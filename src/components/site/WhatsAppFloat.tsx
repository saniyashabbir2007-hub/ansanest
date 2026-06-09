import { waLink, generalInquiry } from "@/lib/business";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function WhatsAppFloat() {
  return (
    <a
      href={waLink(generalInquiry)}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-luxury ring-4 ring-white/40 transition-transform hover:scale-110"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-30" />
    </a>
  );
}
