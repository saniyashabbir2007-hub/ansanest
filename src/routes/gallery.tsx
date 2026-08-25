import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/products-api";
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
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: listProducts });

  const images = (products ?? []).flatMap((p: any) =>
    (Array.isArray(p?.gallery_urls) && p.gallery_urls.length > 0 ? p.gallery_urls : [p?.image_url])
      .filter(Boolean)
      .map((src: string, i: number) => ({ src, name: p?.name, cat: p?.category, key: `${p?.id}-${i}` }))
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
    <div className="container-px mx-auto max-w-7xl py-8 sm:py-12">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[0.25em] text-emerald font-semibold">Gallery</div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          Our Craft, In Homes
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-muted-foreground">
          A glimpse into homes, hotels and lounges across India where our upholstery now lives.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              tab === t
                ? "border-foreground bg-foreground text-background shadow-xs"
                : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8 sm:mt-10 columns-1 gap-3 sm:columns-2 lg:columns-3 [&>*]:mb-3 sm:[&>*]:mb-4">
        {filtered.map((img) => (
          <figure key={img.key} className="break-inside-avoid overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs">
            <img
              src={img.src}
              alt={img.name}
              loading="lazy"
              className="w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <figcaption className="bg-card px-3.5 py-2.5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{img.cat}</div>
              <div className="font-display text-sm font-semibold text-foreground">{img.name}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}