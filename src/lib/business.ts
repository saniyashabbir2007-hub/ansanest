// Replace these placeholders with the actual business details.
export const BUSINESS = {
  name: "Royal Upholstery House",
  tagline: "Crafted Comfort. Timeless Elegance.",
  owner: "[Owner Name]",
  phone: "+91 98765 43210",
  phoneRaw: "+919876543210",
  whatsapp: "919876543210", // country code + number, no +
  email: "sales@royalupholstery.in",
  address: "Plot 42, Furniture Market Road, New Delhi, India 110001",
  hours: "Mon – Sat: 10:00 AM – 8:00 PM · Sunday: 11:00 AM – 6:00 PM",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.0123!2d77.2090!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2zMjjCsDM2JzUwLjAiTiA3N8KwMTInMzIuNCJF!5e0!3m2!1sen!2sin!4v1700000000000",
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
  },
} as const;

export const waLink = (msg: string) =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(msg)}`;

export const defaultInquiry =
  "Hello, I am interested in this product. Please provide more details.";

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
