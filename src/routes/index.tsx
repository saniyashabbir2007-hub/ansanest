import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Hammer, Sparkles, ShieldCheck, Heart, Smile } from "lucide-react";
import hero from "@/assets/hero-sofa.jpg";
import sectional from "@/assets/sectional.jpg";
import bed from "@/assets/bed.jpg";
import custom from "@/assets/custom.jpg";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BUSINESS.name} — Premium Sofas, Sectionals & Upholstered Beds in India` },
      { name: "description", content: "Hand-crafted sofas, L-shaped & U-shaped sectional sofas, luxury upholstered beds, and bespoke custom upholstery. Visit our premium furniture showroom in India." },
      { property: "og:title", content: `${BUSINESS.name} — Premium Upholstery Furniture` },
      { property: "og:description", content: "India's destination for premium sofas, sectionals and upholstered beds." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const featured = products.filter((p) => p.featured);
  const sofas = products.filter((p) => p.category === "Sofa" || p.category === "Sectional Sofa").slice(0, 3);
  const sectionals = products.filter((p) => p.category === "Sectional Sofa").slice(0, 3);
  const beds = products.filter((p) => p.category === "Upholstered Bed");

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="container-px mx-auto grid max-w-7xl items-center gap-12 py-16 md:grid-cols-[1.05fr_1fr] md:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-emerald">
              <Sparkles className="h-3 w-3" /> Premium Upholstery · Crafted in India
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-balance text-foreground md:text-7xl">
              The art of <em className="italic text-emerald">upholstered</em> living.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Hand-crafted sofas, sectional sofas, upholstered beds and bespoke
              custom upholstery — designed in India, built to be lived on for a lifetime.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalog" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90">
                Explore Catalog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background">
                Book a Showroom Visit
              </Link>
            </div>
            <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
              {[["15+", "Years"], ["2,500+", "Homes"], ["1000+", "Fabrics"]].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl text-emerald">{n}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img src={hero} alt="Luxury emerald velvet sectional sofa in a premium living room" width={1792} height={1152} className="aspect-[4/5] w-full rounded-2xl object-cover shadow-luxury" />
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-5 shadow-luxury md:block">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Featured</div>
              <div className="mt-1 font-display text-lg text-foreground">Emerald Heritage U-Sectional</div>
              <div className="mt-1 text-sm text-emerald">₹2,85,000</div>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS STRIP */}
      <section className="container-px mx-auto max-w-7xl py-16">
        <SectionHead eyebrow="Collections" title="Designed for every room of the home" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { img: sectional, title: "Sofas & Sectionals", desc: "L-shape, U-shape, modular, curved.", to: "/catalog" },
            { img: bed, title: "Upholstered Beds", desc: "Wingback, platform, tufted classics.", to: "/catalog" },
            { img: custom, title: "Custom Upholstery", desc: "Built to your sketch. Any silhouette.", to: "/catalog" },
          ].map((c) => (
            <Link key={c.title} to={c.to} className="group relative overflow-hidden rounded-2xl">
              <img src={c.img} alt={c.title} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="text-xs uppercase tracking-[0.25em] text-gold">Collection</div>
                <div className="mt-1 font-display text-2xl">{c.title}</div>
                <div className="mt-1 text-sm text-white/80">{c.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED SOFAS */}
      <CarouselSection
        eyebrow="Featured Sofas"
        title="Statement seating, hand-crafted to order"
        items={sofas}
      />

      {/* SECTIONALS */}
      <CarouselSection
        eyebrow="Sectional Sofa Collection"
        title="L-shape, U-shape, curved & modular"
        items={sectionals}
        muted
      />

      {/* BEDS */}
      <CarouselSection
        eyebrow="Upholstered Beds"
        title="Bedroom suites worthy of a slow morning"
        items={beds}
      />

      {/* CUSTOM */}
      <section className="container-px mx-auto max-w-7xl py-20">
        <div className="grid items-center gap-12 overflow-hidden rounded-3xl gradient-luxury p-8 md:grid-cols-2 md:p-14">
          <div className="text-primary-foreground">
            <div className="text-xs uppercase tracking-[0.25em] text-gold">Custom Upholstery</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Have a vision? We build to it.</h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              From a single bespoke sofa to entire hospitality fit-outs, our master
              craftsmen translate your sketches and references into finished pieces —
              delivered and installed across India.
            </p>
            <Link to="/contact" className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-medium text-gold-foreground hover:opacity-90">
              Request a Quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <img src={custom} alt="Master craftsman hand-stitching premium leather upholstery" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="container-px mx-auto max-w-7xl py-16">
        <SectionHead eyebrow="Why Choose Us" title="Six reasons families trust us for life" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { Icon: Sparkles, t: "Premium Materials", d: "Italian velvets, full-grain leathers, kiln-dried hardwoods, CMHR foams." },
            { Icon: Hammer, t: "Expert Craftsmanship", d: "Each piece is hand-built by master craftsmen with an obsessive focus on precision and detail." },
            { Icon: Award, t: "Custom Designs", d: "1000+ fabrics, any silhouette, any size — built exactly to your home." },
            { Icon: ShieldCheck, t: "Quality Assurance", d: "Every frame is stress-tested and every seam double-stitched." },
            { Icon: Heart, t: "Comfort & Durability", d: "Pocket-spring seating and high-density foam that keeps its shape for years." },
            { Icon: Smile, t: "Customer Satisfaction", d: "Free site visits, 3D mockups, and personal after-sales service." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl text-foreground">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="container-px mx-auto max-w-7xl py-16">
        <div className="flex items-end justify-between gap-4">
          <SectionHead eyebrow="Gallery" title="Glimpses from completed homes" inline />
          <Link to="/gallery" className="hidden text-sm font-medium text-emerald underline-offset-4 hover:underline md:inline">
            View full gallery →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
          {featured.slice(0, 6).map((p, i) => (
            <Link
              key={p.id}
              to="/product/$id"
              params={{ id: p.id }}
              className={`relative overflow-hidden rounded-xl ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            </Link>
          ))}
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="container-px mx-auto max-w-7xl py-20">
        <div className="rounded-3xl border border-border bg-card p-10 text-center md:p-16">
          <h2 className="font-display text-4xl text-foreground md:text-5xl">Visit our showroom</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Feel the fabrics. Test the cushions. Meet the makers. Our team is ready to help
            you build the home you've always wanted.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background hover:opacity-90">
              Get Directions
            </Link>
            <a href={`tel:${BUSINESS.phoneRaw}`} className="rounded-full border border-foreground/20 px-6 py-3.5 text-sm font-medium text-foreground hover:bg-foreground hover:text-background">
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ eyebrow, title, inline }: { eyebrow: string; title: string; inline?: boolean }) {
  return (
    <div className={inline ? "" : "text-center"}>
      <div className="text-xs uppercase tracking-[0.25em] text-emerald">{eyebrow}</div>
      <h2 className="mt-3 font-display text-4xl text-balance text-foreground md:text-5xl">{title}</h2>
    </div>
  );
}

function CarouselSection({ eyebrow, title, items, muted }: { eyebrow: string; title: string; items: typeof products; muted?: boolean }) {
  return (
    <section className={muted ? "bg-muted/40 py-16" : "py-16"}>
      <div className="container-px mx-auto max-w-7xl">
        <SectionHead eyebrow={eyebrow} title={title} />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}
