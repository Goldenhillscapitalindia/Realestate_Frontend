import { BarChart3, Landmark, Shield, TrendingUp } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const cases = [
  {
    icon: TrendingUp,
    title: "Private Equity Funds",
    description: "Monitor portfolio exposure + acquisition upside in one view.",
    stat: "42+",
    statLabel: "Active Funds",
  },
  {
    icon: Shield,
    title: "Institutional Owners",
    description: "Ensure revenue resilience and operational consistency.",
    stat: "3,200+",
    statLabel: "Units Tracked",
  },
  {
    icon: BarChart3,
    title: "Asset Managers",
    description: "Prioritize risk, optimize lease strategy, and improve performance.",
    stat: "$2.4B",
    statLabel: "AUM Managed",
  },
  {
    icon: Landmark,
    title: "Developers & Capital Markets",
    description: "Align market timing with deal execution.",
    stat: "18+",
    statLabel: "Markets Covered",
  },
];

const UseCases = () => {
  return (
    <section
      className="section-padding relative overflow-hidden"
      id="use-cases"
      style={{
        background: "linear-gradient(180deg, #f2f6ff 0%, #eef2fb 40%, #f7f9ff 100%)",
      }}
    >
      {/* ── Background pattern: subtle geometric shapes ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Floating hexagon outlines */}
        {[
          { x: "8%", y: "15%", size: 80, rot: 15, opacity: 0.03 },
          { x: "85%", y: "70%", size: 120, rot: -20, opacity: 0.025 },
          { x: "70%", y: "10%", size: 60, rot: 30, opacity: 0.035 },
          { x: "15%", y: "80%", size: 90, rot: -10, opacity: 0.03 },
        ].map((h, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: h.x, top: h.y,
              width: `${h.size}px`, height: `${h.size}px`,
              border: "1px solid rgba(121, 151, 198, 0.08)",
              borderRadius: "12px",
              transform: `rotate(${h.rot}deg)`,
              opacity: h.opacity,
              animation: `orbFloat ${12 + i * 3}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Ambient orbs */}
      <div className="absolute right-[6%] top-16 h-56 w-56 rounded-full bg-[#13c9b4]/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <ScrollReveal variant="up">
          <div className="mb-16 text-center">
            {/* Refined label with flanking rules */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#20d6bd]/50" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#20d6bd]">
                Real Use Cases
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#20d6bd]/50" />
            </div>
            <h2 className="font-display text-[2rem] font-extrabold tracking-tight md:text-[2.35rem] lg:text-[2.8rem]" style={{ color: "#0f1d2f" }}>
              Designed for Institutional Real Estate
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 items-stretch">
          {cases.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 100} variant={index % 2 === 0 ? "left" : "right"}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1"
                style={{
                  background: "#0F213D",
                  border: "1px solid rgba(122, 153, 202, 0.18)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "0 20px 56px -34px rgba(0, 7, 24, 0.72)",
                }}
              >
                {/* Top accent gradient bar */}
                <div
                  className="h-[3px] w-full transition-all duration-500 group-hover:h-[4px]"
                  style={{
                    background: "linear-gradient(90deg, #18c7b0 0%, #35ddc4 48%, #5f9fe8 100%)",
                    opacity: 0.7,
                  }}
                />

                <div className="flex flex-col flex-grow p-7 lg:p-8">
                  {/* Icon */}
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6f87b5]/25 bg-[#122543]/80 transition-all duration-500 group-hover:scale-110 group-hover:border-[#20d6bd]/30 group-hover:bg-[#12334b] relative">
                    <item.icon className="h-6 w-6 text-white transition-all duration-500" />
                    {/* Hover ring pulse */}
                    <div className="absolute inset-0 rounded-2xl border border-[#20d6bd]/0 group-hover:border-[#20d6bd]/20 transition-all duration-500 group-hover:scale-125 group-hover:opacity-0" />
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 font-display text-xl font-semibold tracking-tight text-white">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-[#c7d3e6] flex-grow">{item.description}</p>

                  {/* Stat line */}
                  <div className="mt-6 pt-4 border-t border-[#6f87b5]/20 flex items-center gap-2">
                    <span className="text-xl font-extrabold font-display text-white">
                      {item.stat}
                    </span>
                    <span className="text-[11px] font-mono tracking-wide text-[#91a4c0] uppercase">
                      {item.statLabel}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
