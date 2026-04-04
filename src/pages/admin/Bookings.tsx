import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout";

type BookingRow = {
  id: string;
  coach_id: string | null;
  product_id: string | null;
  status: string | null;
  created_at: string | null;
};

type CoachRow = {
  id: string;
  display_name: string | null;
};

type ProductRow = {
  id: string;
  title: string | null;
};

export default function Bookings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, coach_id, product_id, status, created_at")
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      const safeBookings = (bookings || []) as BookingRow[];

      const coachIds = [
        ...new Set(
          safeBookings.map((b) => b.coach_id).filter(Boolean) as string[]
        ),
      ];

      const productIds = [
        ...new Set(
          safeBookings.map((b) => b.product_id).filter(Boolean) as string[]
        ),
      ];

      let coaches: CoachRow[] = [];
      let products: ProductRow[] = [];

      if (coachIds.length > 0) {
        const { data: coachData, error: coachError } = await supabase
          .from("coaches")
          .select("id, display_name")
          .in("id", coachIds);

        if (coachError) throw coachError;
        coaches = (coachData || []) as CoachRow[];
      }

      if (productIds.length > 0) {
        const { data: productData, error: productError } = await supabase
          .from("coach_products")
          .select("id, title")
          .in("id", productIds);

        if (productError) throw productError;
        products = (productData || []) as ProductRow[];
      }

      const coachMap = new Map(coaches.map((c) => [c.id, c.display_name]));
      const productMap = new Map(products.map((p) => [p.id, p.title]));

      return safeBookings.map((booking) => ({
        ...booking,
        coach_name: booking.coach_id
          ? coachMap.get(booking.coach_id) || "Unknown Coach"
          : "Unknown Coach",
        product_title: booking.product_id
          ? productMap.get(booking.product_id) || "Unknown Product"
          : "Unknown Product",
      }));
    },
  });

  return (
    <Layout>
      <section className="relative pt-28 pb-12">
        <div className="container-wide">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                Admin Booking Log
              </h1>
              <p className="text-muted-foreground">
                Simulated checkout and booking records.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading bookings...
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  Failed to load bookings.
                </div>
              ) : data && data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                      <tr>
                        <th className="text-left px-6 py-4 font-semibold">Coach</th>
                        <th className="text-left px-6 py-4 font-semibold">Package</th>
                        <th className="text-left px-6 py-4 font-semibold">Status</th>
                        <th className="text-left px-6 py-4 font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b border-border last:border-b-0"
                        >
                          <td className="px-6 py-4">{booking.coach_name}</td>
                          <td className="px-6 py-4">{booking.product_title}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs">
                              {booking.status || "unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {booking.created_at
                              ? new Date(booking.created_at).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No bookings recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}