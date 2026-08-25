import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { listProducts, type Product } from "@/lib/products-api";
import { BUSINESS } from "@/lib/business";
import { TestimonialsSection } from "@/components/site/TestimonialsSection";
import { TrustBar } from "@/components/site/Home/TrustBar";
import { CarouselSection } from "@/components/site/Home/CarouselSection";

const CATEGORY_ROTATION_MS = 60_000;

const ADMIN_CATEGORIES_CONFIG = [
  { id: 1, label: "Sofa", match: ["sofa", "couches", "seating"] },
  { id: 2, label: "Sofa Cum Bed", match: ["sofa cum bed", "cum bed", "daybed"] },
  { id: 3, label: "Accent Chairs", match: ["accent chairs", "accent chair"] },
  { id: 4, label: "Cloud Curved Sofa", match: ["cloud curved sofa", "curved sofa", "cloud curved"] },
  { id: 5, label: "Chair", match: ["chair", "lounge chair", "armchair"] },
  { id: 6, label: "Bubble Sofa / Cloud Sofa", match: ["bubble sofa", "cloud sofa", "bubble sofa / cloud sofa"] },
  { id: 7, label: "Ottoman Storage", match: ["ottoman storage", "storage ottoman"] },
  { id: 8, label: "Ottomans & Benches", match: ["ottomans & benches", "ottomans", "benches", "pouf"] },
  { id: 9, label: "Living Room Furniture", match: ["living room furniture", "living room"] },
  { id: 10, label: "Sofas & Seating", match: ["sofas & seating", "sectional", "sectionals"] },
  { id: 11, label: "Chesterfield Sofas", match: ["chesterfield sofas", "chesterfield"] },
  { id: 12, label: "Beds", match: ["beds", "bed", "upholstered bed", "storage bed"] },
];

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const products = await listProducts();
      return { products: products ?? [] };
    } catch {
      return { products: [] };
    }
  },
  head: () => ({
    meta: [
      {
        title: `${BUSINESS.name} — Premium Sofas, Sectionals & Upholstered Beds in India`,
      },
      {
        name: "description",
        content:
          "Hand-crafted sofas, L-shaped & U-shaped sectional sofas, luxury upholstered beds, and bespoke custom upholstery. Visit our premium furniture showroom in India.",
      },
      {
        property: "og:title",
        content: `${BUSINESS.name} — Premium Upholstery Furniture`,
      },
      {
        property: "og:description",
        content:
          "India's destination for premium sofas, sectionals and upholstered beds.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const loaderData = Route.useLoaderData();

  const { data: products = loaderData?.products ?? [] } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
    initialData: loaderData?.products,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const isInitialLoading = products.length === 0;

  const featured = products.filter((p) => p.featured === true);
  const heroProducts = featured.length > 0 ? featured : products;
  const recommendedProducts = products.slice(0, 10);
  const bestSellerProducts = products.slice(0, 10);

  const featuredProductsList = featured.length > 0 ? featured : products.slice(0, 8);
  const premiumProductsList = products
    .filter((p: any) => (p.price && Number(p.price) >= 50000) || p.customizable === true)
    .slice(0, 8);

  return (
    <div>
      {/* 1. COMPACT HERO BANNER */}
      <DynamicHero
        products={heroProducts as Product[]}
        isLoading={isInitialLoading}
      />

      {/* 2. COMPACT CATEGORY STRIP */}
      <CategoryQuickStrip products={products as Product[]} />

      {/* 3. RECOMMENDED (Curated for your home) */}
      <div className="pt-2">
        <CarouselSection
          eyebrow="Recommended"
          title="Curated for your home"
          items={recommendedProducts as Product[]}
        />
      </div>

      {/* 4. BEST SELLERS */}
      <CarouselSection
        eyebrow="Best Sellers"
        title="Most loved by our customers"
        items={bestSellerProducts as Product[]}
        muted
      />

      {/* 5. FEATURED PRODUCTS */}
      <CarouselSection
        eyebrow="Featured"
        title="Featured Products"
        items={featuredProductsList as Product[]}
      />

      {/* 6. PREMIUM COLLECTION */}
      <CarouselSection
        eyebrow="Exclusive"
        title="Premium Collection"
        items={(premiumProductsList.length > 0 ? premiumProductsList : products) as Product[]}
        muted
      />

      {/* 7. 6-FEATURE TRUST BAR */}
      <TrustBar />

      {/* 8. TESTIMONIALS */}
      <TestimonialsSection />

      {/* 9. SHOWROOM VISIT */}
      <section className="container-px mx-auto max-w-7xl py-12 md:py-16">
        <div className="rounded-3xl border border-border bg-card p-8 text-center md:p-12">
          <h2 className="font-display text-3xl text-foreground md:text-4xl">
            Visit our showroom
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs md:text-sm text-muted-foreground">
            Feel the fabrics. Test the cushions. Meet the makers.
            Our team is ready to help you build the home you've
            always wanted.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="rounded-full bg-foreground px-5 py-2.5 text-xs md:text-sm font-medium text-background hover:opacity-90"
            >
              Get Directions
            </Link>
            <a
              href={`tel:${BUSINESS.phoneRaw}`}
              className="rounded-full border border-foreground/20 px-5 py-2.5 text-xs md:text-sm font-medium text-foreground hover:bg-foreground hover:text-background notranslate"
              translate="no"
            >
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryQuickStrip({ products }: { products: Product[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [imageTick, setImageTick] = useState(0);

  const categoriesList = useMemo(() => {
    return ADMIN_CATEGORIES_CONFIG.map((catConfig) => {
      const matchedProducts = products.filter((p: any) => {
        const cat = (p.category ?? "").trim().toLowerCase();
        const sub = (p.sub_type ?? "").trim().toLowerCase();
        const name = (p.name ?? "").trim().toLowerCase();

        return catConfig.match.some((keyword) => {
          const kw = keyword.toLowerCase();
          return cat === kw || sub === kw || cat.includes(kw) || name.includes(kw);
        });
      });

      const images = Array.from(
        new Set(
          matchedProducts
            .flatMap((p: any) => [
              p.image_url,
              ...(Array.isArray(p.gallery_urls) ? p.gallery_urls : []),
            ])
            .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
        )
      );

      return {
        id: catConfig.id,
        label: catConfig.label,
        images: images,
      };
    });
  }, [products]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setImageTick((prev: number) => prev + 1);
    }, CATEGORY_ROTATION_MS);

    return () => clearInterval(interval);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="container-px mx-auto max-w-7xl pt-1 pb-4">
      <div className="relative rounded-2xl border border-border/70 bg-card/80 p-2.5 shadow-sm md:p-3.5">
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow text-foreground transition-transform hover:scale-105 hover:bg-muted"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 overflow-x-auto scroll-smooth px-1 py-1 md:gap-6 md:px-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categoriesList.map((cat) => {
            const hasImages = cat.images.length > 0;
            const activeImage = hasImages ? cat.images[imageTick % cat.images.length] : null;

            return (
              <Link
                key={cat.id}
                to="/catalog"
                className="group flex flex-col items-center flex-shrink-0 cursor-pointer text-center"
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-full border border-border bg-muted/80 p-0.5 transition-all duration-300 group-hover:scale-105 group-hover:border-foreground/40 md:h-16 md:w-16">
                  {activeImage ? (
                    <img
                      key={activeImage}
                      src={activeImage}
                      alt={cat.label}
                      className="h-full w-full rounded-full object-cover transition-all duration-700 hover:opacity-95"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground notranslate"
                      translate="no"
                    >
                      {cat.label.slice(0, 3).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="mt-1 max-w-[85px] truncate text-[11px] font-medium text-foreground transition-colors group-hover:text-emerald md:text-xs">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow text-foreground transition-transform hover:scale-105 hover:bg-muted"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

function DynamicHero({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [products.length]);

  const activeProduct = products[activeIndex] ?? products[0];

  return (
    <section className="relative isolate overflow-hidden">
      <div className="container-px mx-auto grid max-w-7xl items-center gap-4 py-3 sm:gap-6 sm:py-4 md:grid-cols-[1.1fr_1fr] md:gap-8 md:py-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-emerald sm:text-[10px]">
            <Sparkles className="h-2.5 w-2.5" />
            WELCOME TO <span className="notranslate" translate="no">ANSA NEST</span>
          </div>

          <h1 className="mt-2 max-w-lg font-display text-xl leading-[1.08] text-balance text-foreground sm:mt-3 sm:text-2xl md:mt-3 md:text-4xl lg:text-5xl">
            Timeless <em className="italic text-emerald">Furniture</em>
            <br />
            for modern living.
          </h1>

          <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-xs md:text-sm">
            Thoughtfully crafted sofas, upholstered beds and bespoke furniture designed to bring timeless elegance and comfort into every home.
          </p>

          <div className="mt-3.5 flex flex-wrap gap-2 sm:mt-4">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90 sm:px-5 sm:py-2.5"
            >
              Explore Catalog
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background sm:px-5 sm:py-2.5"
            >
              Book a Showroom Visit
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative mx-auto aspect-[16/10] w-full max-w-[460px] overflow-hidden rounded-xl shadow-lg sm:rounded-2xl md:aspect-[4/3] bg-muted">
            {isLoading && !activeProduct && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}

            {activeProduct?.image_url && (
              <img
                key={activeProduct.id || activeProduct.image_url}
                src={activeProduct.image_url}
                alt={activeProduct.name || "Ansa Nest Luxury Furniture"}
                width={900}
                height={675}
                className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-1000"
              />
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </div>

          {products.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/20 px-2 py-1 backdrop-blur-sm">
              {products.slice(0, Math.min(products.length, 6)).map((product: any, index: number) => (
                <span
                  key={product.id || index}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    index === activeIndex ? "w-4 bg-white" : "w-1 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}