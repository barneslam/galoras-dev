/**
 * CompleteRegistration — Coach profile completion page.
 * Accessed via unique token link sent in confirmation email.
 * Requires the coach to be signed in (session-aware).
 */
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Status = "loading" | "auth_required" | "invalid_token" | "already_complete" | "ready" | "saving" | "done" | "error";

interface RegData {
  id: string;
  selected_tier: string;
  full_name: string | null;
  email: string;
}

const TIER_LABELS: Record<string, string> = {
  pro: "Pro — $49/month",
  elite: "Elite — $99/month",
  master: "Master — $197/month",
};

export default function CompleteRegistration() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [regData, setRegData] = useState<RegData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [company, setCompany] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMsg("No registration token provided.");
      setStatus("error");
      return;
    }
    init();
  }, [token]);

  const init = async () => {
    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/complete-registration?token=${token}`, { replace: true });
      return;
    }

    // Validate token
    const { data: reg, error } = await supabase
      .from("coach_registrations")
      .select("id, selected_tier, full_name, email, registration_completed, user_id")
      .eq("registration_token", token)
      .maybeSingle();

    if (error || !reg) {
      setErrorMsg("This registration link is invalid or has expired.");
      setStatus("invalid_token");
      return;
    }

    // Ensure this token belongs to the current user
    if (reg.user_id !== session.user.id) {
      setErrorMsg("This registration link does not belong to your account. Please sign in with the correct account.");
      setStatus("invalid_token");
      return;
    }

    if (reg.registration_completed) {
      setStatus("already_complete");
      return;
    }

    setRegData(reg);
    setFullName(reg.full_name ?? "");
    setStatus("ready");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData) return;

    setStatus("saving");

    try {
      const specialtiesArr = specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Store all coach application fields in coach_registrations
      const { error: regError } = await supabase
        .from("coach_registrations")
        .update({
          full_name: fullName,
          coach_current_role: currentRole || null,
          company: company || null,
          linkedin_url: linkedIn || null,
          bio: bio || null,
          specialties: specialtiesArr.length > 0 ? specialtiesArr : null,
          years_experience: yearsExperience ? parseInt(yearsExperience) : null,
          registration_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", regData.id);

      if (regError) throw regError;

      // Also keep full_name in sync on profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ full_name: fullName, updated_at: new Date().toISOString() })
          .eq("id", user.id);
      }

      setStatus("done");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-lg">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-3 text-zinc-400 py-20">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying your registration link…</span>
            </div>
          )}

          {(status === "invalid_token" || status === "error") && (
            <div className="text-center py-20 space-y-4">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
              <h2 className="text-xl font-bold">Link Invalid</h2>
              <p className="text-zinc-400 text-sm">{errorMsg}</p>
              <Button onClick={() => navigate("/")} variant="outline" className="border-zinc-700 text-zinc-300">
                Go to Home
              </Button>
            </div>
          )}

          {status === "already_complete" && (
            <div className="text-center py-20 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-bold">Profile Already Completed</h2>
              <p className="text-zinc-400 text-sm">
                Your coach profile has already been submitted. Our team will be in touch once your application is reviewed.
              </p>
              <Button onClick={() => navigate("/coach-dashboard")} className="bg-primary text-primary-foreground">
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === "done" && (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold">Profile Submitted!</h2>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                Thank you for completing your coach profile. Our team will review your application and be in touch within 2–3 business days.
              </p>
              <Button onClick={() => navigate("/")} className="bg-primary text-primary-foreground">
                Back to Galoras
              </Button>
            </div>
          )}

          {status === "ready" && regData && (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="h-1 bg-gradient-to-r from-primary to-sky-400 rounded-full mb-6" />
                <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                  {TIER_LABELS[regData.selected_tier] ?? regData.selected_tier}
                </p>
                <h1 className="text-3xl font-black mb-2">Complete Your Coach Profile</h1>
                <p className="text-zinc-400 text-sm">
                  Help us introduce you to the right clients. This information will appear on your public coach profile once approved.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Full Name *</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Current Role</label>
                    <Input
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      placeholder="e.g. Executive Coach"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Company / Firm</label>
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium uppercase tracking-wide">LinkedIn Profile URL</label>
                  <Input
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    type="url"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Bio / Professional Summary *</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                    rows={4}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
                    placeholder="Tell us about your background, what you coach, and the results you deliver…"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
                    Coaching Specialties
                    <span className="text-zinc-600 normal-case font-normal ml-1">(comma-separated)</span>
                  </label>
                  <Input
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder="e.g. Leadership, Executive Presence, Career Transitions"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Years of Coaching Experience</label>
                  <Input
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    type="number"
                    min="0"
                    max="50"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder="e.g. 5"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={status === "saving"}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
                  >
                    {status === "saving" ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</>
                    ) : (
                      "Submit My Profile →"
                    )}
                  </Button>
                  <p className="text-xs text-zinc-600 text-center mt-3">
                    Your application will be reviewed by the Galoras team. You'll receive an email once approved.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
