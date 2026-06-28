CREATE POLICY "Anyone can update album photos"
  ON public.album_photos FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete album photos"
  ON public.album_photos FOR DELETE
  USING (true);

GRANT UPDATE, DELETE ON public.album_photos TO anon, authenticated;

CREATE POLICY "Anyone can delete album photo files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'album-photos');