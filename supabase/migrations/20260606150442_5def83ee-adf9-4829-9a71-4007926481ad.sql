CREATE TABLE public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by uuid
);

GRANT SELECT, INSERT ON public.access_requests TO authenticated;
GRANT ALL ON public.access_requests TO service_role;

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own request"
ON public.access_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own request"
ON public.access_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins can view all requests"
ON public.access_requests FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));