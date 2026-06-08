import { createFileRoute, Link } from "@tanstack/react-router";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: `Terms of Service — ${BUSINESS.name}` },
      { name: "description", content: `Terms of Service for ${BUSINESS.name}. Please read these terms carefully before using our website and services.` },
      { property: "og:title", content: `Terms of Service — ${BUSINESS.name}` },
      { property: "og:description", content: `Terms of Service for ${BUSINESS.name}.` },
    ],
    links: [{ rel: "canonical", href: "/terms-of-service" }],
  }),
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <div className="container-px mx-auto max-w-3xl py-16">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-emerald">Legal</div>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">Terms of Service</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          These Terms of Service govern your use of our website and the purchase of our products. Please read them carefully.
        </p>
      </div>

      <div className="mt-14 space-y-12">
        <Section title="Acceptance of Terms">
          <p className="text-foreground/80">
            By accessing or using the {BUSINESS.name} website, placing an order, or interacting with our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
          </p>
        </Section>

        <Section title="Product Information">
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li>We make every effort to display our products and their colors as accurately as possible. However, variations in screen settings and lighting may cause colors to appear differently.</li>
            <li>Product dimensions, materials, and specifications are provided as accurately as possible and may be subject to minor variations due to the handcrafted nature of our furniture.</li>
            <li>All products are subject to availability. We reserve the right to discontinue or modify any product without prior notice.</li>
          </ul>
        </Section>

        <Section title="Pricing & Payments">
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li>All prices listed on our website are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</li>
            <li>We reserve the right to change prices at any time without prior notice. Changes will not affect orders already placed and confirmed.</li>
            <li>Payment must be made in full before an order is processed. We accept the payment methods displayed at checkout.</li>
            <li>In the event of a payment discrepancy, we reserve the right to cancel or hold the order until the issue is resolved.</li>
          </ul>
        </Section>

        <Section title="Order Acceptance">
          <p className="text-foreground/80">
            Your order constitutes an offer to purchase our products. All orders are subject to acceptance by {BUSINESS.name}. We reserve the right to refuse or cancel any order for reasons including but not limited to product unavailability, errors in pricing or product information, or suspected fraudulent activity. You will be notified if your order is cancelled.
          </p>
        </Section>

        <Section title="Shipping & Delivery">
          <p className="text-foreground/80">
            Delivery terms, timelines, and coverage areas are governed by our <Link to="/shipping-policy" className="text-emerald hover:underline">Shipping Policy</Link>. Risk of loss and title for items pass to you upon delivery to the carrier or to your designated delivery address, as applicable.
          </p>
        </Section>

        <Section title="Refund Policy">
          <p className="text-foreground/80">
            Refunds and returns are governed by our <Link to="/refund-policy" className="text-emerald hover:underline">Refund Policy</Link>. By placing an order, you acknowledge and agree to the conditions set forth in that policy.
          </p>
        </Section>

        <Section title="Intellectual Property">
          <p className="text-foreground/80">
            All content on the {BUSINESS.name} website—including text, graphics, logos, images, product designs, and software—is the property of {BUSINESS.name} or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.
          </p>
        </Section>

        <Section title="Limitation of Liability">
          <p className="text-foreground/80">
            To the fullest extent permitted by applicable law, {BUSINESS.name} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our website or products, even if advised of the possibility of such damages. Our total liability shall not exceed the amount paid by you for the specific product giving rise to the claim.
          </p>
        </Section>

        <Section title="Privacy Policy">
          <p className="text-foreground/80">
            Your use of our website is also governed by our <Link to="/privacy-policy" className="text-emerald hover:underline">Privacy Policy</Link>, which explains how we collect, use, and protect your personal information.
          </p>
        </Section>

        <Section title="Governing Law">
          <p className="text-foreground/80">
            These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
          </p>
        </Section>

        <Section title="Changes to These Terms">
          <p className="text-foreground/80">
            We may update these Terms of Service from time to time to reflect changes in our practices, products, or legal requirements. The updated terms will be posted on this page with a revised effective date. Continued use of our website and services after changes constitutes acceptance of the revised terms.
          </p>
        </Section>

        <Section title="Contact Information">
          <p className="text-foreground/80">
            If you have any questions about these Terms of Service, please contact us:
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
