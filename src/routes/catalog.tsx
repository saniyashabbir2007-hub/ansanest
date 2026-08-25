import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/products-api";
import { ProductCard } from "@/components/site/ProductCard";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/catalog")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { search?: string } => ({
    search: typeof search.search === "string" ? search.search : undefined,
  }),
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

function normalize(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function formatCategoryName(category: string): string {
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function matchesFilter(productCategory: string | null | undefined, activeFilter: string) {
  if (activeFilter === "All") return true;
  return normalize(productCategory) === normalize(activeFilter);
}

function Catalog() {
  const { search: searchParam } = Route.useSearch();
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState(searchParam ?? "");

  useEffect(() => {
    setQuery(searchParam ?? "");
  }, [searchParam]);

  const activeQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  // Extract filters dynamically from the products list safely
  const availableFilters = useMemo(() => {
    const categoryMap = new Map<string, string>();

    (products as any[]).forEach((product) => {
      const rawCategory = product?.category?.trim();
      if (rawCategory) {
        const key = rawCategory.toLowerCase();
        if (!categoryMap.has(key)) {
          categoryMap.set(key, rawCategory);
        }
      }
    });

    const uniqueCategories = Array.from(categoryMap.values()).sort((a, b) =>
      a.localeCompare(b)
    );

    return ["All", ...uniqueCategories];
  }, [products]);

  const visible = useMemo(() => {
    return (products as any[]).filter((product) => {
      if (!matchesFilter(product.category, filter)) return false;
      if (activeQuery) {
        const haystack = [
          product.name,
          product.category,
          product.material,
          product.sub_type,
          product.short_description,
          product.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(activeQuery)) return false;
      }
      return true;
    });
  }, [products, filter, activeQuery]);

  return (
    <div className="container-px mx-auto max-w-7xl py-10 sm:py-12 md:py-14">
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

      <div className="mt-8 flex justify-center">
        <div className="relative w-full max-w-xl">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "Cloud Sofa", "sectional", "bed"…'
            aria-label="Search catalog"
            className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-10 text-sm focus:border-emerald focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 overflow-x-auto pb-2">
        <div className="flex min-w-max justify-center gap-2">
          {availableFilters.map((currentFilter) => {
            const active =
              filter.toLowerCase() === currentFilter.toLowerCase();
            const displayName =
              currentFilter === "All"
                ? "All"
                : formatCategoryName(currentFilter);

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
                {displayName}
              </button>
            );
          })}
        </div>
      </div>

      {!isProductsLoading && (
        <div className="mt-8 flex items-center justify-between border-b border-border pb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {filter === "All" ? "All Furniture" : formatCategoryName(filter)}
          </p>

          <p className="text-sm text-muted-foreground">
            {visible.length} {visible.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      )}

      {isProductsLoading ? (
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

      {!isProductsLoading && visible.length === 0 && (
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