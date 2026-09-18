ALTER TABLE public.profiles ADD COLUMN email text;

CREATE OR REPLACE FUNCTION public.ensure_profile()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  meta jsonb;
  user_email text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT raw_user_meta_data, email INTO meta, user_email FROM auth.users WHERE id = uid;
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (uid, COALESCE(meta->>'full_name', meta->>'name'), meta->>'avatar_url', user_email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  INSERT INTO public.user_roles (user_id, role)
  SELECT uid, 'citizen'
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = uid);
END;
$$;