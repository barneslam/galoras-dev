import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function SubscriptionSuccess() {
  return (
    <Layout>
      <section className="min-h-[60vh] flex items-center justify-center pt-28 pb-12">
        <div className="container-wide">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border border-primary/20 mb-6 mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-3">
              Welcome to Galoras!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your subscription is active. Start exploring coaches and booking
              sessions today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/coaching">
                <Button>Find a Coach</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
