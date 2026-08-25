import { Link } from "@tanstack/react-router";
import { MessageCircle, Star } from "lucide-react";
import type { Product } from "@/lib/products-api";
import { BUSINESS } from "@/lib/business";

function formatRupeePrice(price?: number | string | null): string {
  if (price === undefined || price === null || price === "") return "₹0";
  const num = typeof price === "string" ? Number(price) : price;
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
}

export function ProductCard({ p }: { p: Product }) {
  const whatsappMessage = encodeURIComponent(
    `Hi Ansa Nest! I'm interested in the ${p.name} (${formatRupeePrice(p.price)}). Could you share more details?`
  );
  const whatsappUrl = `https://wa.me/${BUSINESS.phoneRaw}?text=${whatsappMessage}`;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-300 hover:shadow-md">
      {/* Product Image */}
      <Link to="/catalog" className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-2 sm:p-2.5">
        <span className="truncate text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-muted-foreground">
          {p.category || "Furniture"}
        </span>

        <h3 className="mt-0.5 line-clamp-1 font-display text-xs sm:text-sm font-semibold text-foreground">
          {p.name}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-500">
          <Star className="h-2.5 w-2.5 fill-current" />
          <span className="font-medium text-muted-foreground">4.8</span>
        </div>

        <div className="mt-1 font-sans text-xs sm:text-sm font-bold text-foreground">
          {formatRupeePrice(p.price)}
        </div>

        {/* Action Buttons */}
        <div className="mt-2 grid grid-cols-2 gap-1.5 pt-1 border-t border-border/40">
          <Link
            to="/catalog"
            className="flex items-center justify-center rounded-lg bg-muted px-1.5 py-1 text-[10px] sm:text-[11px] font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            View
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-center gap-1 rounded-lg bg-emerald px-1.5 py-1 text-[10px] sm:text-[11px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-2.5 w-2.5" /> Enquire
          </a>
        </div>
      </div>
    </div>
  );
}