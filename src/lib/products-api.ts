import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

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

// -------------------------------------------------------------
// IMAGE NORMALIZATION & PARSING HELPERS
// -------------------------------------------------------------

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";
  const trimmed = String(url).trim();
  if (!trimmed) return "/placeholder.svg";

  // If already an active CDN link (ImgBB account 1, account 2, Cloudinary, data URLs, etc.)
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("data:image")
  ) {
    // If it's a dead Supabase URL, extract filename
    if (trimmed.includes("supabase.co")) {
      const cleanFilename = trimmed.split("/").pop()?.split("?")[0];
      if (cleanFilename) {
        return `/product-images/${decodeURIComponent(cleanFilename)}`;
      }
    }
    return trimmed;
  }

  // Already a valid local relative path
  if (trimmed.startsWith("/product-images/")) return trimmed;

  // Extract base filename if it was a relative filename
  const cleanFilename = trimmed.split("/").pop()?.split("?")[0];
  if (cleanFilename) {
    return `/product-images/${decodeURIComponent(cleanFilename)}`;
  }

  return trimmed;
}

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
  return ensureArray(colors);
}

function ensureArray<T = any>(val: any): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeProduct(p: any): Product {
  if (!p) return p;

  const rawGallery = ensureArray<string>(p.gallery_urls);
  const rawColors = ensureArray<any>(p.colors);
  const rawColorVariants = ensureArray<any>(p.color_variants);
  const rawDimensionVariants = ensureArray<any>(p.dimension_variants);

  return {
    ...p,
    image_url: resolveImageUrl(p.image_url),
    gallery_urls: rawGallery.map((img) => resolveImageUrl(img)),
    colors: rawColors.map((c) => ({
      ...c,
      imageUrl: c?.imageUrl ? resolveImageUrl(c.imageUrl) : c?.imageUrl,
    })),
    color_variants: rawColorVariants.map((cv) => ({
      ...cv,
      images: ensureArray<string>(cv.images).map((img) => resolveImageUrl(img)),
    })),
    dimension_variants: rawDimensionVariants.map((v) => ({
      ...v,
      images: ensureArray<string>(v.images).map((img) => resolveImageUrl(img)),
      colors: ensureArray<any>(v.colors).map((c) => ({
        ...c,
        imageUrl: c?.imageUrl ? resolveImageUrl(c.imageUrl) : c?.imageUrl,
        images: ensureArray<string>(c?.images).map((img) => resolveImageUrl(img)),
      })),
    })),
  };
}

// -------------------------------------------------------------
// CLIENT-SIDE IMAGE COMPRESSION (FOR FUTURE UPLOADS)
// -------------------------------------------------------------

async function compressImageToWebP(
  file: File,
  maxWidth = 1600,
  quality = 0.82
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const cleanBase = file.name
              .replace(/\.[^/.]+$/, "")
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "-");

            const optimizedFile = new File(
              [blob],
              `${cleanBase}-${Date.now().toString().slice(-6)}.webp`,
              { type: "image/webp" }
            );
            resolve(optimizedFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

// -------------------------------------------------------------
// CATEGORIES API
// -------------------------------------------------------------

export async function listCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, "categories"), orderBy("sort_order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Category;
      return {
        ...data,
        id: docSnap.id,
        image_url: data.image_url ? resolveImageUrl(data.image_url) : data.image_url,
      };
    });
  } catch {
    const snapshot = await getDocs(collection(db, "categories"));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Category;
      return {
        ...data,
        id: docSnap.id,
        image_url: data.image_url ? resolveImageUrl(data.image_url) : data.image_url,
      };
    });
  }
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const newDocRef = doc(collection(db, "categories"));
  const record: Category = { ...input, id: newDocRef.id };
  await setDoc(newDocRef, record);
  return record;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>
): Promise<Category> {
  const docRef = doc(db, "categories", id);
  await updateDoc(docRef, input as any);
  const snap = await getDoc(docRef);
  return { id: snap.id, ...(snap.data() as any) } as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, "categories", id));
}

// -------------------------------------------------------------
// PRODUCTS API
// -------------------------------------------------------------

export async function listProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, "products"), orderBy("sort_order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      normalizeProduct({ id: docSnap.id, ...docSnap.data() })
    );
  } catch {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map((docSnap) =>
      normalizeProduct({ id: docSnap.id, ...docSnap.data() })
    );
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, "products"), where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return normalizeProduct({ id: docSnap.id, ...docSnap.data() });
  } catch {
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, "products", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return normalizeProduct({ id: snap.id, ...snap.data() });
  } catch {
    return null;
  }
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const newDocRef = doc(collection(db, "products"));
  const record: Product = { ...input, id: newDocRef.id };
  await setDoc(newDocRef, record);
  return normalizeProduct(record);
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<Product> {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, input as any);
  const snap = await getDoc(docRef);
  return normalizeProduct({ id: snap.id, ...(snap.data() as any) });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}

// -------------------------------------------------------------
// MEDIA UPLOAD
// -------------------------------------------------------------

