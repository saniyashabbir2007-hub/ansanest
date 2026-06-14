import { createFileRoute, Link } from "@tanstack/react-router";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${BUSINESS.name}` },
      { name: "description", content: `Privacy Policy for ${BUSINESS.name}. Learn how we collect, use, and protect your personal information.` },
      { property: "og:title", content: `Privacy Policy — ${BUSINESS.name}` },
      { property: "og:description", content: `Privacy Policy for ${BUSINESS.name}.` },
    ],
    links: [{ rel: "canonical", href: "/privacy-policy" }],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="container-px mx-auto max-w-3xl py-16">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-emerald">Legal</div>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">Privacy Policy</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Your privacy matters to us. This policy explains how we collect, use, and safeguard your information.
        </p>
      </div>

      <div className="mt-14 space-y-12">
        <Section title="Introduction">
          <p className="text-foreground/80">
            {BUSINESS.name} ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy describes how we collect, use, store, and share your personal information when you visit our website, make inquiries, or interact with our services.
          </p>
        </Section>

        <Section title="Information We Collect">
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and address when you submit a contact form or request a quote.</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent on the site, and referring URLs, collected via cookies and analytics tools.</li>
            <li><strong>Device Information:</strong> Browser type, operating system, and IP address to improve site performance and security.</li>
          </ul>
        </Section>

        <Section title="How We Use Information">
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li>To respond to inquiries and provide customer support.</li>
            <li>To process orders and arrange deliveries.</li>
            <li>To send updates about products, promotions, and showroom events (only with your consent).</li>
            <li>To analyze website traffic and improve user experience.</li>
            <li>To detect and prevent fraud or abuse.</li>
          </ul>
        </Section>

        <Section title="Cookies and Tracking Technologies">
          <p className="text-foreground/80">
            We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and gather analytics data. You can control cookie settings through your browser. Disabling cookies may affect site functionality.
          </p>
        </Section>

        <Section title="Data Protection">
          <p className="text-foreground/80">
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Access to personal information is restricted to authorized personnel who need it to perform their duties.
          </p>
        </Section>

        <Section title="Third-Party Services">
          <p className="text-foreground/80">
            We may use trusted third-party services for analytics (e.g., Google Analytics), payment processing, and communication. These providers have access to limited personal data only as necessary to perform their functions and are obligated not to disclose or use it for other purposes.
          </p>
        </Section>

        <Section title="Contact Information">
          <p className="text-foreground/80">
            If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us:
          </p>
          <ul className="mt-3 space-y-2 text-foreground/80">
            <li>Email: <a href={`mailto:${BUSINESS.email}`} className="text-emerald hover:underline">{BUSINESS.email}</a></li>
            <li>Phone: <a href={`tel:${BUSINESS.phoneRaw}`} className="text-emerald hover:underline">{BUSINESS.phone}</a></li>
            <li>Address: {BUSINESS.address}</li>
          </ul>
        </Section>

        <Section title="Changes to This Policy">
          <p className="text-foreground/80">
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The updated policy will be posted on this page with a revised effective date. We encourage you to review this page periodically.
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
