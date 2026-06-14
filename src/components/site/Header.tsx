import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone, Instagram } from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { Logo } from "@/components/site/Logo";


const nav = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "Catalog" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-px mx-auto flex h-20 max-w-7xl items-center justify-between">
        <Link to="/" className="group flex items-center gap-3">
          <Logo />

          <div className="leading-tight">
            <div className="font-display text-xl text-foreground">{BUSINESS.name}</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Upholstery Atelier</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={BUSINESS.social.instagram}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href={`tel:${BUSINESS.phoneRaw}`}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Phone className="h-4 w-4" /> {BUSINESS.phone}
          </a>
        </div>

        <button className="md:hidden" onClick={() => setOpen((s) => !s)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border md:hidden">
          <div className="container-px mx-auto flex max-w-7xl flex-col gap-1 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base text-foreground hover:bg-muted"
              >
                {n.label}
              </Link>
            ))}
            <a
              href={`tel:${BUSINESS.phoneRaw}`}
              className="mt-2 rounded-md bg-foreground px-3 py-3 text-center text-sm font-medium text-background"
            >
              Call {BUSINESS.phone}
            </a>
            <a
              href={BUSINESS.social.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-3 text-sm font-medium text-foreground"
            >
              <Instagram className="h-4 w-4" /> {BUSINESS.social.instagramHandle}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
