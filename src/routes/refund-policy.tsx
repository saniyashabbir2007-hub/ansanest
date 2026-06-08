import { createFileRoute, Link } from "@tanstack/react-router";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: `Refund Policy — ${BUSINESS.name}` },
      { name: "description", content: `Refund and return policy for ${BUSINESS.name}. Learn about our eligibility criteria, timelines, and process.` },
      { property: "og:title", content: `Refund Policy — ${BUSINESS.name}` },
      { property: "og:description", content: `Refund and return policy for ${BUSINESS.name}.` },
    ],
    links: [{ rel: "canonical", href: "/refund-policy" }],
  }),
  component: RefundPolicy,
});

function RefundPolicy() {
  return (
    <div className="container-px mx-auto max-w-3xl py-16">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-emerald">Customer Care</div>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">Refund Policy</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          We stand behind the quality of our products. Please review our refund and return guidelines below.
        </p>
      </div>

      <div className="mt-14 space-y-12">
        <Section title="Overview">
          <p className="text-foreground/80">
            At {BUSINESS.name}, customer satisfaction is our priority. We want you to love your purchase. This Refund Policy outlines when and how you may request a refund or return, and the conditions that apply.
          </p>
        </Section>

        <Section title="Eligibility for Refunds">
          <p className="text-foreground/80">Refunds are only eligible for products that meet one of the following conditions:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li><strong>Damaged during delivery:</strong> Items that arrive with visible damage caused during transit.</li>
            <li><strong>Defective:</strong> Items with manufacturing defects or faults that affect their intended use.</li>
            <li><strong>Incorrect items received:</strong> Items that do not match the product description or your confirmed order.</li>
          </ul>
        </Section>

        <Section title="Reporting Timeline & Documentation">
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li>Customers must report any damage, defect, or incorrect item <strong>within 48 hours of delivery</strong>.</li>
            <li>Supporting photographs of the damaged or defective product, packaging, and any relevant labels must be provided.</li>
            <li>Failure to report within the specified timeframe may result in the refund request being declined.</li>
          </ul>
        </Section>

        <Section title="Order Cancellations">
          <p className="text-foreground/80">
            Order cancellations are permitted <strong>only within 24 hours of placing the order</strong>. Once an order enters production or shipping preparation, it cannot be cancelled. To request a cancellation, please contact us immediately at <a href={`mailto:${BUSINESS.email}`} className="text-emerald hover:underline">{BUSINESS.email}</a>.
          </p>
        </Section>

        <Section title="Non-Refundable Items">
          <p className="text-foreground/80">
            Customized, personalized, made-to-order, or specially manufactured products are <strong>non-refundable and non-returnable</strong> unless they arrive damaged or defective. These items are produced specifically for you and cannot be resold.
          </p>
        </Section>

        <Section title="Refund Verification Process">
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li>All refund requests are subject to verification by {BUSINESS.name}.</li>
            <li>We may request additional information, photographs, or inspection of the product before approving a refund.</li>
            <li>{BUSINESS.name} reserves the right to reject fraudulent, invalid, or unsupported refund claims.</li>
            <li>Approved refunds will be processed within <strong>7–10 business days</strong> through the original payment method used at checkout.</li>
          </ul>
        </Section>

        <Section title="Customer Responsibilities">
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li>Provide accurate order information, including order number, date of purchase, and delivery details.</li>
            <li>Preserve the original packaging where possible to facilitate return shipping if required.</li>
            <li>Cooperate with our team during the verification and return process.</li>
          </ul>
        </Section>

        <Section title="Contact Us">
          <p className="text-foreground/80">
            For refund requests or questions about this policy, please reach out to us:
          </p>
          <ul className="mt-3 space-y-2 text-foreground/80">
            <li>Email: <a href={`mailto:${BUSINESS.email}`} className="text-emerald hover:underline">{BUSINESS.email}</a></li>
            <li>Phone: <a href={`tel:${BUSINESS.phoneRaw}`} className="text-emerald hover:underline">{BUSINESS.phone}</a></li>
          </ul>
        </Section>

        <Section title="Policy Updates">
          <p className="text-foreground/80">
            {BUSINESS.name} reserves the right to update this Refund Policy at any time. Changes will be posted on this page with a revised effective date. We encourage you to review this policy periodically.
          </p>
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
