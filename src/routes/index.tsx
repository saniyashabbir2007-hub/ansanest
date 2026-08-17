import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import hero from "@/assets/hero-sofa.jpg";
import sectional from "@/assets/sectional.jpg";
import bed from "@/assets/bed.jpg";
import custom from "@/assets/custom.jpg";

import { listProducts } from "@/lib/products-api";
import { BUSINESS } from "@/lib/business";
import { TestimonialsSection } from "@/components/site/TestimonialsSection";
import { TrustBar } from "@/components/site/Home/TrustBar";
import { CarouselSection } from "@/components/site/Home/CarouselSection";

/*
 * ============================================================
 * HOMEPAGE COLLECTION IMAGE ROTATION
 * ============================================================
 *
 * TESTING:
 * 10 seconds
 *
 * FINAL:
 * 60 seconds
 *
 * Once we confirm that rotation works correctly,
 * change 10_000 to 60_000.
 */
const COLLECTION_ROTATION_MS = 10_000;

export const Route = createFileRoute("/")({
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
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  /*
   * ============================================================
   * PRODUCT GROUPS
   * ============================================================
   */

  const featured = products.filter((p) => p.featured);

  const recommendedProducts = featured.slice(0, 8);

  const bestSellerProducts = featured.slice(0, 8);

  const sofas = products
    .filter(
      (p) =>
        p.category === "Sofa" ||
        p.category === "Sectional Sofa"
    )
    .slice(0, 3);

  const sectionals = products
    .filter((p) => p.category === "Sectional Sofa")
    .slice(0, 3);

  const beds = products.filter(
    (p) => p.category === "Upholstered Bed"
  );

  /*
   * ============================================================
   * COLLECTION IMAGE POOLS
   * ============================================================
   *
   * Each collection uses:
   *
   * 1. Product main image
   * 2. Product gallery images
   *
   * Therefore the homepage uses actual ANSA NEST catalog
   * photography instead of separate static collection images.
   */

  const getProductImages = (product: any): string[] => {
    const images: string[] = [];

    if (product.image_url) {
      images.push(product.image_url);
    }

    if (Array.isArray(product.gallery_urls)) {
      images.push(
        ...product.gallery_urls.filter(
          (image: unknown): image is string =>
            typeof image === "string" &&
            image.trim().length > 0
        )
      );
    }

    return [...new Set(images)];
  };

  const normalizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const sofaCollectionImages = products
  .filter((p) => {
    const category = normalizeText(p.category);
    const subType = normalizeText(p.sub_type);

    const text = `${category} ${subType}`;

    return (
      text.includes("sofa") ||
      text.includes("sectional")
    );
  })
  .flatMap(getProductImages);

const bedCollectionImages = products
  .filter((p) => {
    const category = normalizeText(p.category);
    const subType = normalizeText(p.sub_type);

    const text = `${category} ${subType}`;

    return (
      text.includes("bed") ||
      text.includes("upholstered bed")
    );
  })
  .flatMap(getProductImages);

const customCollectionImages = products
  .filter((p) => p.customizable === true)
  .flatMap(getProductImages);
  /*
   * ============================================================
   * COLLECTION ROTATION STATE
   * ============================================================
   */

  const [collectionImageIndex, setCollectionImageIndex] =
    useState({
      sofas: 0,
      beds: 0,
      custom: 0,
    });

  /*
   * ============================================================
   * COLLECTION ROTATION TIMER
   * ============================================================
   */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCollectionImageIndex((current) => ({
        sofas:
          sofaCollectionImages.length > 1
            ? (current.sofas + 1) %
              sofaCollectionImages.length
            : 0,

        beds:
          bedCollectionImages.length > 1
            ? (current.beds + 1) %
              bedCollectionImages.length
            : 0,

        custom:
          customCollectionImages.length > 1
            ? (current.custom + 1) %
              customCollectionImages.length
            : 0,
      }));
    }, COLLECTION_ROTATION_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    sofaCollectionImages.length,
    bedCollectionImages.length,
    customCollectionImages.length,
  ]);

  /*
   * ============================================================
   * HOMEPAGE
   * ============================================================
   */

  return (
    <div>

      {/* ======================================================
          HERO
      ====================================================== */}

      <DynamicHero products={featured} />

      {/* ======================================================
          RECOMMENDED PRODUCTS
      ====================================================== */}

      <CarouselSection
        eyebrow="Recommended"
        title="Curated for your home"
        items={recommendedProducts}
      />

      {/* ======================================================
          BEST SELLERS
      ====================================================== */}

      <CarouselSection
        eyebrow="Best Sellers"
        title="Most loved by our customers"
        items={bestSellerProducts}
        muted
      />

      {/* ======================================================
          COLLECTIONS
      ====================================================== */}

      <section className="container-px mx-auto max-w-7xl py-16">
        <SectionHead
          eyebrow="Collections"
          title="Designed for every room of the home"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          {/* ==================================================
              SOFAS & SECTIONALS
          ================================================== */}

          <Link
            to="/catalog"
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden">

              {sofaCollectionImages.length > 0 ? (
                sofaCollectionImages.map(
                  (image, index) => (
                    <img
                      key={`sofa-${image}-${index}`}
                      src={image}
                      alt="ANSA NEST Sofas & Sectionals"
                      loading={index === 0 ? "eager" : "lazy"}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ${
                        index ===
                        collectionImageIndex.sofas
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                  )
                )
              ) : (
                <img
                  src={sectional}
                  alt="Sofas & Sectionals"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">

                <div className="text-xs uppercase tracking-[0.25em] text-gold">
                  Collection
                </div>

                <div className="mt-1 font-display text-2xl">
                  Sofas & Sectionals
                </div>

                <div className="mt-1 text-sm text-white/80">
                  L-shape, U-shape, modular, curved.
                </div>

              </div>
            </div>
          </Link>

          {/* ==================================================
              UPHOLSTERED BEDS
          ================================================== */}

          <Link
            to="/catalog"
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden">

              {bedCollectionImages.length > 0 ? (
                bedCollectionImages.map(
                  (image, index) => (
                    <img
                      key={`bed-${image}-${index}`}
                      src={image}
                      alt="ANSA NEST Upholstered Beds"
                      loading={index === 0 ? "eager" : "lazy"}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ${
                        index ===
                        collectionImageIndex.beds
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                  )
                )
              ) : (
                <img
                  src={bed}
                  alt="Upholstered Beds"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">

                <div className="text-xs uppercase tracking-[0.25em] text-gold">
                  Collection
                </div>

                <div className="mt-1 font-display text-2xl">
                  Upholstered Beds
                </div>

                <div className="mt-1 text-sm text-white/80">
                  Wingback, platform, tufted classics.
                </div>

              </div>
            </div>
          </Link>

          {/* ==================================================
              CUSTOM UPHOLSTERY
          ================================================== */}

          <Link
            to="/contact"
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden">

              {customCollectionImages.length > 0 ? (
                customCollectionImages.map(
                  (image, index) => (
                    <img
                      key={`custom-${image}-${index}`}
                      src={image}
                      alt="ANSA NEST Custom Upholstery"
                      loading={index === 0 ? "eager" : "lazy"}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ${
                        index ===
                        collectionImageIndex.custom
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                  )
                )
              ) : (
                <img
                  src={custom}
                  alt="Custom Upholstery"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">

                <div className="text-xs uppercase tracking-[0.25em] text-gold">
                  Collection
                </div>

                <div className="mt-1 font-display text-2xl">
                  Custom Upholstery
                </div>

                <div className="mt-1 text-sm text-white/80">
                  Built around your space. Made to your vision.
                </div>

              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* ======================================================
          FEATURED SOFAS
      ====================================================== */}

      <CarouselSection
        eyebrow="Featured Sofas"
        title="Statement seating, hand-crafted to order"
        items={sofas}
      />

      {/* ======================================================
          SECTIONAL SOFAS
      ====================================================== */}

      <CarouselSection
        eyebrow="Sectional Sofa Collection"
        title="L-shape, U-shape, curved & modular"
        items={sectionals}
        muted
      />

      {/* ======================================================
          UPHOLSTERED BEDS
      ====================================================== */}

      <CarouselSection
        eyebrow="Upholstered Beds"
        title="Bedroom suites worthy of a slow morning"
        items={beds}
      />

      {/* ======================================================
          TRUST BAR
      ====================================================== */}

      <TrustBar />

      {/* ======================================================
          TESTIMONIALS
      ====================================================== */}

      <TestimonialsSection />

      {/* ======================================================
          CONTACT CTA
      ====================================================== */}

      <section className="container-px mx-auto max-w-7xl py-20">
        <div className="rounded-3xl border border-border bg-card p-10 text-center md:p-16">

          <h2 className="font-display text-4xl text-foreground md:text-5xl">
            Visit our showroom
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Feel the fabrics. Test the cushions. Meet the makers.
            Our team is ready to help you build the home you've
            always wanted.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">

            <Link
              to="/contact"
              className="rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background hover:opacity-90"
            >
              Get Directions
            </Link>

            <a
              href={`tel:${BUSINESS.phoneRaw}`}
              className="rounded-full border border-foreground/20 px-6 py-3.5 text-sm font-medium text-foreground hover:bg-foreground hover:text-background"
            >
              Call {BUSINESS.phone}
            </a>

          </div>
        </div>
      </section>

    </div>
  );
}

/* ============================================================================
   DYNAMIC HERO
============================================================================ */

function DynamicHero({
  products,
}: {
  products: {
    id: string;
    name: string;
    image_url: string;
  }[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex(
        (current) =>
          (current + 1) % products.length
      );
    }, 6000);

    return () => {
      window.clearInterval(interval);
    };
  }, [products.length]);

  const activeProduct = products[activeIndex];

  return (
    <section className="relative isolate overflow-hidden">

      <div className="container-px mx-auto grid max-w-7xl items-center gap-6 py-6 sm:gap-8 sm:py-8 md:grid-cols-[1.05fr_1fr] md:gap-10 md:py-10">

        {/* HERO TEXT */}

        <div>

          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-emerald sm:text-xs">
            <Sparkles className="h-3 w-3" />
            WELCOME TO ANSA NEST
          </div>

          <h1 className="mt-3 max-w-xl font-display text-2xl leading-[1.08] text-balance text-foreground sm:mt-4 sm:text-3xl md:mt-5 md:text-5xl lg:text-6xl">
            Timeless{" "}
            <em className="italic text-emerald">
              Furniture
            </em>
            <br />
            for modern living.
          </h1>

          <p className="mt-3 max-w-lg text-xs leading-relaxed text-muted-foreground sm:mt-4 sm:text-sm md:text-base">
            Thoughtfully crafted sofas, upholstered beds
            and bespoke furniture designed to bring
            timeless elegance and exceptional comfort
            into every home.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">

            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-medium text-background transition-opacity hover:opacity-90 sm:px-6 sm:py-3 sm:text-sm"
            >
              Explore Catalog
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background sm:px-6 sm:py-3 sm:text-sm"
            >
              Book a Showroom Visit
            </Link>

          </div>
        </div>

        {/* HERO IMAGE */}

        <div className="relative">

          <div className="relative mx-auto aspect-[16/10] w-full max-w-[560px] overflow-hidden rounded-2xl shadow-xl sm:rounded-3xl md:aspect-[4/3]">

            {/* FALLBACK */}

            <img
              src={hero}
              alt="ANSA NEST premium furniture"
              width={1792}
              height={1152}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                activeProduct
                  ? "opacity-0"
                  : "opacity-100"
              }`}
            />

            {/* CATALOG IMAGE */}

            {activeProduct && (
              <img
                key={activeProduct.id}
                src={activeProduct.image_url}
                alt={activeProduct.name}
                width={1200}
                height={900}
                className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-1000"
              />
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

          </div>

          {/* HERO INDICATORS */}

          {products.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1.5 backdrop-blur-sm">

              {products
                .slice(
                  0,
                  Math.min(products.length, 6)
                )
                .map((product, index) => (
                  <span
                    key={product.id}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === activeIndex
                        ? "w-5 bg-white"
                        : "w-1.5 bg-white/50"
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

/* ============================================================================
   SECTION HEADING
============================================================================ */

function SectionHead({
  eyebrow,
  title,
  inline,
}: {
  eyebrow: string;
  title: string;
  inline?: boolean;
}) {
  return (
    <div
      className={
        inline
          ? ""
          : "text-center"
      }
    >

      <div className="text-xs uppercase tracking-[0.25em] text-emerald">
        {eyebrow}
      </div>

      <h2 className="mt-3 font-display text-4xl text-balance text-foreground md:text-5xl">
        {title}
      </h2>

    </div>
  );
}