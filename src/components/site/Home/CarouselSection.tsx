import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Product } from "@/lib/products-api";
import { HomeProductCard } from "./HomeProductCard";

interface Props {
  eyebrow: string;
  title: string;
  items: Product[];
  muted?: boolean;
}

export function CarouselSection({
  eyebrow,
  title,
  items,
  muted = false,
}: Props) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      className={`py-12 sm:py-16 lg:py-20 ${
        muted ? "bg-card/30" : "bg-background"
      }`}
    >
      <div className="container-px mx-auto max-w-7xl">

        {/* SECTION HEADER */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-emerald sm:text-[10px]">
              {eyebrow}
            </p>

            <h2 className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h2>
          </div>

          {/* Desktop View All */}
          <Link
            to="/catalog"
            className="
              hidden
              shrink-0
              items-center
              gap-1.5
              text-xs
              font-medium
              text-foreground
              transition-opacity
              hover:opacity-60
              sm:flex
            "
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* PRODUCTS
            MOBILE = COMPACT HORIZONTAL SCROLL
            DESKTOP = NORMAL GRID
        */}
        <div
          className="
            mt-6
            flex
            gap-2.5
            overflow-x-auto
            overflow-y-hidden
            pb-2
            snap-x
            snap-mandatory
            scrollbar-hide

            sm:mt-8
            sm:gap-3

            md:grid
            md:grid-cols-3
            md:gap-5
            md:overflow-visible
            md:pb-0
            md:snap-none

            lg:grid-cols-5
            lg:gap-4
          "
        >
          {items.map((product) => (
            <div
              key={product.id}
              className="
                min-w-[42%]
                max-w-[42%]
                shrink-0
                snap-start

                sm:min-w-[32%]
                sm:max-w-[32%]

                md:min-w-0
                md:max-w-none
                md:shrink
              "
            >
              <HomeProductCard p={product} />
            </div>
          ))}
        </div>

        {/* MOBILE VIEW ALL */}
        <div className="mt-4 sm:hidden">
          <Link
            to="/catalog"
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-border
              px-4
              py-2
              text-xs
              font-medium
              text-foreground
              transition-colors
              hover:bg-foreground
              hover:text-background
            "
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}