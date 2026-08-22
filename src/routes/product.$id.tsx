import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, FileText, Check, ShieldCheck, Truck, RefreshCw, Lock } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import {
  getProductBySlug,
  listProducts,
  listProductReviews,
  createProductReview,
  type DimensionVariant,
} from "@/lib/products-api";
import { BUSINESS, inr, waLink, productInquiry } from "@/lib/business";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const p = await getProductBySlug(params.id);
    if (!p) throw notFound();
    return p;
  },

  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — ${BUSINESS.name}` },
          {
            name: "description",
            content: loaderData.short_description,
          },
          {
            property: "og:title",
            content: loaderData.name,
          },
          {
            property: "og:description",
            content: loaderData.short_description,
          },
          {
            property: "og:image",
            content: loaderData.image_url,
          },
        ]
      : [],

    links: loaderData
      ? [
          {
            rel: "canonical",
            href: `/product/${loaderData.slug}`,
          },
        ]
      : [],
  }),

  component: ProductPage,

  notFoundComponent: () => (
    <div className="container-px mx-auto max-w-3xl py-20 text-center">
      <h1 className="font-display text-4xl">Product not found</h1>

      <Link
        to="/catalog"
        className="mt-6 inline-block text-emerald underline"
      >
        Back to catalog
      </Link>
    </div>
  ),
});

function ProductPage() {
  const p = Route.useLoaderData();

  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState<"description" | "specifications" | "reviews" | "shipping">("description");

  const rawVariants: DimensionVariant[] = (p as any).dimension_variants ?? [];
  const hasVariants = rawVariants.length > 0;

  const defaultDimensionIdx = rawVariants.findIndex((d) => d.is_default);
  const [selectedDimensionIndex, setSelectedDimensionIndex] = useState<number>(
    defaultDimensionIdx >= 0 ? defaultDimensionIdx : 0
  );

  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const qc = useQueryClient();

  const { data: allProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const related = allProducts
    .filter((x) => x.id !== p.id && x.category === p.category)
    .slice(0, 3);

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", p.id],
    queryFn: () => listProductReviews(p.id),
  });

  const reviewMutation = useMutation({
    mutationFn: createProductReview,

    onSuccess: () => {
      setReviewName("");
      setReviewText("");
      setRating(5);

      qc.invalidateQueries({
        queryKey: ["reviews", p.id],
      });

      alert(
        "Thank you! Your review has been submitted and will appear after approval.",
      );
    },
  });

  const activeDimension = hasVariants ? rawVariants[selectedDimensionIndex] || rawVariants[0] : null;

  const activeColors = useMemo(() => {
    if (activeDimension?.colors && activeDimension.colors.length > 0) {
      return activeDimension.colors;
    }
    if (Array.isArray(p.color_variants) && p.color_variants.length > 0) {
      return p.color_variants;
    }
    return [];
  }, [activeDimension, p.color_variants]);

  const currentColor = activeColors[selectedColorIndex] || activeColors[0];

  const media = useMemo(() => {
    const list: string[] = [];

    if (currentColor?.images && currentColor.images.length > 0) {
      list.push(...currentColor.images);
    }

    if (activeDimension?.images && activeDimension.images.length > 0) {
      list.push(...activeDimension.images);
    }

    if (list.length === 0) {
      if (p.image_url) list.push(p.image_url);
      if (p.gallery_urls && p.gallery_urls.length > 0) list.push(...p.gallery_urls);
    }

    const videos = p.video_urls ?? [];
    return [...videos, ...Array.from(new Set(list.filter(Boolean)))];
  }, [currentColor, activeDimension, p.image_url, p.gallery_urls, p.video_urls]);

  const currentPrice = activeDimension?.price ?? (p.price != null ? Number(p.price) : null);

  const priceLabel = p.price_on_request
    ? "Price on Request"
    : currentPrice != null
      ? inr(currentPrice)
      : "—";

  const waMsg = productInquiry(
    `${p.name}${activeDimension ? ` (${activeDimension.name})` : ""}${currentColor ? ` - ${currentColor.name}` : ""}`
  );

  const features: string[] = p.features ?? [];

  return (
    <div className="container-px mx-auto max-w-7xl py-4 md:py-10">

      {/* BREADCRUMB */}
      <nav className="text-xs md:text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5 md:mx-2">/</span>
        <Link to="/catalog" className="hover:text-foreground">Catalog</Link>
        <span className="mx-1.5 md:mx-2">/</span>
        <span className="text-foreground truncate inline-block max-w-[180px] md:max-w-none align-bottom">
          {p.name}
        </span>
      </nav>

      {/* TOP PRODUCT SECTION */}
      <div className="mt-3 md:mt-6 grid items-start gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:gap-12">

        {/* LEFT — GALLERY */}
        <div>
          <div className="overflow-hidden rounded-2xl md:rounded-[28px] border border-border bg-muted shadow-sm">
            {media[activeMediaIdx]?.includes("/videos/") ||
            media[activeMediaIdx]?.match(/\.(mp4|webm|mov)$/i) ? (
              <video
                key={media[activeMediaIdx]}
                src={media[activeMediaIdx]}
                controls
                autoPlay
                muted
                playsInline
                className="aspect-[16/10] md:aspect-[4/3] w-full object-contain bg-black"
              />
            ) : (
              <img
                key={media[activeMediaIdx] || p.image_url}
                src={media[activeMediaIdx] || p.image_url}
                alt={p.name}
                className="aspect-[16/10] md:aspect-[4/3] w-full object-contain bg-white transition-opacity duration-300"
              />
            )}
          </div>

          {/* HORIZONTAL SCROLLABLE THUMBNAILS */}
          {media.length > 1 && (
            <div className="mt-2 md:mt-4 flex gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x">
              {media.map((g: string, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveMediaIdx(i)}
                  aria-label={`View product media ${i + 1}`}
                  className={`shrink-0 snap-start overflow-hidden rounded-lg md:rounded-xl border-2 transition-all duration-200 ${
                    activeMediaIdx === i
                      ? "border-emerald shadow-sm scale-95"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  {g.includes("/videos/") ||
                  g.match(/\.(mp4|webm|mov)$/i) ? (
                    <video
                      src={g}
                      className="h-12 w-12 md:h-20 md:w-20 rounded-md object-cover"
                    />
                  ) : (
                    <img
                      src={g}
                      alt=""
                      className="h-12 w-12 md:h-20 md:w-20 rounded-md object-cover"
                      loading="lazy"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — INFO */}
        <div className="mt-1 md:mt-0 space-y-4 md:space-y-5">
          <div>
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold text-emerald">
              {p.sub_type ?? p.category}
            </div>

            <h1 className="mt-1 font-display text-2xl md:text-4xl lg:text-5xl text-foreground">
              {p.name}
            </h1>

            <div className="mt-2 flex items-center gap-2">
              <div className="flex">
                {[0, 1, 2, 3].map((i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-gold text-gold"
                  />
                ))}
                <Star className="h-3.5 w-3.5 text-gold/40" />
              </div>
              <span className="text-xs text-muted-foreground">
                4.8 · ({reviews.length} reviews)
              </span>
            </div>
          </div>

          {/* DYNAMIC PRICE */}
          <div>
            {hasVariants && (
              <span className="text-xs text-muted-foreground mr-1.5">From</span>
            )}
            <span className="text-2xl md:text-3xl font-bold text-emerald">
              {priceLabel}
            </span>
          </div>

          {/* 1. SELECT SIZE / DIMENSIONS */}
          {hasVariants && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs md:text-sm font-semibold text-foreground">
                  1. Select Size / Dimensions
                </h3>
                <span className="text-[10px] text-muted-foreground md:hidden">
                  Swipe to view sizes →
                </span>
              </div>

              <div className="flex sm:grid sm:grid-cols-3 gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
                {rawVariants.map((dim, idx) => {
                  const isSelected = selectedDimensionIndex === idx;
                  return (
                    <button
                      key={dim.id || idx}
                      type="button"
                      onClick={() => {
                        setSelectedDimensionIndex(idx);
                        setSelectedColorIndex(0);
                        setActiveMediaIdx(0);
                      }}
                      className={`relative flex flex-col justify-between shrink-0 snap-start w-[42vw] max-w-[170px] sm:w-auto rounded-xl border p-2.5 md:p-3 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-emerald bg-emerald/5 ring-2 ring-emerald shadow-sm"
                          : "border-border bg-card hover:border-emerald/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-semibold text-[11px] md:text-xs text-foreground line-clamp-1">
                            {dim.name}
                          </span>
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-emerald shrink-0 mt-0.5 ring-2 ring-emerald/30" />
                          )}
                        </div>
                        <div className="mt-1 text-[10px] md:text-[11px] text-muted-foreground leading-tight line-clamp-2">
                          {dim.dimensions}
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] md:text-xs font-bold text-emerald">
                        {inr(dim.price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. SELECT COLOR */}
          {activeColors.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs md:text-sm font-semibold text-foreground">
                2. Select Color: <span className="font-normal text-muted-foreground">{currentColor?.name}</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                {activeColors.map((col: any, index: number) => {
                  const isSelected = selectedColorIndex === index;
                  const thumb = col.images && col.images.length > 0
                    ? col.images[0]
                    : activeDimension?.images?.[0] || p.image_url;

                  return (
                    <button
                      key={`${col.name}-${index}`}
                      type="button"
                      title={col.name}
                      aria-label={`Select ${col.name}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedColorIndex(index);
                        setActiveMediaIdx(0);
                      }}
                      className={`relative h-9 w-9 md:h-10 md:w-10 rounded-full border-2 overflow-hidden shadow-sm transition-all duration-200 ${
                        isSelected
                          ? "border-emerald ring-2 ring-emerald/30 scale-105"
                          : "border-border/60 hover:border-emerald/60 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={col.name}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <span className="block h-full w-full bg-muted" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PRIMARY ACTIONS */}
          <div className="pt-2 grid gap-2.5 sm:grid-cols-2">
            <a
              href={waLink(waMsg)}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 shadow-sm"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp Enquiry
            </a>

            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 rounded-lg border border-emerald bg-emerald/5 px-4 py-3 text-sm font-medium text-emerald transition hover:bg-emerald hover:text-emerald-foreground"
            >
              <FileText className="h-4 w-4" />
              Request a Quote
            </Link>
          </div>

          {/* VALUE PROPOSITIONS STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-border/80 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald shrink-0" />
              <div>
                <span className="font-medium text-foreground block">Pan India Delivery</span>
                Safe & Insured
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald shrink-0" />
              <div>
                <span className="font-medium text-foreground block">Premium Quality</span>
                Assured
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-emerald shrink-0" />
              <div>
                <span className="font-medium text-foreground block">1-2 Years Warranty</span>
                On Frame
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald shrink-0" />
              <div>
                <span className="font-medium text-foreground block">Secure Payment</span>
                100% Safe
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABBED FULL WIDTH PRODUCT DETAILS */}
      <section className="mt-12 md:mt-16 border-t border-border pt-6">
        <div className="flex border-b border-border gap-6 md:gap-8 overflow-x-auto scrollbar-none text-xs md:text-sm font-semibold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setSelectedTab("description")}
            className={`pb-3 transition border-b-2 ${
              selectedTab === "description"
                ? "border-emerald text-emerald"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("specifications")}
            className={`pb-3 transition border-b-2 ${
              selectedTab === "specifications"
                ? "border-emerald text-emerald"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Specifications
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("reviews")}
            className={`pb-3 transition border-b-2 ${
              selectedTab === "reviews"
                ? "border-emerald text-emerald"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Reviews ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("shipping")}
            className={`pb-3 transition border-b-2 ${
              selectedTab === "shipping"
                ? "border-emerald text-emerald"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Shipping & Returns
          </button>
        </div>

        <div className="py-6">
          {selectedTab === "description" && (
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-4 text-sm leading-relaxed text-foreground/85">
                <p>{p.description}</p>
                {features.length > 0 && (
                  <ul className="space-y-2 pt-2">
                    {features.map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-xs md:text-sm">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* SPECIFICATION CARD IN SIDEBAR */}
              <div className="rounded-xl border border-border bg-card p-4 text-xs">
                <h4 className="font-semibold text-foreground mb-3 text-sm">Specifications</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Material</span>
                    <span className="font-medium text-foreground">{p.material || "Solid Wood"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="font-medium text-foreground">
                      {activeDimension?.dimensions || p.dimensions || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium text-foreground">{p.availability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Warranty</span>
                    <span className="font-medium text-foreground">{p.warranty || "1-2 Years on Frame"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === "specifications" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="font-semibold text-foreground text-sm mb-2">Build & Material</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.material || "Crafted with reinforced hardwood framing and high-resilience foam padding."}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="font-semibold text-foreground text-sm mb-2">Available Dimensions</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.dimensions || "Custom dimensions available upon request."}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="font-semibold text-foreground text-sm mb-2">Care Instructions</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.care_instructions || "Vacuum clean regularly. Blot spills immediately with a dry cloth."}</p>
              </div>
            </div>
          )}

          {selectedTab === "reviews" && (
            <div className="space-y-6">
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center gap-1.5">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                    <div className="mt-1.5 text-sm font-semibold">{r.customer_name}</div>
                    <p className="mt-1 text-xs md:text-sm text-muted-foreground">{r.review || r.review_text}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border p-4 md:p-6">
                <h3 className="text-base font-semibold">Write a Review</h3>
                <input
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Your Name"
                  className="mt-3 w-full rounded-md border border-border p-2.5 text-xs"
                />
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="mt-3 w-full rounded-md border border-border p-2.5 text-xs"
                >
                  <option value={5}>⭐⭐⭐⭐⭐</option>
                  <option value={4}>⭐⭐⭐⭐</option>
                  <option value={3}>⭐⭐⭐</option>
                  <option value={2}>⭐⭐</option>
                  <option value={1}>⭐</option>
                </select>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us about this product..."
                  rows={4}
                  className="mt-3 w-full rounded-md border border-border p-2.5 text-xs"
                />
                <button
                  onClick={() =>
                    reviewMutation.mutate({
                      product_id: p.id,
                      customer_name: reviewName,
                      email: "",
                      rating,
                      review_text: reviewText,
                    })
                  }
                  className="mt-3 rounded-md bg-emerald px-4 py-2 text-xs font-semibold text-white"
                >
                  Submit Review
                </button>
              </div>
            </div>
          )}

          {selectedTab === "shipping" && (
            <div className="space-y-3 text-xs md:text-sm text-foreground/80 max-w-2xl leading-relaxed">
              <p>• <strong>Free Delivery:</strong> All orders within Mumbai MMR include free white-glove door delivery and installation.</p>
              <p>• <strong>Pan India Delivery:</strong> Safe and insured doorstep delivery nationwide.</p>
              <p>• <strong>Returns & Custom Orders:</strong> Since each piece is custom upholstered to order, standard returns are not accepted unless damaged in transit.</p>
            </div>
          )}
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <section className="mt-10 md:mt-16 border-t border-border pt-6 md:pt-10">
          <h2 className="font-display text-2xl md:text-3xl text-foreground">
            You may also like
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ProductCard
                key={r.id}
                p={r}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}