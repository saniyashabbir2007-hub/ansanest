import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { listProducts, type Product } from "@/lib/products-api";
import { ProductCard } from "@/components/site/ProductCard";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/catalog")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      category: typeof search.category === "string" ? search.category : undefined,
      q: typeof search.q === "string" ? search.q : undefined,
    };
  },
  loader: async () => {
    try {
      const products = await listProducts();
      return { products: products ?? [] };
    } catch {
      return { products: [] };
    }
  },
  component: CatalogPage,
});

function normalize(str?: string | null): string {
  if (!str) return "";
  return decodeURIComponent(str.replace(/\+/g, " "))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function CatalogPage() {
  const loaderData = Route.useLoaderData();
  const searchParams = useSearch({ from: "/catalog" });

  const { data: products = loaderData?.products ?? [] } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
    initialData: loaderData?.products,
    staleTime: 0,
  });

  // Extract all unique categories present in the products
  const categoryPills = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: any) => {
      if (p.category && String(p.category).trim().length > 0) {
        set.add(String(p.category).trim());
      }
    });

    const list = Array.from(set);
    if (list.length === 0) {
      return [
        "Accent Chairs",
        "Beds",
        "Bubble Sofa / Cloud Sofa",
        "Chair",
        "Chesterfield Sofas",
        "Cloud Curved Sofa",
        "Living Room Furniture",
        "Ottomans & Benches",
        "Sofa",
        "Sofa Cum Bed",
        "Sofas & Seating",
      ];
    }
    return list.sort();
  }, [products]);

  // Selected Category State
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.q || "");

  // Sync selectedCategory whenever URL search query changes (e.g. from homepage click)
  useEffect(() => {
    if (searchParams.category) {
      const targetNorm = normalize(searchParams.category);
      const matched = categoryPills.find((pill) => normalize(pill) === targetNorm);

      if (matched) {
        setSelectedCategory(matched);
      } else {
        // Fallback matching
        const partialMatch = categoryPills.find(
          (pill) => normalize(pill).includes(targetNorm) || targetNorm.includes(normalize(pill))
        );
        setSelectedCategory(partialMatch || decodeURIComponent(searchParams.category.replace(/\+/g, " ")));
      }
    } else {
      setSelectedCategory("All");
    }
  }, [searchParams.category, categoryPills]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      // Category filter
      if (selectedCategory !== "All") {
        const catNorm = normalize(p.category);
        const subNorm = normalize(p.sub_type);
        const nameNorm = normalize(p.name);
        const targetNorm = normalize(selectedCategory);

        const matchesCategory =
          catNorm === targetNorm ||
          subNorm === targetNorm ||
          catNorm.includes(targetNorm) ||
          targetNorm.includes(catNorm) ||
          nameNorm.includes(targetNorm);

        if (!matchesCategory) return false;
      }

      // Text search filter
      if (searchQuery.trim().length > 0) {
        const qNorm = searchQuery.trim().toLowerCase();
        const matchesQuery =
          (p.name && p.name.toLowerCase().includes(qNorm)) ||
          (p.category && p.category.toLowerCase().includes(qNorm)) ||
          (p.description && p.description.toLowerCase().includes(qNorm));

        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="container-px mx-auto max-w-7xl">
        {/* Header Title */}
        <div className="text-center">
          <span className="text-[10px] uppercase tracking-[0.25em] text-emerald font-semibold">
            {BUSINESS.name.toUpperCase()} COLLECTION
          </span>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Furniture made for living.
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-muted-foreground">
            Explore sofas, sectionals, upholstered beds and statement pieces crafted with premium materials and thoughtful detail.
          </p>

          {/* Search Box */}
          <div className="relative mx-auto mt-6 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Try "Cloud Sofa", "sectional", "bed"...'
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-xs sm:text-sm text-foreground shadow-2xs outline-none transition-all placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                window.history.pushState({}, "", "/catalog");
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-foreground text-background shadow-xs"
                  : "border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              All
            </button>

            {categoryPills.map((pill) => {
              const isSelected = selectedCategory === pill || normalize(selectedCategory) === normalize(pill);

              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(pill);
                    window.history.pushState({}, "", `/catalog?category=${encodeURIComponent(pill)}`);
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-foreground text-background shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {pill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Header & Count */}
        <div className="mt-10 mb-4 flex items-center justify-between border-b border-border pb-2">
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            {selectedCategory === "All" ? "ALL FURNITURE" : selectedCategory.toUpperCase()}
          </span>
          <span className="text-xs text-muted-foreground">
            {filteredProducts.length} pieces
          </span>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filteredProducts.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard p={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No products found matching this category.
          </div>
        )}
      </div>
    </div>
  );
}