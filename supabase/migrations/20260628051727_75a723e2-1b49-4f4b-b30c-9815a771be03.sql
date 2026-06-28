
CREATE TABLE public.gift_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  price_cents integer,
  currency text NOT NULL DEFAULT 'BRL',
  store_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gift_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_items TO authenticated;
GRANT ALL ON public.gift_items TO service_role;

ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active gift items"
  ON public.gift_items FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'couple'));

CREATE POLICY "Couple can insert gift items"
  ON public.gift_items FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'couple'));

CREATE POLICY "Couple can update gift items"
  ON public.gift_items FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'couple'))
  WITH CHECK (public.has_role(auth.uid(), 'couple'));

CREATE POLICY "Couple can delete gift items"
  ON public.gift_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'couple'));

CREATE TRIGGER trg_gift_items_updated_at
  BEFORE UPDATE ON public.gift_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TYPE public.gift_reservation_status AS ENUM ('reserved', 'purchased', 'cancelled');

CREATE TABLE public.gift_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_item_id uuid NOT NULL REFERENCES public.gift_items(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  status public.gift_reservation_status NOT NULL DEFAULT 'reserved',
  reserved_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  confirmed_at timestamptz,
  confirm_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gift_reservations_item ON public.gift_reservations(gift_item_id);
CREATE UNIQUE INDEX idx_gift_reservations_token ON public.gift_reservations(confirm_token);
CREATE UNIQUE INDEX idx_gift_reservations_purchased
  ON public.gift_reservations(gift_item_id)
  WHERE status = 'purchased';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_reservations TO authenticated;
GRANT ALL ON public.gift_reservations TO service_role;

ALTER TABLE public.gift_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can view all reservations"
  ON public.gift_reservations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'couple'));

CREATE POLICY "Couple can update reservations"
  ON public.gift_reservations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'couple'))
  WITH CHECK (public.has_role(auth.uid(), 'couple'));

CREATE POLICY "Couple can delete reservations"
  ON public.gift_reservations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'couple'));

CREATE TRIGGER trg_gift_reservations_updated_at
  BEFORE UPDATE ON public.gift_reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.list_gift_catalog()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  image_url text,
  price_cents integer,
  currency text,
  store_url text,
  sort_order integer,
  is_available boolean,
  reserved_by_first_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    gi.id, gi.title, gi.description, gi.image_url, gi.price_cents,
    gi.currency, gi.store_url, gi.sort_order,
    NOT EXISTS (
      SELECT 1 FROM public.gift_reservations gr
      WHERE gr.gift_item_id = gi.id
        AND (gr.status = 'purchased'
             OR (gr.status = 'reserved' AND gr.expires_at > now()))
    ) AS is_available,
    (
      SELECT split_part(gr.guest_name, ' ', 1)
      FROM public.gift_reservations gr
      WHERE gr.gift_item_id = gi.id
        AND (gr.status = 'purchased'
             OR (gr.status = 'reserved' AND gr.expires_at > now()))
      ORDER BY gr.reserved_at DESC
      LIMIT 1
    ) AS reserved_by_first_name
  FROM public.gift_items gi
  WHERE gi.is_active = true
  ORDER BY gi.sort_order ASC, gi.created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public.list_gift_catalog() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.reserve_gift_item(
  _gift_item_id uuid,
  _guest_name text,
  _guest_email text
)
RETURNS TABLE (reservation_id uuid, confirm_token uuid, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _name text := btrim(coalesce(_guest_name, ''));
  _email text := lower(btrim(coalesce(_guest_email, '')));
  _exists boolean;
BEGIN
  IF length(_name) < 2 OR length(_name) > 120 THEN
    RAISE EXCEPTION 'invalid_name';
  END IF;
  IF _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(_email) > 255 THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.gift_items WHERE id = _gift_item_id AND is_active = true
  ) INTO _exists;
  IF NOT _exists THEN
    RAISE EXCEPTION 'item_not_found';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.gift_reservations
    WHERE gift_item_id = _gift_item_id
      AND (status = 'purchased'
           OR (status = 'reserved' AND expires_at > now()))
  ) INTO _exists;
  IF _exists THEN
    RAISE EXCEPTION 'item_unavailable';
  END IF;

  RETURN QUERY
  INSERT INTO public.gift_reservations (gift_item_id, guest_name, guest_email)
  VALUES (_gift_item_id, _name, _email)
  RETURNING id, gift_reservations.confirm_token, gift_reservations.expires_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reserve_gift_item(uuid, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.confirm_gift_purchase(_token uuid)
RETURNS TABLE (reservation_id uuid, gift_title text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rid uuid;
  _iid uuid;
  _title text;
  _status public.gift_reservation_status;
BEGIN
  SELECT gr.id, gr.gift_item_id, gr.status
    INTO _rid, _iid, _status
  FROM public.gift_reservations gr
  WHERE gr.confirm_token = _token;

  IF _rid IS NULL THEN
    RAISE EXCEPTION 'token_invalid';
  END IF;
  IF _status = 'cancelled' THEN
    RAISE EXCEPTION 'reservation_cancelled';
  END IF;

  UPDATE public.gift_reservations
     SET status = 'purchased',
         confirmed_at = COALESCE(confirmed_at, now()),
         expires_at = now() + interval '100 years'
   WHERE id = _rid;

  SELECT title INTO _title FROM public.gift_items WHERE id = _iid;
  reservation_id := _rid;
  gift_title := _title;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_gift_purchase(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.cancel_gift_reservation(_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _updated int;
BEGIN
  UPDATE public.gift_reservations
     SET status = 'cancelled'
   WHERE confirm_token = _token
     AND status = 'reserved';
  GET DIAGNOSTICS _updated = ROW_COUNT;
  RETURN _updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_gift_reservation(uuid) TO anon, authenticated;
