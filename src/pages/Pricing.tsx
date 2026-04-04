import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />

        <div className="container-wide relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
                Simple, transparent pricing
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start with a plan that fits you. Upgrade or cancel anytime.
              </p>
            </div>

            <SubscriptionPlans
              onSuccess={() => navigate("/subscription-success")}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
