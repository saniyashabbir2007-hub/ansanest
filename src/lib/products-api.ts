import { supabase } from "@/integrations/supabase/client";

export type VariantColor = {
  name: string;
  images: string[];
};

export type DimensionVariant = {
  id: string;
  name: string;
  dimensions: string;
  seats?: string;
  price: number;
  stock?: number;
  is_default?: boolean;
  images?: string[];
  colors?: VariantColor[];
};

export type ProductColor = {
  colorName: string;
  colorCode: string;
  imageUrl: string;
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

export type CategoryInput = Omit<Category, "id">;

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function normalizeProductColors(colors: any): any[] {
  if (!Array.isArray(colors)) return [];
  return colors;
}

// -------------------------------------------------------------
// CATEGORIES API
// -------------------------------------------------------------

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert([input as any])
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update(input as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// -------------------------------------------------------------
// PRODUCTS API
// -------------------------------------------------------------

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

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
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

// -------------------------------------------------------------
// REVIEWS API
// -------------------------------------------------------------

export async function listProductReviews(productId: string): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    const fallback = await (supabase as any)
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    return fallback.data ?? [];
  }
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
    approved: false,
  };

  const { error } = await (supabase as any).from("reviews").insert([payload]);
  if (error) throw error;
}

export async function listPendingProductReviews(): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from("reviews")
    .select("*, products(name, image_url)")
    .eq("approved", false)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function listAllProductReviews(): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from("reviews")
    .select("*, products(name, image_url)")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function approveProductReview(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from("reviews")
    .update({ approved: true })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteProductReview(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// -------------------------------------------------------------
// MERGE PRODUCT INTO VARIANT HELPER
// -------------------------------------------------------------

export async function mergeProductAsVariant(
  sourceProductId: string,
  targetProductId: string,
  variantName?: string,
  deleteSource: boolean = true
): Promise<void> {
  const [source, target] = await Promise.all([
    getProductById(sourceProductId),
    getProductById(targetProductId),
  ]);

  if (!source || !target) throw new Error("Source or target product not found.");

  // Build images array
  const sourceImages = [
    source.image_url,
    ...(source.gallery_urls ?? []),
  ].filter(Boolean);

  // Convert colors / color_variants if present
  const sourceColors: VariantColor[] = Array.isArray(source.color_variants)
    ? source.color_variants.map((c: any) => ({
        name: c.name || "Default Color",
        images: c.images || [],
      }))
    : [];

  const newVariant: DimensionVariant = {
    id: `var-${Date.now()}`,
    name: variantName || source.name,
    dimensions: source.dimensions || "",
    seats: source.sub_type || "",
    price: Number(source.price) || 0,
    stock: 10,
    is_default: (target.dimension_variants ?? []).length === 0,
    images: sourceImages,
    colors: sourceColors,
  };

  const updatedVariants = [...(target.dimension_variants ?? []), newVariant];

  // Auto-calculate lowest price
  const validPrices = updatedVariants
    .map((v) => Number(v.price))
    .filter((p) => !isNaN(p) && p > 0);
  const lowestPrice =
    validPrices.length > 0 ? Math.min(...validPrices) : target.price;

  await updateProduct(targetProductId, {
    dimension_variants: updatedVariants,
    price: lowestPrice,
  });

  if (deleteSource) {
    await deleteProduct(sourceProductId);
  }
}