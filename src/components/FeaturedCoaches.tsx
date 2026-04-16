import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeaturedCoaches() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 100%, #16181e 0%, #0d0f12 100%)" }}
    >
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 min-h-[600px]">

          {/* Left — copy */}
          <div className="flex flex-col justify-center py-20 pr-0 lg:pr-16 order-2 lg:order-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              The Coaches
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight mb-6">
              People Who Have <span className="text-gradient">Been There</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-4">
              Every Galoras coach has operated at the level they coach. Not studied it. Not observed it. Lived it — and taken responsibility for outcomes.
            </p>
            <p className="text-zinc-500 text-base leading-relaxed mb-10">
              Executives, founders, and operators who have led at the highest level — and now deploy that experience to help others perform under real conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/coaching">
                <Button size="lg" className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold">
                  Meet the Coaches
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — group B&W photo */}
          <div className="relative flex items-end order-1 lg:order-2 overflow-hidden">
            {/* Left-side fade so photo blends into the copy column */}
            <div
              className="absolute inset-y-0 left-0 z-10 pointer-events-none w-24"
              style={{
                background: "linear-gradient(to right, #0d0f12 0%, transparent 100%)",
              }}
            />
            {/* Bottom fade */}
            <div
              className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
              style={{
                height: "35%",
                background:
                  "linear-gradient(to top, #0d0f12 0%, rgba(13,15,18,0.4) 60%, transparent 100%)",
              }}
            />
            <img
              src="/group-bw-coaches.jpg"
              alt="Galoras coaches"
              className="relative z-0 w-full h-full object-cover object-center"
              style={{
                filter: "grayscale(100%) contrast(1.08) brightness(0.92)",
                minHeight: 480,
                maxHeight: 620,
              }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
