
ALTER TABLE public.story_chapters REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_chapters;
