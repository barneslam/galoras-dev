import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function BookingSuccess() {
  return (
    <Layout>
      <section className="min-h-[60vh] flex items-center justify-center pt-28 pb-12">
        <div className="container-wide">
          <div className="max-w-md mx-auto text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-display font-bold mb-3">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your coaching session has been booked and payment processed. Check
              your email for confirmation and next steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/coaching">
                <Button variant="outline">Browse More Coaches</Button>
              </Link>
              <Link to="/dashboard">
                <Button>View My Bookings</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
