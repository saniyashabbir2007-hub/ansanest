import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import type { Product } from "@/lib/products-api";

interface CarouselSectionProps {
  eyebrow?: string;
  title: string;
  items: Product[];
  muted?: boolean;
}

export function CarouselSection({ eyebrow, title, items, muted }: CarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className={`py-4 sm:py-6 md:py-8 ${muted ? "bg-muted/30" : ""}`}>
      <div className="container-px mx-auto max-w-7xl">
        <div className="mb-3 flex items-end justify-between sm:mb-4">
          <div>
            {eyebrow && (
              <span className="text-[9px] uppercase tracking-[0.2em] text-emerald font-semibold sm:text-[10px]">
                {eyebrow}
              </span>
            )}
            <h2 className="mt-0.5 font-display text-lg sm:text-2xl md:text-3xl text-foreground font-semibold leading-tight">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/catalog"
              className="hidden items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous"
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-border bg-background shadow-xs text-foreground transition-colors hover:bg-muted"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next"
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-border bg-background shadow-xs text-foreground transition-colors hover:bg-muted"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel: Mobile peeks next card at ~58vw */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((product) => (
            <div
              key={product.id}
              className="w-[58vw] max-w-[210px] flex-shrink-0 sm:w-56 sm:max-w-none md:w-64"
            >
              <ProductCard p={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}