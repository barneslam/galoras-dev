import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: coaches, isLoading, isError } = useQuery({
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
    retry: 1,
  });

  if (isLoading || isError || !coaches || coaches.length === 0) return null;

  const prev = () => setActiveIndex(i => Math.max(0, i - 1));
  const next = () => setActiveIndex(i => Math.min(coaches.length - 1, i + 1));

  const handleCardClick = (coach: FeaturedCoach, offset: number) => {
    if (offset === 0) {
      const path = coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`;
      navigate(path);
    } else {
      setActiveIndex(coaches.indexOf(coach));
    }
  };

  const getCardStyle = (offset: number): React.CSSProperties => {
    const sign = offset < 0 ? -1 : 1;
    const abs = Math.abs(offset);
    const clamped = Math.min(abs, 2);

    const rotateY   = sign * clamped * 42;
    const translateX = sign * clamped * 52;
    const scale     = 1 - clamped * 0.2;
    const translateZ = -clamped * 110;
    const brightness = Math.max(0.35, 1 - clamped * 0.3);

    return {
      transform: `perspective(1400px) translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex: 20 - abs * 5,
      filter: `brightness(${brightness})`,
      transition: "all 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: abs > 2 ? 0 : 1,
      pointerEvents: abs > 2 ? "none" : "auto",
    };
  };

  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 60%, #2e3138 0%, #1a1d22 45%, #0d0f12 100%)",
      }}
    >
      {/* Arena texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&q=80&auto=format&fit=crop")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
        }}
      />
      {/* Edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Heading */}
      <div className="container-wide relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Featured <span className="text-gradient">Coaches</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Curated leaders selected by Galoras.
          </p>
        </div>
      </div>

      {/* 3D stage */}
      <div className="container-wide relative z-10">
        <div className="relative" style={{ height: "500px" }}>
          {/* Left arrow */}
          <button
            onClick={prev}
            disabled={activeIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/70 border border-zinc-700 flex items-center justify-center text-white hover:bg-primary/20 hover:border-primary transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Previous coach"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            disabled={activeIndex === coaches.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/70 border border-zinc-700 flex items-center justify-center text-white hover:bg-primary/20 hover:border-primary transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Next coach"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Cards — absolutely centred, fan out via 3D transforms */}
          <div className="absolute inset-0 flex items-end justify-center">
            {coaches.map((coach, i) => {
              const offset = i - activeIndex;
              if (Math.abs(offset) > 2) return null;

              return (
                <div
                  key={coach.id}
                  className="absolute"
                  style={{
                    ...getCardStyle(offset),
                    width: "240px",
                    bottom: 0,
                  }}
                >
                  <button
                    onClick={() => handleCardClick(coach, offset)}
                    className="group relative cursor-pointer focus:outline-none w-full"
                    aria-label={
                      offset === 0
                        ? `View ${coach.display_name || "coach"} profile`
                        : `Select ${coach.display_name || "coach"}`
                    }
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      {coach.avatar_url ? (
                        <img
                          src={coach.avatar_url}
                          alt={coach.display_name || "Coach"}
                          className="w-full h-[440px] object-cover object-top"
                          style={{
                            filter:
                              offset === 0 ? "grayscale(0%)" : "grayscale(55%)",
                            transition: "filter 0.55s ease",
                          }}
                        />
                      ) : (
                        <div className="w-full h-[440px] bg-zinc-800 flex items-center justify-center">
                          <span className="text-7xl font-bold text-zinc-500">
                            {(coach.display_name || "C").charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Bottom gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                      {/* Active glow ring */}
                      {offset === 0 && (
                        <div className="absolute inset-0 ring-2 ring-primary/70 rounded-t-lg pointer-events-none" />
                      )}

                      {/* Name + role — always visible for active, hover for others */}
                      <div
                        className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-300"
                        style={{
                          opacity: offset === 0 ? 1 : 0,
                          transform:
                            offset === 0
                              ? "translateY(0)"
                              : "translateY(6px)",
                        }}
                      >
                        <p className="text-white font-semibold text-sm leading-tight">
                          {coach.display_name}
                        </p>
                        {(coach.current_role || coach.headline) && (
                          <p className="text-zinc-300 text-xs mt-0.5 line-clamp-1">
                            {coach.current_role || coach.headline}
                          </p>
                        )}
                        <p className="text-primary text-xs mt-1 font-medium">
                          View Profile →
                        </p>
                      </div>

                      {/* Side-card "select" hint */}
                      {offset !== 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white/80 text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">
                            Select
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {coaches.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-zinc-600 hover:bg-zinc-400"
              }`}
              aria-label={`Go to coach ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
