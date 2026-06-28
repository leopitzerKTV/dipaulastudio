
ALTER TABLE public.guest_manual
  ADD COLUMN IF NOT EXISTS dress_code_note text,
  ADD COLUMN IF NOT EXISTS ceremony_note text,
  ADD COLUMN IF NOT EXISTS during_ceremony_note text,
  ADD COLUMN IF NOT EXISTS reception_note text,
  ADD COLUMN IF NOT EXISTS cake_note text,
  ADD COLUMN IF NOT EXISTS dancefloor_note text,
  ADD COLUMN IF NOT EXISTS album_note text,
  ADD COLUMN IF NOT EXISTS gift_note text,
  ADD COLUMN IF NOT EXISTS transport_note text,
  ADD COLUMN IF NOT EXISTS closing_note text;
