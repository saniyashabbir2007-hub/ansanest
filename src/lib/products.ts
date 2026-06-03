import hero from "@/assets/hero-sofa.jpg";
import sectional from "@/assets/sectional.jpg";
import bed from "@/assets/bed.jpg";
import sofa1 from "@/assets/sofa-1.jpg";
import sofa2 from "@/assets/sofa-2.jpg";
import sofa3 from "@/assets/sofa-3.jpg";
import sofa4 from "@/assets/sofa-4.jpg";
import bed2 from "@/assets/bed-2.jpg";
import bed3 from "@/assets/bed-3.jpg";
import custom from "@/assets/custom.jpg";

export type Category = "Sofa" | "Sectional Sofa" | "Upholstered Bed" | "Custom Upholstery";

export interface Product {
  id: string;
  name: string;
  category: Category;
  subType?: string;
  price: number | "request";
  image: string;
  gallery: string[];
  short: string;
  description: string;
  features: string[];
  material: string;
  dimensions: string;
  availability: "In Stock" | "Made to Order" | "Limited Stock";
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: "emerald-velvet-sectional",
    name: "Emerald Heritage U-Sectional",
    category: "Sectional Sofa",
    subType: "U-Shaped Sectional Sofas",
    price: 285000,
    image: hero,
    gallery: [hero, sofa2, sectional],
    short: "Statement U-shaped velvet sectional with brushed brass detailing.",
    description:
      "The Emerald Heritage U-Sectional is the centerpiece your living room deserves. Hand-tailored in premium Italian-inspired velvet over a kiln-dried hardwood frame, every seam is double-stitched by master craftsmen with an unwavering dedication to quality and precision. The high-density CMHR foam cushions retain their shape for years, while pocket-spring seating delivers cloud-soft comfort with deep support. Brushed brass legs and subtle nailhead trim lend a regal finish without ever feeling ornate. Generous proportions comfortably seat seven, making it ideal for joint families, entertaining guests, or unwinding after a long day. Made to order in your choice of fabric, configuration and dimensions, this sectional is built to anchor your home for a lifetime.",
    features: ["U-Shape Configuration", "Pocket Spring Seating", "Brushed Brass Legs", "Double-Stitched Seams", "Removable Cushion Covers"],
    material: "Italian Velvet · Kiln-dried Sheesham Frame · High-Density CMHR Foam",
    dimensions: '124"W × 95"D × 33"H',
    availability: "Made to Order",
    featured: true,
  },
  {
    id: "ivory-curve-sofa",
    name: "Ivory Crescent Curved Sofa",
    category: "Sectional Sofa",
    subType: "Curved Sectional Sofas",
    price: 165000,
    image: sofa1,
    gallery: [sofa1, sectional],
    short: "Sculptural curved silhouette in soft boucle ivory.",
    description:
      "The Ivory Crescent breaks the rules with its sweeping curved form — a sculptural conversation piece that wraps gently around the room. Upholstered in heavyweight Italian boucle and supported by an engineered hardwood frame, the silhouette stays crisp through years of daily use. Deep, feather-blend back cushions invite long evenings of conversation, while the low profile keeps sightlines open in modern apartments. A truly contemporary statement, made to last.",
    features: ["Curved Silhouette", "Feather-Blend Back Cushions", "Stain-Resistant Boucle", "Modular Configuration"],
    material: "Italian Boucle · Engineered Hardwood · Feather-Down Blend Fill",
    dimensions: '118"W × 64"D × 30"H',
    availability: "In Stock",
    featured: true,
  },
  {
    id: "charcoal-luxury-sectional",
    name: "Noir Tufted Luxury Sectional",
    category: "Sectional Sofa",
    subType: "Luxury Sectional Sofas",
    price: 325000,
    image: sofa2,
    gallery: [sofa2, hero],
    short: "Chesterfield-inspired tufted sectional in charcoal velvet.",
    description:
      "Noir Tufted is our flagship luxury sectional — a Chesterfield-inspired piece reimagined for the modern Indian home. Deep button-tufting, antique brass nailhead trim and gold-tipped solid wood legs combine for a silhouette that feels both classical and confidently contemporary. Built from kiln-dried hardwood and dressed in heavyweight cotton velvet, it earns its place in the most considered drawing rooms.",
    features: ["Hand Button-Tufting", "Antique Brass Nailheads", "Gold-Tipped Legs", "Heavyweight Cotton Velvet"],
    material: "Cotton Velvet · Kiln-dried Hardwood · Brass Hardware",
    dimensions: '132"W × 92"D × 34"H',
    availability: "Made to Order",
    featured: true,
  },
  {
    id: "cognac-chesterfield",
    name: "Cognac Heritage Chesterfield",
    category: "Sofa",
    price: 145000,
    image: sofa3,
    gallery: [sofa3],
    short: "Classic three-seater Chesterfield in full-grain cognac leather.",
    description:
      "Our Cognac Heritage Chesterfield is the timeless three-seater every refined home should own. Wrapped in full-grain Italian leather that develops a richer patina with every passing year, the diamond-tufted back and scroll arms are hand-formed and hand-stitched in our Delhi workshop. Solid teak bun feet and double-row nailhead trim complete a piece that quietly tells visitors everything about your taste.",
    features: ["Diamond Button Tufting", "Full-Grain Leather", "Scroll Arms", "Solid Teak Feet"],
    material: "Full-Grain Italian Leather · Solid Teak Frame",
    dimensions: '88"W × 38"D × 30"H',
    availability: "In Stock",
    featured: true,
  },
  {
    id: "linen-modular-sofa",
    name: "Sandstone Modular L-Sectional",
    category: "Sectional Sofa",
    subType: "L-Shaped Sectional Sofas",
    price: 98000,
    image: sofa4,
    gallery: [sofa4],
    short: "Reconfigurable L-shape in stain-resistant sandstone linen.",
    description:
      "The Sandstone Modular L-Sectional is built for real life. Each module locks securely yet can be rearranged in minutes, so your sofa grows with your home. Performance linen resists everyday spills, pet hair brushes away, and removable covers can be unzipped and dry-cleaned. Deep seats, supportive back cushions and a quiet, neutral palette make it as easy to live with as it is to love.",
    features: ["Reconfigurable Modules", "Stain-Resistant Performance Linen", "Removable Covers", "Deep Seat Depth"],
    material: "Performance Linen Blend · Hardwood Frame · CMHR Foam",
    dimensions: '108"W × 68"D × 32"H',
    availability: "In Stock",
  },
  {
    id: "teal-wingback-bed",
    name: "Regal Teal Wingback Bed",
    category: "Upholstered Bed",
    price: 92000,
    image: bed,
    gallery: [bed, bed2],
    short: "Tall tufted wingback bed in deep teal velvet.",
    description:
      "The Regal Teal Wingback Bed transforms your bedroom into a private suite. Towering 60-inch wings cocoon the headboard, hand button-tufted across deep teal velvet and finished with delicate antique brass nailhead detailing. The platform base needs no box spring — just a mattress — and reinforced solid wood slats provide quiet, lifelong support. Available in Queen and King.",
    features: ["60in Wingback Headboard", "Hand Button-Tufting", "Solid Wood Slats", "No Box Spring Required"],
    material: "Cotton Velvet · Solid Sheesham · Antique Brass",
    dimensions: 'King: 84"W × 88"D × 60"H',
    availability: "Made to Order",
    featured: true,
  },
  {
    id: "blush-platform-bed",
    name: "Blush Couture Platform Bed",
    category: "Upholstered Bed",
    price: 68000,
    image: bed2,
    gallery: [bed2],
    short: "Romantic wingback bed in soft blush velvet.",
    description:
      "Romance, restraint and a whisper of glamour. The Blush Couture Platform Bed pairs a softly curved wingback headboard with hand-applied antique nail trim, raised on slim solid wood legs that keep the silhouette light. Upholstered in our signature dust-blush velvet, the cushion is hand-tufted for that soft, slightly imperfect, made-by-hand feel.",
    features: ["Curved Wingback", "Hand-Applied Nailheads", "Solid Wood Legs", "Hand Tufting"],
    material: "Performance Velvet · Solid Wood Frame",
    dimensions: 'Queen: 72"W × 84"D × 56"H',
    availability: "In Stock",
  },
  {
    id: "taupe-low-bed",
    name: "Taupe Minimal Low Bed",
    category: "Upholstered Bed",
    price: 42000,
    image: bed3,
    gallery: [bed3],
    short: "Low-profile platform bed in warm taupe linen.",
    description:
      "A study in quiet luxury. The Taupe Minimal Low Bed strips back the silhouette to its essentials — a low, gently tufted headboard, clean platform base and slim tapered feet, all wrapped in warm taupe performance linen. Perfectly proportioned for compact bedrooms and minimalist interiors.",
    features: ["Low Profile", "Subtle Tufting", "Tapered Feet", "Performance Linen"],
    material: "Performance Linen · Engineered Hardwood",
    dimensions: 'King: 80"W × 86"D × 44"H',
    availability: "In Stock",
  },
  {
    id: "custom-upholstery",
    name: "Bespoke Custom Upholstery",
    category: "Custom Upholstery",
    price: "request",
    image: custom,
    gallery: [custom],
    short: "Fully bespoke sofas, beds and seating to your specification.",
    description:
      "Have a vision? We build to it. Our bespoke upholstery service covers everything from one-off sofas and beds to entire suites and commercial installations — hotels, restaurants, lounges and offices. Choose your silhouette, fabric, frame timber, foam density, leg style and finish. Our master craftsmen translate your sketches, references or Pinterest boards into a finished piece, delivered and installed across India. Site visits and 3D mockups available on request.",
    features: ["Any Silhouette", "1000+ Fabric Options", "Bulk & Hospitality Orders", "Free Site Consultation", "3D Mockups"],
    material: "Your choice of premium fabrics, leathers, timbers and finishes",
    dimensions: "Built to your exact specification",
    availability: "Made to Order",
    featured: true,
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
