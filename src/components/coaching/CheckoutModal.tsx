import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Stripe } from "@stripe/stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface CheckoutFormProps {
  productTitle: string;
  amountCents: number;
  currency: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({
  productTitle,
  amountCents,
  currency,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const formatAmount = (cents: number, cur: string) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: cur.toUpperCase(),
    }).format(cents / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setPayError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking-success`,
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
      <div className="flex flex-col items-center gap-4 py-8">
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <p className="text-lg font-semibold">Payment successful!</p>
        <p className="text-sm text-muted-foreground">
          Your booking has been confirmed. Check your email for details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl bg-muted/40 border border-border p-4">
        <p className="text-sm text-muted-foreground">You are purchasing</p>
        <p className="font-semibold mt-0.5">{productTitle}</p>
        <p className="text-2xl font-bold mt-1">
          {formatAmount(amountCents, currency)}
        </p>
      </div>

      <PaymentElement />

      {payError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          {payError}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={paying}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={!stripe || paying}>
          {paying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatAmount(amountCents, currency)}`
          )}
        </Button>
      </div>
    </form>
  );
}

interface CheckoutModalProps {
  open: boolean;
  stripePromise: Promise<Stripe | null>;
  clientSecret: string;
  productTitle: string;
  amountCents: number;
  currency?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function CheckoutModal({
  open,
  stripePromise,
  clientSecret,
  productTitle,
  amountCents,
  currency = "cad",
  onSuccess,
  onClose,
}: CheckoutModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Secure payment powered by Stripe
          </DialogDescription>
        </DialogHeader>

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
          <CheckoutForm
            productTitle={productTitle}
            amountCents={amountCents}
            currency={currency}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
