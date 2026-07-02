ALTER TABLE public.album_photos ADD COLUMN IF NOT EXISTS tag TEXT NOT NULL DEFAULT 'Geral';
CREATE INDEX IF NOT EXISTS album_photos_tag_idx ON public.album_photos (tag);
CREATE INDEX IF NOT EXISTS album_photos_created_at_idx ON public.album_photos (created_at DESC);