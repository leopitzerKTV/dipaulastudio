
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.guest_manual (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ceremony_date TEXT,
  ceremony_time TEXT,
  ceremony_location TEXT,
  parking_info TEXT,
  location_info TEXT,
  gift_list_url TEXT,
  welcome_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.guest_manual TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guest_manual TO authenticated;
GRANT ALL ON public.guest_manual TO service_role;

ALTER TABLE public.guest_manual ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guest manual is public readable"
  ON public.guest_manual FOR SELECT
  USING (true);

CREATE POLICY "Couple can insert guest manual"
  ON public.guest_manual FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'couple'));

CREATE POLICY "Couple can update guest manual"
  ON public.guest_manual FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'couple'))
  WITH CHECK (public.has_role(auth.uid(), 'couple'));

CREATE POLICY "Couple can delete guest manual"
  ON public.guest_manual FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'couple'));

CREATE TRIGGER update_guest_manual_updated_at
  BEFORE UPDATE ON public.guest_manual
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.guest_manual (ceremony_date, ceremony_time, ceremony_location)
VALUES (NULL, NULL, NULL);
