import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, Sparkles, UserCircle2, ArrowRight, CalendarCheck, GitCompareArrows, X, SlidersHorizontal, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContactModal } from "@/components/coaching/ContactModal";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/hooks/useAuth";
import { useProductTypes } from "@/hooks/useProductTypes";
import { useTags } from "@/hooks/useTags";

// ── Types ─────────────────────────────────────────────────────────────────────

type PublicCoach = {
  id: string;
  slug: string | null;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  specialties: string[] | null;
  audience: string[] | null;
  avatar_url: string | null;
  booking_url: string | null;
  tier: string | null;
  coach_products?: {
    product_type: string;
    title: string;
    price_type: string;
    price_amount: number | null;
    enterprise_ready: boolean;
  }[] | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Toggle a value in/out of a multi-select set */
function toggle(set: string[], value: string): string[] {
  return set.includes(value) ? set.filter(v => v !== value) : [...set, value];
}

/** Format price for card display */
function priceAnchor(products: PublicCoach["coach_products"]): string | null {
  if (!products || products.length === 0) return null;
  const fixed = products
    .filter(p => p.price_type === "fixed" && p.price_amount)
    .map(p => p.price_amount!);
  if (fixed.length === 0) return null;
  const min = Math.min(...fixed);
  return `From $${(min / 100).toLocaleString()}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CoachingDirectory() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  const matchedParam = searchParams.get("matched") === "1";

  const [searchQuery, setSearchQuery] = useState("");

  // Multi-select filters
  const [selProductTypes, setSelProductTypes] = useState<string[]>([]);
  const [selSpecialties, setSelSpecialties] = useState<string[]>(
    filterParam ? [filterParam] : []
  );
  const [selAudience, setSelAudience] = useState<string[]>([]);
  const [selOutcomes, setSelOutcomes] = useState<string[]>([]);
  const [selFormats, setSelFormats] = useState<string[]>([]);
  const [enterpriseOnly, setEnterpriseOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [contactCoach, setContactCoach] = useState<{ id: string; name: string } | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const { isLoggedIn, profile } = useAuth();
  const navigate = useNavigate();
  const { types: productTypes, getConfig } = useProductTypes();
  const { getTagsByFamily } = useTags();

  const specialtyTags = getTagsByFamily("specialty");
  const audienceTags  = getTagsByFamily("audience");
  const outcomeTags   = getTagsByFamily("outcome");
  const formatTags    = getTagsByFamily("format");

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const activeFilterCount =
    selProductTypes.length + selSpecialties.length + selAudience.length +
    selOutcomes.length + selFormats.length + (enterpriseOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelProductTypes([]);
    setSelSpecialties([]);
    setSelAudience([]);
    setSelOutcomes([]);
    setSelFormats([]);
    setEnterpriseOnly(false);
    setSearchQuery("");
  };

  // ── Data ───────────────────────────────────────────────────────────────────

  const { data: coaches, isLoading, error } = useQuery({
    queryKey: ["public-coaches-directory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, slug, display_name, headline, bio, specialties, audience, avatar_url, booking_url, tier, coach_products(product_type, title, price_type, price_amount, enterprise_ready)")
        .eq("lifecycle_status", "published")
        .order("display_name", { ascending: true });
      if (error) throw error;
      return (data || []) as PublicCoach[];
    },
  });

  const { data: coachTagData } = useQuery({
    queryKey: ["coach-tag-map-directory"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("coach_tag_map")
        .select("coach_id, tags(tag_key, tag_label, tag_family)");
      return data || [];
    },
  });

  const coachTagLookup = useMemo(() => {
    const map: Record<string, { tag_key: string; tag_label: string; tag_family: string }[]> = {};
    (coachTagData || []).forEach((row: any) => {
      if (!map[row.coach_id]) map[row.coach_id] = [];
      if (row.tags) map[row.coach_id].push(row.tags);
    });
    return map;
  }, [coachTagData]);

  // Build a set of all tag labels for search matching
  const allTagLabels = useMemo(() => {
    const labels: Record<string, string[]> = {};
    (coachTagData || []).forEach((row: any) => {
      if (!row.tags) return;
      if (!labels[row.coach_id]) labels[row.coach_id] = [];
      labels[row.coach_id].push(row.tags.tag_label.toLowerCase());
    });
    return labels;
  }, [coachTagData]);

  const matchScore = (coach: PublicCoach): number => {
    if (!profile?.coaching_areas || profile.coaching_areas.length === 0) return 0;
    const userAreas = profile.coaching_areas.map((a) => a.toLowerCase());
    return (coach.specialties || []).filter((s) =>
      userAreas.includes(s.toLowerCase())
    ).length;
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  // AND across categories, OR within category

  const filtered = (coaches || [])
    .filter((coach) => {
      // Search: match name, headline, bio, specialties, AND tag labels
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const textFields = [coach.display_name, coach.headline, coach.bio, ...(coach.specialties || [])]
          .join(" ")
          .toLowerCase();
        const tagLabels = (allTagLabels[coach.id] || []).join(" ");
        if (!textFields.includes(q) && !tagLabels.includes(q)) return false;
      }

      // Product type filter (OR within)
      if (selProductTypes.length > 0) {
        const coachTypes = (coach.coach_products || []).map(p => p.product_type);
        if (!selProductTypes.some(t => coachTypes.includes(t))) return false;
      }

      // Enterprise toggle
      if (enterpriseOnly) {
        const hasEnterprise = (coach.coach_products || []).some(p => p.enterprise_ready);
        if (!hasEnterprise) return false;
      }

      // Tag-based filters: check coach_tag_map
      const coachTags = coachTagLookup[coach.id] || [];

      if (selSpecialties.length > 0) {
        const coachSpecKeys = coachTags.filter(t => t.tag_family === "specialty").map(t => t.tag_key);
        // Also check legacy specialties array
        const legacySpecs = (coach.specialties || []).map(s => s.toLowerCase());
        if (!selSpecialties.some(s => coachSpecKeys.includes(s) || legacySpecs.includes(s))) return false;
      }

      if (selAudience.length > 0) {
        const coachAudKeys = coachTags.filter(t => t.tag_family === "audience").map(t => t.tag_key);
        if (!selAudience.some(a => coachAudKeys.includes(a))) return false;
      }

      if (selOutcomes.length > 0) {
        const coachOutKeys = coachTags.filter(t => t.tag_family === "outcome").map(t => t.tag_key);
        if (!selOutcomes.some(o => coachOutKeys.includes(o))) return false;
      }

      if (selFormats.length > 0) {
        const coachFmtKeys = coachTags.filter(t => t.tag_family === "format").map(t => t.tag_key);
        if (!selFormats.some(f => coachFmtKeys.includes(f))) return false;
      }

      return true;
    })
    .sort((a, b) => matchScore(b) - matchScore(a));

  const hasProfile = isLoggedIn && profile?.onboarding_complete;
  const hasMatches = isLoggedIn && profile?.coaching_areas && profile.coaching_areas.length > 0;

  const coachProfilePath = (coach: PublicCoach) =>
    coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`;

  // ── Filter chip component ─────────────────────────────────────────────────

  function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
          active
            ? "bg-primary border-primary text-zinc-950"
            : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
        }`}
      >
        {label}
      </button>
    );
  }

  function FilterRow({ label, tags, selected, onToggle }: {
    label: string;
    tags: { tag_key: string; tag_label: string }[];
    selected: string[];
    onToggle: (key: string) => void;
  }) {
    if (tags.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mr-1 w-20 shrink-0">{label}</span>
        {tags.map(t => (
          <FilterChip
            key={t.tag_key}
            label={t.tag_label}
            active={selected.includes(t.tag_key)}
            onClick={() => onToggle(t.tag_key)}
          />
        ))}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="pt-28 pb-14 bg-zinc-950">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white uppercase mb-4">
              Find a Coach for{" "}
              <span className="text-primary">Where You Are</span>
            </h1>
            <p className="text-zinc-400 text-base mb-8 max-w-xl mx-auto">
              Every coach on Galoras has performed at the level you're trying to reach. No generic advice — only people who've been in the room.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search by name, specialty, or outcome..."
                className="pl-11 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 h-12 text-sm focus-visible:ring-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Compass nudge */}
            <Link
              to="/compass"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-primary transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Not sure who you need? Let Compass match you
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="bg-zinc-900 border-y border-zinc-800">
        <div className="container-wide py-3">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-xs text-zinc-500">
            <span>Vetted by Galoras</span>
            <span className="text-zinc-700">·</span>
            <span>Matched to your goals</span>
            <span className="text-zinc-700">·</span>
            <span>Real-world execution experience</span>
            <span className="text-zinc-700">·</span>
            <span>Book directly — no gatekeeping</span>
          </div>
        </div>
      </div>

      {/* ── Directory ── */}
      <section className="min-h-screen bg-zinc-950 py-10 pb-24">
        <div className="container-wide">

          {/* Profile nudge */}
          {!hasProfile && (
            <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-primary/5 border border-primary/20 max-w-2xl mx-auto">
              <UserCircle2 className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm text-zinc-300">
                {isLoggedIn
                  ? "Complete your profile to see coaches matched to your goals."
                  : "Create a free profile to see coaches matched to your goals."}
              </p>
              <button
                onClick={() => navigate(isLoggedIn ? "/onboarding" : "/signup")}
                className="ml-auto text-xs font-semibold text-primary hover:underline whitespace-nowrap"
              >
                {isLoggedIn ? "Complete profile →" : "Get started →"}
              </button>
            </div>
          )}

          {/* Matched banner */}
          {matchedParam && (
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-2xl">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">
                Coaches matched to your context.
              </p>
              <button
                onClick={() => { clearAllFilters(); navigate("/coaching", { replace: true }); }}
                className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 whitespace-nowrap"
              >
                Clear match
              </button>
            </div>
          )}

          {/* ── Filter bar ── */}
          <div className="mb-8 space-y-3">

            {/* Top row: product types + enterprise toggle + filter toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mr-1 w-20 shrink-0">Offering</span>
              {productTypes.map(pt => (
                <FilterChip
                  key={pt.slug}
                  label={pt.label}
                  active={selProductTypes.includes(pt.slug)}
                  onClick={() => setSelProductTypes(toggle(selProductTypes, pt.slug))}
                />
              ))}

              {/* Enterprise toggle */}
              <button
                onClick={() => setEnterpriseOnly(!enterpriseOnly)}
                className={`ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  enterpriseOnly
                    ? "bg-orange-500 border-orange-500 text-zinc-950"
                    : "border-zinc-700 text-zinc-400 hover:border-orange-500/50 hover:text-orange-400"
                }`}
              >
                <Building2 className="h-3 w-3" />
                Enterprise
              </button>

              {/* Expand filters */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filtersOpen
                    ? "border-primary text-primary"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-zinc-500 hover:text-zinc-300 underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Expanded filter rows */}
            {filtersOpen && (
              <div className="space-y-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <FilterRow
                  label="Specialty"
                  tags={specialtyTags}
                  selected={selSpecialties}
                  onToggle={k => setSelSpecialties(toggle(selSpecialties, k))}
                />
                <FilterRow
                  label="Audience"
                  tags={audienceTags}
                  selected={selAudience}
                  onToggle={k => setSelAudience(toggle(selAudience, k))}
                />
                <FilterRow
                  label="Outcome"
                  tags={outcomeTags}
                  selected={selOutcomes}
                  onToggle={k => setSelOutcomes(toggle(selOutcomes, k))}
                />
                <FilterRow
                  label="Format"
                  tags={formatTags}
                  selected={selFormats}
                  onToggle={k => setSelFormats(toggle(selFormats, k))}
                />
              </div>
            )}
          </div>

          {/* Results count */}
          {!isLoading && !error && (
            <p className="text-xs text-zinc-600 mb-6">
              {filtered.length} coach{filtered.length !== 1 ? "es" : ""} available
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-zinc-500 text-sm">Loading coaches...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 text-sm">Failed to load coaches.</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-500 text-sm mb-4">No coaches match your filters.</p>
              <button
                onClick={clearAllFilters}
                className="text-primary text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((coach) => {
                const score = matchScore(coach);
                const profilePath = coachProfilePath(coach);
                const price = priceAnchor(coach.coach_products);
                const featuredProduct = coach.coach_products?.[0];
                const hasEnterprise = (coach.coach_products || []).some(p => p.enterprise_ready);
                const coachTags = coachTagLookup[coach.id] || [];
                const audienceLabels = coachTags.filter(t => t.tag_family === "audience").slice(0, 2);
                const outcomeLabels = coachTags.filter(t => t.tag_family === "outcome").slice(0, 2);

                return (
                  <div
                    key={coach.id}
                    className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-primary/40 transition-all duration-200 flex flex-col"
                  >
                    {/* Photo */}
                    <Link to={profilePath} className="relative bg-zinc-800 block" style={{ height: "260px" }}>
                      {coach.avatar_url ? (
                        <img
                          src={coach.avatar_url}
                          alt={coach.display_name || "Coach"}
                          className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl font-bold text-zinc-600">
                            {(coach.display_name || "C").charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />

                      {/* Badges: top-right */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                        {hasMatches && score > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                            <Sparkles className="h-3 w-3" />
                            Matched
                          </span>
                        )}
                        {hasEnterprise && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 backdrop-blur-sm">
                            <Building2 className="h-3 w-3" />
                            Enterprise
                          </span>
                        )}
                      </div>

                      {/* Price anchor: bottom-left */}
                      {price && (
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-950/80 text-white backdrop-blur-sm border border-zinc-700/50">
                            {price}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <Link to={profilePath}>
                        <h3 className="text-base font-bold text-white leading-tight mb-1 hover:text-primary transition-colors">
                          {coach.display_name || "Coach"}
                        </h3>
                      </Link>

                      {coach.headline && (
                        <p className="text-zinc-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                          {coach.headline}
                        </p>
                      )}

                      {/* Featured product */}
                      {featuredProduct && (
                        <div className="mb-3 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
                          <div className="flex items-center gap-2 mb-0.5">
                            {(() => {
                              const { label, className } = getConfig(featuredProduct.product_type);
                              return (
                                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${className}`}>
                                  {label}
                                </span>
                              );
                            })()}
                          </div>
                          <p className="text-xs text-zinc-300 font-medium line-clamp-1">{featuredProduct.title}</p>
                        </div>
                      )}

                      {/* Tags: audience + outcome */}
                      {(audienceLabels.length > 0 || outcomeLabels.length > 0) && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {audienceLabels.map(t => (
                            <span key={t.tag_key}
                              className="px-2 py-0.5 text-[10px] rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                              {t.tag_label}
                            </span>
                          ))}
                          {outcomeLabels.map(t => (
                            <span key={t.tag_key}
                              className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              {t.tag_label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Specialty tags (legacy) */}
                      {coach.specialties && coach.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {coach.specialties.slice(0, 2).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-500 text-xs capitalize"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTAs */}
                      <div className="flex gap-2 mt-auto pt-3 border-t border-zinc-800">
                        <Link to={profilePath} className="flex-1">
                          <Button className="w-full bg-primary hover:bg-primary/90 text-zinc-950 text-xs font-bold h-9 rounded-lg gap-1.5">
                            <CalendarCheck className="h-3.5 w-3.5" />
                            View & Book
                          </Button>
                        </Link>

                        <button
                          onClick={() => toggleCompare(coach.id)}
                          title={compareList.includes(coach.id) ? "Remove from compare" : "Add to compare"}
                          className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
                            compareList.includes(coach.id)
                              ? "border-amber-500 bg-amber-500/10 text-amber-400"
                              : "border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400"
                          }`}
                        >
                          <GitCompareArrows className="h-3.5 w-3.5" />
                        </button>

                        <AuthGate isLoggedIn={isLoggedIn} message="Sign in to message coaches">
                          <button
                            onClick={() =>
                              setContactCoach({ id: coach.id, name: coach.display_name || "Coach" })
                            }
                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-700 text-zinc-400 hover:border-primary/50 hover:text-primary transition-colors"
                            title="Send a message"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                        </AuthGate>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {contactCoach && (
        <ContactModal
          coachId={contactCoach.id}
          coachName={contactCoach.name}
          onClose={() => setContactCoach(null)}
        />
      )}

      {/* ── Floating Compare Tray ── */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#0a1628] border border-amber-500/40 shadow-2xl shadow-black/60 backdrop-blur-sm">
            <GitCompareArrows className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-sm text-slate-300 font-medium">
              {compareList.length} coach{compareList.length !== 1 ? "es" : ""} selected
              {compareList.length < 2 && (
                <span className="text-slate-500 ml-1">(select at least 2)</span>
              )}
            </span>

            <button
              onClick={() => navigate(`/coaching/compare?ids=${compareList.join(",")}`)}
              disabled={compareList.length < 2}
              className="ml-2 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Compare
            </button>

            <button
              onClick={() => setCompareList([])}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
              title="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
