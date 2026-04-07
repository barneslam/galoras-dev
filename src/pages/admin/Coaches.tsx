import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Coach = {
  id: string;
  display_name: string | null;
  headline: string | null;
  positioning_statement: string | null;
};

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
      .select("id, display_name, headline, positioning_statement")
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
      })
      .eq("id", selected.id);

    if (error) {
      console.error(error);
      alert("Failed to save");
      setSaving(false);
      return;
    }

    alert("Saved");
    await load();
    setSaving(false);
  };

  return (
    <AdminLayout>
      <section className="p-6">
        <div className="container-wide">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                Admin – Coaches
              </h1>
              <p className="text-muted-foreground">
                Edit coach display content for profile review and sign-off.
              </p>
            </div>

            <div className="grid md:grid-cols-[280px_1fr] gap-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Coach List</h2>

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
                          className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                            active
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background hover:border-primary/40"
                          }`}
                        >
                          <div className="font-medium">
                            {coach.display_name || "Unnamed Coach"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {coach.headline || "No headline"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No coaches found.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Edit Coach</h2>

                {selected ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Display Name
                      </label>
                      <input
                        className="w-full rounded-lg border border-border bg-background px-3 py-2"
                        value={selected.display_name || ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            display_name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Headline
                      </label>
                      <input
                        className="w-full rounded-lg border border-border bg-background px-3 py-2"
                        value={selected.headline || ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            headline: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Positioning Statement
                      </label>
                      <textarea
                        className="w-full min-h-[180px] rounded-lg border border-border bg-background px-3 py-2"
                        value={selected.positioning_statement || ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            positioning_statement: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={save} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setSelected(null)}
                        disabled={saving}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a coach from the left to edit profile content.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}