import { supabase } from "@/integrations/supabase/client";

export type Review = {
  id: string;
  customer_name: string;
  customer_photo_url: string | null;
  customer_location: string | null;
  product_name: string | null;
  rating: number;
  review_text: string;
  review_date: string;
  is_hidden: boolean;
  is_featured: boolean;
  source: string;
  submitted_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewInput = {
  customer_name: string;
  customer_photo_url?: string | null;
  customer_location?: string | null;
  product_name?: string | null;
  rating: number;
  review_text: string;
  review_date?: string;
  is_hidden?: boolean;
  is_featured?: boolean;
};

// Public — only visible (non-hidden) reviews, featured first, newest first.
export async function listPublicReviews(): Promise<Review[]> {
  const { data, error } = await (supabase as any)
    .from("reviews")
    .select("*")
    .eq("is_hidden", false)
    .order("is_featured", { ascending: false })
    .order("review_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}

// Admin — all reviews (hidden included).
export async function listAllReviews(): Promise<Review[]> {
  const { data, error } = await (supabase as any)
    .from("reviews")
    .select("*")
    .order("review_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function createReview(input: ReviewInput): Promise<Review> {
  const { data, error } = await (supabase as any).from("reviews").insert(input).select().single();
  if (error) throw error;
  return data as Review;
}

export async function updateReview(id: string, patch: Partial<ReviewInput>): Promise<void> {
  const { error } = await (supabase as any).from("reviews").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await (supabase as any).from("reviews").delete().eq("id", id);
  if (error) throw error;
}
