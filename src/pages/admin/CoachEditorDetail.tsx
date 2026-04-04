import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";

export default function CoachEditorDetail() {
  const { id } = useParams();

  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [debugError, setDebugError] = useState("");

  useEffect(() => {
    fetchCoach();
  }, [id]);

  const fetchCoach = async () => {
    setLoading(true);
    setDebugError("");

    if (!id) {
      setDebugError("Missing ID");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("coaches")
      .select(`
        id,
        display_name,
        email,
        headline,
        bio,
        positioning_statement,
        methodology,
        slug,
        status,
        lifecycle_status
      `)
      .eq("id", id)
      .single();

    if (error) {
      setDebugError(JSON.stringify(error));
      setCoach(null);
      setLoading(false);
      return;
    }

    setCoach(data);
    setLoading(false);
  };

  const updateCoach = async () => {
    if (!coach) return;

    setSaving(true);

    const { error } = await supabase
      .from("coaches")
      .update({
        display_name: coach.display_name,
        headline: coach.headline,
        bio: coach.bio,
        positioning_statement: coach.positioning_statement,
        methodology: coach.methodology,
        slug: coach.slug,
        status: coach.status,
        lifecycle_status: coach.lifecycle_status,
      })
      .eq("id", coach.id);

    setSaving(false);

    if (error) {
      console.error(error);
      alert("Update failed");
      return;
    }

    alert("Saved!");
    fetchCoach();
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 40 }}>Loading...</div>
      </Layout>
    );
  }

  if (!coach) {
    return (
      <Layout>
        <div style={{ padding: 40 }}>
          <div style={{ marginBottom: 16 }}>
            <Link to="/admin/coaches">← Back to Coaches</Link>
          </div>
          <div>Coach NOT FOUND</div>
          <div>ID: {id}</div>
          <pre>{debugError}</pre>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: 40, maxWidth: 800 }}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/admin/coaches">← Back to Coaches</Link>
        </div>

        <h2 style={{ marginBottom: 8 }}>{coach.display_name || "Unnamed Coach"}</h2>
        <p style={{ marginTop: 0 }}>{coach.email}</p>

        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 6 }}>Display Name</div>
          <input
            value={coach.display_name || ""}
            onChange={(e) =>
              setCoach({ ...coach, display_name: e.target.value })
            }
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 16,
              background: "#fff",
              color: "#000",
              border: "1px solid #ccc",
            }}
          />

          <div style={{ marginBottom: 6 }}>Headline</div>
          <input
            value={coach.headline || ""}
            onChange={(e) =>
              setCoach({ ...coach, headline: e.target.value })
            }
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 16,
              background: "#fff",
              color: "#000",
              border: "1px solid #ccc",
            }}
          />

          <div style={{ marginBottom: 6 }}>Slug</div>
          <input
            value={coach.slug || ""}
            onChange={(e) =>
              setCoach({
                ...coach,
                slug: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "-"),
              })
            }
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 16,
              background: "#fff",
              color: "#000",
              border: "1px solid #ccc",
            }}
          />

          <div style={{ marginBottom: 6 }}>Status</div>
          <select
            value={coach.status || "pending"}
            onChange={(e) =>
              setCoach({ ...coach, status: e.target.value })
            }
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 16,
              background: "#fff",
              color: "#000",
              border: "1px solid #ccc",
            }}
          >
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>

          <div style={{ marginBottom: 6 }}>Lifecycle Status</div>
          <select
            value={coach.lifecycle_status || "draft"}
            onChange={(e) =>
              setCoach({ ...coach, lifecycle_status: e.target.value })
            }
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 16,
              background: "#fff",
              color: "#000",
              border: "1px solid #ccc",
            }}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>

          <div style={{ marginBottom: 6 }}>Bio</div>
          <textarea
            value={coach.bio || ""}
            onChange={(e) =>
              setCoach({ ...coach, bio: e.target.value })
            }
            rows={5}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 16,
              background: "#fff",
              color: "#000",
              border: "1px solid #ccc",
              resize: "vertical",
            }}
          />

          <div style={{ marginBottom: 6 }}>Positioning Statement</div>
          <textarea
            value={coach.positioning_statement || ""}
            onChange={(e) =>
              setCoach({ ...coach, positioning_statement: e.target.value })
            }
            rows={4}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 16,
              background: "#fff",
              color: "#000",
              border: "1px solid #ccc",
              resize: "vertical",
            }}
          />

          <div style={{ marginBottom: 6 }}>Methodology</div>
          <textarea
            value={coach.methodology || ""}
            onChange={(e) =>
              setCoach({ ...coach, methodology: e.target.value })
            }
            rows={4}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 20,
              background: "#fff",
              color: "#000",
              border: "1px solid #ccc",
              resize: "vertical",
            }}
          />

          <button
            onClick={updateCoach}
            disabled={saving}
            style={{
              padding: "10px 16px",
              background: "#38bdf8",
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Layout>
  );
}