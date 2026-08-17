import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Product } from "@/lib/products-api";
import { inr } from "@/lib/business";

interface Props {
  p: Product;
}

export function HomeProductCard({ p }: Props) {
  const priceLabel =
    p.price_on_request
      ? "Price on Request"
      : p.price != null
      ? inr(Number(p.price))
      : "—";

  return (
    <Link
      to="/product/$id"
      params={{ id: p.slug }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Product Image */}
      <div className="overflow-hidden">
        <img
          src={p.image_url}
          alt={p.name}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-4">

        <h3 className="line-clamp-2 font-medium text-base text-foreground">
          {p.name}
        </h3>

        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="h-3.5 w-3.5 fill-gold text-gold"
            />
          ))}

          <span className="ml-1 text-xs text-muted-foreground">
            4.8
          </span>
        </div>

        <div className="mt-3 text-lg font-semibold text-emerald">
          {priceLabel}
        </div>

        <div className="mt-4 text-sm font-medium text-emerald group-hover:underline">
          View Details →
        </div>

      </div>
    </Link>
  );
}