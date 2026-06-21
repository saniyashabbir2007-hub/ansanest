import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Product } from "@/lib/products-api";
import { inr, waLink, productInquiry } from "@/lib/business";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function ProductCard({ p }: { p: Product }) {
  const priceLabel = p.price_on_request
    ? "Price on Request"
    : p.price != null
      ? inr(Number(p.price))
      : "—";

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-luxury">
      <Link
        to="/product/$id"
        params={{ id: p.slug }}
        className="block overflow-hidden"
      >
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {p.image_url && (
            <img
              src={p.image_url}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
        </div>
      </Link>

      <div className="p-5">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {p.sub_type ?? p.category}
        </div>

        <h3 className="mt-1 font-display text-xl text-foreground">
          {p.name}
        </h3>

        <div className="mt-1 flex items-center gap-2">
          <div className="flex">
            {[0, 1, 2, 3].map((i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5 fill-gold text-gold"
              />
            ))}
            <Star className="h-3.5 w-3.5 text-gold/40" />
          </div>
          <span className="text-xs text-muted-foreground">4.0</span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {p.short_description}
        </p>

        {p.dimensions && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Size:</span> {p.dimensions}
          </div>
        )}

        <div className="mt-4 text-lg font-semibold text-emerald">
          {priceLabel}
        </div>

        <div className="mt-5 flex gap-2">
          <Link
            to="/product/$id"
            params={{ id: p.slug }}
            className="flex-1 rounded-md bg-foreground px-3 py-2.5 text-center text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            View Details
          </Link>

          <a
            href={waLink(productInquiry(p.name))}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2.5 text-xs font-medium text-white hover:opacity-90"
            aria-label={`WhatsApp enquiry about ${p.name}`}
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            Enquire
          </a>
        </div>
      </div>
    </article>
  );
}