
-- Restrict column-level SELECT on reviews so anon/authenticated cannot read the
-- internal submitter user UUID. Admin policies still allow full row reads via
-- the service role / authenticated admin path.
REVOKE SELECT ON public.reviews FROM anon;
REVOKE SELECT ON public.reviews FROM authenticated;

GRANT SELECT (
  id,
  customer_name,
  customer_photo_url,
  customer_location,
  product_name,
  rating,
  review_text,
  review_date,
  is_hidden,
  is_featured,
  source,
  created_at,
  updated_at
) ON public.reviews TO anon, authenticated;

-- Admins need full row access including submitted_by_user_id; grant remaining
-- write privileges back to authenticated (RLS still gates by admin role).
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT (submitted_by_user_id) ON public.reviews TO authenticated;
