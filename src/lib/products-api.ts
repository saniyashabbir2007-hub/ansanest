import { supabase } from "@/integrations/supabase/client";

export type ProductColor = {
  colorName: string;
  colorCode: string;
  imageUrl: string;
};

export type DimensionVariant = {
  id: string;
  name: string;
  dimensions: string;
  seats?: string;
  price: number;
  stock?: number;
  is_default?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  sub_type?: string | null;
  price?: number | null;
  price_on_request: boolean;
  image_url: string;
  gallery_urls?: string[];
  video_urls?: string[];
  short_description?: string;
  description: string;
  features?: string[];
  colors?: ProductColor[];
  color_variants?: Array<{ name: string; images?: string[] }>;
  dimension_variants?: DimensionVariant[];
  material?: string;
  dimensions?: string;
  availability: string;
  delivery_time?: string | null;
  customizable?: boolean;
  warranty?: string | null;
  care_instructions?: string | null;
  featured: boolean;
  sort_order: number;
  badge?: string;
};

export type ProductInput = Omit<Product, "id">;

export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  sort_order: number;
};

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function normalizeProductColors(colors: any): ProductColor[] {
  if (!Array.isArray(colors)) return [];
  return colors.map((c) => {
    if (typeof c === "string") {
      return {
        colorName: c,
        colorCode: c.startsWith("#") ? c : "#888888",
        imageUrl: "",
      };
    }
    return {
      colorName: c?.colorName || "",
      colorCode: c?.colorCode || "",
      imageUrl: c?.imageUrl || "",
    };
  });
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as any) ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data as any) ?? null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert([input as any])
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(input as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function uploadProductVideo(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-videos")
    .upload(path, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("product-videos")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function listProductReviews(productId: string): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function createProductReview(review: {
  product_id: string;
  customer_name: string;
  email?: string;
  rating: number;
  review?: string;
  review_text?: string;
}): Promise<void> {
  const payload: any = {
    product_id: review.product_id,
    customer_name: review.customer_name,
    email: review.email ?? "",
    rating: review.rating,
    review: review.review || review.review_text || "",
    review_text: review.review_text || review.review || "",
  };

  const { error } = await (supabase as any).from("reviews").insert([payload]);
  if (error) throw error;
}