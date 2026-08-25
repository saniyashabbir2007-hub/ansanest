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
      const offset = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className={`py-2 sm:py-4 md:py-6 ${muted ? "bg-muted/30" : ""}`}>
      <div className="container-px mx-auto max-w-7xl">
        <div className="mb-2 flex items-end justify-between sm:mb-3">
          <div>
            {eyebrow && (
              <span className="text-[8px] uppercase tracking-[0.2em] text-emerald font-semibold sm:text-[9.5px]">
                {eyebrow}
              </span>
            )}
            <h2 className="mt-0.5 font-display text-base font-semibold text-foreground sm:text-xl md:text-2xl leading-tight">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/catalog"
              className="hidden items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous"
              className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-border bg-background shadow-xs text-foreground transition-colors hover:bg-muted"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next"
              className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-border bg-background shadow-xs text-foreground transition-colors hover:bg-muted"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Carousel Cards (Compact peek view) */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-1 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((product) => (
            <div
              key={product.id}
              className="w-[52vw] max-w-[190px] flex-shrink-0 sm:w-48 sm:max-w-none md:w-56"
            >
              <ProductCard p={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}