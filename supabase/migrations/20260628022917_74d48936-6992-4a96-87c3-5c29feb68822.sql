
CREATE TABLE public.album_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  author_name TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.album_photos TO anon, authenticated;
GRANT ALL ON public.album_photos TO service_role;

ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view album photos"
  ON public.album_photos FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add album photos"
  ON public.album_photos FOR INSERT
  WITH CHECK (true);

-- Storage policies for the album-photos bucket
CREATE POLICY "Anyone can view album photo files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'album-photos');

CREATE POLICY "Anyone can upload album photo files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'album-photos');
