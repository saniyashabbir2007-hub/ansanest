import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";

import { Product } from "@/lib/products-api";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";

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
    <section className="py-16">
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {viewAllHref && (
                <Button asChild>
                  <Link to={viewAllHref}>
                    View All
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
          <div className="flex gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-[310px] max-w-[310px] flex-none"
              >
<ProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}