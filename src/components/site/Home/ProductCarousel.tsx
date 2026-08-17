import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";

import { Product } from "@/lib/products-api";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";
import { HomeProductCard } from "./HomeProductCard";

interface ProductCarouselProps {
  eyebrow?: string;
  title: string;
  description?: string;
  products: Product[];
  viewAllHref?: string;
}

export function ProductCarousel({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
}: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  if (!products.length) return null;

  return (
    <section className="py-8 md:py-10">
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollPrev}
                className="h-8 w-8 rounded-full border"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={scrollNext}
                className="h-8 w-8 rounded-full border"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {viewAllHref && (
                <Button
                  asChild
                  variant="ghost"
                  className="text-sm font-medium"
                >
                  <Link to={viewAllHref}>
                    View all →
                  </Link>
                </Button>
              )}
            </div>
          }
        />

        <div
          className="overflow-hidden"
          ref={emblaRef}
        >
          <div className="flex gap-4 md:gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="
                  min-w-[170px]
                  max-w-[170px]
                  flex-none
                  sm:min-w-[190px]
                  sm:max-w-[190px]
                  md:min-w-[210px]
                  md:max-w-[210px]
                  lg:min-w-[220px]
                  lg:max-w-[220px]
                "
              >
                <HomeProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}