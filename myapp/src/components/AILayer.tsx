import { AlertTriangle, Heart, RefreshCw, TrendingDown, Wind } from "lucide-react";

import { ScrollReveal } from "./ScrollReveal";

const capabilities = [
  { icon: RefreshCw, label: "Rollover risk visibility" },
  { icon: AlertTriangle, label: "Revenue variance detection" },
  { icon: TrendingDown, label: "Expense outlier identification" },
  { icon: Wind, label: "Competitive rent positioning" },
  { icon: Heart, label: "AI Guided Recommendations" },
];

const AILayer = () => {
  return (
    <section className="section-padding section-soft-alt" id="ai">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal variant="up">
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <p className="mb-3 text-base font-semibold uppercase tracking-widest text-indigo-500">
              AI Layer - Beyond Dashboards
            </p>

            <h2 className="mb-5 font-display text-[2rem] font-extrabold text-foreground md:text-[2.35rem] lg:text-[2.8rem]">
              Real Estate-Specific Intelligence
            </h2>

            <p className="text-base leading-7 text-muted-foreground">
              Asset72 analyzes structured financial data to surface patterns in lease exposure,
              revenue alignment, and operating efficiency - Insights that manual spreadsheets simply
              miss
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
          {capabilities.map((capability, index) => (
            <ScrollReveal key={capability.label} delay={index * 60} variant="scale">
              <div className="premium-panel-light group relative flex h-full flex-col items-center overflow-hidden p-8 text-center">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#1ebc9a] to-transparent opacity-80" />

                <div className="flex flex-col items-center flex-grow text-center">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f4b8a]/10 transition-transform duration-300 group-hover:scale-105">
                    <capability.icon className="h-6 w-6 text-[#0f4b8a]" />
                  </div>

                  <p className="text-sm font-semibold leading-snug text-foreground">{capability.label}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AILayer;
