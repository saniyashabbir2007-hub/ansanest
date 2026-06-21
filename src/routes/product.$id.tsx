import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Phone, Mail, FileText, Check } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { getProductBySlug, listProducts } from "@/lib/products-api";
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
  console.log("PRODUCT COLORS:", p.colors);
  console.log("PRODUCT DATA:", p);
  const [active, setActive] = useState(0);
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: listProducts });
  const related = allProducts.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 3);

  const gallery = p.gallery_urls.length > 0 ? p.gallery_urls : [p.image_url];
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
          <div className="overflow-hidden rounded-2xl bg-muted">
            <img src={gallery[active]} alt={p.name} className="aspect-[4/3] w-full object-cover" />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((g: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`overflow-hidden rounded-lg border-2 transition-colors ${active === i ? "border-emerald" : "border-transparent"}`}
                >
                  <img src={g} alt="" className="aspect-square w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-emerald">{p.sub_type ?? p.category}</div>
          <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">{p.name}</h1>
          
          <div className="mt-3 flex items-center gap-3">
            <div className="flex">
              {[0, 1, 2, 3].map((i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
              <Star className="h-4 w-4 text-gold/40" />
            </div>
            <span className="text-sm text-muted-foreground">4.0 · Customer Rated</span>
          </div>

          <div className="mt-6 text-4xl font-semibold text-emerald">{priceLabel}</div>
          <div className="mt-1 text-sm text-muted-foreground">Inclusive of all taxes · Free delivery in Mumbai MMR</div>

          <p className="mt-6 leading-relaxed text-foreground/80">{p.description}</p>

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

          <div className="mt-10 space-y-6">
            {p.features.length > 0 && (
              <Block title="Features">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {p.features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" /> {f}
                    </li>
                  ))}
                </ul>
              </Block>
            )}
            {p.colors && p.colors.length > 0 && (
  <Block title="Available Colors">
    <div className="flex flex-wrap gap-2">
      {p.colors.map((color: string) => (
        <span
          key={color}
className="rounded-full bg-emerald/10 text-emerald px-4 py-1.5 text-sm font-medium"        >
          {color}
        </span>
      ))}
    </div>
  </Block>
)}
            {p.material && <Block title="Material"><p className="text-sm text-foreground/80">{p.material}</p></Block>}
            {p.dimensions && <Block title="Dimensions"><p className="text-sm text-foreground/80">{p.dimensions}</p></Block>}
            <Block title="Customization">
  <ul className="space-y-2 text-sm text-foreground/80">
    <li>✓ Custom Dimensions Available</li>
    <li>✓ Custom Upholstery Available</li>
    <li>✓ Fabric & Color Selection Available</li>
    <li>✓ Made to Order</li>
  </ul>
</Block>
            <Block title="Availability">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-3 py-1 text-sm font-medium text-emerald">
                <span className="h-2 w-2 rounded-full bg-emerald" /> {p.availability}
              </span>
            </Block>
          </div>
        </div>
      </div>

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
