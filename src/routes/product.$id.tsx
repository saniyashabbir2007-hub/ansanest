import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, FileText, Check } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import {
  getProductBySlug,
  listProducts,
  listProductReviews,
  createProductReview,
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

  const [active, setActive] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

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

  // Color Variants from Admin
  const variants: Array<{ name: string; images?: string[] }> =
    Array.isArray(p.color_variants) ? p.color_variants : [];

  const hasVariants = variants.length > 0;
  const currentVariant = hasVariants ? variants[selectedVariantIndex] || variants[0] : null;

  const variantImages = currentVariant?.images && currentVariant.images.length > 0
    ? currentVariant.images
    : [];

  const heroImage = variantImages[0] || p.image_url;

  const gallery = [
    ...new Set(
      [
        heroImage,
        ...variantImages,
        ...(p.gallery_urls ?? []),
      ].filter(Boolean)
    ),
  ];

  const media = [
    ...(p.video_urls ?? []),
    ...gallery,
  ];

  const priceLabel =
    p.price_on_request
      ? "Price on Request"
      : p.price != null
        ? inr(Number(p.price))
        : "—";

  const waMsg = productInquiry(p.name);

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
            {media[active]?.includes("/videos/") ||
            media[active]?.match(/\.(mp4|webm|mov)$/i) ? (
              <video
                src={media[active]}
                controls
                autoPlay
                muted
                playsInline
                className="aspect-[16/10] md:aspect-[4/3] w-full object-contain bg-black"
              />
            ) : (
              <img
                src={media[active] || p.image_url}
                alt={p.name}
                className="aspect-[16/10] md:aspect-[4/3] w-full object-contain bg-white"
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
                  onClick={() => setActive(i)}
                  aria-label={`View product media ${i + 1}`}
                  className={`shrink-0 snap-start overflow-hidden rounded-lg md:rounded-xl border-2 transition-all duration-200 ${
                    active === i
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
        <div className="mt-1 md:mt-0">
          <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold text-emerald">
            {p.sub_type ?? p.category}
          </div>

          <h1 className="mt-1 font-display text-xl md:text-4xl lg:text-5xl text-foreground">
            {p.name}
          </h1>

          <div className="mt-2 flex flex-wrap gap-1.5 md:gap-2">
            <span className="rounded-full border border-emerald/20 bg-emerald/10 px-2.5 py-0.5 text-[10px] md:text-xs font-medium text-emerald">
              Premium Upholstery
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] md:text-xs font-medium text-amber-700">
              Hand Crafted
            </span>
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] md:text-xs font-medium text-foreground">
              Made to Order
            </span>
          </div>

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
              4.0 · Customer Rated
            </span>
          </div>

          <div className="mt-2.5 text-2xl font-bold text-emerald md:text-4xl">
            {priceLabel}
          </div>

          {/* COMPACT COLOR SWATCHES */}
          {hasVariants && (
            <div className="mt-3 md:mt-5">
              <h3 className="mb-1.5 text-xs md:text-sm font-semibold">
                Color: {currentVariant?.name}
              </h3>

              <div className="flex flex-wrap gap-2">
                {variants.map((v, index) => {
                  const isSelected = selectedVariantIndex === index;
                  const thumb = v.images && v.images.length > 0 ? v.images[0] : p.image_url;

                  return (
                    <button
                      key={`${v.name}-${index}`}
                      type="button"
                      title={v.name}
                      aria-label={`Select ${v.name}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedVariantIndex(index);
                        setActive(0);
                      }}
                      className={`relative h-9 w-9 md:h-11 md:w-11 rounded-full border-2 overflow-hidden shadow-sm transition-all duration-200 ${
                        isSelected
                          ? "border-emerald ring-2 ring-emerald/30 scale-105"
                          : "border-border/60 hover:border-emerald/60 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={v.name}
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

          {/* QUICK SPECIFICATIONS */}
          <div className="mt-4 md:mt-6 rounded-xl md:rounded-2xl border border-border bg-muted/20 p-3.5 md:p-5">
            <h3 className="mb-2 md:mb-4 text-xs md:text-sm font-semibold text-foreground">
              Specifications
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs md:text-sm">
              <div>
                <div className="text-muted-foreground">Material</div>
                <div className="mt-0.5 font-medium">{p.material ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Dimensions</div>
                <div className="mt-0.5 font-medium">{p.dimensions ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Availability</div>
                <div className="mt-0.5 font-medium">{p.availability}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Delivery</div>
                <div className="mt-0.5 font-medium">{p.delivery_time ?? "Made to Order"}</div>
              </div>
            </div>
          </div>

          <div className="mt-2.5 text-xs text-muted-foreground">
            Inclusive of all taxes · Free delivery in Mumbai MMR
          </div>

          {/* PRIMARY ACTIONS */}
          <div className="mt-4 md:mt-6 grid gap-2.5 sm:grid-cols-2">
            <a
              href={waLink(waMsg)}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
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
        </div>
      </div>

      {/* FULL WIDTH DETAILS */}
      <section className="mt-8 md:mt-12 border-t border-border pt-6 md:pt-10">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-foreground">
            About this Product
          </h2>
          <p className="mt-2 md:mt-4 max-w-4xl text-sm md:text-base leading-relaxed text-foreground/80">
            {p.description}
          </p>
        </div>

        <div className="mt-6 md:mt-10 grid gap-6 md:gap-8 lg:grid-cols-2">
          {p.features?.length > 0 && (
            <Block title="Why You'll Love It">
              <ul className="grid gap-3 sm:grid-cols-2">
                {p.features.map((f: string) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-xs md:text-sm text-foreground/80"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                    {f}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {hasVariants && (
            <Block title="Available Color Options">
              <div className="flex flex-wrap gap-2.5">
                {variants.map((v, index) => {
                  const thumb = v.images && v.images.length > 0 ? v.images[0] : p.image_url;

                  return (
                    <div
                      key={`${v.name}-${index}`}
                      className="rounded-xl border border-border bg-card px-3 py-2 md:px-4 md:py-3 transition-all duration-300 hover:border-emerald hover:shadow-md"
                    >
                      <div className="flex items-center gap-2">
                        {thumb && (
                          <img
                            src={thumb}
                            alt={v.name}
                            className="h-5 w-5 rounded-full object-cover border border-border"
                          />
                        )}
                        <div className="text-xs md:text-sm font-medium text-foreground">
                          {v.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Block>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mt-10 md:mt-16 border-t border-border pt-6 md:pt-10">
        <h2 className="font-display text-2xl md:text-3xl text-foreground">
          Customer Reviews
        </h2>

        <div className="mt-6 space-y-4">
          {reviews.map((r: any) => (
            <div
              key={r.id}
              className="rounded-xl border border-border p-4 md:p-5"
            >
              <div className="flex items-center gap-1.5">
                {[...Array(r.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-gold text-gold"
                  />
                ))}
              </div>
              <div className="mt-1.5 text-sm font-semibold">{r.customer_name}</div>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground">{r.review}</p>
            </div>
          ))}
        </div>

        {/* REVIEW FORM */}
        <div className="mt-6 md:mt-10 rounded-xl border border-border p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold">Write a Review</h3>

          <input
            value={reviewName}
            onChange={(e) => setReviewName(e.target.value)}
            placeholder="Your Name"
            className="mt-3 w-full rounded-md border border-border p-2.5 text-sm"
          />

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-3 w-full rounded-md border border-border p-2.5 text-sm"
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
            className="mt-3 w-full rounded-md border border-border p-2.5 text-sm"
          />

          <button
            onClick={() =>
              reviewMutation.mutate({
                product_id: p.id,
                customer_name: reviewName,
                email: "",
                rating,
                review: reviewText,
              })
            }
            className="mt-3 rounded-md bg-emerald px-5 py-2.5 text-sm text-white"
          >
            Submit Review
          </button>
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

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-4">
      <h3 className="font-display text-base md:text-lg text-foreground">{title}</h3>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}