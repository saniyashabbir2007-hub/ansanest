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
  Share2,
  Check,
  Maximize2,
  X,
  Info,
  Sparkles,
  Clock,
  PhoneCall,
} from "lucide-react";
import { listProducts } from "@/lib/products-api";
import { BUSINESS } from "@/lib/business";
import { ProductCard } from "@/components/site/ProductCard";

interface MediaItem {
  type: "image" | "video";
  url: string;
  poster?: string;
}

interface SpecItem {
  label: string;
  value: string;
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
  "mocha brown": "#5C3A21",
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

function cleanDirectUrl(url: any): string {
  if (!url || typeof url !== "string") return "";
  let trimmed = url.trim();
  if (!trimmed || trimmed === "/placeholder.svg" || trimmed === "undefined" || trimmed === "null") return "";
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
    return "";
  }
  if (trimmed.includes("ibb.co/") && !trimmed.includes("i.ibb.co/")) {
    trimmed = trimmed.replace("https://ibb.co/", "https://i.ibb.co/").replace("http://ibb.co/", "https://i.ibb.co/");
  }
  return trimmed;
}

function extractImagesFromObj(obj: any): string[] {
  if (!obj) return [];
  const found: string[] = [];

  const add = (val: any) => {
    const s = cleanDirectUrl(val);
    if (s && !found.includes(s)) {
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

  // 1. Dimensions / Sizes
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
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews" | "shipping" | "warranty">("desc");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [brokenUrls, setBrokenUrls] = useState<Record<string, boolean>>({});

  // 3. Media List Construction (Strictly Valid URLs only)
  const mediaList: MediaItem[] = useMemo(() => {
    const currentVariant = activeColorVariants[selectedVariantIdx];
    let candidateImages: string[] = [];

    if (currentVariant) {
      candidateImages.push(...extractImagesFromObj(currentVariant));
    }

    if (candidateImages.length === 0 && activeDimension) {
      candidateImages.push(...extractImagesFromObj(activeDimension));
    }

    if (candidateImages.length === 0) {
      candidateImages.push(...extractImagesFromObj(product));
    }

    const validImages = Array.from(new Set(candidateImages))
      .filter((u) => u && typeof u === "string" && u.trim().length > 5 && !brokenUrls[u]);

    const finalImages = validImages.length > 0 
      ? validImages 
      : [cleanDirectUrl(product.image_url) || "/placeholder.svg"];

    const media: MediaItem[] = finalImages.map((url) => ({
      type: "image",
      url,
    }));

    const videoUrl = cleanDirectUrl(product.video_url || product.video || product.videoUrl);
    if (videoUrl) {
      media.push({
        type: "video",
        url: videoUrl,
        poster: media[0]?.url,
      });
    }

    return media;
  }, [product, activeDimension, activeColorVariants, selectedVariantIdx, brokenUrls]);

  const totalMedia = mediaList.length;

  useEffect(() => {
    if (activeSlide >= totalMedia) {
      setActiveSlide(0);
    }
  }, [totalMedia, activeSlide]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % totalMedia);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + totalMedia) % totalMedia);
  const activeMedia = mediaList[activeSlide] || mediaList[0] || { type: "image", url: "/placeholder.svg" };

  const handleDimensionChange = (idx: number) => {
    setSelectedDimensionIdx(idx);
    setSelectedVariantIdx(0);
    setActiveSlide(0);
  };

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
    `Hi ${BUSINESS.name}! I would like to request a customized quote for "${product.name}" with custom dimensions/fabric.`
  );

  const whatsappUrl = `https://wa.me/${BUSINESS.phoneRaw}?text=${whatsappMessage}`;
  const quoteUrl = `https://wa.me/${BUSINESS.phoneRaw}?text=${quoteMessage}`;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator
          .share({
            title: product.name,
            text: `Check out ${product.name} on ${BUSINESS.name}`,
            url: window.location.href,
          })
          .catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  const specificationsList: SpecItem[] = useMemo(() => {
    const list: SpecItem[] = [];

    const dim =
      activeDimension?.dimensions ||
      activeDimension?.spec ||
      activeDimension?.description ||
      product.dimensions;
    if (dim) list.push({ label: "Dimensions", value: dim });

    const mat = product.material || product.fabric;
    if (mat) list.push({ label: "Upholstery & Material", value: mat });

    const frame = product.frame || product.frame_material || "Solid Treated Hardwood Frame";
    list.push({ label: "Internal Structure", value: frame });

    const foam = product.foam || product.cushioning || "High-Resilience Multi-Density Comfort Foam";
    list.push({ label: "Cushioning Fill", value: foam });

    const seating = product.seating_capacity || activeDimension?.name || product.sub_type;
    if (seating) list.push({ label: "Seating Setup", value: seating });

    const warranty = product.warranty || "1-2 Years Warranty on Frame";
    list.push({ label: "Warranty Coverage", value: warranty });

    const assembly = product.assembly || "Minimal / Pre-assembled (Leg installation if needed)";
    list.push({ label: "Assembly", value: assembly });

    const care = product.care_instructions || "Professional dry clean or wipe clean with damp cloth";
    list.push({ label: "Care Guide", value: care });

    return list;
  }, [product, activeDimension]);

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

  return (
    <div className="min-h-screen bg-background py-6 md:py-10">
      <div className="container-px mx-auto max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/catalog" className="hover:text-foreground">Catalog</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link
                  to="/catalog"
                  search={{ category: product.category.toLowerCase() } as any}
                  className="hover:text-foreground capitalize"
                >
                  {product.category}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground font-medium truncate max-w-[220px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1 text-xs text-muted-foreground transition hover:border-foreground/40 hover:text-foreground cursor-pointer"
          >
            {copySuccess ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Share2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copySuccess ? "Link Copied!" : "Share"}</span>
          </button>
        </div>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14 items-start">
          {/* Main Media Carousel */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs group">
              <div className="absolute right-3.5 top-3.5 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="Enlarge image"
                  className="rounded-md bg-black/60 p-1.5 text-white backdrop-blur-xs transition hover:bg-black/80 cursor-pointer"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <div className="rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                  {activeSlide + 1} / {totalMedia}
                </div>
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
                  key={activeMedia.url}
                  src={activeMedia.url}
                  alt={product.name}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-contain p-2 transition-all duration-200 cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                  onError={() => {
                    setBrokenUrls((prev) => ({ ...prev, [activeMedia.url]: true }));
                  }}
                />
              )}

              {totalMedia > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Slider Dots */}
            {totalMedia > 1 && (
              <div className="mt-3.5 flex items-center justify-center gap-1.5 flex-wrap px-2">
                {mediaList.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeSlide === idx
                        ? "w-6 bg-emerald"
                        : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Customizers */}
          <div className="flex flex-col lg:col-span-6 xl:col-span-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-emerald font-semibold">
                {product.category || product.sub_type || "ANSA NEST COLLECTION"}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald/10 px-2 py-0.5 text-[9px] font-medium text-emerald">
                Made to Order
              </span>
            </div>

            <h1 className="mt-1 font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <span className="font-semibold text-foreground">
                {product.rating ? Number(product.rating).toFixed(1) : "4.8"}
              </span>
              <span>•</span>
              <span className="text-muted-foreground">{product.review_count || 12} verified customer reviews</span>
            </div>

            <div className="mt-3.5 flex items-baseline gap-2.5">
              <span className="text-xs font-normal text-muted-foreground">Starting from</span>
              <span className="font-sans text-3xl font-bold text-foreground">
                {formatRupeePrice(displayPrice)}
              </span>
              <span className="text-[11px] text-muted-foreground">(Inclusive of all taxes)</span>
            </div>

            {/* 1. Dimensions Selector */}
            {dimensionVariants.length > 0 && (
              <div className="mt-5 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    1. Select Size / Dimensions:
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {dimensionVariants.length} sizes available
                  </span>
                </div>
                <div
                  className="mt-2.5 flex gap-2 overflow-x-auto pb-1.5 scroll-smooth"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {dimensionVariants.map((dim: any, idx: number) => {
                    const isSelected = selectedDimensionIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDimensionChange(idx)}
                        className={`flex min-w-[170px] max-w-[220px] flex-shrink-0 flex-col justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald bg-emerald/5 ring-1 ring-emerald/30 shadow-2xs"
                            : "border-border bg-card hover:border-foreground/40"
                        }`}
                      >
                        <div>
                          <div className="truncate text-xs font-semibold text-foreground">
                            {dim.name || dim.label || `Size ${idx + 1}`}
                          </div>
                          {dim.dimensions && (
                            <div className="mt-1 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                              {dim.dimensions}
                            </div>
                          )}
                        </div>
                        {dim.price && (
                          <div className="mt-2 font-sans text-xs font-bold text-foreground">
                            {formatRupeePrice(dim.price)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Circular Color Swatches */}
            {hasColorVariants && (
              <div className="mt-4 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {dimensionVariants.length > 0 ? "2. " : "1. "}Select Color / Fabric:
                  </span>
                  <span className="text-xs uppercase font-semibold text-emerald">
                    {selectedColorName}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
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
                        title={colorName}
                        className={`group relative h-9 w-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedVariantIdx === idx
                            ? "border-emerald ring-2 ring-emerald/30 scale-110 shadow-sm"
                            : "border-border hover:border-foreground/50 hover:scale-105"
                        }`}
                        style={{ backgroundColor: colorHex }}
                      >
                        {variantThumb ? (
                          <img
                            src={variantThumb}
                            alt={colorName}
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

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-semibold text-white shadow-xs transition hover:opacity-95"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Enquiry
              </a>
              <a
                href={quoteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <FileText className="h-4 w-4" /> Request Custom Quote
              </a>
            </div>

            <div className="mt-3.5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <PhoneCall className="h-3.5 w-3.5 text-emerald" />
              <span>Direct manufacturing consultation available via WhatsApp.</span>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 grid grid-cols-2 gap-3.5 border-t border-border/60 pt-4 sm:grid-cols-4">
              <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-emerald flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-foreground">Pan-India Transit</div>
                  <div className="text-[10px] text-muted-foreground">Insured Delivery</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Award className="h-4 w-4 text-emerald flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-foreground">Solid Wood Frame</div>
                  <div className="text-[10px] text-muted-foreground">Kiln-Dried Timber</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-foreground">1-2 Yrs Warranty</div>
                  <div className="text-[10px] text-muted-foreground">On Structure</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-emerald flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-foreground">Secure Payment</div>
                  <div className="text-[10px] text-muted-foreground">Direct Gateway</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed In-Depth Information */}
        <div className="mt-12 border-t border-border/80 pt-8">
          <div className="flex gap-8 border-b border-border text-sm font-medium overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("desc")}
              className={`pb-3 transition cursor-pointer whitespace-nowrap ${
                activeTab === "desc"
                  ? "border-b-2 border-emerald font-semibold text-emerald"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Description & Craftsmanship
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("specs")}
              className={`pb-3 transition cursor-pointer whitespace-nowrap ${
                activeTab === "specs"
                  ? "border-b-2 border-emerald font-semibold text-emerald"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dimensions & Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 transition cursor-pointer whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-b-2 border-emerald font-semibold text-emerald"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Customer Reviews ({product.review_count || 12})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shipping")}
              className={`pb-3 transition cursor-pointer whitespace-nowrap ${
                activeTab === "shipping"
                  ? "border-b-2 border-emerald font-semibold text-emerald"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Delivery & White-Glove Setup
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("warranty")}
              className={`pb-3 transition cursor-pointer whitespace-nowrap ${
                activeTab === "warranty"
                  ? "border-b-2 border-emerald font-semibold text-emerald"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Warranty & Care
            </button>
          </div>

          <div className="pt-6 text-sm leading-relaxed text-muted-foreground">
            {activeTab === "desc" && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Artisanal Comfort Built for Contemporary Living
                  </h3>
                  <p className="leading-relaxed whitespace-pre-line text-foreground/90">
                    {product.description ||
                      `${product.name} delivers understated elegance and deep, supportive comfort to residential and executive interiors. Each unit is constructed by master craftsmen with reinforced internal jointing, heavy-duty webbing, and multilayered cushioning.`}
                  </p>

                  {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                        Key Architectural Features
                      </h4>
                      <ul className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {product.features.map((feat: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-emerald flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-5 lg:col-span-5 space-y-3">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                    Quick Specification Summary
                  </h4>
                  <div className="divide-y divide-border/60 text-xs">
                    {specificationsList.slice(0, 5).map((spec, i) => (
                      <div key={i} className="py-2 flex justify-between gap-4">
                        <span className="font-medium text-foreground">{spec.label}</span>
                        <span className="text-right text-muted-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="max-w-4xl space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {specificationsList.map((spec, i) => (
                    <div key={i} className="rounded-xl border border-border/70 bg-card p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {spec.label}
                      </div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-4 flex items-start gap-3">
                  <Info className="h-4 w-4 text-emerald flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-foreground/80 leading-normal">
                    Custom sizes, depth extensions, and high-density orthopedic foam configurations are available upon request through our custom design studio.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-6">
                  <div>
                    <div className="text-3xl font-bold font-sans text-foreground">
                      {product.rating ? Number(product.rating).toFixed(1) : "4.8"}
                    </div>
                    <div className="flex text-amber-500 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Based on {product.review_count || 12} authentic customer ratings
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Submit a Review
                  </a>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Arjun M. — Bengaluru</span>
                      <span className="text-[11px] text-muted-foreground">Verified Buyer</span>
                    </div>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-foreground/80">
                      "Outstanding build quality. The solid wood structure is substantial and the upholstery finish feels top notch. Prompt delivery."
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Sneha R. — Mumbai</span>
                      <span className="text-[11px] text-muted-foreground">Verified Buyer</span>
                    </div>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-foreground/80">
                      "We requested a custom size adjustment for our living room nook. The team accommodated the specs effortlessly."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="max-w-3xl space-y-4 text-xs leading-relaxed">
                <h4 className="text-sm font-semibold text-foreground">Safe Pan-India Transit & Unboxing</h4>
                <p>
                  Every furniture unit leaves our manufacturing workshop wrapped in a multi-layered protective cocoon including heavy-gauge bubble wrap, foam corner bumpers, and corrugated wooden outer boxing to prevent transit damages.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-lg border border-border p-3">
                    <Clock className="h-4 w-4 text-emerald mb-1" />
                    <div className="font-semibold text-foreground">Production Time</div>
                    <div className="text-muted-foreground">7 to 14 business days</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <Truck className="h-4 w-4 text-emerald mb-1" />
                    <div className="font-semibold text-foreground">Transit Duration</div>
                    <div className="text-muted-foreground">3 to 7 business days</div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <ShieldCheck className="h-4 w-4 text-emerald mb-1" />
                    <div className="font-semibold text-foreground">Transit Insurance</div>
                    <div className="text-muted-foreground">100% full value cover</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "warranty" && (
              <div className="max-w-3xl space-y-4 text-xs leading-relaxed">
                <h4 className="text-sm font-semibold text-foreground">Structural Warranty Coverage</h4>
                <p>
                  All ANSA NEST frames are warranted against termite infestation, joint looseness, and structural timber fractures under regular domestic usage for up to 2 years from delivery date.
                </p>
                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald flex-shrink-0 mt-0.5" />
                    <span>Free replacement or repair for any manufacturing framing defect.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald flex-shrink-0 mt-0.5" />
                    <span>Vacuum regularly with a soft brush attachment to keep upholstery clean.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald flex-shrink-0 mt-0.5" />
                    <span>Avoid direct exposure to harsh sunlight or moisture.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-border/80 pt-10">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald font-semibold">
                  DISCOVER MORE
                </span>
                <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
                  You May Also Like
                </h2>
              </div>
              <Link
                to="/catalog"
                search={{ category: (product.category ?? "").toLowerCase() } as any}
                className="text-xs font-semibold text-emerald hover:underline"
              >
                View collection →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedProducts.map((relProduct: any) => (
                <div key={relProduct.id} className="h-full">
                  <ProductCard p={relProduct} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close fullscreen view"
            className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={activeMedia.url}
              alt={product.name}
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
            />
          </div>

          {totalMedia > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 cursor-pointer"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}