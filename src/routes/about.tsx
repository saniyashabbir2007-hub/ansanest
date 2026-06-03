import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Hammer, Sparkles, ShieldCheck } from "lucide-react";
import custom from "@/assets/custom.jpg";
import hero from "@/assets/hero-sofa.jpg";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About Us — ${BUSINESS.name}` },
      { name: "description", content: "Premium upholstery craftsmanship. Learn about our atelier, our makers, and our commitment to quality." },
      { property: "og:title", content: `About ${BUSINESS.name}` },
      { property: "og:description", content: "Premium upholstery craftsmanship in India." },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="container-px mx-auto grid max-w-7xl items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-emerald">Our Story</div>
          <h1 className="mt-3 font-display text-5xl text-balance text-foreground md:text-6xl">
            Premium Craftsmanship. <em className="italic text-emerald">One craft.</em>
          </h1>
          <p className="mt-6 leading-relaxed text-foreground/80">
            {BUSINESS.name} was founded with a simple belief — that a piece of furniture should
            outlive the home it was bought for. From a single workshop in old Delhi, we have
            grown into one of India's most trusted upholstery ateliers, building sofas, sectionals
            and beds for thousands of families, designers and hospitality brands across the country.
          </p>
          <p className="mt-4 leading-relaxed text-foreground/80">
            Every piece that leaves our workshop is hand-built by master craftsmen on kiln-dried
            hardwood frames, upholstered in premium fabrics and leathers, and finished with
            obsessive attention to detail. We don't mass produce. We make to order — exactly as you
            want it, exactly as it should be.
          </p>
        </div>
        <img src={custom} alt="Craftsmen at work in the atelier" loading="lazy" className="aspect-[4/5] w-full rounded-2xl object-cover shadow-luxury" />
      </section>

      <section className="bg-muted/40 py-20">
        <div className="container-px mx-auto max-w-7xl">
          <h2 className="text-center font-display text-4xl text-foreground md:text-5xl">What we stand for</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Sparkles, t: "Premium Materials", d: "Sourced from the world's best mills and tanneries." },
              { Icon: Hammer, t: "Quality Craftsmanship", d: "Hand-built by craftsmen with an obsessive focus on precision and detail." },
              { Icon: Award, t: "Custom Design", d: "Bespoke silhouettes, fabrics and finishes." },
              { Icon: ShieldCheck, t: "Customer Focus", d: "Personal service from first sketch to final delivery." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="rounded-xl border border-border bg-card p-6">
                <Icon className="h-8 w-8 text-emerald" />
                <h3 className="mt-4 font-display text-xl">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <img src={hero} alt="Premium upholstered furniture" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-emerald">Our Commitment</div>
            <h2 className="mt-3 font-display text-4xl text-foreground">Built to be lived on for a lifetime.</h2>
            <p className="mt-6 text-foreground/80">
              Frames are stress-tested. Joints are reinforced. Seats are pocket-sprung.
              Every cushion is filled by hand, every seam is double-stitched, every leg is
              hand-finished. We back every piece with a structural warranty because we know
              what we made.
            </p>
            <Link to="/contact" className="mt-7 inline-flex rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background hover:opacity-90">
              Start your project
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
