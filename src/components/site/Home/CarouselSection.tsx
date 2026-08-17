import { Product } from "@/lib/products-api";
import SectionHead from "@/components/site/SectionHead";
import { HomeProductCard } from "@/components/site/Home/HomeProductCard";

interface CarouselSectionProps {
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
}: CarouselSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={
        muted
          ? "bg-muted/40 py-8 sm:py-10"
          : "py-8 sm:py-10"
      }
    >
      <div className="container-px mx-auto max-w-7xl">
        <SectionHead eyebrow={eyebrow} title={title} />

        {/* Mobile = compact horizontal scroll
            Desktop = normal grid */}
        <div
          className="
            mt-5
            flex
            gap-2.5
            overflow-x-auto
            overflow-y-hidden
            pb-2
            snap-x
            snap-mandatory
            scrollbar-hide

            sm:mt-6
            sm:gap-3

            md:grid
            md:grid-cols-3
            md:gap-4
            md:overflow-visible
            md:pb-0
            md:snap-none

            lg:grid-cols-4
            xl:grid-cols-5
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

        {/* Small mobile scroll hint */}
        <div className="mt-2 text-[9px] text-muted-foreground sm:hidden">
          Swipe to explore →
        </div>
      </div>
    </section>
  );
}