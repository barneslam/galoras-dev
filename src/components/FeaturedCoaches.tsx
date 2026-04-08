import { useState, useEffect } from "react";
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

const CARD_W = 240;
const CARD_GAP = 32;
const CARD_STEP = CARD_W + CARD_GAP;

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

  // Start at centre card once data loads
  useEffect(() => {
    if (coaches && coaches.length > 1) {
      setActiveIndex(Math.floor(coaches.length / 2));
    }
  }, [coaches?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || isError || !coaches || coaches.length === 0) return null;

  const prev = () => setActiveIndex(i => Math.max(0, i - 1));
  const next = () => setActiveIndex(i => Math.min(coaches.length - 1, i + 1));

  const handleCardClick = (i: number, offset: number) => {
    if (offset === 0) {
      const coach = coaches[i];
      const path = coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`;
      navigate(path);
    } else {
      setActiveIndex(i);
    }
  };

  const getCardStyle = (offset: number): React.CSSProperties => {
    const abs = Math.abs(offset);
    const sign = offset < 0 ? -1 : 1;
    const xPos = offset * CARD_STEP;

    // ±1 cards are clearly visible, ±2+ start to fade
    const rotateY = sign * Math.min(abs, 2) * 28;
    const scale = abs === 0 ? 1 : abs === 1 ? 0.88 : Math.max(0.72, 1 - abs * 0.13);
    // Bright enough to read clearly; only cards 3+ away go very dark
    const brightness = abs === 0 ? 1 : abs === 1 ? 0.82 : abs === 2 ? 0.65 : Math.max(0.3, 0.65 - (abs - 2) * 0.18);
    const opacity = abs > 3 ? 0 : 1;

    return {
      position: "absolute",
      left: `calc(50% - ${CARD_W / 2}px + ${xPos}px)`,
      bottom: 0,
      width: `${CARD_W}px`,
      transform: `perspective(1200px) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex: 30 - Math.min(abs * 4, 28),
      filter: `brightness(${brightness})`,
      opacity,
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      pointerEvents: abs > 3 ? "none" : "auto",
    };
  };

  return (
    <section
      className="py-16 relative"
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
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
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

      {/* Carousel stage */}
      <div className="relative z-10">
        {/* Narrow edge masks — only hide coaches that scroll far off-screen */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-20 pointer-events-none"
          style={{ background: "linear-gradient(to right, #0d0f12 0%, transparent 100%)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-20 pointer-events-none"
          style={{ background: "linear-gradient(to left, #0d0f12 0%, transparent 100%)" }} />

        {/* Arrows */}
        <button
          onClick={prev}
          disabled={activeIndex === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/70 border border-zinc-700 flex items-center justify-center text-white hover:bg-primary/20 hover:border-primary transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Previous coach"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={next}
          disabled={activeIndex === coaches.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/70 border border-zinc-700 flex items-center justify-center text-white hover:bg-primary/20 hover:border-primary transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Next coach"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Cards — all in DOM, positioned by offset */}
        <div className="relative overflow-hidden" style={{ height: "500px" }}>
          {coaches.map((coach, i) => {
            const offset = i - activeIndex;

            return (
              <div key={coach.id} style={getCardStyle(offset)}>
                <button
                  onClick={() => handleCardClick(i, offset)}
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
                          filter: offset === 0 ? "grayscale(0%)" : "grayscale(100%)",
                          transition: "filter 0.5s ease",
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

                    {/* Name + role — active card always visible */}
                    <div
                      className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-300"
                      style={{
                        opacity: offset === 0 ? 1 : 0,
                        transform:
                          offset === 0 ? "translateY(0)" : "translateY(6px)",
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

                    {/* Side-card hover hint */}
                    {offset !== 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white/90 text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full">
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
      <div className="relative z-10 flex justify-center gap-2 mt-6">
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
    </section>
  );
}
