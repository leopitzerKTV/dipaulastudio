CREATE OR REPLACE FUNCTION public.grant_couple_role_for_known_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) IN (
       'ddipaulabr@yahoo.com.br',
       'casamentodossonhos@casamentodossonhosdipaulastudio.com'
     ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'couple')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'couple'::public.app_role
FROM auth.users
WHERE lower(email) IN (
  'ddipaulabr@yahoo.com.br',
  'casamentodossonhos@casamentodossonhosdipaulastudio.com'
) AND email_confirmed_at IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;