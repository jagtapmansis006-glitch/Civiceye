-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Enums
CREATE TYPE public.app_role AS ENUM ('citizen', 'field_worker', 'authority', 'admin');
CREATE TYPE public.report_category AS ENUM (
  'pothole', 'garbage', 'streetlight', 'damaged_road', 'drainage',
  'water_leakage', 'infrastructure', 'other'
);
CREATE TYPE public.report_status AS ENUM (
  'submitted', 'ai_analysis', 'verified', 'assigned', 'in_progress',
  'resolved', 'citizen_verification', 'closed'
);
CREATE TYPE public.report_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  phone text,
  avatar_url text,
  ward text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (separate table, never on profiles)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Role helpers (security definer to avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('authority', 'admin')
  )
$$;

-- Ensure a profile + default citizen role exist for the calling user
CREATE OR REPLACE FUNCTION public.ensure_profile()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  meta jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT raw_user_meta_data INTO meta FROM auth.users WHERE id = uid;
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (uid, COALESCE(meta->>'full_name', meta->>'name'), meta->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  SELECT uid, 'citizen'
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = uid);
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_profile() FROM public;
GRANT EXECUTE ON FUNCTION public.ensure_profile() TO authenticated;

-- Profiles policies
CREATE POLICY "Users read own profile or staff read all" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- User roles policies (writes only via server-side admin code)
CREATE POLICY "Users read own roles or staff read all" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- Reports
CREATE SEQUENCE public.report_reference_seq START 10001;

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE DEFAULT ('CE-' || nextval('public.report_reference_seq')::text),
  reporter_id uuid NOT NULL,
  category public.report_category NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status public.report_status NOT NULL DEFAULT 'submitted',
  priority public.report_priority,
  latitude double precision,
  longitude double precision,
  location extensions.geography(Point, 4326),
  address text,
  assigned_to uuid,
  department text,
  ai_analysis jsonb,
  ai_analyzed_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reports_reporter_idx ON public.reports (reporter_id);
CREATE INDEX reports_assigned_idx ON public.reports (assigned_to);
CREATE INDEX reports_status_idx ON public.reports (status);
CREATE INDEX reports_location_idx ON public.reports USING GIST (location);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.report_reference_seq TO authenticated, service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Report media (files live in Storage bucket "report-media")
CREATE TABLE public.report_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  storage_path text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  mime_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX report_media_report_idx ON public.report_media (report_id);
GRANT SELECT, INSERT, DELETE ON public.report_media TO authenticated;
GRANT ALL ON public.report_media TO service_role;
ALTER TABLE public.report_media ENABLE ROW LEVEL SECURITY;

-- Status history (append-only, written by triggers)
CREATE TABLE public.report_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  from_status public.report_status,
  to_status public.report_status NOT NULL,
  changed_by uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX report_status_history_report_idx ON public.report_status_history (report_id);
GRANT SELECT ON public.report_status_history TO authenticated;
GRANT ALL ON public.report_status_history TO service_role;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;

-- Trigger: maintain derived columns
CREATE OR REPLACE FUNCTION public.reports_before_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, extensions AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := extensions.ST_SetSRID(extensions.ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::extensions.geography;
  ELSE
    NEW.location := NULL;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
    IF NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM 'resolved' THEN
      NEW.resolved_at := now();
    END IF;
    IF NEW.status = 'closed' AND OLD.status IS DISTINCT FROM 'closed' THEN
      NEW.closed_at := now();
    END IF;
    -- Non-staff may only change status (field worker / citizen flows)
    IF NOT public.is_staff(auth.uid()) THEN
      IF NEW.reporter_id IS DISTINCT FROM OLD.reporter_id
        OR NEW.category IS DISTINCT FROM OLD.category
        OR NEW.title IS DISTINCT FROM OLD.title
        OR NEW.description IS DISTINCT FROM OLD.description
        OR NEW.priority IS DISTINCT FROM OLD.priority
        OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
        OR NEW.department IS DISTINCT FROM OLD.department
        OR NEW.ai_analysis IS DISTINCT FROM OLD.ai_analysis
        OR NEW.latitude IS DISTINCT FROM OLD.latitude
        OR NEW.longitude IS DISTINCT FROM OLD.longitude
        OR NEW.address IS DISTINCT FROM OLD.address THEN
        RAISE EXCEPTION 'Only status changes are permitted for this report';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER reports_before_write
BEFORE INSERT OR UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.reports_before_write();

-- Trigger: record status history
CREATE OR REPLACE FUNCTION public.reports_log_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.report_status_history (report_id, from_status, to_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.report_status_history (report_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER reports_log_status
AFTER INSERT OR UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.reports_log_status();

-- Reports policies
CREATE POLICY "Reporter, assignee or staff can read reports" ON public.reports
  FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR assigned_to = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Citizens create own reports as submitted" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid() AND status = 'submitted' AND assigned_to IS NULL);
CREATE POLICY "Staff update any report" ON public.reports
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Field workers progress assigned reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() AND public.has_role(auth.uid(), 'field_worker'))
  WITH CHECK (assigned_to = auth.uid() AND status IN ('assigned', 'in_progress', 'resolved'));
CREATE POLICY "Citizens verify own resolved reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (reporter_id = auth.uid() AND status = 'citizen_verification')
  WITH CHECK (reporter_id = auth.uid() AND status IN ('closed', 'in_progress'));

-- Media policies
CREATE POLICY "Visible report media is readable" ON public.report_media
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.reports r WHERE r.id = report_id));
CREATE POLICY "Participants attach media" ON public.report_media
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.id = report_id
        AND (r.reporter_id = auth.uid() OR r.assigned_to = auth.uid() OR public.is_staff(auth.uid()))
    )
  );
CREATE POLICY "Uploader removes own media" ON public.report_media
  FOR DELETE TO authenticated USING (uploaded_by = auth.uid());

-- History policies
CREATE POLICY "Visible report history is readable" ON public.report_status_history
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.reports r WHERE r.id = report_id));

-- Realtime for live status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;