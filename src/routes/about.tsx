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
    <div className="py-4 sm:py-6">
      <section className="container-px mx-auto grid max-w-7xl items-center gap-6 py-6 sm:py-10 md:grid-cols-2 md:gap-10">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-emerald font-semibold">Our Story</div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-balance text-foreground leading-tight">
            Premium Craftsmanship. <em className="italic text-emerald">One craft.</em>
          </h1>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-foreground/80">
            {BUSINESS.name} was founded with a simple belief — that a piece of furniture should
            outlive the home it was bought for. From a single workshop in Mumbai, we have
            grown into one of India's most trusted upholstery ateliers, building sofas, sectionals
            and beds for thousands of families, designers and hospitality brands across the country.
          </p>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-foreground/80">
            Every piece that leaves our workshop is hand-built by master craftsmen on kiln-dried
            hardwood frames, upholstered in premium fabrics and leathers, and finished with
            obsessive attention to detail. We don't mass produce. We make to order — exactly as you
            want it, exactly as it should be.
          </p>
        </div>
        <img
          src={custom}
          alt="Craftsmen at work in the atelier"
          loading="lazy"
          className="aspect-[4/3] sm:aspect-[4/5] w-full rounded-2xl object-cover shadow-2xs border border-border/80"
        />
      </section>

      <section className="bg-muted/40 py-10 sm:py-14 border-y border-border/60">
        <div className="container-px mx-auto max-w-7xl">
          <h2 className="text-center font-display text-2xl sm:text-3xl font-bold text-foreground">What we stand for</h2>
          <div className="mt-8 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Sparkles, t: "Premium Materials", d: "Sourced from the world's best mills and tanneries." },
              { Icon: Hammer, t: "Quality Craftsmanship", d: "Hand-built by craftsmen with an obsessive focus on precision and detail." },
              { Icon: Award, t: "Custom Design", d: "Bespoke silhouettes, fabrics and finishes." },
              { Icon: ShieldCheck, t: "Customer Focus", d: "Personal service from first sketch to final delivery." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                <Icon className="h-5 w-5 text-emerald" />
                <h3 className="mt-2.5 font-display text-sm sm:text-base font-semibold text-foreground">{t}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-10 sm:py-14">
        <div className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
          <img
            src={hero}
            alt="Premium upholstered furniture"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xs border border-border/80"
          />
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-emerald font-semibold">Our Commitment</div>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Built to be lived on for a lifetime.
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-foreground/80">
              Frames are stress-tested. Joints are reinforced. Seats are pocket-sprung.
              Every cushion is filled by hand, every seam is double-stitched, every leg is
              hand-finished. We back every piece with a structural warranty because we know
              what we made.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-flex rounded-full bg-foreground px-5 py-2.5 text-xs font-medium text-background hover:opacity-90 transition-opacity"
            >
              Start your project
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}