import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, MessageCircle, Star, ShieldCheck, Truck, RefreshCw, Check } from "lucide-react";
import { listProducts, type Product } from "@/lib/products-api";
import { BUSINESS } from "@/lib/business";

function formatRupeePrice(price?: number | string | null): string {
  if (price === undefined || price === null || price === "") return "₹0";
  const num = typeof price === "string" ? Number(price) : price;
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
}

export const Route = createFileRoute("/catalog/$id")({
  loader: async ({ params }) => {
    try {
      const products = await listProducts();
      const product = products.find(
        (p) => String(p.id) === params.id || (p as any).slug === params.id
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

  const product =
    products.find((p) => String(p.id) === id || (p as any).slug === id) ||
    loaderData.product;

  const images = Array.from(
    new Set([
      product.image_url,
      ...(Array.isArray(product.gallery_urls) ? product.gallery_urls : []),
    ])
  ).filter((u): u is string => typeof u === "string" && u.trim().length > 0);

  const [activeImage, setActiveImage] = useState(images[0] || product.image_url);

  const whatsappMessage = encodeURIComponent(
    `Hi ${BUSINESS.name}! I would like to enquire about the "${product.name}" (${formatRupeePrice(product.price)}).\n\nProduct Link: ${typeof window !== "undefined" ? window.location.href : ""}`
  );
  const whatsappUrl = `https://wa.me/${BUSINESS.phoneRaw}?text=${whatsappMessage}`;

  return (
    <div className="container-px mx-auto max-w-7xl py-6 md:py-10">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {/* Gallery Section */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-sm">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="h-full w-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                No Image Available
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    activeImage === img
                      ? "border-emerald shadow-sm scale-95"
                      : "border-border/60 hover:border-foreground/40"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald font-semibold">
              {product.category || "Furniture"}
            </span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-500 text-xs font-medium">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>4.8</span>
            </div>
            <span className="text-xs text-muted-foreground">• Verified Craftsmanship</span>
          </div>

          <div className="mt-4 font-sans text-2xl font-bold text-foreground sm:text-3xl">
            {formatRupeePrice(product.price)}
          </div>

          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {product.description ||
              "Handcrafted with premium fabrics and solid internal framing for maximum durability and comfort. Custom dimensions, colors, and fabric finishes available upon request."}
          </p>

          {/* Quick Specifications */}
          <div className="mt-6 space-y-2 rounded-2xl border border-border/80 bg-card p-4 text-xs">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Check className="h-4 w-4 text-emerald" /> Custom fabric & color choices available
            </div>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald" /> 5-Year Frame & Foam Warranty
            </div>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Truck className="h-4 w-4 text-emerald" /> Pan-India Safe Doorstep Delivery
            </div>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <RefreshCw className="h-4 w-4 text-emerald" /> Old sofa repair & custom reupholstery support
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95"
            >
              <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp
            </a>
            <a
              href={`tel:${BUSINESS.phoneRaw}`}
              className="flex items-center justify-center rounded-full border border-foreground/20 px-6 py-3 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background notranslate"
              translate="no"
            >
              Call Showroom
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}