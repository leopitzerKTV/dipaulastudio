CREATE TABLE public.timeline_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position integer NOT NULL DEFAULT 0,
  storage_path text,
  date_label text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_milestones TO anon, authenticated;
GRANT ALL ON public.timeline_milestones TO service_role;

ALTER TABLE public.timeline_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view timeline milestones" ON public.timeline_milestones FOR SELECT USING (true);
CREATE POLICY "Anyone can insert timeline milestones" ON public.timeline_milestones FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update timeline milestones" ON public.timeline_milestones FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete timeline milestones" ON public.timeline_milestones FOR DELETE USING (true);

CREATE TRIGGER timeline_milestones_set_updated_at
BEFORE UPDATE ON public.timeline_milestones
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.timeline_milestones REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_milestones;