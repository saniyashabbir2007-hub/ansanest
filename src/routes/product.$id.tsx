import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Phone, Mail, FileText, Check } from "lucide-react";
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
          { name: "description", content: loaderData.short_description },
          { property: "og:title", content: loaderData.name },
          { property: "og:description", content: loaderData.short_description },
          { property: "og:image", content: loaderData.image_url },
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `/product/${loaderData.slug}` }] : [],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="container-px mx-auto max-w-3xl py-32 text-center">
      <h1 className="font-display text-4xl">Product not found</h1>
      <Link to="/catalog" className="mt-6 inline-block text-emerald underline">Back to catalog</Link>
    </div>
  ),
});

function ProductPage() {
  const p = Route.useLoaderData();
  console.log("VIDEO URLS:", p.video_urls);
console.log("FULL PRODUCT:", p);
  console.log("PRODUCT COLORS:", p.colors);
  console.log("PRODUCT DATA:", p);
const [active, setActive] = useState(0);
const [selectedColor, setSelectedColor] = useState(0);  
const [reviewName, setReviewName] = useState("");
const [reviewText, setReviewText] = useState("");
const [rating, setRating] = useState(5);

const qc = useQueryClient();
const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: listProducts });
  const related = allProducts.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 3);

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
      "Thank you! Your review has been submitted and will appear after approval."
    );
  },
});

const variants = (p as any).color_variants ?? [];

const selectedVariantImages =
  variants[selectedColor]?.images ?? [];

const gallery =
  selectedVariantImages.length > 0
    ? [...selectedVariantImages, ...p.gallery_urls]
    : p.gallery_urls.length > 0
    ? p.gallery_urls
    : [p.image_url];
    
