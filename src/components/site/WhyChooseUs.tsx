import {
  ShieldCheck,
  Sofa,
  Truck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Sofa,
    title: "Premium Craftsmanship",
    description:
      "Expertly handcrafted furniture designed with attention to every detail.",
  },
  {
    icon: Sparkles,
    title: "Custom Upholstery",
    description:
      "Choose fabrics, colors, finishes, and sizes tailored to your home.",
  },
  {
    icon: Truck,
    title: "Safe Pan India Delivery",
    description:
      "Reliable delivery with careful handling to ensure your furniture arrives safely.",
  },
  {
    icon: ShieldCheck,
    title: "Quality You Can Trust",
    description:
      "Built using premium materials for durability, comfort, and timeless elegance.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="container-px mx-auto max-w-7xl">

        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald">
            WHY ANSA NEST
          </div>

          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Crafted for Comfort.
            <br />
            Designed for Life.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Every piece combines premium materials, thoughtful craftsmanship,
            and timeless design to create furniture that truly feels like home.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {features.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-border bg-background p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10">
                  <Icon className="h-7 w-7 text-emerald" />
                </div>

                <h3 className="mt-6 font-display text-2xl">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-muted-foreground">
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