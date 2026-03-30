import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";
import { Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OnboardRedirect() {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortId) {
      setError("Invalid link");
      return;
    }

    const resolve = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("resolve-onboarding-link", {
          body: { shortId },
        });

        if (fnError || !data?.token) {
          setError(data?.error || "This onboarding link is invalid or has expired.");
          return;
        }

        // Pass token via router state — keeps it out of the URL, history, and Referer headers
        navigate("/coaching/onboarding", { replace: true, state: { token: data.token } });
      } catch {
        setError("Something went wrong. Please try again.");
      }
    };

    resolve();
  }, [shortId, navigate]);

  if (error) {
    return (
      <Layout>
        <section className="py-16">
          <div className="container-wide">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold mb-2">Link Invalid</h1>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Go Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </Layout>
  );
}
