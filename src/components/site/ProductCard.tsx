import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Product } from "@/lib/products-api";

function formatRupeePrice(price?: number | string | null): string {
  if (price === undefined || price === null || price === "") return "₹0";
  const num = typeof price === "string" ? Number(price) : price;
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
}

export function ProductCard({ p }: { p: Product }) {
  const targetUrl = p.id ? `/catalog/${p.id}` : "/catalog";

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-all duration-300 hover:shadow-xs">
      {/* Compact Image */}
      <Link to={targetUrl} className="relative block aspect-[16/11] overflow-hidden bg-muted">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
            No Image
          </div>
        )}
      </Link>

      {/* Compact Details */}
      <div className="flex flex-1 flex-col p-2">
        <span className="truncate text-[8px] uppercase tracking-wider text-muted-foreground">
          {p.category || "Furniture"}
        </span>

        <h3 className="mt-0.5 line-clamp-1 font-display text-[11px] sm:text-xs font-semibold text-foreground">
          {p.name}
        </h3>

        <div className="mt-0.5 flex items-center gap-1 text-[9px] text-amber-500">
          <Star className="h-2 w-2 fill-current" />
          <span className="font-medium text-muted-foreground">4.8</span>
        </div>

        <div className="mt-1 font-sans text-xs font-bold text-foreground">
          {formatRupeePrice(p.price)}
        </div>

        {/* Action Button */}
        <div className="mt-1.5 pt-1 border-t border-border/40">
          <Link
            to={targetUrl}
            className="flex w-full items-center justify-center rounded-md bg-foreground py-1 text-[10px] sm:text-[11px] font-medium text-background transition-opacity hover:opacity-90"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}