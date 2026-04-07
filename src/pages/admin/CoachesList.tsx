import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

type CoachRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  headline?: string | null;
  status?: string | null;
  lifecycle_status?: string | null;
};

export default function CoachesList() {
  const [coaches, setCoaches] = useState<CoachRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState("");
  const [filter, setFilter] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    setLoading(true);
    setDebugError("");

    const { data, error } = await supabase
      .from("coaches")
      .select("id, display_name, email, headline, status, lifecycle_status")
      .order("display_name", { ascending: true });

    if (error) {
      console.error(error);
      setDebugError(JSON.stringify(error));
      setCoaches([]);
      setLoading(false);
      return;
    }

    setCoaches((data as CoachRow[]) || []);
    setLoading(false);
  };

  const updateCoachQuick = async (
    id: string,
    updates: Partial<CoachRow>
  ) => {
    setSavingId(id);

    const { error } = await supabase
      .from("coaches")
      .update(updates)
      .eq("id", id);

    setSavingId(null);

    if (error) {
      console.error(error);
      alert("Update failed");
      return;
    }

    fetchCoaches();
  };

  const filteredCoaches = coaches.filter((coach) => {
    if (filter === "all") return true;
    if (filter === "pending") return coach.status === "pending";
    if (filter === "approved") return coach.status === "approved";
    if (filter === "published") {
      return (
        coach.status === "approved" &&
        coach.lifecycle_status === "published"
      );
    }
    if (filter === "draft") return coach.lifecycle_status === "draft";
    return true;
  });

  const buttonStyle = {
    padding: "6px 10px",
    border: "1px solid #999",
    borderRadius: "4px",
    background: "#f5f5f5",
    color: "#000",
    cursor: "pointer",
    fontSize: "12px",
  } as const;

  return (
    <AdminLayout>
      <div style={{ padding: 40 }}>
        <h1 style={{ marginBottom: 24 }}>Coaches</h1>

        <div style={{ marginBottom: 20 }}>
          <label style={{ marginRight: 12 }}>Filter</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: 8,
              background: "#fff",
              color: "#000",
              border: "1px solid #ccc",
            }}
          >
            <option value="all">all</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="published">published</option>
            <option value="draft">draft</option>
          </select>
        </div>

        {loading && <div>Loading...</div>}

        {!loading && debugError && (
          <pre style={{ whiteSpace: "pre-wrap", color: "tomato" }}>
            {debugError}
          </pre>
        )}

        {!loading && !debugError && filteredCoaches.length === 0 && (
          <div>No coaches found.</div>
        )}

        {!loading && !debugError && filteredCoaches.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
                color: "black",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Headline
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Lifecycle
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Quick Actions
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCoaches.map((coach) => (
                  <tr key={coach.id}>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {coach.display_name || "Unnamed Coach"}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {coach.email || "-"}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {coach.headline || "-"}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {coach.status || "pending"}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {coach.lifecycle_status || "draft"}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          style={buttonStyle}
                          onClick={() =>
                            updateCoachQuick(coach.id, { status: "approved" })
                          }
                          disabled={savingId === coach.id}
                        >
                          Approve
                        </button>

                        <button
                          style={buttonStyle}
                          onClick={() =>
                            updateCoachQuick(coach.id, { status: "rejected" })
                          }
                          disabled={savingId === coach.id}
                        >
                          Reject
                        </button>

                        <button
                          style={buttonStyle}
                          onClick={() =>
                            updateCoachQuick(coach.id, {
                              lifecycle_status: "published",
                            })
                          }
                          disabled={savingId === coach.id}
                        >
                          Publish
                        </button>

                        <button
                          style={buttonStyle}
                          onClick={() =>
                            updateCoachQuick(coach.id, {
                              lifecycle_status: "draft",
                            })
                          }
                          disabled={savingId === coach.id}
                        >
                          Draft
                        </button>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Link to={`/admin/coaches/${coach.id}`}>Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}