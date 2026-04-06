import { Layout } from "@/components/layout";

export default function Privacy() {
  return (
    <Layout>
      <section className="relative pt-32 pb-20 bg-zinc-950">
        <div className="container-wide max-w-3xl">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-display font-black text-white uppercase mb-2">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Galoras Operations LLC — Last updated: January 2026</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide max-w-3xl prose prose-zinc dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary">
          <p>
            This Privacy Policy explains how Galoras Operations LLC ("Galoras", "we", "us") collects,
            uses, and protects your personal data when you use our website and platform.
          </p>

          <h2>1. Who We Are</h2>
          <p>
            Galoras Operations LLC is a company registered in the United States with its registered
            address at Suite 800, 1200 Brickell Avenue, FL 33131, Miami, USA. Galoras operates an
            online platform that connects individuals with independent coaches and provides community
            and content services.
          </p>

          <h2>2. What Data We Collect</h2>
          <p>We may collect:</p>
          <ul>
            <li>Name, email address, country of residence</li>
            <li>Account and profile information</li>
            <li>Payment information (processed securely by Stripe — we do not store card details)</li>
            <li>Usage data (logins, activity, bookings)</li>
            <li>Communications with us</li>
            <li>IP address and device/browser information for security and compliance purposes</li>
          </ul>

          <h2>3. Why We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Create and manage your account</li>
            <li>Provide platform services and coaching marketplace functionality</li>
            <li>Process payments and manage subscriptions</li>
            <li>Communicate with you about your account and bookings</li>
            <li>Send marketing communications where you have opted in</li>
            <li>Improve our platform and services</li>
            <li>Meet legal, regulatory, and security obligations</li>
            <li>Maintain records of legal agreement acceptance (US ESIGN Act / Canada PIPEDA)</li>
          </ul>

          <h2>4. Legal Basis (US &amp; Canada)</h2>
          <p>
            For users in the United States, our processing is based on contractual necessity,
            legitimate business interests, and your consent where applicable.
            For users in Canada, we comply with the Personal Information Protection and Electronic
            Documents Act (PIPEDA) and applicable provincial privacy legislation.
          </p>

          <h2>5. Data Sharing</h2>
          <p>
            We share data only with trusted service providers including Stripe (payments),
            Supabase (hosting and database), and analytics providers. We do not sell your
            personal data to third parties.
          </p>

          <h2>6. International Transfers</h2>
          <p>
            Your data may be processed in the United States and other countries. Where data is
            transferred from Canada, we ensure appropriate safeguards are in place as required
            by PIPEDA.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data (subject to legal retention requirements)</li>
            <li>Withdraw consent for marketing communications at any time</li>
            <li>California residents: the right to know, delete, and opt out under CCPA</li>
            <li>Canadian residents: rights under PIPEDA including access and correction</li>
          </ul>

          <h2>8. Data Retention</h2>
          <p>
            We retain personal data only as long as necessary for the purposes above, or as required
            by law. Legal agreement records are retained for a minimum of 7 years for compliance purposes.
          </p>

          <h2>9. Do Not Sell (California)</h2>
          <p>
            Galoras does not sell personal information as defined under the California Consumer
            Privacy Act (CCPA). California residents may submit a data rights request to{" "}
            <a href="mailto:privacy@galoras.com">privacy@galoras.com</a>.
          </p>

          <h2>10. Contact</h2>
          <p>
            For privacy questions or data rights requests, contact:{" "}
            <a href="mailto:privacy@galoras.com">privacy@galoras.com</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
