
-- 1. Lock down SECURITY DEFINER helpers: revoke from PUBLIC + anon.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_first_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- has_role and is_super_admin are referenced from RLS policies evaluated for
-- authenticated users, so they must remain executable by that role.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;

-- 2. Harden admin_activity_logs insert policy: actor_email must match the
-- authenticated user's JWT email, preventing identity spoofing in audit trail.
DROP POLICY IF EXISTS "Admins can insert their own activity" ON public.admin_activity_logs;

CREATE POLICY "Admins can insert their own activity"
ON public.admin_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
  actor_id = auth.uid()
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
  AND (
    actor_email IS NULL
    OR lower(actor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);
