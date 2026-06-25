import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  sub_type: string | null;
  price: number | null;
  price_on_request: boolean;
  image_url: string;
  gallery_urls: string[];
  short_description: string;
  description: string;
  features: string[];
  colors: string[];
  color_variants: any[];
  material: string;
  dimensions: string;
  availability: string;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Product) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Product) ?? null;
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function createCategory(input: { name: string; slug: string; sort_order?: number }) {
  const { data, error } = await supabase.from("categories").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, patch: Partial<Category>) {
  const { error } = await supabase.from("categories").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at">;

export async function createProduct(input: ProductInput) {
  const { data, error } = await supabase.from("products").insert(input).select().single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, patch: Partial<ProductInput>) {
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from("product-images")
    .createSignedUrl(path, TEN_YEARS);
  if (signErr) throw signErr;
  return data.signedUrl;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
