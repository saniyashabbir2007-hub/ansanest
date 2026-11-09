import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
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
}

interface NormalizedColor {
  id: string;
  name: string;
  hex: string;
  thumb: string;
  targetSlideIndex: number;
  price?: number | null;
}

function formatRupeePrice(price?: number | string | null): string {
  if (price === undefined || price === null || price === "") return "₹0";
  const num = typeof price === "string" ? Number(price) : price;
  if (isNaN(num)) return "₹0";
  return "₹" + num.toLocaleString("en-IN");
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

function getColorHex(name: string): string {
  if (!name) return "#C4C4C4";
  const clean = name.toLowerCase().replace(/[^a-z\s]/g, "").trim();

  if (COLOR_MAP[clean]) return COLOR_MAP[clean];

  for (const key of Object.keys(COLOR_MAP)) {
    if (clean.includes(key)) {
      return COLOR_MAP[key];
    }
  }

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 50%, 65%)`;
}

function isLegitimateColorName(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const lower = name.toLowerCase().trim();
  const blacklist = [
    "custom",
    "available",
    "also",
    "warranty",
    "assembly",
    "guarantee",
    "feature",
    "specification",
    "dimension",
    "material",
    "frame",
    "seater",
    "cushion",
    "foam",
    "patchwork",
    "capacity",
    "weight",
    "size",
    "lbs",
  ];
  if (blacklist.some((term) => lower.includes(term))) return false;
  if (lower.length > 25 || lower.length < 2) return false;
  return true;
}

function sanitizeImgUrl(url: string | null | undefined): string {
  if (!url) return "";
  let trimmed = String(url).trim();
  if (trimmed.includes("ibb.co/") && !trimmed.includes("i.ibb.co/")) {
    trimmed = trimmed.replace("https://ibb.co/", "https://i.ibb.co/");
    trimmed = trimmed.replace("http://ibb.co/", "https://i.ibb.co/");
  }
  return resolveImageUrl(trimmed);
}

function extractUrls(target: any): string[] {
  if (!target) return [];
  const found: string[] = [];

  const add = (val: any) => {
    if (typeof val === "string" && val.trim().length > 0) {
      const resolved = sanitizeImgUrl(val.trim());
      if (resolved && resolved !== "/placeholder.svg") {
        found.push(resolved);
      }
    }
  };

  if (typeof target === "string") {
    add(target);
    return found;
  }

  if (Array.isArray(target)) {
    target.forEach((item) => {
      extractUrls(item).forEach((u) => found.push(u));
    });
    return Array.from(new Set(found));
  }

  if (typeof target === "object" && target !== null) {
    add(target.image_url);
    add(target.imageUrl);
    add(target.image);
    add(target.swatch_url);
    add(target.url);
    add(target.thumbnail);

    const subArrays = [target.images, target.gallery, target.gallery_urls, target.photos, target.image_urls];
    subArrays.forEach((arr) => {
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          extractUrls(item).forEach((u) => found.push(u));
        });
      }
    });
  }

  return Array.from(new Set(found));
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

  // 1. DIMENSION / SIZE VARIANTS
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

  const hasDimensions = dimensionVariants.length > 0;
  const [selectedDimensionIdx, setSelectedDimensionIdx] = useState(0);
  const activeDimension = hasDimensions ? dimensionVariants[selectedDimensionIdx] || null : null;

  // 2. PRODUCT'S COMPLETE GALLERY (NEVER COLLAPSES TO 1/1)
  const productGallery = useMemo(() => {
    const list: string[] = [];
    if (product.image_url) {
      const main = sanitizeImgUrl(product.image_url);
      if (main && main !== "/placeholder.svg") list.push(main);
    }
    extractUrls(product.gallery_urls).forEach((u) => list.push(u));
    extractUrls(product.images).forEach((u) => list.push(u));

    const unique = Array.from(new Set(list.filter(Boolean)));
    return unique.length > 0 ? unique : [sanitizeImgUrl(product.image_url) || "/placeholder.svg"];
  }, [product]);

  const primaryFallback = productGallery[0] || "/placeholder.svg";

  // MEDIA CAROUSEL LIST
  const mediaList: MediaItem[] = useMemo(() => {
    const list: MediaItem[] = productGallery.map((url) => ({
      type: "image",
      url,
    }));

    const videoUrl = product.video_url || product.video || product.videoUrl;
    if (videoUrl && typeof videoUrl === "string" && videoUrl.trim().length > 0) {
      list.push({
        type: "video",
        url: videoUrl.trim(),
      });
    }

    return list;
  }, [productGallery, product]);

  const totalMedia = mediaList.length;

  // 3. COLOR VARIANTS FOR THIS PRODUCT
  const availableColors: NormalizedColor[] = useMemo(() => {
    let rawList: any[] = [];

    const dimColors =
      activeDimension?.color_variants ||
      activeDimension?.variants ||
      activeDimension?.colors ||
      activeDimension?.color_options;

    if (Array.isArray(dimColors) && dimColors.length > 0) {
      rawList = dimColors;
    } else if (Array.isArray(product.color_variants) && product.color_variants.length > 0) {
      rawList = product.color_variants;
    } else if (Array.isArray(product.colors) && product.colors.length > 0) {
      rawList = product.colors;
    }

    if (!rawList || rawList.length === 0) return [];

    const candidateColors: NormalizedColor[] = [];

    for (let idx = 0; idx < rawList.length; idx++) {
      const c = rawList[idx];
      let name = "";
      let images: string[] = [];
      let swatchUrl = "";
      let price: number | null = null;
      let explicitColorCode = "";

      if (typeof c === "string") {
        name = c.trim();
      } else if (typeof c === "object" && c !== null) {
        name = c.name || c.color_name || c.colorName || c.label || "";
        images = extractUrls(c);
        swatchUrl = c.swatch_url || c.thumbnail || c.imageUrl || (images.length > 0 ? images[0] : "");
        explicitColorCode = c.colorCode || c.color_code || c.hex || "";
        if (c.price) price = Number(c.price);
      }

      const cleanName = name.replace(/[^a-zA-Z\s&-]/g, "").trim();
      if (!cleanName || !isLegitimateColorName(cleanName)) continue;

      const hex = explicitColorCode || getColorHex(cleanName);
      const thumb = sanitizeImgUrl(swatchUrl);

      // Map color directly to slide index in productGallery
      let targetSlideIndex = 0;
      if (images.length > 0) {
        const found = productGallery.findIndex((img) => img === images[0]);
        if (found !== -1) targetSlideIndex = found;
      } else if (thumb) {
        const found = productGallery.findIndex((img) => img === thumb);
        if (found !== -1) targetSlideIndex = found;
      } else {
        const firstWord = cleanName.toLowerCase().split(" ")[0];
        const keywordMatch = productGallery.findIndex((img) => img.toLowerCase().includes(firstWord));
        if (keywordMatch !== -1) {
          targetSlideIndex = keywordMatch;
        } else {
          // Direct 1-to-1 index matching
          targetSlideIndex = Math.min(idx, productGallery.length - 1);
        }
      }

      candidateColors.push({
        id: c?.id || `color-${idx}`,
        name: cleanName,
        hex,
        thumb,
        targetSlideIndex,
        price,
      });
    }

    if (candidateColors.length < 2) return [];

    return candidateColors;
  }, [product, activeDimension, productGallery]);

  const hasColors = availableColors.length >= 2;
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  const activeColor = hasColors ? availableColors[selectedColorIdx] || availableColors[0] : null;

  // DIMENSION CHANGE: Selects dimension without emptying the gallery
  const handleDimensionChange = (newDimIdx: number) => {
    setSelectedDimensionIdx(newDimIdx);
    setSelectedColorIdx(0);

    const nextDim = dimensionVariants[newDimIdx];
    const dimImages = extractUrls(nextDim?.images || nextDim?.gallery);

    if (dimImages.length > 0) {
      const matchIdx = productGallery.findIndex((img) => img === dimImages[0]);
      if (matchIdx !== -1) {
        setActiveSlide(matchIdx);
        return;
      }
    }
    setActiveSlide(0);
  };

  // COLOR CLICK: Switches directly to that color's photo
  const handleColorClick = (idx: number) => {
    setSelectedColorIdx(idx);
    const targetColor = availableColors[idx];
    if (!targetColor) return;

    if (targetColor.targetSlideIndex >= 0 && targetColor.targetSlideIndex < totalMedia) {
      setActiveSlide(targetColor.targetSlideIndex);
    } else {
      setActiveSlide(Math.min(idx, totalMedia - 1));
    }
  };

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % totalMedia);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + totalMedia) % totalMedia);
  const activeMedia = mediaList[activeSlide] || mediaList[0] || { type: "image", url: primaryFallback };

  const displayPrice = useMemo(() => {
    if (activeColor?.price) return activeColor.price;
    if (activeDimension?.price) return activeDimension.price;
    return product.price;
  }, [activeColor, activeDimension, product.price]);

  const selectedColorName = hasColors ? activeColor?.name || "" : "";
  const selectedSizeInfo = activeDimension
    ? activeDimension.name || activeDimension.label || activeDimension.dimensions || ""
    : "";

  const whatsappMsgText = [
    "Hi " + BUSINESS.name + "! I am interested in " + product.name + " (" + formatRupeePrice(displayPrice) + ")",
    selectedColorName ? "in " + selectedColorName : "",
    selectedSizeInfo ? "| Size: " + selectedSizeInfo : "",
    typeof window !== "undefined" ? "Product Link: " + window.location.href : "",
  ]
    .filter(Boolean)
    .join(" ");

  const whatsappUrl = "https://wa.me/" + BUSINESS.phoneRaw + "?text=" + encodeURIComponent(whatsappMsgText);
  const quoteUrl =
    "https://wa.me/" +
    BUSINESS.phoneRaw +
    "?text=" +
    encodeURIComponent("Hi " + BUSINESS.name + "! I would like to request a quote for " + product.name + ".");

  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews" | "shipping">("desc");

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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14 items-start">
          {/* Main Media Carousel */}
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
                  key={activeMedia.url}
                  src={activeMedia.url || primaryFallback}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain p-2 transition-all duration-300"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src !== primaryFallback) {
                      img.src = primaryFallback;
                    }
                  }}
                  onLoad={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (
                      img.src.includes("imgbb.com") &&
                      ((img.naturalWidth === 500 && img.naturalHeight === 500) || img.naturalWidth <= 1)
                    ) {
                      img.src = primaryFallback;
                    }
                  }}
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

            {totalMedia > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap px-2">
                {mediaList.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeSlide === idx
                        ? "w-6 bg-emerald"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details & Selectors */}
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
            {hasDimensions && (
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
            {hasColors && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-foreground">
                  {hasDimensions ? "2. " : "1. "}Select Color:{" "}
                  <span className="uppercase font-semibold text-emerald">
                    {selectedColorName}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {availableColors.map((color, idx) => {
                    const isSelected = selectedColorIdx === idx;
                    const isWhiteColor = color.hex.toLowerCase() === "#ffffff" || color.name.toLowerCase().includes("white");

                    return (
                      <button
                        key={color.id || idx}
                        type="button"
                        title={color.name}
                        onClick={() => handleColorClick(idx)}
                        aria-label={color.name}
                        className={`group relative h-9 w-9 rounded-full overflow-hidden border transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald ring-2 ring-emerald/40 scale-110 shadow-sm"
                            : isWhiteColor
                            ? "border-neutral-300 hover:border-neutral-500"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {color.thumb ? (
                          <img
                            src={color.thumb}
                            alt={color.name}
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

        {/* Tabbed Info */}
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
                      product.name +
                        " brings timeless sophistication into your space. Crafted with reinforced framing and high-density cushioning designed to provide lasting support."}
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