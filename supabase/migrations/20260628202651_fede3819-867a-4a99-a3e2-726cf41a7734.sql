CREATE TABLE public.rsvp_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  attending boolean NOT NULL,
  party_size integer NOT NULL DEFAULT 1,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rsvp_guest_name_len CHECK (char_length(btrim(guest_name)) BETWEEN 2 AND 120),
  CONSTRAINT rsvp_party_size_range CHECK (party_size BETWEEN 1 AND 20),
  CONSTRAINT rsvp_message_len CHECK (message IS NULL OR char_length(message) <= 1000)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rsvp_responses TO authenticated;
GRANT INSERT ON public.rsvp_responses TO anon;
GRANT ALL ON public.rsvp_responses TO service_role;

ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an RSVP"
  ON public.rsvp_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Couple can view RSVPs"
  ON public.rsvp_responses FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'couple'));

CREATE POLICY "Couple can update RSVPs"
  ON public.rsvp_responses FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'couple'))
  WITH CHECK (public.has_role(auth.uid(), 'couple'));

CREATE POLICY "Couple can delete RSVPs"
  ON public.rsvp_responses FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'couple'));

CREATE TRIGGER trg_rsvp_responses_updated_at
  BEFORE UPDATE ON public.rsvp_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();