-- Migration: 0003_auth_user_trigger.sql
-- Automatically syncs auth.users with public.profiles and assigns default 'citizen' role
-- Executes whenever a user signs up (even before email confirmation).

-- 1. Ensure profiles table has the email column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Create the trigger function to automatically handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Defensive profile creation: exceptions here must never abort auth.users insertion
  BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'first_name'),
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, public.profiles.email),
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
      updated_at = now();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Failed to upsert profile for %: %', NEW.id, SQLERRM;
  END;

  -- Defensive role assignment
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    SELECT NEW.id, 'citizen'
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Failed to assign default role for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 3. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Update ensure_profile() RPC for authenticated calls
CREATE OR REPLACE FUNCTION public.ensure_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
  VALUES (
    uid,
    COALESCE(meta->>'full_name', meta->>'name'),
    meta->>'avatar_url',
    user_email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  SELECT uid, 'citizen'
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = uid);
END;
$$;
