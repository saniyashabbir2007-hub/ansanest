import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/products-api";
import { ProductCard } from "@/components/site/ProductCard";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      {
        title: `Product Catalog — Sofas, Sectionals & Beds | ${BUSINESS.name}`,
      },
      {
        name: "description",
        content:
          "Browse our full catalog of premium sofas, L-shaped & U-shaped sectional sofas, upholstered beds, and custom upholstery.",
      },
      {
        property: "og:title",
        content: "Furniture Catalog",
      },
      {
        property: "og:description",
        content:
          "Premium sofas, sectionals, beds and custom upholstery.",
      },
    ],
    links: [{ rel: "canonical", href: "/catalog" }],
  }),
  component: Catalog,
});

type Filter =
  | "All"
  | "Sofas"
  | "Sectional Sofas"
  | "Sofa Cum Beds"
  | "Accent Chairs"
  | "Ottomans & Benches"
  | "Upholstered Beds";

const filters: Filter[] = [
  "All",
  "Sofas",
  "Sectional Sofas",
  "Sofa Cum Beds",
  "Accent Chairs",
  "Ottomans & Benches",
  "Upholstered Beds",
];

function normalize(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function matchesFilter(category: string | null | undefined, filter: Filter) {
  if (filter === "All") return true;

  const value = normalize(category);

  if (!value) return false;

  switch (filter) {
    case "Sectional Sofas":
      return (
        value.includes("sectional") ||
        value.includes("l-shape") ||
        value.includes("u-shape") ||
        value.includes("modular sectional")
      );

    case "Sofa Cum Beds":
      return (
        value.includes("sofa cum bed") ||
        value.includes("sofa-cum-bed") ||
        value.includes("sofa bed")
      );

    case "Sofas":
      return (
        value.includes("sofa") &&
        !value.includes("cum bed") &&
        !value.includes("sofa bed") &&
        !value.includes("sectional") &&
        !value.includes("l-shape") &&
        !value.includes("u-shape")
      );

    case "Accent Chairs":
      return (
        value.includes("accent chair") ||
        value === "chair" ||
        value.includes("lounge chair")
      );

    case "Ottomans & Benches":
      return (
        value.includes("ottoman") ||
        value.includes("bench") ||
        value.includes("pouf") ||
        value.includes("poufs")
      );

    case "Upholstered Beds":
      return value.includes("bed");

    default:
      return false;
  }
}

function Catalog() {
  const [filter, setFilter] = useState<Filter>("All");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const availableFilters = useMemo(() => {
    return filters.filter((currentFilter) => {
      if (currentFilter === "All") return true;

      return products.some((product) =>
        matchesFilter(product.category, currentFilter)
      );
    });
  }, [products]);

  const visible = useMemo(() => {
    return products.filter((product) =>
      matchesFilter(product.category, filter)
    );
  }, [products, filter]);

  return (
    <div className="container-px mx-auto max-w-7xl py-10 sm:py-12 md:py-14">
      {/* HEADER */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-[10px] uppercase tracking-[0.28em] text-emerald sm:text-xs">
          ANSA NEST COLLECTION
        </div>

        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
          Furniture made for living.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          Explore sofas, sectionals, upholstered beds and statement pieces
          crafted with premium materials and thoughtful detail.
        </p>
      </div>

      {/* FILTERS */}
      <div className="mt-8 overflow-x-auto pb-2">
        <div className="flex min-w-max justify-center gap-2">
          {availableFilters.map((currentFilter) => {
            const active = filter === currentFilter;

            return (
              <button
                key={currentFilter}
                type="button"
                onClick={() => setFilter(currentFilter)}
                className={[
                  "whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-medium transition-all duration-300 sm:px-5 sm:text-sm",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground hover:border-foreground/40 hover:bg-muted",
                ].join(" ")}
              >
                {currentFilter}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRODUCT COUNT */}
      {!isLoading && (
        <div className="mt-8 flex items-center justify-between border-b border-border pb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {filter === "All" ? "All Furniture" : filter}
          </p>

          <p className="text-sm text-muted-foreground">
            {visible.length} {visible.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      )}

      {/* PRODUCTS */}
      {isLoading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && visible.length === 0 && (
        <div className="py-24 text-center">
          <h2 className="font-display text-2xl text-foreground">
            Nothing here yet.
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            We're adding more pieces to this collection soon.
          </p>

          <button
            type="button"
            onClick={() => setFilter("All")}
            className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            View all furniture
          </button>
        </div>
      )}
    </div>
  );
}