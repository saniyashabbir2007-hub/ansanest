import { Link } from "@tanstack/react-router";

const collections = [
  {
    title: "Luxury Sofas",
    description: "Elegant sofas crafted for modern living.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900",
    href: "/catalog",
  },
  {
    title: "Upholstered Beds",
    description: "Premium beds designed for exceptional comfort.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900",
    href: "/catalog",
  },
  {
    title: "Custom Upholstery",
    description: "Tailored furniture crafted to your vision.",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900",
    href: "/contact",
  },
];

export default function FeaturedCollections() {
  return (
    <section className="py-20">
      <div className="container-px mx-auto max-w-7xl">

        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald">
            Collections
          </div>

          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Explore Our Collections
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {collections.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-[4/5]">

                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute bottom-0 p-8 text-white">

                  <h3 className="font-display text-3xl">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm opacity-90">
                    {item.description}
                  </p>

                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}