const media = [
  ...(p.video_urls ?? []),
  ...gallery,
];
  const priceLabel = p.price_on_request ? "Price on Request" : p.price != null ? inr(Number(p.price)) : "—";
  const waMsg = productInquiry(p.name);
  const emailSubject = encodeURIComponent(`Inquiry: ${p.name}`);
  const emailBody = encodeURIComponent(`Hello,\n\nI am interested in the ${p.name} (${priceLabel}).\nPlease share more details.\n\nThank you.`);

  return (
    <div className="container-px mx-auto max-w-7xl py-12">
      <nav className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/catalog" className="hover:text-foreground">Catalog</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>

          <div className="overflow-hidden rounded-[32px] border border-border bg-muted shadow-xl">
  {media[active]?.includes("/videos/") ||
  media[active]?.match(/\.(mp4|webm|mov)$/i) ? (
    <video
  src={media[active]}
  controls
  autoPlay
  muted
  playsInline
  className="aspect-[4/3] w-full object-cover"
/>
  ) : (
    <img
      src={media[active]}
      alt={p.name}
      className="aspect-[4/3] w-full object-cover"
    />
  )}
</div>

{media.length > 1 && (
  <div className="mt-6 flex flex-wrap gap-3">
              {media.map((g: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`overflow-hidden rounded-xl border-2 transition-all duration-300 ${
  active === i
    ? "border-emerald shadow-lg scale-105"
    : "border-transparent hover:border-emerald/40 hover:scale-105"
}`}
                >
{g.includes("/videos/") ||
g.match(/\.(mp4|webm|mov)$/i) ? (
  <video
    src={g}
    className="h-24 w-24 rounded-lg object-cover"
  />
) : (
  <img
    src={g}
    alt=""
    className="h-24 w-24 rounded-lg object-cover"
    loading="lazy"
  />
)}                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-emerald">{p.sub_type ?? p.category}</div>
          <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">{p.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
  <span className="rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald">
    Premium Upholstery
  </span>

  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
    Hand Crafted
  </span>

  <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground">
    Made to Order
  </span>
</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex">
              {[0, 1, 2, 3].map((i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
              <Star className="h-4 w-4 text-gold/40" />
            </div>
            <span className="text-sm text-muted-foreground">4.0 · Customer Rated</span>
          </div>
          <div className="mt-6 text-4xl font-semibold text-emerald">{priceLabel}</div>


          {variants.length > 0 && (
  <div className="mt-4">
    <h3 className="mb-3 text-sm font-semibold">
      Select Color
    </h3>

    <div className="flex flex-wrap gap-3">
      {variants.map((variant: any, index: number) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            setSelectedColor(index);
            setActive(0);
          }}
          className={`rounded-full border px-4 py-2 transition ${
            selectedColor === index
              ? "bg-emerald text-white border-emerald"
              : "border-gray-300"
          }`}
        >
          {variant.name}
        </button>
      ))}
    </div>
  </div>
)}

<div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5">
  <h3 className="mb-4 font-semibold text-foreground">
    Specifications
  </h3>

  <div className="grid grid-cols-2 gap-4 text-sm">

    <div>
      <div className="text-muted-foreground">Material</div>
      <div className="font-medium">{p.material ?? "—"}</div>
    </div>

    <div>
      <div className="text-muted-foreground">Dimensions</div>
      <div className="font-medium">{p.dimensions ?? "—"}</div>
    </div>

    <div>
      <div className="text-muted-foreground">Availability</div>
      <div className="font-medium">{p.availability}</div>
    </div>

    <div>
      <div className="text-muted-foreground">Delivery</div>
      <div className="font-medium">
        {p.delivery_time ?? "Made to Order"}
      </div>
    </div>

  </div>
</div>


          <div className="mt-1 text-sm text-muted-foreground">Inclusive of all taxes · Free delivery in Mumbai MMR</div>
           

         

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a href={waLink(waMsg)} target="_blank" rel="noreferrer noopener" className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3.5 text-sm font-medium text-white hover:opacity-90">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp Enquiry
            </a>
            <a href={`tel:${BUSINESS.phoneRaw}`} className="flex items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3.5 text-sm font-medium text-background hover:opacity-90">
              <Phone className="h-4 w-4" /> Call Now
            </a>
            <a href={`mailto:${BUSINESS.email}?subject=${emailSubject}&body=${emailBody}`} className="flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground hover:bg-muted">
              <Mail className="h-4 w-4" /> Email Inquiry
            </a>
            <Link to="/contact" className="flex items-center justify-center gap-2 rounded-md border border-emerald bg-emerald/5 px-4 py-3.5 text-sm font-medium text-emerald hover:bg-emerald hover:text-emerald-foreground">
              <FileText className="h-4 w-4" /> Request a Quote
            </Link>
          </div>
          <div className="mt-8 rounded-2xl border border-border bg-muted/20 p-5">
  <div className="grid gap-4 sm:grid-cols-2">

    <div className="flex items-center gap-3">
      <Check className="h-5 w-5 text-emerald" />
      <span className="text-sm font-medium">
        Premium Craftsmanship
      </span>
    </div>

    <div className="flex items-center gap-3">
      <Check className="h-5 w-5 text-emerald" />
      <span className="text-sm font-medium">
        Made to Order
      </span>
    </div>

    <div className="flex items-center gap-3">
      <Check className="h-5 w-5 text-emerald" />
      <span className="text-sm font-medium">
        Pan India Delivery
      </span>
    </div>

    <div className="flex items-center gap-3">
      <Check className="h-5 w-5 text-emerald" />
      <span className="text-sm font-medium">
        Dedicated Customer Support
      </span>
    </div>

  </div>
</div>
          <div className="mt-8">
  <h2 className="font-display text-2xl text-foreground">
    About this Product
  </h2>

  <p className="mt-4 leading-relaxed text-foreground/80">
    {p.description}
  </p>
</div>

          <div className="mt-10 space-y-6">
            {p.features.length > 0 && (
              
              <Block title="Why You'll Love It">
                <ul className="grid gap-4 sm:grid-cols-2">
                  {p.features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" /> {f}
                    </li>
                  ))}
                </ul>
              </Block>
            )}
            {p.colors && p.colors.length > 0 && (
  <Block title="Available Fabric & Color Options">
  <div className="flex flex-wrap gap-3">
    {p.colors.map((color: string) => (
      <div
        key={color}
        className="rounded-xl border border-border bg-card px-4 py-3 transition-all duration-300 hover:border-emerald hover:shadow-md"
      >
        <div className="text-sm font-medium text-foreground">
          {color}
        </div>

        <div className="mt-1 text-xs text-muted-foreground">
          Available for this design
        </div>
      </div>
    ))}
  </div>
</Block>
)}
            {p.material && <Block title="Material"><p className="text-sm text-foreground/80">{p.material}</p></Block>}
            {p.dimensions && <Block title="Dimensions"><p className="text-sm text-foreground/80">{p.dimensions}</p></Block>}
            <Block title="Made Just for You">
  <div className="rounded-2xl border border-border bg-muted/20 p-5">

    <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
      Every ANSA NEST piece can be tailored to match your home and lifestyle.
    </p>

    <ul className="space-y-3 text-sm text-foreground/80">
      <li className="flex items-center gap-3">
        <Check className="h-4 w-4 text-emerald" />
        Custom Dimensions
      </li>

      <li className="flex items-center gap-3">
        <Check className="h-4 w-4 text-emerald" />
        Fabric & Leather Options
      </li>

      <li className="flex items-center gap-3">
        <Check className="h-4 w-4 text-emerald" />
        Color Selection
      </li>

      <li className="flex items-center gap-3">
        <Check className="h-4 w-4 text-emerald" />
        Made to Order by Skilled Craftsmen
      </li>
    </ul>

  </div>
</Block>
            <Block title="Availability">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-3 py-1 text-sm font-medium text-emerald">
                <span className="h-2 w-2 rounded-full bg-emerald" /> {p.availability}
              </span>
            </Block>
          </div>
        </div>
      </div>

      <section className="mt-20">
  <h2 className="font-display text-3xl text-foreground">
    Customer Reviews
  </h2>

  <div className="mt-8 space-y-6">
    {reviews.map((r: any) => (
      <div
        key={r.id}
        className="rounded-xl border border-border p-5"
      >
        <div className="flex items-center gap-2">
          {[...Array(r.rating)].map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-gold text-gold"
            />
          ))}
        </div>

        <div className="mt-2 font-semibold">
{r.customer_name}
        </div>

        <p className="mt-2 text-muted-foreground">
          {r.review}
        </p>
      </div>
    ))}
  </div>

  <div className="mt-12 rounded-xl border border-border p-6">
    <h3 className="text-xl font-semibold">
      Write a Review
    </h3>

    <input
      value={reviewName}
      onChange={(e) =>
        setReviewName(e.target.value)
      }
      placeholder="Your Name"
      className="mt-4 w-full rounded-md border border-border p-3"
    />

    <select
      value={rating}
      onChange={(e) =>
        setRating(Number(e.target.value))
      }
      className="mt-4 w-full rounded-md border border-border p-3"
    >
      <option value={5}>⭐⭐⭐⭐⭐</option>
      <option value={4}>⭐⭐⭐⭐</option>
      <option value={3}>⭐⭐⭐</option>
      <option value={2}>⭐⭐</option>
      <option value={1}>⭐</option>
    </select>

    <textarea
      value={reviewText}
      onChange={(e) =>
        setReviewText(e.target.value)
      }
      placeholder="Tell us about this product..."
      rows={5}
      className="mt-4 w-full rounded-md border border-border p-3"
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
      className="mt-4 rounded-md bg-emerald px-6 py-3 text-white"
    >
      Submit Review
    </button>
  </div>
</section>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl text-foreground">You may also like</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-5">
      <h3 className="font-display text-lg text-foreground">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}
