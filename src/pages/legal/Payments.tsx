import { Layout } from "@/components/layout";

export default function Payments() {
  return (
    <Layout>
      <section className="relative pt-32 pb-20 bg-zinc-950">
        <div className="container-wide max-w-3xl">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-display font-black text-white uppercase mb-2">Payments and Refunds Policy</h1>
          <p className="text-zinc-500 text-sm">Galoras Operations LLC — Last updated: January 2026</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide max-w-3xl prose prose-zinc dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary">
          <p>
            This policy applies to all subscriptions and payments processed through the Galoras
            platform operated by Galoras Operations LLC, Suite 800, 1200 Brickell Avenue,
            FL 33131, Miami, USA.
          </p>

          <h2>1. Subscriptions</h2>
          <p>
            Coach platform subscriptions are billed monthly and renew automatically on the same
            date each month unless cancelled before the renewal date. By subscribing, you
            authorise Galoras to charge your payment method on a recurring basis until cancelled.
          </p>

          <h2>2. Session Payments</h2>
          <p>
            Individual coaching sessions are charged at the time of booking. Payment is processed
            securely via Stripe. Session fees are set by the coach and displayed clearly before
            purchase.
          </p>

          <h2>3. Payment Processing</h2>
          <p>
            All payments are processed by Stripe, Inc. Galoras does not store card numbers or
            sensitive payment information. By making a payment, you agree to Stripe's terms of
            service. Payments are processed in CAD or USD as displayed at checkout.
          </p>

          <h2>4. Refunds — Subscriptions</h2>
          <p>
            Subscription fees are non-refundable once billed, except where required by applicable
            law. If you cancel your subscription, you retain access until the end of the current
            billing period.
          </p>

          <h2>5. Refunds — Sessions</h2>
          <p>
            Session refunds are available if a cancellation is made more than 24 hours before the
            scheduled session. Cancellations within 24 hours are non-refundable. Refunds will be
            returned to the original payment method within 5–10 business days.
          </p>

          <h2>6. Immediate Access and Cooling-Off Waiver</h2>
          <p>
            By purchasing a subscription or session and requesting immediate access to digital
            content and services, you acknowledge and agree that you waive any applicable
            statutory cooling-off or cancellation right to the extent permitted by law.
            This waiver is recorded at the time of purchase.
          </p>

          <h2>7. Failed Payments</h2>
          <p>
            If a payment fails, Galoras will attempt to retry the charge. Accounts may be suspended
            after repeated failed payment attempts. You will be notified by email and given the
            opportunity to update your payment method.
          </p>

          <h2>8. Cancellation</h2>
          <p>
            You may cancel your subscription at any time from your account dashboard. Cancellation
            takes effect at the end of the current billing period. To request a refund or dispute a
            charge, contact{" "}
            <a href="mailto:billing@galoras.com">billing@galoras.com</a>.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            This policy is governed by the laws of the State of Florida, USA. Canadian consumers
            retain rights under applicable provincial consumer protection legislation.
          </p>

          <h2>10. Contact</h2>
          <p>
            Billing questions: <a href="mailto:billing@galoras.com">billing@galoras.com</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
