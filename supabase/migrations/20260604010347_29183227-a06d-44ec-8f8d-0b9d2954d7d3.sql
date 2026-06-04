
-- Super admin tracking (separate table to avoid enum alter limitations)
CREATE TABLE public.super_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.super_admins TO authenticated;
GRANT ALL ON public.super_admins TO service_role;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = _user_id)
$$;

CREATE POLICY "Super admins can view super admins" ON public.super_admins
  FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

-- Add disabled flag to user_roles so super admin can suspend store admins
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;

-- Update has_role to ignore disabled rows
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND disabled = false
  )
$$;

-- Update first-admin trigger to also grant super_admin
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
    INSERT INTO public.super_admins (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Wire the trigger if missing
DROP TRIGGER IF EXISTS on_auth_user_created_first_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

-- Activity logs
CREATE TABLE public.admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  target text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_activity_logs TO authenticated;
GRANT ALL ON public.admin_activity_logs TO service_role;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can insert their own activity"
  ON public.admin_activity_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can view all activity"
  ON public.admin_activity_logs FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Allow super admin to update/delete user_roles (for disable + delete)
CREATE POLICY "Super admins can manage user_roles update"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage user_roles delete"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage user_roles insert"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Backfill: make the earliest existing admin a super_admin if none exists
INSERT INTO public.super_admins (user_id)
SELECT user_id FROM public.user_roles WHERE role = 'admin'
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT DO NOTHING;
