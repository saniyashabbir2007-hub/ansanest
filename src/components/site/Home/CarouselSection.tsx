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
  muted,
}: CarouselSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className={muted ? "bg-muted/40 py-10" : "py-10"}>
      <div className="container-px mx-auto max-w-7xl">
        <SectionHead eyebrow={eyebrow} title={title} />

        <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((p) => (
            <HomeProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}