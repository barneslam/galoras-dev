import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

type Coach = {
  id: string;
  display_name: string | null;
  headline: string | null;
  positioning_statement: string | null;
  specialty: string | null;
  experience_level: string | null;
  linkedin_profile: string | null;
};

const SPECIALTIES = [
  "Executive Coaching",
  "Leadership Coaching",
  "Career Coaching",
  "Performance Coaching",
  "Team Coaching",
  "Life Coaching",
  "Business Coaching",
];

const EXPERIENCE_LEVELS = [
  { value: "1-3", label: "1-3 Years" },
  { value: "3-5", label: "3-5 Years" },
  { value: "5-10", label: "5-10 Years" },
  { value: "10+", label: "10+ Years" },
];

export default function CoachesAdmin() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selected, setSelected] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("coaches")
      .select("id, display_name, headline, positioning_statement, specialty, experience_level, linkedin_profile")
      .order("display_name", { ascending: true });

    if (error) {
      console.error(error);
      setCoaches([]);
      setLoading(false);
      return;
    }

    setCoaches((data || []) as Coach[]);
    setLoading(false);
  };

  const save = async () => {
    if (!selected) return;

    setSaving(true);

    const { error } = await supabase
      .from("coaches")
      .update({
        display_name: selected.display_name,
        headline: selected.headline,
        positioning_statement: selected.positioning_statement,
        specialty: selected.specialty,
        experience_level: selected.experience_level,
        linkedin_profile: selected.linkedin_profile,
      })
      .eq("id", selected.id);

    if (error) {
      console.error(error);
      alert("Failed to save");
      setSaving(false);
      return;
    }

    alert("Saved successfully");
    await load();
    setSaving(false);
  };

  return (
    <AdminLayout>
      <section className="p-6 md:p-8 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 border-b border-primary pb-6">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 uppercase">
              Admin – Coaches
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage coach profiles, verify credentials, and edit display content
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            {/* Coach List Section */}
            <div className="rounded-md border-2 border-primary bg-card p-6 h-fit">
              <h2 className="text-lg font-display font-bold mb-4 uppercase text-primary">
                Coaches ({coaches.length})
              </h2>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading coaches...</p>
              ) : coaches.length > 0 ? (
                <div className="space-y-2">
                  {coaches.map((coach) => {
                    const active = selected?.id === coach.id;

                    return (
                      <button
                        key={coach.id}
                        type="button"
                        onClick={() => setSelected(coach)}
                        className={`w-full text-left rounded-md border-2 px-4 py-3 transition ${
                          active
                            ? "border-primary bg-primary/15"
                            : "border-secondary bg-transparent hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        <div className="font-medium text-sm">
                          {coach.display_name || "Unnamed Coach"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {coach.specialty || "No specialty"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No coaches found.</p>
              )}
            </div>

            {/* Edit Form Section */}
            <div className="rounded-md border-2 border-primary bg-card p-8">
              <h2 className="text-lg font-display font-bold mb-6 uppercase text-primary">
                Edit Coach Profile
              </h2>

              {selected ? (
                <div className="space-y-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-display font-bold mb-2 uppercase tracking-wide">
                      Display Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border-2 border-secondary bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      value={selected.display_name || ""}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          display_name: e.target.value,
                        })
                      }
                      placeholder="Coach name"
                    />
                  </div>

                  {/* Specialty & Experience Level */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-display font-bold mb-2 uppercase tracking-wide">
                        Specialty
                      </label>
                      <select
                        className="w-full rounded-md border-2 border-secondary bg-background px-4 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-foreground"
                        value={selected.specialty || ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            specialty: e.target.value,
                          })
                        }
                      >
                        <option value="">Select specialty...</option>
                        {SPECIALTIES.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-2">
                        Coach's primary focus area
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-display font-bold mb-2 uppercase tracking-wide">
                        Experience Level
                      </label>
                      <select
                        className="w-full rounded-md border-2 border-secondary bg-background px-4 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-foreground"
                        value={selected.experience_level || ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            experience_level: e.target.value,
                          })
                        }
                      >
                        <option value="">Select level...</option>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-2">
                        Years of coaching experience
                      </p>
                    </div>
                  </div>

                  {/* LinkedIn Profile */}
                  <div className="border-t border-secondary/30 pt-6">
                    <label className="block text-xs font-display font-bold mb-2 uppercase tracking-wide">
                      LinkedIn Profile
                    </label>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <input
                          type="url"
                          className="w-full rounded-md border-2 border-secondary bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                          value={selected.linkedin_profile || ""}
                          onChange={(e) =>
                            setSelected({
                              ...selected,
                              linkedin_profile: e.target.value,
                            })
                          }
                          placeholder="https://linkedin.com/in/coach-name"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          LinkedIn URL for coach verification & research
                        </p>
                      </div>
                      {selected.linkedin_profile && (
                        <a
                          href={selected.linkedin_profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-3 rounded-md bg-[#0A66C2] text-white hover:bg-[#0951A5] transition font-display font-bold text-xs uppercase tracking-wide whitespace-nowrap"
                        >
                          <ExternalLink size={16} />
                          View
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block text-xs font-display font-bold mb-2 uppercase tracking-wide">
                      Headline
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border-2 border-secondary bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      value={selected.headline || ""}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          headline: e.target.value,
                        })
                      }
                      placeholder="Coach headline"
                      maxLength={120}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Displayed on coach profile ({selected.headline?.length || 0}/120)
                    </p>
                  </div>

                  {/* Positioning Statement */}
                  <div>
                    <label className="block text-xs font-display font-bold mb-2 uppercase tracking-wide">
                      Positioning Statement
                    </label>
                    <textarea
                      className="w-full min-h-[160px] rounded-md border-2 border-secondary bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-vertical"
                      value={selected.positioning_statement || ""}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          positioning_statement: e.target.value,
                        })
                      }
                      placeholder="Coach biography and positioning"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Full coach biography (displayed on Galoras)
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-secondary/30">
                    <Button
                      onClick={save}
                      disabled={saving}
                      className="bg-primary text-primary-foreground hover:bg-primary/80 px-6"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setSelected(null)}
                      disabled={saving}
                      className="border-2 border-primary text-primary hover:bg-primary/10"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Select a coach from the left to edit profile content.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}