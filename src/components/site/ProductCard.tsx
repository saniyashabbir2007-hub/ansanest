import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Product } from "@/lib/products-api";
import { inr, waLink, productInquiry } from "@/lib/business";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function ProductCard({ p }: { p: Product }) {
  const colors = p.colors ?? [];
  const [selectedColor, setSelectedColor] = useState(0);
  const selected = colors[selectedColor];
  const imageSrc = selected?.imageUrl || p.image_url;

  const priceLabel = p.price_on_request
    ? "Price on Request"
    : p.price != null
      ? inr(Number(p.price))
      : "—";

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-card
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-emerald/40
        hover:shadow-lg

        sm:rounded-2xl
        sm:hover:-translate-y-2
        sm:hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]
      "
    >
      {/* =========================================================
          PRODUCT IMAGE
      ========================================================= */}

      <Link
        to="/product/$id"
        params={{ id: p.slug }}
        className="block overflow-hidden"
      >
        <div
          className="
            relative
            aspect-[16/9]
            overflow-hidden
            bg-muted

            sm:aspect-[4/3]
            sm:rounded-t-2xl
          "
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={p.name}
              loading="lazy"
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />
          )}

          {/* Premium Badge */}
          <div
            className="
              absolute
              left-2
              top-2
              rounded-full
              bg-emerald
              px-2
              py-1
              text-[8px]
              font-semibold
              uppercase
              tracking-wider
              text-white
              shadow-md

              sm:left-4
              sm:top-4
              sm:px-3
              sm:text-[10px]
            "
          >
            Premium
          </div>
        </div>
      </Link>

      {/* =========================================================
          PRODUCT CONTENT
      ========================================================= */}

      <div
        className="
          p-2.5

          sm:p-5
        "
      >
        {/* Category / Sub-type */}
        <div
          className="
            truncate
            text-[8px]
            uppercase
            tracking-[0.16em]
            text-muted-foreground

            sm:text-[11px]
            sm:tracking-[0.2em]
          "
        >
          {p.sub_type ?? p.category}
        </div>

        {/* Product Name */}
        <h3
          className="
            mt-1
            line-clamp-1
            font-display
            text-sm
            font-semibold
            leading-tight
            text-foreground

            sm:mt-2
            sm:line-clamp-2
            sm:text-lg
            md:text-xl
          "
        >
          {p.name}
        </h3>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1 sm:mt-1 sm:gap-2">
          <div className="flex">
            {[0, 1, 2, 3].map((i) => (
              <Star
                key={i}
                className="
                  h-3
                  w-3
                  fill-gold
                  text-gold

                  sm:h-3.5
                  sm:w-3.5
                "
              />
            ))}

            <Star
              className="
                h-3
                w-3
                text-gold/40

                sm:h-3.5
                sm:w-3.5
              "
            />
          </div>

          <span className="text-[9px] text-muted-foreground sm:text-xs">
            4.0
          </span>
        </div>

        {/* =======================================================
            DESKTOP DETAILS
            Hidden on mobile to keep catalog compact.
        ======================================================= */}

        <p
          className="
            mt-3
            hidden
            line-clamp-2
            text-sm
            text-muted-foreground

            sm:block
          "
        >
          {p.short_description}
        </p>

        <div
          className="
            mt-3
            hidden
            space-y-1
            text-xs
            text-muted-foreground

            sm:block
          "
        >
          {p.material && (
            <div>
              🌳{" "}
              <span className="font-medium">
                Material:
              </span>{" "}
              {p.material}
            </div>
          )}

          {p.dimensions && (
            <div>
              📐{" "}
              <span className="font-medium">
                Size:
              </span>{" "}
              {p.dimensions}
            </div>
          )}

          {p.delivery_time && (
            <div>
              🚚{" "}
              <span className="font-medium">
                Delivery:
              </span>{" "}
              {p.delivery_time}
            </div>
          )}
        </div>

        {/* Price */}
        <div
          className="
            mt-1.5
            text-base
            font-bold
            tracking-tight
            text-emerald

            sm:mt-5
            sm:text-2xl
          "
        >
          {priceLabel}
        </div>

        {colors.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
            {colors.map((color, index) => (
              <button
                key={`${color.colorName}-${index}`}
                type="button"
                title={color.colorName || `Color ${index + 1}`}
                aria-label={`Select ${color.colorName || `color ${index + 1}`}`}
                aria-pressed={selectedColor === index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(index);
                }}
                className={`h-4 w-4 shrink-0 rounded-full border shadow-sm sm:h-5 sm:w-5 ${
                  selectedColor === index
                    ? "ring-2 ring-emerald ring-offset-1"
                    : "border-border hover:ring-1 hover:ring-emerald/50"
                }`}
                style={{
                  backgroundColor: color.colorCode || "#d4d4d4",
                }}
              />
            ))}
          </div>
        )}

        {/* =======================================================
            ACTIONS
        ======================================================= */}

        <div
          className="
            mt-2
            flex
            gap-1.5

            sm:mt-5
            sm:gap-2
          "
        >
          <Link
            to="/product/$id"
            params={{ id: p.slug }}
            className="
              flex-1
              rounded-lg
              bg-foreground
              px-2
              py-2
              text-center
              text-[10px]
              font-medium
              text-background
              transition-opacity
              hover:opacity-90

              sm:rounded-xl
              sm:px-3
              sm:py-2.5
              sm:text-xs
            "
          >
            View Details
          </Link>

          <a
            href={waLink(productInquiry(p.name))}
            target="_blank"
            rel="noreferrer noopener"
            className="
              flex
              items-center
              justify-center
              gap-1
              rounded-lg
              bg-[#25D366]
              px-2
              py-2
              text-[10px]
              font-medium
              text-white
              hover:opacity-90

              sm:rounded-xl
              sm:gap-1.5
              sm:px-3
              sm:py-2.5
              sm:text-xs
            "
            aria-label={`WhatsApp enquiry about ${p.name}`}
          >
            <WhatsAppIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Enquire
          </a>
        </div>
      </div>
    </article>
  );
}