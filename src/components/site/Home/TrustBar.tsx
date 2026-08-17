import {
  Truck,
  ShieldCheck,
  Sofa,
  Headphones,
} from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Pan India Delivery",
    description: "Fast & Secure Shipping",
  },
  {
    icon: ShieldCheck,
    title: "Quality You Can Trust",
    description: "Premium Craftsmanship",
  },
  {
    icon: Sofa,
    title: "Designed for Maximum Comfort",
    description: "Built for Everyday Living",
  },
  {
    icon: Headphones,
    title: "Dedicated Customer Support",
    description: "We're Here to Help",
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="container-px mx-auto max-w-7xl py-10">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald/40 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald/10 text-emerald transition-all duration-300 group-hover:bg-emerald group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}