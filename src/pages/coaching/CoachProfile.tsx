import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageCoachModal } from "@/components/coaching/MessageCoachModal";
import { ProductCard, type CoachProduct } from "@/components/coaching/ProductCard";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Globe,
  Linkedin,
  Calendar,
  MessageCircle,
  CheckCircle,
  Award,
  Users,
  Briefcase,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Tier config ──────────────────────────────────────────────────────────────
const TIER_CONFIG: Record<string, { label: string; className: string }> = {
  elite:    { label: "⭐ Elite",  className: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  premium:  { label: "Premium",  className: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  standard: { label: "Standard", className: "bg-muted border-border text-muted-foreground" },
};

const AUDIENCE_LABELS: Record<string, string> = {
  individual: "Individuals",
  sme:        "SME",
  enterprise: "Enterprise",
  startup:    "Startups",
  nonprofit:  "Non-Profit",
  government: "Government",
};

const FORMAT_LABELS: Record<string, string> = {
  online:    "Remote",
  in_person: "In-Person",
  hybrid:    "Hybrid",
};

// ── Type for proof point JSON objects ────────────────────────────────────────
interface ProofPoint {
  name:    string;
  role?:   string;
  company?: string;
  outcome?: string;
  quote:   string;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function CoachProfile() {
  // Support both /coaching/:coachId (legacy UUID) and /coach/:slug (new)
  const { coachId, slug } = useParams<{ coachId?: string; slug?: string }>();
  const identifier = slug || coachId;
  const useSlug    = !!slug;

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const currentUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      currentUserIdRef.current = user?.id ?? null;
    });
  }, []);

  // ── Main coach query ──────────────────────────────────────────────────────
  const { data: coach, isLoading } = useQuery({
    queryKey: ["coach", identifier, useSlug],
    queryFn: async () => {
      let query = supabase
        .from("coaches")
        .select(`
          *,
          coach_categories (
            categories ( id, name, slug, icon )
          )
        `);

      // Route by slug (new) or id (legacy)
      if (useSlug) {
        query = query.eq("slug", identifier);
      } else {
        query = query.eq("id", identifier);
      }

      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    },
    enabled: !!identifier,
  });

  // ── Products query ────────────────────────────────────────────────────────
  const { data: products } = useQuery({
    queryKey: ["coach-products", coach?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_products")
        .select("*")
        .eq("coach_id", coach!.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CoachProduct[];
    },
    enabled: !!coach?.id,
  });

  // ── Testimonials (legacy — kept for coaches without proof_points yet) ─────
  const { data: testimonials } = useQuery({
    queryKey: ["testimonials", coach?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("coach_id", coach!.id)
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!coach?.id,
  });

  // ── Derived values ────────────────────────────────────────────────────────
  const categories = coach?.coach_categories
    ?.map((cc: any) => cc.categories)
    .filter(Boolean) ?? [];

  // proof_points: use structured jsonb if available, fall back to testimonials
  const proofPoints: ProofPoint[] = Array.isArray(coach?.proof_points) && coach.proof_points.length > 0
    ? coach.proof_points as ProofPoint[]
    : [];

  const showTestimonials = proofPoints.length === 0 && testimonials && testimonials.length > 0;

  const tierCfg = coach?.tier ? TIER_CONFIG[coach.tier] : null;

  const audienceLabels = (coach?.audience ?? [])
    .map((a: string) => AUDIENCE_LABELS[a] ?? a);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Layout>
        <div className="pt-32 pb-16">
          <div className="container-wide">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-32 mb-8" />
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-muted rounded-2xl" />
                  <div className="h-48 bg-muted rounded-2xl" />
                </div>
                <div className="h-96 bg-muted rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!coach) {
    return (
      <Layout>
        <div className="pt-32 pb-16">
          <div className="container-wide text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Coach Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This coach profile doesn't exist or hasn't been published yet.
            </p>
            <Link to="/coaching">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Directory
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-28 pb-16">
        <div className="container-wide">

          {/* Back button */}
          <Link
            to="/coaching"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Coaches
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Main content ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Profile header */}
              <Card className="overflow-hidden">
                <div
                  className="h-32 bg-cover bg-center relative"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1920&auto=format&fit=crop')" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-accent/40 to-primary/30" />
                </div>
                <CardContent className="relative pt-0 pb-6">
                  <div className="flex flex-col sm:flex-row gap-6 -mt-12">
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                        {coach.avatar_url ? (
                          <img
                            src={coach.avatar_url}
                            alt={coach.display_name || "Coach"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-bold text-white">
                            {coach.display_name?.charAt(0) || "C"}
                          </span>
                        )}
                      </div>
                      {coach.is_featured && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Star className="h-4 w-4 text-primary-foreground fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 pt-4 sm:pt-8">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h1 className="text-2xl sm:text-3xl font-display font-bold">
                              {coach.display_name || "Coach"}
                            </h1>
                            {/* Tier badge — new structured field */}
                            {tierCfg && (
                              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${tierCfg.className}`}>
                                {tierCfg.label}
                              </span>
                            )}
                          </div>
                          <p className="text-lg text-muted-foreground">
                            {coach.headline || "Executive Coach"}
                          </p>
                        </div>
                        {coach.rating && coach.rating > 0 && (
                          <div className="flex items-center gap-1 text-lg">
                            <Star className="h-5 w-5 text-primary fill-current" />
                            <span className="font-semibold">{Number(coach.rating).toFixed(1)}</span>
                            <span className="text-muted-foreground">
                              ({coach.total_sessions || 0} sessions)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                        {coach.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {coach.location}
                          </span>
                        )}
                        {coach.experience_years && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {coach.experience_years}+ years experience
                          </span>
                        )}
                        {coach.timezone && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {coach.timezone}
                          </span>
                        )}
                        {/* Engagement format — new structured field */}
                        {coach.engagement_format && FORMAT_LABELS[coach.engagement_format] && (
                          <span className="flex items-center gap-1">
                            {FORMAT_LABELS[coach.engagement_format]}
                          </span>
                        )}
                      </div>

                      {/* Category tags from DB — new structured field */}
                      {categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {categories.map((cat: any) => (
                            <Badge key={cat.id} variant="secondary" className="text-xs">
                              {cat.icon && <span className="mr-1">{cat.icon}</span>}
                              {cat.name}
                            </Badge>
                          ))}
                          {/* Audience tags */}
                          {audienceLabels.map((a: string) => (
                            <Badge
                              key={a}
                              variant="outline"
                              className="text-xs border-amber-500/30 text-amber-400"
                            >
                              {a}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Positioning statement (structured) — replaces plain About */}
              {(coach.positioning_statement || coach.bio) && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-display font-semibold mb-4">About</h2>
                    {/* Pull quote style for positioning_statement */}
                    {coach.positioning_statement ? (
                      <blockquote className="border-l-2 border-primary/40 pl-4 mb-4">
                        <p className="text-base font-medium leading-relaxed italic text-foreground">
                          {coach.positioning_statement}
                        </p>
                      </blockquote>
                    ) : null}
                    {/* Bio shown below if different from positioning_statement */}
                    {coach.bio && coach.bio !== coach.positioning_statement && (
                      <p className="text-muted-foreground leading-relaxed">
                        {coach.bio}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Methodology (structured) — replaces Coaching Philosophy */}
              {(coach.methodology || coach.coaching_philosophy) && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-display font-semibold mb-4">Methodology</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {coach.methodology || coach.coaching_philosophy}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* ── Products / Offerings ───────────────────────────── */}
              {products && products.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-display font-semibold mb-6">
                      Work With {coach.display_name?.split(" ")[0] || "Me"}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          coachName={coach.display_name ?? undefined}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Background & Experience — unchanged */}
              {(coach.coach_background || coach.coaching_experience_level || coach.leadership_experience_years) && (
                <Card>
                  <CardContent className="p-6 space-y-3">
                    <h2 className="text-xl font-display font-semibold mb-4">Background & Experience</h2>
                    {coach.coach_background && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span className="font-medium">Background:</span>
                        <span className="text-muted-foreground">{coach.coach_background}</span>
                      </div>
                    )}
                    {coach.coaching_experience_level && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="font-medium">Level:</span>
                        <Badge variant="secondary">{coach.coaching_experience_level}</Badge>
                      </div>
                    )}
                    {coach.leadership_experience_years && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">Leadership Experience:</span>
                        <span className="text-muted-foreground">{coach.leadership_experience_years}</span>
                      </div>
                    )}
                    {coach.current_role && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span className="font-medium">Current Role:</span>
                        <span className="text-muted-foreground">{coach.current_role}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Specialties — unchanged, reads pillar_specialties → specialties */}
              {coach.pillar_specialties?.length > 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-display font-semibold mb-4">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {coach.pillar_specialties.map((s: string, i: number) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className={`px-3 py-1 ${s.includes("Sport of Business") ? "bg-primary/10 text-primary border-primary/20" : ""}`}
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : coach.specialties?.length > 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-display font-semibold mb-4">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {coach.specialties.map((s: string, i: number) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1">{s}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Coaching Style & Framework — unchanged */}
              {(coach.coaching_style || coach.signature_framework) && (
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {coach.coaching_style && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-primary" />
                          Coaching Style
                        </h3>
                        <p className="text-muted-foreground">{coach.coaching_style}</p>
                      </div>
                    )}
                    {coach.signature_framework && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          Signature Framework
                        </h3>
                        <p className="text-muted-foreground">{coach.signature_framework}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Proof Points (structured jsonb) — new, replaces raw testimonials */}
              {proofPoints.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-display font-semibold mb-6">Proof Points</h2>
                    <div className="space-y-6">
                      {proofPoints.map((p, i) => (
                        <div key={i} className="relative pl-6 border-l-2 border-primary/30">
                          <p className="text-muted-foreground italic mb-3">"{p.quote}"</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {p.name?.charAt(0) ?? "?"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{p.name}</p>
                              {(p.role || p.company) && (
                                <p className="text-xs text-muted-foreground">
                                  {[p.role, p.company].filter(Boolean).join(" · ")}
                                </p>
                              )}
                            </div>
                          </div>
                          {p.outcome && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <span className="text-xs font-medium text-primary">Outcome: </span>
                              <span className="text-xs text-muted-foreground">{p.outcome}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Legacy testimonials — shown only when proof_points are not yet populated */}
              {showTestimonials && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-display font-semibold mb-6">Client Testimonials</h2>
                    <div className="space-y-6">
                      {testimonials!.map((t) => (
                        <div key={t.id} className="relative pl-6 border-l-2 border-primary/30">
                          <p className="text-muted-foreground italic mb-3">"{t.content}"</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {t.client_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{t.client_name}</p>
                              {(t.client_title || t.client_company) && (
                                <p className="text-xs text-muted-foreground">
                                  {[t.client_title, t.client_company].filter(Boolean).join(" at ")}
                                </p>
                              )}
                            </div>
                            {t.rating && (
                              <div className="ml-auto flex items-center gap-1">
                                {[...Array(t.rating)].map((_: any, i: number) => (
                                  <Star key={i} className="h-3 w-3 text-primary fill-current" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── Sidebar ────────────────────────────────────────────────── */}
            <div className="space-y-6">

              {/* Booking card — unchanged */}
              <Card className="sticky top-28">
                <CardContent className="p-6">
                  {coach.hourly_rate && (
                    <div className="text-center mb-6">
                      <span className="text-3xl font-display font-bold">${coach.hourly_rate}</span>
                      <span className="text-muted-foreground">/session</span>
                    </div>
                  )}
                  <div className="space-y-3 mb-6">
                    {coach.booking_url ? (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => {
                          supabase.from("booking_click_events").insert({
                            coach_id: coach.id,
                            user_id: currentUserIdRef.current,
                            session_id: null,
                          }).then(({ error }) => {
                            if (error) console.error("booking_click_events insert failed:", error);
                          });
                          window.open(coach.booking_url!, "_blank", "noopener,noreferrer");
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Book a Session
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        Booking link coming soon
                      </p>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => setIsMessageModalOpen(true)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  {/* Quick info */}
                  <div className="space-y-4 text-sm">
                    {/* Audience — new structured field */}
                    {audienceLabels.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Works With</p>
                          <p className="text-muted-foreground">{audienceLabels.join(", ")}</p>
                        </div>
                      </div>
                    )}
                    {coach.languages?.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Languages</p>
                          <p className="text-muted-foreground">{coach.languages.join(", ")}</p>
                        </div>
                      </div>
                    )}
                    {coach.total_sessions > 0 && (
                      <div className="flex items-start gap-3">
                        <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Sessions Completed</p>
                          <p className="text-muted-foreground">{coach.total_sessions}+</p>
                        </div>
                      </div>
                    )}
                    {coach.is_enterprise_ready && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Enterprise Ready</p>
                          <p className="text-muted-foreground">Available for corporate engagements</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* External links — unchanged */}
                  <div className="flex justify-center gap-4">
                    {coach.linkedin_url && (
                      <a href={coach.linkedin_url} target="_blank" rel="noopener noreferrer"
                         className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {coach.website_url && (
                      <a href={coach.website_url} target="_blank" rel="noopener noreferrer"
                         className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Trust signals — unchanged */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Why Choose This Coach</h3>
                  <div className="space-y-3">
                    {[
                      "Vetted by Galoras team",
                      "Background verified",
                      "Secure booking & payments",
                      "Satisfaction guaranteed",
                    ].map((t) => (
                      <div key={t} className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <MessageCoachModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        coachId={coach?.id || ""}
        coachName={coach?.display_name || "Coach"}
        coachUserId={coach?.user_id || ""}
      />
    </Layout>
  );
}
