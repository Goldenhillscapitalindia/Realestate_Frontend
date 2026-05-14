import { AlertTriangle, Heart, RefreshCw, TrendingDown, Wind } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";


const capabilities = [
  { icon: RefreshCw, label: "Rollover risk visibility", detail: "Track lease expirations before they impact NOI" },
  { icon: AlertTriangle, label: "Revenue variance detection", detail: "Spot deviations between forecast and actuals" },
  { icon: TrendingDown, label: "Expense outlier identification", detail: "Flag above-market operating costs instantly" },
  { icon: Wind, label: "Competitive rent positioning", detail: "Benchmark rents against real-time market data" },
  { icon: Heart, label: "AI Guided Recommendations", detail: "Actionable insights delivered to your workflow" },
];

const AILayer = () => {
  return (
    <section className="relative overflow-hidden" id="ai"
      style={{
        padding: "5rem 1.5rem",
        background: "linear-gradient(180deg, #f2f6ff 0%, #eef2fb 40%, #f7f9ff 100%)",
      }}
    >
      {/* ── Faint geometric dot pattern background ── */}
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
            {/* Refined label with flanking rules */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-indigo-400/40" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-500">
                AI Layer — Beyond Dashboards
              </p>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-indigo-400/40" />
            </div>

            <h2 className="mb-5 font-display text-[2rem] font-extrabold text-[#0f1d2f] tracking-tight md:text-[2.35rem] lg:text-[2.8rem]">
              Real Estate–Specific Intelligence
            </h2>

            <p className="text-[15px] leading-7 text-slate-500 max-w-2xl mx-auto">
              Asset72 analyzes structured financial data to surface patterns in lease exposure,
              revenue alignment, and operating efficiency — Insights that manual spreadsheets simply
              miss
            </p>
          </div>
        </ScrollReveal>

        {/* ── Capability cards with connectors ── */}
        <div className="relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-px z-0"
            style={{
              background: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(15,75,138,0.15) 4px, rgba(15,75,138,0.15) 8px)",
            }}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 items-stretch relative z-10">
            {capabilities.map((capability, index) => (
              <ScrollReveal key={capability.label} delay={index * 80} variant="scale">
                <div className="group relative flex h-full flex-col items-center overflow-hidden text-center rounded-2xl transition-all duration-500 hover:-translate-y-1.5"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,255,0.82) 100%)",
                    border: "1px solid rgba(15,28,62,0.08)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    boxShadow: "0 20px 54px -36px rgba(11,20,38,0.22)",
                    padding: "2rem 1.25rem 1.5rem",
                  }}
                >
                  {/* Top accent gradient */}
                  <div className="absolute inset-x-0 top-0 h-[3px] transition-all duration-500 group-hover:h-[4px]"
                    style={{
                      background: "linear-gradient(90deg, transparent 10%, #1ebc9a 50%, transparent 90%)",
                      opacity: 0.7,
                    }}
                  />

                  {/* Numbered step indicator */}
                  <div className="mb-4 flex h-7 w-7 items-center justify-center rounded-full border border-[#0f4b8a]/15 text-[11px] font-bold font-mono transition-all duration-500 group-hover:bg-[#1ebc9a] group-hover:border-[#1ebc9a] group-hover:text-white"
                    style={{ color: "#0f4b8a" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Icon */}
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f4b8a]/8 border border-[#0f4b8a]/6 transition-all duration-500 group-hover:scale-110 group-hover:bg-[#0f4b8a]/12 group-hover:border-[#0f4b8a]/15">
                    <capability.icon className="h-6 w-6 text-[#0f4b8a] transition-all duration-500 group-hover:text-[#1ebc9a]" />
                  </div>

                  {/* Label */}
                  <p className="text-sm font-semibold leading-snug text-[#0f1d2f] mb-2">{capability.label}</p>

                  {/* Detail text */}
                  <p className="text-[12px] leading-relaxed text-slate-400 mt-auto">{capability.detail}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AILayer;
