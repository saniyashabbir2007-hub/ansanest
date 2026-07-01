export const BUSINESS = {
  name: "Ansa Nest",
  tagline: "Crafted for Comfort",
  owner: "[Owner Name]",
  phone: "+91 9838992444",
  phoneRaw: "919838992444",
  whatsapp: "919651886293", // country code + number, no +
  email: "contact.ansanest@gmail.com",
  address: "Oshiwara, Jogeshwari, Maharashtra, India 400102",
  hours: "Mon – Sat: 10:00 AM – 8:00 PM · Sunday: 11:00 AM – 6:00 PM",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15087.1!2d72.84!3d19.14!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA4JzI0LjAiTiA3MsKwNTAnMjQuMCJF!5e0!3m2!1sen!2sin!4v1700000000000",
  social: {
    instagram: "https://instagram.com/_ansanest_",
    instagramHandle: "_ansanest_",  },
} as const;

export const waLink = (msg: string) =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(msg)}`;

export const generalInquiry =
  `Hello ${BUSINESS.name},\n\nI would like to know more about your products and services.\n\nPlease share more information.\n\nThank you.`;

export const productInquiry = (productName: string) =>
  `Hello ${BUSINESS.name},\n\nI am interested in the product: ${productName}.\n\nI would like more information about this product.\n\nThank you.`;

// Back-compat alias used in older imports — now points to the general inquiry.
export const defaultInquiry = generalInquiry;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
