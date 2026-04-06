import { Layout } from "@/components/layout";

export default function CookiePolicy() {
  return (
    <Layout>
      <section className="relative pt-32 pb-20 bg-zinc-950">
        <div className="container-wide max-w-3xl">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-display font-black text-white uppercase mb-2">Cookie Policy</h1>
          <p className="text-zinc-500 text-sm">Galoras Operations LLC — Last updated: January 2026</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide max-w-3xl prose prose-zinc dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary">
          <p>
            This Cookie Policy applies to the Galoras website operated by Galoras Operations LLC,
            registered at Suite 800, 1200 Brickell Avenue, FL 33131, Miami, USA.
          </p>

          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help
            websites remember your preferences and understand how you use the site.
          </p>

          <h2>2. How We Use Cookies</h2>
          <p>Galoras uses cookies for the following purposes:</p>
          <ul>
            <li><strong>Strictly necessary:</strong> Authentication sessions, security tokens, and platform functionality. These cannot be disabled.</li>
            <li><strong>Analytics:</strong> Understanding how users interact with our platform to improve our service.</li>
            <li><strong>Performance:</strong> Optimising page load speeds and platform performance.</li>
            <li><strong>Preferences:</strong> Remembering your settings and consent choices.</li>
          </ul>

          <h2>3. Third-Party Cookies</h2>
          <p>
            We use the following third-party services which may set cookies:
          </p>
          <ul>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Supabase</strong> — authentication and database</li>
            <li><strong>Analytics providers</strong> — platform usage analysis</li>
          </ul>

          <h2>4. Managing Cookies</h2>
          <p>
            You can manage cookie preferences through your browser settings. Most browsers allow
            you to refuse or delete cookies. Note that disabling cookies may affect platform
            functionality, including your ability to log in.
          </p>
          <p>
            You can also manage your preferences through our cookie banner when you first visit
            the site. Your choice is stored locally and can be reset by clearing your browser data.
          </p>

          <h2>5. Your Rights (US &amp; Canada)</h2>
          <p>
            California residents may exercise rights under the CCPA regarding data collected via
            cookies. Canadian residents have rights under PIPEDA. To exercise your rights, contact{" "}
            <a href="mailto:privacy@galoras.com">privacy@galoras.com</a>.
          </p>

          <h2>6. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. The updated version will be posted
            on this page with a revised date.
          </p>

          <h2>7. Contact</h2>
          <p>
            For questions about cookies or privacy:{" "}
            <a href="mailto:privacy@galoras.com">privacy@galoras.com</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
