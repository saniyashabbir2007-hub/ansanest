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
      <div className="container-px mx-auto max-w-7xl py-5 sm:py-7 lg:py-10">

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-5">

          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  group
                  rounded-xl
                  border
                  border-border
                  bg-background
                  p-3

                  sm:rounded-2xl
                  sm:p-4

                  lg:p-6
                "
              >
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-emerald/10
                    text-emerald

                    sm:h-9
                    sm:w-9

                    lg:h-14
                    lg:w-14
                  "
                >
                  <Icon
                    className="
                      h-4
                      w-4

                      sm:h-5
                      sm:w-5

                      lg:h-7
                      lg:w-7
                    "
                  />
                </div>

                <h3
                  className="
                    mt-2
                    text-[11px]
                    font-semibold
                    leading-snug
                    text-foreground

                    sm:mt-3
                    sm:text-sm

                    lg:mt-5
                    lg:text-base
                  "
                >
                  {item.title}
                </h3>

                <p
                  className="
                    mt-1
                    text-[9px]
                    leading-relaxed
                    text-muted-foreground

                    sm:text-xs

                    lg:mt-2
                    lg:text-sm
                  "
                >
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