import { pb } from "@/integrations/pocketbase/client";

export interface Review {
  id: string;
  product_id?: string;
  customer_name: string;
  email?: string;
  rating: number;
  review?: string;
  review_text?: string;
  approved: boolean;
  created?: string;
  updated?: string;
  [key: string]: any;
}

export type ReviewInput = Partial<Omit<Review, "id" | "created" | "updated">>;

export async function listPublicReviews(): Promise<Review[]> {
  try {
    return await pb.collection("reviews").getFullList<Review>({
      filter: "approved = true",
      sort: "-created",
    });
  } catch (error) {
    console.error("Error fetching public reviews:", error);
    return [];
  }
}

export async function listAllReviews(): Promise<Review[]> {
  try {
    return await pb.collection("reviews").getFullList<Review>({
      sort: "-created",
    });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return [];
  }
}

export async function listProductReviews(productId: string): Promise<Review[]> {
  try {
    return await pb.collection("reviews").getFullList<Review>({
      filter: `product_id="${productId}" && approved=true`,
      sort: "-created",
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function createReview(input: ReviewInput): Promise<Review> {
  const payload = {
    ...input,
    approved: input.approved ?? false,
    review: input.review || input.review_text || "",
    review_text: input.review_text || input.review || "",
  };
  return await pb.collection("reviews").create<Review>(payload);
}

export const createProductReview = createReview;

export async function updateReview(
  id: string,
  input: ReviewInput
): Promise<Review> {
  const payload: Record<string, any> = { ...input };
  if (input.review || input.review_text) {
    payload.review = input.review || input.review_text;
    payload.review_text = input.review_text || input.review;
  }
  return await pb.collection("reviews").update<Review>(id, payload);
}

export async function approveReview(id: string): Promise<Review> {
  return await pb.collection("reviews").update<Review>(id, { approved: true });
}

export async function deleteReview(id: string): Promise<void> {
  await pb.collection("reviews").delete(id);
}