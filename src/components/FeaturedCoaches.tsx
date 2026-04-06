import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type FeaturedCoach = {
  id: string;
  slug: string | null;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  current_role: string | null;
};

export function FeaturedCoaches() {
  const navigate = useNavigate();

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["featured-coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, slug, display_name, avatar_url, headline, current_role")
        .eq("lifecycle_status", "published")
        .eq("is_featured", true)
        .order("display_name", { ascending: true });

      if (error) throw error;
      return (data || []) as FeaturedCoach[];
    },
  });

  if (isLoading || !coaches || coaches.length === 0) return null;

  const n = coaches.length;
  // Each coach takes 55% of the container width; they're spaced 40% apart → 15% overlap
  const slotPct = 100 / n;          // equal slot per coach
  const overlapPx = 60;             // px overlap between adjacent coaches

  return (
    <section
      style={{
        background: "linear-gradient(to bottom, #b8b8b8 0%, #787878 55%, #1e1e1e 100%)",
      }}
    >
      {/* Heading */}
      <div className="text-center pt-10 pb-4">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white drop-shadow">
          Featured Coaches
        </h2>
      </div>

      {/* Overlapping cutout strip */}
      <div className="relative w-full overflow-hidden" style={{ height: "580px" }}>
        {coaches.map((coach, i) => {
          // Each coach occupies (100/n + overlap_fraction)% width
          // Left position: i * slot — but pull left by overlap for each step after 0
          const widthPct = slotPct + 15;            // slightly wider than slot
          const leftPct = i * slotPct - (i > 0 ? 0 : 0);

          // Z-index: centre coaches are in front
          const mid = (n - 1) / 2;
          const dist = Math.abs(i - mid);
          const zIndex = Math.round(n * 2 - dist * 2);

          return (
            <button
              key={coach.id}
              onClick={() => navigate("/coaching")}
              className="group absolute bottom-0 cursor-pointer focus:outline-none"
              style={{
                left: `calc(${leftPct}% - ${i * overlapPx / n}px)`,
                width: `calc(${widthPct}% + ${overlapPx}px)`,
                height: "100%",
                zIndex,
              }}
              aria-label={`Go to coaching directory`}
            >
              {coach.avatar_url ? (
                <img
                  src={coach.avatar_url}
                  alt={coach.display_name || "Coach"}
                  className="w-full h-full object-contain object-bottom transition-all duration-500"
                  style={{ filter: "grayscale(1)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLImageElement).style.filter = "grayscale(0)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLImageElement).style.filter = "grayscale(1)";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-end justify-center pb-8">
                  <span className="text-7xl font-bold text-zinc-500">
                    {(coach.display_name || "C").charAt(0)}
                  </span>
                </div>
              )}

              {/* Bottom fade into dark */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1e1e1e] to-transparent pointer-events-none" />

              {/* Name on hover */}
              <div className="absolute bottom-10 left-0 right-0 text-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                <p className="text-white font-semibold text-sm drop-shadow-lg">
                  {coach.display_name}
                </p>
                {(coach.current_role || coach.headline) && (
                  <p className="text-zinc-300 text-xs mt-0.5 drop-shadow">
                    {coach.current_role || coach.headline}
                  </p>
                )}
                <p className="text-primary text-xs mt-1 font-medium">View Coaches →</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
