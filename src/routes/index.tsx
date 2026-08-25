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
      <CarouselSection
        eyebrow="Recommended"
        title="Curated for your home"
        items={recommendedProducts as Product[]}
      />

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
      <section className="container-px mx-auto max-w-7xl py-10 md:py-14">
        <div className="rounded-3xl border border-border bg-card p-6 text-center md:p-10">
          <h2 className="font-display text-2xl text-foreground md:text-3xl">
            Visit our showroom
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs md:text-sm text-muted-foreground">
            Feel the fabrics. Test the cushions. Meet the makers.
            Our team is ready to help you build the home you've
            always wanted.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Link
              to="/contact"
              className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90"
            >
              Get Directions
            </Link>
            <a
              href={`tel:${BUSINESS.phoneRaw}`}
              className="rounded-full border border-foreground/20 px-4 py-2 text-xs font-medium text-foreground hover:bg-foreground hover:text-background notranslate"
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
      const offset = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="container-px mx-auto max-w-7xl pt-0 pb-3">
      <div className="relative rounded-2xl border border-border/70 bg-card/70 p-2 shadow-xs md:p-3">
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-xs text-foreground transition-transform hover:scale-105"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 overflow-x-auto scroll-smooth px-1 py-0.5 md:gap-5 md:px-6"
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
                <div className="relative h-11 w-11 overflow-hidden rounded-full border border-border bg-muted/80 p-0.5 transition-all duration-300 group-hover:scale-105 group-hover:border-foreground/40 sm:h-13 sm:w-13 md:h-14 md:w-14">
                  {activeImage ? (
                    <img
                      key={activeImage}
                      src={activeImage}
                      alt={cat.label}
                      className="h-full w-full rounded-full object-cover transition-all duration-700 hover:opacity-95"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center rounded-full bg-muted text-[8px] font-semibold text-muted-foreground notranslate"
                      translate="no"
                    >
                      {cat.label.slice(0, 3).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="mt-1 max-w-[72px] truncate text-[10px] font-medium text-foreground transition-colors group-hover:text-emerald md:text-xs">
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
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-xs text-foreground transition-transform hover:scale-105"
        >
          <ChevronRight className="h-3 w-3" />
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
      <div className="container-px mx-auto grid max-w-7xl items-center gap-3 py-2 sm:gap-5 sm:py-3 md:grid-cols-[1.1fr_1fr] md:gap-7 md:py-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[8.5px] uppercase tracking-[0.2em] text-emerald sm:text-[9.5px]">
            <Sparkles className="h-2.5 w-2.5" />
            WELCOME TO <span className="notranslate" translate="no">ANSA NEST</span>
          </div>

          <h1 className="mt-1.5 max-w-lg font-display text-lg leading-tight text-balance text-foreground sm:mt-2 sm:text-2xl md:text-3xl lg:text-4xl">
            Timeless <em className="italic text-emerald">Furniture</em>
            <br />
            for modern living.
          </h1>

          <p className="mt-1.5 max-w-md text-[11px] leading-relaxed text-muted-foreground sm:text-xs md:text-sm">
            Thoughtfully crafted sofas, upholstered beds and bespoke furniture designed for comfort into every home.
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2 sm:mt-3">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 sm:px-4 sm:py-2"
            >
              Explore Catalog
              <ArrowRight className="h-3 w-3" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background sm:px-4 sm:py-2"
            >
              Book a Showroom Visit
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative mx-auto aspect-[16/10] w-full max-w-[360px] sm:max-w-[420px] overflow-hidden rounded-xl shadow-md md:aspect-[4/3] bg-muted">
            {isLoading && !activeProduct && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}

            {activeProduct?.image_url && (
              <img
                key={activeProduct.id || activeProduct.image_url}
                src={activeProduct.image_url}
                alt={activeProduct.name || "Ansa Nest Luxury Furniture"}
                width={800}
                height={600}
                className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-1000"
              />
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </div>

          {products.length > 1 && (
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 backdrop-blur-sm">
              {products.slice(0, Math.min(products.length, 6)).map((product: any, index: number) => (
                <span
                  key={product.id || index}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    index === activeIndex ? "w-3.5 bg-white" : "w-1 bg-white/50"
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