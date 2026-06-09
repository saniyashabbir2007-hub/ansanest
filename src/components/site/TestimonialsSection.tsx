import { useQuery } from "@tanstack/react-query";
import { Star, Quote } from "lucide-react";
import { listPublicReviews } from "@/lib/reviews-api";
import { useEffect, useState } from "react";

export function TestimonialsSection() {
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", "public"],
    queryFn: listPublicReviews,
  });

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  const active = reviews[index];

  return (
    <section className="bg-muted/40 py-20">
      <div className="container-px mx-auto max-w-5xl">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-emerald">Testimonials</div>
          <h2 className="mt-3 font-display text-4xl text-balance text-foreground md:text-5xl">
            Loved by families across India
          </h2>
        </div>

        <div className="relative mt-12">
          <article
            key={active.id}
            className="rounded-2xl border border-border bg-card p-8 shadow-soft md:p-12"
          >
            <Quote className="h-10 w-10 text-emerald/30" />
            <div className="mt-4 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < active.rating ? "fill-gold text-gold" : "text-gold/30"}`}
                />
              ))}
            </div>
            <p className="mt-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
              {active.review_text}
            </p>
            <div className="mt-8 flex items-center gap-4">
              {active.customer_photo_url ? (
                <img
                  src={active.customer_photo_url}
                  alt={active.customer_name}
                  className="h-12 w-12 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10 font-display text-lg text-emerald">
                  {active.customer_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-medium text-foreground">{active.customer_name}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {[active.customer_location, active.product_name].filter(Boolean).join(" · ") ||
                    "Verified customer"}
                </div>
              </div>
            </div>
          </article>

          {reviews.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Show review ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-8 bg-emerald" : "w-2 bg-emerald/30 hover:bg-emerald/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
