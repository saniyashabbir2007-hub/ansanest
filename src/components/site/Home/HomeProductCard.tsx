import { Link } from "@tanstack/react-router";
import { Star, Heart } from "lucide-react";
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
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Product Image */}
      <div className="relative aspect-[1.18/1] overflow-hidden">
        <img
          src={p.image_url}
          alt={p.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Wishlist */}
        <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm">
          <Heart className="h-4 w-4 text-foreground" />
        </div>
      </div>

      {/* Compact Content */}
      <div className="px-2.5 pb-3 pt-2">
        <h3 className="line-clamp-1 text-sm font-medium text-foreground">
          {p.name}
        </h3>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="h-3 w-3 fill-gold text-gold"
              />
            ))}
          </div>

          <span className="text-[11px] text-muted-foreground">
            4.8
          </span>
        </div>

        {/* Price */}
        <div className="mt-1.5 text-sm font-semibold text-emerald">
          {priceLabel}
        </div>
      </div>
    </Link>
  );
}