import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import {
  Star,
  MessageCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Truck,
  Award,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { listProducts, resolveImageUrl } from "@/lib/products-api";
import { BUSINESS } from "@/lib/business";
import { ProductCard } from "@/components/site/ProductCard";

interface MediaItem {
  type: "image" | "video";
  url: string;
  poster?: string;
}

function formatRupeePrice(price?: number | string | null): string {
  if (price === undefined || price === null || price === "") return "₹0";
  const num = typeof price === "string" ? Number(price) : price;
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
}

const COLOR_MAP: Record<string, string> = {
  gray: "#808080",
  grey: "#808080",
  "charcoal grey": "#36454F",
  "charcoal gray": "#36454F",
  "mustard yellow": "#E1AD01",
  yellow: "#EAB308",
  "ivory white": "#FAF6F0",
  ivory: "#FBF8F1",
  white: "#FFFFFF",
  "emerald green": "#50C878",
  "olive green": "#556B2F",
  green: "#2E8B57",
  "forest green": "#1B4D3E",
  beige: "#E8D8C8",
  "rust orange": "#C45508",
  orange: "#FFA500",
  "coral orange": "#FF7F50",
  "navy blue": "#000080",
  "neavy blue": "#000080",
  "neavy blue velvet": "#1E2A4A",
  "navy blue velvet": "#1E2A4A",
  blue: "#1E3A8A",
  "royal blue": "#4169E1",
  black: "#1A1A1A",
  "classic black": "#1A1A1A",
  brown: "#8B4513",
  "chocolate brown": "#4B3621",
  "dark brown": "#5C2C16",
  tan: "#D2B48C",
  "tan & cream": "#D2B48C",
  dove: "#8C8D8A",
  taupe: "#B38B6D",
  cognac: "#9E4714",
  red: "#DC2626",
  "classic red": "#B91C1C",
  "burgundy red": "#800020",
  burgundy: "#800020",
  pink: "#F4B6C2",
  rose: "#F43F5E",
  "blush pink": "#F4B6C2",
  "blush rose": "#F4B6C2",
  "light grey": "#D3D3D3",
  "light gray": "#D3D3D3",
};

function getSwatchHex(name?: string, fallbackHex?: string): string {
  if (fallbackHex && fallbackHex.startsWith("#")) return fallbackHex;
  if (!name) return "#E5E7EB";
  const clean = name.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  if (COLOR_MAP[clean]) return COLOR_MAP[clean];
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (clean.includes(key)) return hex;
  }
  return "#D1D5DB";
}

function sanitizeUrl(val: any): string {
  if (!val || typeof val !== "string") return "";
  let trimmed = val.trim();
  if (trimmed.includes("ibb.co/") && !trimmed.includes("i.ibb.co/")) {
    trimmed = trimmed.replace("https://ibb.co/", "https://i.ibb.co/").replace("http://ibb.co/", "https://i.ibb.co/");
  }
  return resolveImageUrl(trimmed);
}

