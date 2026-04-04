import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Stripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, Sparkles } from "lucide-react";
import { useStripePayment } from "@/hooks/useStripePayment";

type Plan = "b2c_monthly" | "b2c_annual" | "enterprise";

const PLANS = [
  {
    key: "b2c_monthly" as Plan,
    name: "Individual",
    price: "$49",
    period: "/month",
    description: "Access Galoras coaches and book sessions on your schedule.",
    features: [
      "Unlimited coach browsing",
      "Book any coach session",
      "Session history & notes",
      "Galoras Compass matching",
    ],
  },
  {
    key: "b2c_annual" as Plan,
    name: "Individual Annual",
    price: "$449",
    period: "/year",
    badge: "Save 23%",
    description: "Everything in Individual, billed annually.",
    features: [
      "Everything in Individual",
      "2 months free",
      "Priority booking",
      "Early access to new coaches",
    ],
    highlighted: true,
  },
  {
    key: "enterprise" as Plan,
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Coaching programs for teams and organizations.",
    features: [
      "Team dashboard",
      "Bulk session credits",
      "Dedicated account manager",
      "Custom reporting & analytics",
    ],
  },
];

interface SubscribeFormProps {
  plan: Plan;
  onSuccess: () => void;
  onCancel: () => void;
}

function SubscribeForm({ plan, onSuccess, onCancel }: SubscribeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setPayError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription-success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setPayError(error.message ?? "Payment failed. Please try again.");
      setPaying(false);
    } else {
      setSucceeded(true);
      setPaying(false);
      setTimeout(() => onSuccess(), 1500);
    }
  };

  if (succeeded) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <p className="text-xl font-semibold">Welcome to Galoras!</p>
        <p className="text-muted-foreground text-center max-w-xs">
          Your subscription is active. Start exploring coaches now.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {payError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          {payError}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={paying}
        >
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={!stripe || paying}>
          {paying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>
    </form>
  );
}

interface SubscriptionPlansProps {
  onSuccess?: () => void;
}

export function SubscriptionPlans({ onSuccess }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const {
    stripePromise,
    clientSecret,
    status,
    error,
    initiateSubscription,
    reset,
  } = useStripePayment();

  const handleSelectPlan = async (plan: Plan) => {
    if (plan === "enterprise") {
      window.location.href = "/contact";
      return;
    }
    setSelectedPlan(plan);
    await initiateSubscription(plan);
  };

  const handleSuccess = () => {
    reset();
    setSelectedPlan(null);
    onSuccess?.();
  };

  const handleBack = () => {
    reset();
    setSelectedPlan(null);
  };

  // Show payment form once clientSecret is ready
  if (status === "ready" && clientSecret && selectedPlan) {
    const plan = PLANS.find((p) => p.key === selectedPlan)!;
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to plans
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {plan.name}
            </span>
          </div>
          <p className="text-2xl font-bold">
            {plan.price}
            <span className="text-base font-normal text-muted-foreground">
              {plan.period}
            </span>
          </p>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#f97316",
                borderRadius: "8px",
              },
            },
          }}
        >
          <SubscribeForm
            plan={selectedPlan}
            onSuccess={handleSuccess}
            onCancel={handleBack}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`relative rounded-2xl border p-6 flex flex-col gap-4 ${
              plan.highlighted
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border bg-card"
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                {plan.badge}
              </span>
            )}

            <div>
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-3xl font-bold mt-1">
                {plan.price}
                <span className="text-base font-normal text-muted-foreground">
                  {plan.period}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={plan.highlighted ? "default" : "outline"}
              disabled={status === "loading" && selectedPlan === plan.key}
              onClick={() => handleSelectPlan(plan.key)}
            >
              {status === "loading" && selectedPlan === plan.key ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : plan.key === "enterprise" ? (
                "Contact Sales"
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
