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
      const offset = direction === "left" ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className={`py-2 sm:py-3.5 ${muted ? "bg-muted/20" : ""}`}>
      <div className="container-px mx-auto max-w-7xl">
        <div className="mb-1.5 flex items-end justify-between sm:mb-2.5">
          <div>
            {eyebrow && (
              <span className="text-[8px] uppercase tracking-[0.2em] text-emerald font-semibold sm:text-[9px]">
                {eyebrow}
              </span>
            )}
            <h2 className="font-display text-sm font-semibold text-foreground sm:text-lg md:text-xl leading-tight">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <Link
              to="/catalog"
              className="hidden items-center gap-1 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous"
              className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border border-border bg-background shadow-2xs text-foreground transition-colors hover:bg-muted"
            >
              <ChevronLeft className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next"
              className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border border-border bg-background shadow-2xs text-foreground transition-colors hover:bg-muted"
            >
              <ChevronRight className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        {/* Compact Product Cards */}
        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((product) => (
            <div
              key={product.id}
              className="w-[44vw] max-w-[165px] flex-shrink-0 sm:w-44 sm:max-w-none md:w-52"
            >
              <ProductCard p={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}