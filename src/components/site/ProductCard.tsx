import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { inr, waLink, productInquiry } from "@/lib/business";

export function ProductCard({ p }: { p: any }) {
  const priceLabel = p.price_on_request
    ? "Price on Request"
    : p.price != null
      ? inr(Number(p.price))
      : "—";

  const waMsg = productInquiry(p.name);
  const slug = p.slug || p.id;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Product Image */}
      <Link
        to="/product/$id"
        params={{ id: slug }}
        className="relative aspect-[4/3] overflow-hidden bg-muted"
      >
        {p.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-emerald/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            {p.badge}
          </span>
        )}
        <img
          src={p.image_url}
          alt={p.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {p.sub_type ?? p.category}
        </div>

        <Link
          to="/product/$id"
          params={{ id: slug }}
        >
          <h3 className="mt-1 font-display text-base font-medium text-foreground line-clamp-1 hover:text-emerald transition-colors">
            {p.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex">
            {[0, 1, 2, 3].map((i) => (
              <Star key={i} className="h-3 w-3 fill-gold text-gold" />
            ))}
            <Star className="h-3 w-3 text-gold/40" />
          </div>
          <span className="text-xs text-muted-foreground">4.0</span>
        </div>

        {/* Price */}
        <div className="mt-2 text-lg font-bold text-foreground">
          {priceLabel}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 pt-1">
          <Link
            to="/product/$id"
            params={{ id: slug }}
            className="flex-1 rounded-lg bg-foreground py-2 text-center text-xs font-semibold text-background transition hover:bg-foreground/90"
          >
            View Details
          </Link>
          <a
            href={waLink(waMsg)}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            Enquire
          </a>
        </div>
      </div>
    </div>
  );
}