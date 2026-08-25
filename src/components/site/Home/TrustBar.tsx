import { Award, Palette, Truck, Wrench, Headphones, Sparkles } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Premium Quality",
    subtitle: "Finest materials & craftsmanship",
  },
  {
    icon: Palette,
    title: "Customizable",
    subtitle: "Personalize size, fabric & color",
  },
  {
    icon: Truck,
    title: "Pan India Delivery",
    subtitle: "Fast & secure shipping across India",
  },
  {
    icon: Wrench,
    title: "Old Sofa Repair Available",
    subtitle: "Expert restoration & reupholstery",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    subtitle: "We're here to help you always",
  },
  {
    icon: Sparkles,
    title: "Maximum Comfort",
    subtitle: "Built for everyday living",
  },
];

export function TrustBar() {
  return (
    <section className="container-px mx-auto max-w-7xl py-12 md:py-16">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-emerald font-semibold">
          Why Choose <span className="notranslate" translate="no">Ansa Nest</span>?
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="group flex flex-col items-center rounded-2xl border border-border/80 bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10 text-emerald transition-colors group-hover:bg-foreground group-hover:text-background">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {feature.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}