export async function uploadProductImage(file: File): Promise<string> {
  const optimizedFile = await compressImageToWebP(file);
  const formData = new FormData();
  formData.append("file", optimizedFile);

  const response = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });
  if (response.ok) {
    const data = await response.json();
    return data.url;
  }
  throw new Error("Failed to upload image file");
}

export async function uploadProductVideo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload-video", {
    method: "POST",
    body: formData,
  });
  if (response.ok) {
    const data = await response.json();
    return data.url;
  }
  throw new Error("Failed to upload video file");
}

// -------------------------------------------------------------
// REVIEWS API
// -------------------------------------------------------------

export async function listProductReviews(productId: string): Promise<any[]> {
  try {
    const q = query(
      collection(db, "reviews"),
      where("product_id", "==", productId),
      where("approved", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function createProductReview(review: {
  product_id: string;
  customer_name: string;
  email?: string;
  rating: number;
  review?: string;
  review_text?: string;
}): Promise<void> {
  const payload = {
    product_id: review.product_id,
    customer_name: review.customer_name,
    email: review.email ?? "",
    rating: review.rating,
    review: review.review || review.review_text || "",
    review_text: review.review_text || review.review || "",
    approved: false,
    created: new Date().toISOString(),
  };
  const docRef = doc(collection(db, "reviews"));
  await setDoc(docRef, payload);
}

export async function listPendingProductReviews(): Promise<any[]> {
  try {
    const q = query(collection(db, "reviews"), where("approved", "==", false));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function listAllProductReviews(): Promise<any[]> {
  try {
    const snapshot = await getDocs(collection(db, "reviews"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function approveProductReview(id: string): Promise<void> {
  await updateDoc(doc(db, "reviews", id), { approved: true });
}

export async function deleteProductReview(id: string): Promise<void> {
  await deleteDoc(doc(db, "reviews", id));
}

// -------------------------------------------------------------
// VARIANT & PRODUCT MANAGEMENT HELPERS
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

  const sourceImages = [
    source.image_url,
    ...(ensureArray<string>(source.gallery_urls)),
  ].filter(Boolean);

  const sourceColors: VariantColor[] = ensureArray(source.color_variants).map(
    (c: any) => ({
      name: c.name || "Default Color",
      images: ensureArray(c.images),
    })
  );

  let existingVariants = ensureArray<DimensionVariant>(target.dimension_variants);

  if (existingVariants.length === 0) {
    existingVariants = [
      {
        id: `var-parent-${Date.now()}`,
        name: target.sub_type || target.name,
        dimensions: target.dimensions || "",
        seats: target.sub_type || "",
        price: Number(target.price) || 0,
        stock: 10,
        is_default: true,
        images: [
          target.image_url,
          ...(ensureArray<string>(target.gallery_urls)),
        ].filter(Boolean),
        colors: ensureArray(target.color_variants).map((c: any) => ({
          name: c.name || "Default Color",
          images: ensureArray(c.images),
        })),
      },
    ];
  }

  const newVariant: DimensionVariant = {
    id: `var-${Date.now()}`,
    name: variantName || source.name,
    dimensions: source.dimensions || "",
    seats: source.sub_type || "",
    price: Number(source.price) || 0,
    stock: 10,
    is_default: false,
    images: sourceImages,
    colors: sourceColors,
  };

  const updatedVariants = [...existingVariants, newVariant];

  const validPrices = updatedVariants
    .map((v) => Number(v.price))
    .filter((p) => !isNaN(p) && p > 0);
  const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : target.price;

  await updateProduct(targetProductId, {
    dimension_variants: updatedVariants,
    price: lowestPrice,
  });

  if (deleteSource) {
    await deleteProduct(sourceProductId);
  }
}

export async function extractVariantToSeparateProduct(
  parentProductId: string,
  variantId: string
): Promise<Product> {
  const parent = await getProductById(parentProductId);
  if (!parent) throw new Error("Parent product not found.");

  const variants = ensureArray<DimensionVariant>(parent.dimension_variants);
  const variant = variants.find((v) => v.id === variantId);
  if (!variant) throw new Error("Variant not found in product.");

  const remainingVariants = variants.filter((v) => v.id !== variantId);
  if (remainingVariants.length > 0 && !remainingVariants.some((v) => v.is_default)) {
    remainingVariants[0].is_default = true;
  }

  await updateProduct(parentProductId, {
    dimension_variants: remainingVariants,
  });

  const newProduct = await createProduct({
    name: variant.name || `${parent.name} Variant`,
    slug: slugify(`${parent.name}-${variant.name}-${Date.now().toString().slice(-4)}`),
    category: parent.category,
    sub_type: variant.seats || parent.sub_type,
    price: variant.price || parent.price,
    price_on_request: false,
    image_url: variant.images?.[0] || parent.image_url,
    gallery_urls: variant.images?.slice(1) ?? [],
    video_urls: [],
    short_description: parent.short_description,
    description: parent.description,
    features: parent.features,
    color_variants:
      ensureArray(variant.colors).map((c: any) => ({
        name: c.name,
        images: ensureArray(c.images),
      })),
    dimensions: variant.dimensions || parent.dimensions,
    material: parent.material,
    availability: parent.availability,
    featured: false,
    sort_order: parent.sort_order + 1,
  });

  return newProduct;
}