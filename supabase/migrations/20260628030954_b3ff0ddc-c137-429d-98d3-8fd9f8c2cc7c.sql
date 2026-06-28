
CREATE TABLE public.story_chapters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position integer NOT NULL DEFAULT 0,
  storage_path text,
  date_label text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_chapters TO anon, authenticated;
GRANT ALL ON public.story_chapters TO service_role;

ALTER TABLE public.story_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view story chapters" ON public.story_chapters FOR SELECT USING (true);
CREATE POLICY "Anyone can insert story chapters" ON public.story_chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update story chapters" ON public.story_chapters FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete story chapters" ON public.story_chapters FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER story_chapters_updated_at
BEFORE UPDATE ON public.story_chapters
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Anyone can view story photos" ON storage.objects FOR SELECT USING (bucket_id = 'story-photos');
CREATE POLICY "Anyone can upload story photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'story-photos');
CREATE POLICY "Anyone can update story photos" ON storage.objects FOR UPDATE USING (bucket_id = 'story-photos') WITH CHECK (bucket_id = 'story-photos');
CREATE POLICY "Anyone can delete story photos" ON storage.objects FOR DELETE USING (bucket_id = 'story-photos');
