import { createFileRoute, Link } from "@tanstack/react-router";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: `Shipping Policy — ${BUSINESS.name}` },
      { name: "description", content: `Shipping and delivery policy for ${BUSINESS.name}. Learn about processing times, delivery estimates, and coverage areas.` },
      { property: "og:title", content: `Shipping Policy — ${BUSINESS.name}` },
      { property: "og:description", content: `Shipping and delivery policy for ${BUSINESS.name}.` },
    ],
    links: [{ rel: "canonical", href: "/shipping-policy" }],
  }),
  component: ShippingPolicy,
});

function ShippingPolicy() {
  return (
    <div className="container-px mx-auto max-w-3xl py-16">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-emerald">Logistics</div>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">Shipping Policy</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Transparent shipping information so you know exactly when to expect your handcrafted furniture.
        </p>
      </div>

      <div className="mt-14 space-y-12">
        <Section title="Order Processing Time">
          <p className="text-foreground/80">
            All orders are processed within <strong>1–3 business days</strong> of payment confirmation. Custom and made-to-order items may require additional production time, which will be communicated at the time of order confirmation.
          </p>
        </Section>

        <Section title="Estimated Delivery Time">
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li><strong>Standard delivery:</strong> 7–14 business days from the date of dispatch.</li>
            <li><strong>Custom orders:</strong> Delivery timelines will be shared individually based on production schedules.</li>
            <li>Delivery times are estimates and may vary depending on your location, carrier schedules, and external factors.</li>
          </ul>
        </Section>

        <Section title="Shipping Coverage Areas">
          <p className="text-foreground/80">
            We currently ship across India. For international shipping inquiries, please contact us directly at <a href={`mailto:${BUSINESS.email}`} className="text-emerald hover:underline">{BUSINESS.email}</a> before placing your order.
          </p>
        </Section>

        <Section title="Delivery Delays">
          <p className="text-foreground/80">
            While we strive to meet all estimated delivery windows, delays may occasionally occur due to weather conditions, logistical challenges, public holidays, or other circumstances beyond our control. We will notify you promptly if a significant delay affects your order.
          </p>
        </Section>

        <Section title="Customer Responsibilities">
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li>Ensure the delivery address provided is accurate and complete, including landmarks and contact numbers.</li>
            <li>Be available to receive the delivery or authorize someone on your behalf.</li>
            <li>Inspect the package at the time of delivery before accepting it.</li>
            <li>Sign the delivery receipt only after confirming the outer packaging is intact.</li>
          </ul>
        </Section>

        <Section title="Damaged Shipment Reporting">
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li>If the outer packaging appears damaged, please note this on the delivery receipt and take photographs before opening.</li>
            <li>Report any damage to the product or packaging <strong>within 48 hours of delivery</strong>.</li>
            <li>Include clear photographs of the damage, packaging, and product labels when contacting us.</li>
          </ul>
        </Section>

        <Section title="Contact Information">
          <p className="text-foreground/80">
            For shipping inquiries, delivery tracking, or address updates, please contact us:
          </p>
          <ul className="mt-3 space-y-2 text-foreground/80">
            <li>Email: <a href={`mailto:${BUSINESS.email}`} className="text-emerald hover:underline">{BUSINESS.email}</a></li>
            <li>Phone: <a href={`tel:${BUSINESS.phoneRaw}`} className="text-emerald hover:underline">{BUSINESS.phone}</a></li>
            <li>Address: {BUSINESS.address}</li>
          </ul>
        </Section>
      </div>

      <div className="mt-16 text-center">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background hover:opacity-90">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
