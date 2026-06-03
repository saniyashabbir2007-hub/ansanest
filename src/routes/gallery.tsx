import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { products } from "@/lib/products";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: `Gallery — Completed Projects | ${BUSINESS.name}` },
      { name: "description", content: "Browse our gallery of completed upholstery work — sofas, sectional sofas, upholstered beds and custom projects." },
      { property: "og:title", content: "Project Gallery" },
      { property: "og:description", content: "Completed upholstery projects across India." },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

const TABS = ["All", "Sofas", "Sectionals", "Beds", "Custom"] as const;

function Gallery() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const images = products.flatMap((p) =>
    p.gallery.map((src, i) => ({ src, name: p.name, cat: p.category, key: `${p.id}-${i}` })),
  );
  const filtered = images.filter((img) => {
    if (tab === "All") return true;
    if (tab === "Sofas") return img.cat === "Sofa";
    if (tab === "Sectionals") return img.cat === "Sectional Sofa";
    if (tab === "Beds") return img.cat === "Upholstered Bed";
    if (tab === "Custom") return img.cat === "Custom Upholstery";
    return true;
  });

  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-emerald">Gallery</div>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">Our Craft, In Homes</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          A glimpse into homes, hotels and lounges across India where our upholstery now lives.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              tab === t ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {filtered.map((img) => (
          <figure key={img.key} className="break-inside-avoid overflow-hidden rounded-xl">
            <img src={img.src} alt={img.name} loading="lazy" className="w-full object-cover transition-transform duration-700 hover:scale-105" />
            <figcaption className="bg-card px-4 py-3">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{img.cat}</div>
              <div className="font-display text-base text-foreground">{img.name}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
