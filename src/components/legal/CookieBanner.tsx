import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { recordAgreements } from "@/lib/legal";

const STORAGE_KEY = "galoras_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    setVisible(false);
    await recordAgreements({ context: "cookie_banner", agreementTypes: ["cookie_policy"] });
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, at: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300 leading-relaxed">
              We use cookies for analytics and platform functionality. See our{" "}
              <Link to="/cookies" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Cookie Policy
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Privacy Policy
              </Link>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-600 text-zinc-400 hover:bg-zinc-800 text-xs"
              onClick={decline}
            >
              Decline
            </Button>
            <Button
              size="sm"
              className="bg-primary text-zinc-950 hover:bg-primary/90 font-semibold text-xs"
              onClick={accept}
            >
              Accept
            </Button>
            <button
              onClick={decline}
              className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
