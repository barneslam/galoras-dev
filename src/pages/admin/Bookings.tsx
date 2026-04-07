import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

type BookingRow = {
  id: string;
  coach_id: string | null;
  client_name: string | null;
  client_email: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  duration_minutes: number | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
  coach_name?: string;
};

const STATUS_STYLE: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  confirmed:  { color: "bg-emerald-900/60 text-emerald-300 border-emerald-800", icon: CheckCircle2 },
  pending:    { color: "bg-zinc-800 text-zinc-300 border-zinc-700",             icon: AlertCircle },
  completed:  { color: "bg-sky-900/60 text-sky-300 border-sky-800",             icon: CheckCircle2 },
  cancelled:  { color: "bg-red-900/60 text-red-400 border-red-800",             icon: XCircle },
};

function StatusBadge({ status }: { status: string | null }) {
  const s = STATUS_STYLE[status ?? ""] ?? STATUS_STYLE.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
      <Icon className="h-3 w-3" />
      {status ?? "unknown"}
    </span>
  );
}

export default function Bookings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-session-bookings"],
    queryFn: async () => {
      const { data: bookings, error: bookingsError } = await supabase
        .from("session_bookings")
        .select("id, coach_id, client_name, client_email, scheduled_date, scheduled_time, duration_minutes, status, notes, created_at")
        .order("scheduled_date", { ascending: false });

      if (bookingsError) throw bookingsError;

      const safeBookings = (bookings || []) as BookingRow[];

      const coachIds = [...new Set(safeBookings.map((b) => b.coach_id).filter(Boolean) as string[])];

      let coachMap = new Map<string, string>();
      if (coachIds.length > 0) {
        const { data: coaches } = await supabase
          .from("coaches")
          .select("id, display_name")
          .in("id", coachIds);
        (coaches || []).forEach((c: any) => coachMap.set(c.id, c.display_name ?? "Unknown"));
      }

      return safeBookings.map((b) => ({
        ...b,
        coach_name: b.coach_id ? coachMap.get(b.coach_id) ?? "Unknown Coach" : "Unknown Coach",
      }));
    },
  });

  const stats = {
    total:     data?.length ?? 0,
    confirmed: data?.filter(b => b.status === "confirmed").length ?? 0,
    pending:   data?.filter(b => b.status === "pending").length ?? 0,
    completed: data?.filter(b => b.status === "completed").length ?? 0,
    cancelled: data?.filter(b => b.status === "cancelled").length ?? 0,
  };

  return (
    <AdminLayout title="Bookings">
      <section className="p-6">
        <div className="max-w-7xl mx-auto">

          <div className="mb-6">
            <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
              Session Bookings
            </h2>
            <p className="text-zinc-500 text-sm mt-0.5">All client sessions across the platform.</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-5 gap-3 mb-8">
            {[
              { label: "Total",     value: stats.total,     color: "text-white" },
              { label: "Confirmed", value: stats.confirmed, color: "text-emerald-400" },
              { label: "Pending",   value: stats.pending,   color: "text-zinc-400" },
              { label: "Completed", value: stats.completed, color: "text-sky-400" },
              { label: "Cancelled", value: stats.cancelled, color: "text-red-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 py-20 text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading bookings…
              </div>
            ) : error ? (
              <div className="py-20 text-center text-red-400 text-sm">Failed to load bookings.</div>
            ) : !data || data.length === 0 ? (
              <div className="py-20 text-center">
                <Calendar className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No sessions booked yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-800">
                    <tr>
                      {["Client", "Coach", "Date & Time", "Duration", "Status", "Booked"].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((b) => (
                      <tr key={b.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                              <User className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium truncate">{b.client_name || "—"}</p>
                              <p className="text-zinc-500 text-xs truncate">{b.client_email || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-300">{b.coach_name}</td>
                        <td className="px-5 py-4">
                          {b.scheduled_date ? (
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-zinc-300">
                                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                                {format(parseISO(b.scheduled_date), "MMM d, yyyy")}
                              </div>
                              {b.scheduled_time && (
                                <div className="flex items-center gap-1.5 text-zinc-500">
                                  <Clock className="h-3.5 w-3.5" />
                                  {b.scheduled_time.slice(0, 5)}
                                </div>
                              )}
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-4 text-zinc-400">
                          {b.duration_minutes ? `${b.duration_minutes} min` : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-5 py-4 text-zinc-500 text-xs">
                          {b.created_at ? format(new Date(b.created_at), "MMM d, yyyy") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </section>
    </AdminLayout>
  );
}