function extractImagesFromObj(obj: any): string[] {
  if (!obj) return [];
  const found: string[] = [];

  const add = (val: any) => {
    const s = sanitizeUrl(val);
    if (s && s !== "/placeholder.svg" && !found.includes(s)) {
      found.push(s);
    }
  };

  add(obj.image_url);
  add(obj.image);
  add(obj.imageUrl);
  add(obj.swatch_url);
  add(obj.thumbnail);

  const arrays = [obj.images, obj.gallery, obj.gallery_urls, obj.photos, obj.image_urls];
  arrays.forEach((arr) => {
    if (Array.isArray(arr)) {
      arr.forEach((item) => {
        if (typeof item === "string") add(item);
        else if (typeof item === "object" && item !== null) {
          add(item.url || item.image_url || item.image || item.imageUrl);
        }
      });
    }
  });

  return found;
}

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    try {
      const products = await listProducts();
      const product = products.find(
        (p: any) =>
          String(p.id) === params.id ||
          p.slug === params.id ||
          p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === params.id
      );
      if (!product) throw notFound();
      return { product, allProducts: products };
    } catch {
      throw notFound();
    }
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const loaderData = Route.useLoaderData();

  const { data: products = loaderData.allProducts } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
    initialData: loaderData.allProducts,
  });

  const product: any =
    products.find(
      (p: any) =>
        String(p.id) === id ||
        p.slug === id ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id
    ) || loaderData.product;

  // 1. Dimension / Size Variants
  const dimensionVariants: any[] = useMemo(() => {
    const raw =
      product.dimension_variants ||
      product.size_variants ||
      product.sizes ||
      product.dimension_options ||
      [];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.filter((d: any) => d && (d.name || d.dimensions || d.label || d.title));
    }
    return [];
  }, [product]);

  const [selectedDimensionIdx, setSelectedDimensionIdx] = useState(0);
  const activeDimension = dimensionVariants[selectedDimensionIdx] || null;

  // 2. Color Variants
  const activeColorVariants: any[] = useMemo(() => {
    const nested =
      activeDimension?.color_variants ||
      activeDimension?.variants ||
      activeDimension?.colors ||
      activeDimension?.color_options;

    if (Array.isArray(nested) && nested.length > 0) {
      return nested.filter((v: any) => v && (v.name || v.color_name || v.label || extractImagesFromObj(v).length > 0));
    }

    const root =
      product.color_variants ||
      product.variants ||
      (Array.isArray(product.colors) && typeof product.colors[0] === "object" ? product.colors : null) ||
      (Array.isArray(product.color_options) && typeof product.color_options[0] === "object" ? product.color_options : null) ||
      [];

    if (Array.isArray(root) && root.length > 0) {
      return root.filter((v: any) => v && (v.name || v.color_name || v.label || extractImagesFromObj(v).length > 0));
    }

    return [];
  }, [product, activeDimension]);

  const hasColorVariants = activeColorVariants.length > 0;
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  useEffect(() => {
    if (selectedVariantIdx >= activeColorVariants.length) {
      setSelectedVariantIdx(0);
    }
  }, [activeColorVariants.length, selectedVariantIdx]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews" | "shipping">("desc");

  // 3. Media List Construction (Strictly bounded per selection)
  const mediaList: MediaItem[] = useMemo(() => {
    const currentVariant = activeColorVariants[selectedVariantIdx];
    let candidateImages: string[] = [];

    // Priority 1: Images attached to current color
    if (currentVariant) {
      candidateImages.push(...extractImagesFromObj(currentVariant));
    }

    // Priority 2: Images attached to current dimension
    if (candidateImages.length === 0 && activeDimension) {
      candidateImages.push(...extractImagesFromObj(activeDimension));
    }

    // Priority 3: Product root gallery
    if (candidateImages.length === 0) {
      candidateImages.push(...extractImagesFromObj(product));
    }

    const uniqueImages = Array.from(new Set(candidateImages.filter(Boolean)));
    const media: MediaItem[] = (uniqueImages.length > 0 ? uniqueImages : [sanitizeUrl(product.image_url) || "/placeholder.svg"]).map(
      (url) => ({
        type: "image",
        url,
      })
    );

    const videoUrl = product.video_url || product.video || product.videoUrl;
    if (videoUrl && typeof videoUrl === "string" && videoUrl.trim().length > 0) {
      media.push({
        type: "video",
        url: videoUrl.trim(),
        poster: media[0]?.url,
      });
    }

    return media;
  }, [product, activeDimension, activeColorVariants, selectedVariantIdx]);

  const totalMedia = mediaList.length;

  useEffect(() => {
    if (activeSlide >= totalMedia) {
      setActiveSlide(0);
    }
  }, [totalMedia, activeSlide]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % totalMedia);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + totalMedia) % totalMedia);
  const activeMedia = mediaList[activeSlide] || mediaList[0];

  // Dimension Change
  const handleDimensionChange = (idx: number) => {
    setSelectedDimensionIdx(idx);
    setSelectedVariantIdx(0);
    setActiveSlide(0);
  };

  // Color Swatch Click
  const handleColorChange = (idx: number) => {
    setSelectedVariantIdx(idx);
    const targetVariant = activeColorVariants[idx];
    const variantImgs = extractImagesFromObj(targetVariant);

    if (variantImgs.length > 0) {
      const matchIndex = mediaList.findIndex((m) => m.url === variantImgs[0]);
      if (matchIndex !== -1) {
        setActiveSlide(matchIndex);
        return;
      }
    }

    // Fallback: cycle image index if images exist sequentially in root
    if (idx < totalMedia) {
      setActiveSlide(idx);
    } else {
      setActiveSlide(0);
    }
  };

  const displayPrice = useMemo(() => {
    if (activeDimension?.price) return activeDimension.price;
    if (activeColorVariants[selectedVariantIdx]?.price) return activeColorVariants[selectedVariantIdx].price;
    return product.price;
  }, [activeDimension, activeColorVariants, selectedVariantIdx, product.price]);

  const selectedColorName = hasColorVariants
    ? activeColorVariants[selectedVariantIdx]?.name ||
      activeColorVariants[selectedVariantIdx]?.color_name ||
      activeColorVariants[selectedVariantIdx]?.label ||
      `Option ${selectedVariantIdx + 1}`
    : "";

  const selectedSizeInfo = activeDimension
    ? activeDimension.name || activeDimension.label || activeDimension.dimensions || ""
    : "";

  const whatsappMessage = encodeURIComponent(
    `Hi ${BUSINESS.name}! I am interested in "${product.name}" (${formatRupeePrice(displayPrice)})${
      selectedColorName ? ` in ${selectedColorName}` : ""
    }${selectedSizeInfo ? ` | Size: ${selectedSizeInfo}` : ""}.\n\nProduct Link: ${
      typeof window !== "undefined" ? window.location.href : ""
    }`
  );
  const quoteMessage = encodeURIComponent(
    `Hi ${BUSINESS.name}! I would like to request a quote for "${product.name}" with custom specifications.`
  );

  const whatsappUrl = `https://wa.me/${BUSINESS.phoneRaw}?text=${whatsappMessage}`;
  const quoteUrl = `https://wa.me/${BUSINESS.phoneRaw}?text=${quoteMessage}`;

  const relatedProducts = useMemo(() => {
    const currentCategory = (product.category ?? "").trim().toLowerCase();
    const currentSub = (product.sub_type ?? "").trim().toLowerCase();

    const matched = products.filter((p: any) => {
      if (p.id === product.id) return false;
      const cat = (p.category ?? "").trim().toLowerCase();
      const sub = (p.sub_type ?? "").trim().toLowerCase();
      return (
        (currentCategory && cat === currentCategory) ||
        (currentSub && sub === currentSub) ||
        (currentCategory && (cat.includes(currentCategory) || currentCategory.includes(cat)))
      );
    });

    if (matched.length >= 4) return matched.slice(0, 8);

    const otherProducts = products.filter(
      (p: any) => p.id !== product.id && !matched.some((m: any) => m.id === p.id)
    );
    return [...matched, ...otherProducts].slice(0, 8);
  }, [products, product]);

  const currentDimensionsText =
    activeDimension?.dimensions ||
    activeDimension?.spec ||
    activeDimension?.description ||
    product.dimensions ||
    "";

  return (
    <div className="min-h-screen bg-background py-6 md:py-8">
      <div className="container-px mx-auto max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-foreground">Catalog</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link
                to="/catalog"
                search={{ category: product.category.toLowerCase() } as any}
                className="hover:text-foreground"
              >
                {product.category}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-[260px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Product Showcase */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14 items-start">
          {/* Left Column: Image Slider */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs">
              <div className="absolute right-3.5 top-3.5 z-10 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                {activeSlide + 1} / {totalMedia}
              </div>

              {activeMedia.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-black">
                  <video
                    key={activeMedia.url}
                    src={activeMedia.url}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <img
                  key={`${selectedDimensionIdx}-${selectedVariantIdx}-${activeSlide}-${activeMedia.url}`}
                  src={activeMedia.url || sanitizeUrl(product.image_url)}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain p-2 transition-all duration-300"
                />
              )}

              {totalMedia > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground shadow-xs hover:bg-background cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground shadow-xs hover:bg-background cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Slider Dots */}
            {totalMedia > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap px-2">
                {mediaList.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                      activeSlide === idx
                        ? "w-6 bg-emerald"
                        : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details, Selectors, and Actions */}
          <div className="flex flex-col lg:col-span-6 xl:col-span-6">
            <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              {product.category || product.sub_type || "FURNITURE"}
            </span>

            <h1 className="mt-1 font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <span className="font-semibold text-foreground">
                {product.rating ? Number(product.rating).toFixed(1) : "4.8"}
              </span>
              <span>({product.review_count || 0} reviews)</span>
            </div>

            <div className="mt-3 font-sans text-2xl sm:text-3xl font-bold text-foreground">
              <span className="text-xs font-normal text-muted-foreground mr-1">from</span>
              {formatRupeePrice(displayPrice)}
            </div>

            {/* 1. SELECT SIZE / DIMENSIONS */}
            {dimensionVariants.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-foreground">
                  1. Select Size / Dimensions:
                </div>
                <div
                  className="mt-2 flex gap-2 overflow-x-auto pb-1.5 scroll-smooth"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {dimensionVariants.map((dim: any, idx: number) => {
                    const isSelected = selectedDimensionIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDimensionChange(idx)}
                        className={`flex min-w-[170px] max-w-[210px] flex-shrink-0 flex-col justify-between rounded-xl border p-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald bg-emerald/5 ring-1 ring-emerald/30 shadow-2xs"
                            : "border-border bg-card hover:border-foreground/40"
                        }`}
                      >
                        <div>
                          <div className="truncate text-[11px] font-semibold text-foreground">
                            {dim.name || dim.label || `Size ${idx + 1}`}
                          </div>
                          {dim.dimensions && (
                            <div className="mt-0.5 line-clamp-2 text-[9.5px] leading-tight text-muted-foreground">
                              {dim.dimensions}
                            </div>
                          )}
                        </div>
                        {dim.price && (
                          <div className="mt-1.5 font-sans text-[11px] font-bold text-foreground">
                            {formatRupeePrice(dim.price)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. SELECT COLOR */}
            {hasColorVariants && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-foreground">
                  {dimensionVariants.length > 0 ? "2. " : "1. "}Select Color:{" "}
                  <span className="uppercase font-semibold text-emerald">
                    {selectedColorName}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {activeColorVariants.map((variant: any, idx: number) => {
                    const variantImgs = extractImagesFromObj(variant);
                    const variantThumb = variantImgs[0] || variant.swatch_url;
                    const colorName = variant.name || variant.color_name || variant.label || "";
                    const colorHex = getSwatchHex(colorName, variant.hex || variant.color_code);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleColorChange(idx)}
                        aria-label={colorName || `Color option ${idx + 1}`}
                        className={`h-9 w-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedVariantIdx === idx
                            ? "border-emerald ring-2 ring-emerald/30 scale-105"
                            : "border-border hover:border-foreground/50"
                        }`}
                        style={{ backgroundColor: colorHex }}
                      >
                        {variantThumb ? (
                          <img
                            src={variantThumb}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action CTAs */}
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-95"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Enquiry
              </a>
              <a
                href={quoteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <FileText className="h-4 w-4" /> Request a Quote
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-3.5 sm:grid-cols-4">
              <div className="flex items-start gap-1.5">
                <Truck className="h-3.5 w-3.5 text-emerald flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10.5px] font-semibold text-foreground">Pan India Delivery</div>
                  <div className="text-[9.5px] text-muted-foreground">Safe & Insured</div>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <Award className="h-3.5 w-3.5 text-emerald flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10.5px] font-semibold text-foreground">Premium Quality</div>
                  <div className="text-[9.5px] text-muted-foreground">Assured</div>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10.5px] font-semibold text-foreground">1-2 Years Warranty</div>
                  <div className="text-[9.5px] text-muted-foreground">On Frame</div>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10.5px] font-semibold text-foreground">Secure Payment</div>
                  <div className="text-[9.5px] text-muted-foreground">100% Safe</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info & Detailed Description */}
        <div className="mt-10 border-t border-border/80 pt-6">
          <div className="flex gap-6 border-b border-border text-xs sm:text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("desc")}
              className={`pb-3 transition-colors cursor-pointer ${
                activeTab === "desc"
                  ? "border-b-2 border-emerald font-semibold text-emerald"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("specs")}
              className={`pb-3 transition-colors cursor-pointer ${
                activeTab === "specs"
                  ? "border-b-2 border-emerald font-semibold text-emerald"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 transition-colors cursor-pointer ${
                activeTab === "reviews"
                  ? "border-b-2 border-emerald font-semibold text-emerald"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reviews ({product.review_count || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shipping")}
              className={`pb-3 transition-colors cursor-pointer ${
                activeTab === "shipping"
                  ? "border-b-2 border-emerald font-semibold text-emerald"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Shipping & Returns
            </button>
          </div>

          <div className="pt-5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {activeTab === "desc" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7 space-y-3">
                  <p className="leading-relaxed whitespace-pre-line text-foreground/90">
                    {product.description ||
                      `${product.name} brings timeless sophistication into your space. Crafted with reinforced framing and high-density cushioning designed to provide lasting support.`}
                  </p>

                  {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                    <ul className="mt-3 list-disc pl-5 space-y-1 text-muted-foreground">
                      {product.features.map((feat: string, i: number) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-4 lg:col-span-5">
                  <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground">
                    Specifications
                  </h4>
                  <div className="mt-3 space-y-2.5 text-[11.5px]">
                    <div>
                      <span className="font-semibold text-foreground">Material: </span>
                      <span className="text-muted-foreground">
                        {product.material ||
                          product.fabric ||
                          "Premium upholstery fabric with high-resilience comfort foam and solid internal wood framing."}
                      </span>
                    </div>
                    {currentDimensionsText && (
                      <div>
                        <span className="font-semibold text-foreground">Dimensions: </span>
                        <span className="text-muted-foreground">{currentDimensionsText}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-foreground">Availability: </span>
                      <span className="text-muted-foreground">{product.availability || "Made to Order"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Warranty: </span>
                      <span className="text-muted-foreground">
                        {product.warranty || "1-2 Years on Frame"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-3xl text-xs">
                <div>
                  <span className="font-semibold text-foreground">Material & Frame:</span>
                  <p className="mt-1 text-muted-foreground">
                    {product.material ||
                      "Reinforced solid timber internal framing, high-resilience foam, luxury upholstery fabric."}
                  </p>
                </div>
                {currentDimensionsText && (
                  <div>
                    <span className="font-semibold text-foreground">Dimensions:</span>
                    <p className="mt-1 text-muted-foreground">{currentDimensionsText}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <p>There are no reviews yet for this piece. Be the first to share your experience!</p>
            )}

            {activeTab === "shipping" && (
              <p>
                Pan-India delivery available. Each piece is custom built and carefully wrapped with multi-layer protective packaging for safe transit.
              </p>
            )}
          </div>
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 border-t border-border/80 pt-8">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-emerald font-semibold">
                  EXPLORE MORE
                </span>
                <h2 className="mt-0.5 font-display text-lg sm:text-xl font-bold text-foreground">
                  You May Also Like
                </h2>
              </div>
              <Link
                to="/catalog"
                search={{ category: (product.category ?? "").toLowerCase() } as any}
                className="text-xs font-medium text-emerald hover:underline"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {relatedProducts.map((relProduct: any) => (
                <div key={relProduct.id} className="h-full">
                  <ProductCard p={relProduct} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}