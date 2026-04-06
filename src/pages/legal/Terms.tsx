import { Layout } from "@/components/layout";

export default function Terms() {
  return (
    <Layout>
      <section className="relative pt-32 pb-20 bg-zinc-950">
        <div className="container-wide max-w-3xl">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-display font-black text-white uppercase mb-2">Terms of Service</h1>
          <p className="text-zinc-500 text-sm">Galoras Operations LLC — Last updated: January 2026</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide max-w-3xl prose prose-zinc dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary">
          <p>
            These Terms of Service govern your use of the Galoras platform operated by Galoras Operations LLC,
            registered at Suite 800, 1200 Brickell Avenue, FL 33131, Miami, USA.
          </p>

          <h2>1. Platform Role</h2>
          <p>
            Galoras is a technology platform connecting users with independent coaches. Galoras does not
            provide coaching services directly. All coaching services are provided by independent coaches
            who are solely responsible for the content and conduct of their sessions.
          </p>

          <h2>2. No Professional Advice</h2>
          <p>
            Coaching is not medical, legal, financial, or therapeutic advice. Users are responsible for
            their own decisions. Nothing on this platform should be construed as professional advice of
            any kind. If you require professional advice, please consult a licensed professional.
          </p>

          <h2>3. Accounts</h2>
          <p>
            You must provide accurate information and keep your account secure. You are responsible for
            all activity that occurs under your account. Galoras reserves the right to suspend or
            terminate accounts where inaccurate information is provided or where security is compromised.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>
            You agree not to misuse the platform, harm other users, post unlawful content, or use
            the platform for any purpose that violates applicable law. Prohibited conduct includes
            harassment, fraud, impersonation, and unauthorised access to systems.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            Galoras owns the platform and brand. Coaches retain ownership of their content but grant
            Galoras a non-exclusive, worldwide, royalty-free licence to display and promote it on the
            platform and in related marketing materials.
          </p>

          <h2>6. Termination</h2>
          <p>
            We may suspend or terminate accounts for breach of these terms or for conduct that poses
            a reputational or legal risk to Galoras or other users.
          </p>

          <h2>7. Liability</h2>
          <p>
            To the maximum extent permitted by law, Galoras is not liable for outcomes of coaching
            relationships, loss of data, loss of business, or any indirect or consequential damages
            arising from use of the platform.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These terms are governed by the laws of the State of Florida, USA. Any disputes shall
            be resolved in the courts of Miami-Dade County, Florida, except where prohibited by
            applicable consumer protection law in Canada.
          </p>

          <h2>9. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:legal@galoras.com">legal@galoras.com</a>.
          </p>
        </div>
      </section>
    </Layout>
  );
}
