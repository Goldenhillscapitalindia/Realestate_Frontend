import { Eye, Layers, Users, Zap } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const benefits = [
  {
    icon: Eye,
    title: "Forward-Looking",
    description: "Forecast risk before it impacts NOI",
  },
  {
    icon: Layers,
    title: "Integrated",
    description: "Unified across portfolio, market, and deal intelligence",
  },
  {
    icon: Users,
    title: "Institutional-Grade",
    description: "Designed for capital allocators and operating teams",
  },
  {
    icon: Zap,
    title: "Actionable",
    description: "Clear signals, not busy dashboards",
  },
];

const WhyAsset72 = () => {
  return (
    <section
      className="relative overflow-hidden"
      id="why"
      style={{
        padding: "5rem 1.5rem",
        background: "linear-gradient(180deg, #f2f6ff 0%, #eef2fb 40%, #f7f9ff 100%)",
      }}
    >
      {/* Faint geometric dot pattern */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ opacity: 0.035 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, #0f1d2f 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Diagonal accent lines */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: 0.02 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute bg-[#0f4b8a]"
            style={{
              width: "1px", height: "200%",
              left: `${20 + i * 20}%`, top: "-50%",
              transform: "rotate(25deg)",
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollReveal variant="up">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            {/* Label with flanking rules */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-indigo-400/40" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-500">
                Why Asset72?
              </p>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-indigo-400/40" />
            </div>

            <h2 className="mb-5 font-display text-[2rem] font-extrabold text-[#0f1d2f] tracking-tight md:text-[2.35rem] lg:text-[2.8rem]">
              Forward-Looking. Integrated. Institutional.
            </h2>
          </div>
        </ScrollReveal>

        {/* Cards with connector */}
        <div className="relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-px z-0"
            style={{
              background: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(15,75,138,0.15) 4px, rgba(15,75,138,0.15) 8px)",
            }}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch relative z-10">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={index * 80} variant="scale">
                <div
                  className="group relative flex h-full flex-col items-center overflow-hidden text-center rounded-2xl transition-all duration-500 hover:-translate-y-1.5"
                  style={{
                    background: "linear-gradient(180deg, #0F213D 0%, #0b1a33 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    boxShadow: "0 20px 54px -36px rgba(11,20,38,0.22)",
                    padding: "2rem 1.25rem 1.5rem",
                  }}
                >
                  {/* Top accent bar */}
                  <div
                    className="absolute inset-x-0 top-0 h-[3px] transition-all duration-500 group-hover:h-[4px]"
                    style={{
                      background: "linear-gradient(90deg, transparent 10%, #1ebc9a 50%, transparent 90%)",
                      opacity: 0.7,
                    }}
                  />

                  {/* Numbered step indicator */}
                  <div
                    className="mb-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-[11px] font-bold font-mono transition-all duration-500 group-hover:bg-[#1ebc9a] group-hover:border-[#1ebc9a] group-hover:text-white"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Icon */}
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8 border border-white/12 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/12 group-hover:border-[#1ebc9a]/30">
                    <benefit.icon className="h-6 w-6 text-white/70 transition-all duration-500 group-hover:text-[#1ebc9a]" />
                  </div>

                  {/* Title */}
                  <p className="text-sm font-semibold leading-snug text-white mb-2">{benefit.title}</p>

                  {/* Description */}
                  <p className="text-[12px] leading-relaxed text-white/55 mt-auto">{benefit.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyAsset72;
