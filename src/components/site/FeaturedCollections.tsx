import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/products-api";

// TESTING: 10 seconds.
// After confirming rotation works, change this to 60_000.
const COLLECTION_ROTATION_MS = 10_000;

type CollectionType = "sofas" | "beds" | "custom";

type Collection = {
  title: string;
  description: string;
  href: string;
  type: CollectionType;
};

type ProductImage = {
  id: string;
  name: string;
  image: string;
};

const collections: Collection[] = [
  {
    title: "Sofas & Sectionals",
    description: "L-shape, U-shape, modular, curved.",
    href: "/catalog",
    type: "sofas",
  },
  {
    title: "Upholstered Beds",
    description: "Wingback, platform, tufted classics.",
    href: "/catalog",
    type: "beds",
  },
  {
    title: "Custom Upholstery",
    description: "Built to your space. Made around your vision.",
    href: "/contact",
    type: "custom",
  },
];

function normalize(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function matchesCollection(
  product: any,
  type: CollectionType
): boolean {
  const category = normalize(product.category);
  const subType = normalize(product.sub_type);

  const combined = `${category} ${subType}`;

  if (type === "sofas") {
    return (
      combined.includes("sofa") ||
      combined.includes("sectional") ||
      combined.includes("l-shape") ||
      combined.includes("u-shape") ||
      combined.includes("modular")
    );
  }

  if (type === "beds") {
    return combined.includes("bed");
  }

  if (type === "custom") {
    return product.customizable === true;
  }

  return false;
}

function buildImagePool(
  products: any[],
  type: CollectionType
): ProductImage[] {
  const matchingProducts = products.filter((product) =>
    matchesCollection(product, type)
  );

  const imagePool: ProductImage[] = [];

  for (const product of matchingProducts) {
    // Main product image
    if (product.image_url) {
      imagePool.push({
        id: `${product.id}-main`,
        name: product.name,
        image: product.image_url,
      });
    }

    // Product gallery images
    if (Array.isArray(product.gallery_urls)) {
      product.gallery_urls.forEach(
        (imageUrl: string, index: number) => {
          if (!imageUrl) return;

          imagePool.push({
            id: `${product.id}-gallery-${index}`,
            name: product.name,
            image: imageUrl,
          });
        }
      );
    }
  }

  // Remove duplicate image URLs
  const uniqueImages = Array.from(
    new Map(
      imagePool.map((item) => [item.image, item])
    ).values()
  );

  return uniqueImages;
}

function RotatingCollectionImage({
  images,
  title,
}: {
  images: ProductImage[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        return (current + 1) % images.length;
      });
    }, COLLECTION_ROTATION_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <span className="px-6 text-center font-display text-xl text-muted-foreground">
          {title}
        </span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {images.map((image, index) => (
        <img
          key={image.id}
          src={image.image}
          alt={image.name}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ${
            index === activeIndex
              ? "opacity-100"
              : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}

export default function FeaturedCollections() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const collectionImages = useMemo(() => {
    return {
      sofas: buildImagePool(products, "sofas"),
      beds: buildImagePool(products, "beds"),
      custom: buildImagePool(products, "custom"),
    };
  }, [products]);

  return (
    <section className="py-16 md:py-20">
      <div className="container-px mx-auto max-w-7xl">

        {/* HEADING */}
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald">
            Collections
          </div>

          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Designed for every room of the home
          </h2>
        </div>

        {/* COLLECTION CARDS */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {collections.map((collection) => {
            const images =
              collectionImages[collection.type];

            return (
              <Link
                key={collection.title}
                to={collection.href}
                className="group overflow-hidden rounded-3xl"
              >
                <div className="relative aspect-[4/5] overflow-hidden">

                  {/* ROTATING PRODUCT IMAGES */}
                  <RotatingCollectionImage
                    images={images}
                    title={collection.title}
                  />

                  {/* DARK GRADIENT */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                  {/* CONTENT */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-7">

                    <div className="text-[10px] uppercase tracking-[0.25em] text-gold">
                      Collection
                    </div>

                    <h3 className="mt-1 font-display text-2xl md:text-3xl">
                      {collection.title}
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85">
                      {collection.description}
                    </p>
                  </div>

                  {/* HOVER */}
                  <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.03]" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}