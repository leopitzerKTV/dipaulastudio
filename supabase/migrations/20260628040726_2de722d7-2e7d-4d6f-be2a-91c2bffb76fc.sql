
-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('couple');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. Auto-grant couple role for known couple emails
CREATE OR REPLACE FUNCTION public.grant_couple_role_for_known_email()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) IN ('ddipaulabr@yahoo.com.br') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'couple')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_couple
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_couple_role_for_known_email();

CREATE TRIGGER on_auth_user_confirmed_grant_couple
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_couple_role_for_known_email();

-- 4. Replace permissive policies on content tables
-- timeline_milestones
DROP POLICY IF EXISTS "Anyone can view timeline milestones" ON public.timeline_milestones;
DROP POLICY IF EXISTS "Anyone can insert timeline milestones" ON public.timeline_milestones;
DROP POLICY IF EXISTS "Anyone can update timeline milestones" ON public.timeline_milestones;
DROP POLICY IF EXISTS "Anyone can delete timeline milestones" ON public.timeline_milestones;

CREATE POLICY "Anyone can view timeline milestones"
  ON public.timeline_milestones FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Couple can insert timeline milestones"
  ON public.timeline_milestones FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'couple'));
CREATE POLICY "Couple can update timeline milestones"
  ON public.timeline_milestones FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'couple'))
  WITH CHECK (public.has_role(auth.uid(), 'couple'));
CREATE POLICY "Couple can delete timeline milestones"
  ON public.timeline_milestones FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'couple'));

-- story_chapters
DROP POLICY IF EXISTS "Anyone can view story chapters" ON public.story_chapters;
DROP POLICY IF EXISTS "Anyone can insert story chapters" ON public.story_chapters;
DROP POLICY IF EXISTS "Anyone can update story chapters" ON public.story_chapters;
DROP POLICY IF EXISTS "Anyone can delete story chapters" ON public.story_chapters;

CREATE POLICY "Anyone can view story chapters"
  ON public.story_chapters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Couple can insert story chapters"
  ON public.story_chapters FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'couple'));
CREATE POLICY "Couple can update story chapters"
  ON public.story_chapters FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'couple'))
  WITH CHECK (public.has_role(auth.uid(), 'couple'));
CREATE POLICY "Couple can delete story chapters"
  ON public.story_chapters FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'couple'));

-- album_photos
DROP POLICY IF EXISTS "Anyone can view album photos" ON public.album_photos;
DROP POLICY IF EXISTS "Anyone can add album photos" ON public.album_photos;
DROP POLICY IF EXISTS "Anyone can update album photos" ON public.album_photos;
DROP POLICY IF EXISTS "Anyone can delete album photos" ON public.album_photos;

CREATE POLICY "Anyone can view album photos"
  ON public.album_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Couple can insert album photos"
  ON public.album_photos FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'couple'));
CREATE POLICY "Couple can update album photos"
  ON public.album_photos FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'couple'))
  WITH CHECK (public.has_role(auth.uid(), 'couple'));
CREATE POLICY "Couple can delete album photos"
  ON public.album_photos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'couple'));

-- 5. Storage policies for the three buckets
DO $$
DECLARE b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['album-photos','story-photos','timeline-photos'] LOOP
    EXECUTE format($f$DROP POLICY IF EXISTS "public read %1$s" ON storage.objects$f$, b);
    EXECUTE format($f$DROP POLICY IF EXISTS "couple write %1$s" ON storage.objects$f$, b);
    EXECUTE format($f$DROP POLICY IF EXISTS "couple update %1$s" ON storage.objects$f$, b);
    EXECUTE format($f$DROP POLICY IF EXISTS "couple delete %1$s" ON storage.objects$f$, b);
  END LOOP;
END $$;

CREATE POLICY "public read album-photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'album-photos');
CREATE POLICY "couple write album-photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'album-photos' AND public.has_role(auth.uid(),'couple'));
CREATE POLICY "couple update album-photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'album-photos' AND public.has_role(auth.uid(),'couple')) WITH CHECK (bucket_id = 'album-photos' AND public.has_role(auth.uid(),'couple'));
CREATE POLICY "couple delete album-photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'album-photos' AND public.has_role(auth.uid(),'couple'));

CREATE POLICY "public read story-photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'story-photos');
CREATE POLICY "couple write story-photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'story-photos' AND public.has_role(auth.uid(),'couple'));
CREATE POLICY "couple update story-photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'story-photos' AND public.has_role(auth.uid(),'couple')) WITH CHECK (bucket_id = 'story-photos' AND public.has_role(auth.uid(),'couple'));
CREATE POLICY "couple delete story-photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'story-photos' AND public.has_role(auth.uid(),'couple'));

CREATE POLICY "public read timeline-photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'timeline-photos');
CREATE POLICY "couple write timeline-photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'timeline-photos' AND public.has_role(auth.uid(),'couple'));
CREATE POLICY "couple update timeline-photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'timeline-photos' AND public.has_role(auth.uid(),'couple')) WITH CHECK (bucket_id = 'timeline-photos' AND public.has_role(auth.uid(),'couple'));
CREATE POLICY "couple delete timeline-photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'timeline-photos' AND public.has_role(auth.uid(),'couple'));
