import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Instagram } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { z } from "zod";
import { BUSINESS, waLink, generalInquiry } from "@/lib/business";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${BUSINESS.name}` },
      { name: "description", content: "Visit our showroom or get in touch via WhatsApp, phone or email. We're here to help with your upholstery project." },
      { property: "og:title", content: `Contact ${BUSINESS.name}` },
      { property: "og:description", content: "Visit our showroom or get in touch." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  message: z.string().trim().min(5, "Tell us a bit more").max(1000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setSubmitting(true);
    const msg = `Hello, my name is ${parsed.data.name}.\nEmail: ${parsed.data.email}\nPhone: ${parsed.data.phone}\n\n${parsed.data.message}`;
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp to send your message…");
    setTimeout(() => setSubmitting(false), 800);
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-8 sm:py-12">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[0.25em] text-emerald font-semibold">Contact</div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          Let's build something beautiful
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-muted-foreground">
          Visit our showroom, request a quote, or chat with us on WhatsApp — whichever works best for you.
        </p>
      </div>

      <div className="mt-8 sm:mt-10 grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1.1fr] items-start">
        <div className="space-y-3 sm:space-y-4">
          <InfoCard Icon={MapPin} title="Visit our showroom" value={BUSINESS.address} />
          <InfoCard Icon={Phone} title="Call us" value={BUSINESS.phone} href={`tel:${BUSINESS.phoneRaw}`} />
          <InfoCard Icon={Mail} title="Email us" value={BUSINESS.email} href={`mailto:${BUSINESS.email}`} />
          <InfoCard Icon={Clock} title="Business Hours" value={BUSINESS.hours} />
          
          <a
            href={BUSINESS.social.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-muted"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
              <Instagram className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Follow on Instagram</div>
              <div className="mt-0.5 text-xs text-foreground font-medium">{BUSINESS.social.instagramHandle}</div>
            </div>
          </a>
          
          <a
            href={waLink(generalInquiry)}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:opacity-90 shadow-2xs"
          >
            <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
          </a>

          <div className="overflow-hidden rounded-xl border border-border">
            <iframe
              title="Showroom location"
              src={BUSINESS.mapsEmbed}
              className="h-56 sm:h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-2xs">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Request a Quote</h2>
          <p className="mt-1 text-xs text-muted-foreground">Send us your details and we'll get back within 24 hours.</p>

          <div className="mt-5 space-y-3.5">
            <Field label="Your Name">
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className="input" placeholder="Full name" />
            </Field>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" placeholder="you@example.com" />
              </Field>
              <Field label="Phone">
                <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" placeholder="+91 …" />
              </Field>
            </div>
            <Field label="Message">
              <textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={4} className="input resize-none" placeholder="Tell us about your project — product, size, fabric preferences…" />
            </Field>
            <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-xs font-semibold text-background hover:opacity-90 disabled:opacity-60 cursor-pointer">
              <Send className="h-3.5 w-3.5" /> {submitting ? "Sending…" : "Send Inquiry"}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">Submitting opens WhatsApp with your message ready to send.</p>
          </div>
        </form>
      </div>

      <style>{`
        .input { width: 100%; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--background); padding: 0.55rem 0.75rem; font-size: 0.75rem; color: var(--foreground); outline: none; transition: border-color .2s, box-shadow .2s; }
        .input:focus { border-color: var(--emerald); box-shadow: 0 0 0 2px color-mix(in oklab, var(--emerald) 20%, transparent); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function InfoCard({ Icon, title, value, href }: { Icon: typeof MapPin; title: string; value: string; href?: string }) {
  const Inner = (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{title}</div>
        <div className="mt-0.5 text-xs text-foreground font-medium">{value}</div>
      </div>
    </>
  );
  const cls = "flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-muted";
  return href ? <a href={href} className={cls}>{Inner}</a> : <div className={cls}>{Inner}</div>;
}