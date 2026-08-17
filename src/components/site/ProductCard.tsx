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
<article className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:-translate-y-2 hover:border-emerald/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <Link
        to="/product/$id"
        params={{ id: p.slug }}
        className="block overflow-hidden"
      >
<div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-muted">
          {p.image_url && (
            <img
              src={p.image_url}
              alt={p.name}
              loading="lazy"
className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
            />
            
          )}
          <div className="absolute left-4 top-4 rounded-full bg-emerald px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
  Premium
</div>
        </div>
      </Link>

      <div className="p-5">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {p.sub_type ?? p.category}
        </div>

<h3 className="mt-2 line-clamp-2 font-display text-lg md:text-xl font-semibold text-foreground">
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

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">

  {p.material && (
    <div>
      🌳 <span className="font-medium">Material:</span> {p.material}
    </div>
  )}

  {p.dimensions && (
    <div>
      📐 <span className="font-medium">Size:</span> {p.dimensions}
    </div>
  )}

  {p.delivery_time && (
    <div>
      🚚 <span className="font-medium">Delivery:</span> {p.delivery_time}
    </div>
  )}

</div>
<div className="mt-5 text-2xl font-bold tracking-tight text-emerald">
              {priceLabel}
        </div>

        <div className="mt-5 flex gap-2">
          <Link
            to="/product/$id"
            params={{ id: p.slug }}
            className="flex-1 rounded-xl bg-foreground px-3 py-2.5 text-center text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            View Details
          </Link>

          <a
            href={waLink(productInquiry(p.name))}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-medium text-white hover:opacity-90"
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