import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { products, type Category } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: `Product Catalog — Sofas, Sectionals & Beds | ${BUSINESS.name}` },
      { name: "description", content: "Browse our full catalog of premium sofas, L-shaped & U-shaped sectional sofas, upholstered beds, and custom upholstery." },
      { property: "og:title", content: "Furniture Catalog" },
      { property: "og:description", content: "Premium sofas, sectionals, beds and custom upholstery." },
    ],
    links: [{ rel: "canonical", href: "/catalog" }],
  }),
  component: Catalog,
});

const FILTERS: (Category | "All")[] = ["All", "Sofa", "Sectional Sofa", "Upholstered Bed", "Custom Upholstery"];

function Catalog() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const visible = filter === "All" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-emerald">Catalog</div>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">Our Collection</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Every piece is hand-crafted to order in our Mumbai atelier. Browse below and
          tap Inquire to chat with us on WhatsApp.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              filter === f
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
