import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { BUSINESS, waLink, generalInquiry } from "@/lib/business";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Footer() {
  return (
    <footer className="mt-32 gradient-luxury text-primary-foreground">
      <div className="container-px mx-auto grid max-w-7xl gap-12 py-20 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src="/favicon.jpeg" alt="Ansa Nest" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
            <div>
              <div className="font-display text-3xl text-gold">{BUSINESS.name}</div>
              <div className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60">{BUSINESS.tagline}</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/70">
            India's atelier for premium sofas, sectional sofas, upholstered beds and bespoke
            upholstery. Hand-crafted with lasting quality.
          </p>

          <div className="mt-6 flex gap-3">
            {[
              { Icon: Instagram, href: BUSINESS.social.instagram, label: "Instagram" },
              { Icon: WhatsAppIcon, href: waLink(generalInquiry), label: "WhatsApp" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg text-gold">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            {[["/", "Home"], ["/catalog", "Catalog"], ["/gallery", "Gallery"], ["/about", "About"], ["/contact", "Contact"]].map(([to, label]) => (
              <li key={to}>
                <Link to={to as string} className="hover:text-gold">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-gold">Policies</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            {[["/privacy-policy", "Privacy Policy"], ["/refund-policy", "Refund Policy"], ["/shipping-policy", "Shipping Policy"], ["/terms-of-service", "Terms of Service"]].map(([to, label]) => (
              <li key={to}>
                <Link to={to as string} className="hover:text-gold">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-gold">Visit & Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {BUSINESS.address}</li>
            <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> <a href={`tel:${BUSINESS.phoneRaw}`}>{BUSINESS.phone}</a></li>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-px mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 py-6 text-xs text-primary-foreground/60 md:flex-row">
          <div>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</div>
          <div>Crafted with care in India.</div>
        </div>
      </div>
    </footer>
  );
}
