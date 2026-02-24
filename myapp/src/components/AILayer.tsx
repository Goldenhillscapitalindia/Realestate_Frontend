import { ScrollReveal } from "./ScrollReveal";
import {
  RefreshCw,
  AlertTriangle,
  TrendingDown,
  Wind,
  Heart,
} from "lucide-react";

const capabilities = [
  { icon: RefreshCw, label: "Rollover risk visibility" },
  { icon: AlertTriangle, label: "Revenue variance detection" },
  { icon: TrendingDown, label: "Expense outlier identification" },
  { icon: Wind, label: "Competitive rent positioning" },
  { icon: Heart, label: "AI Guided Recommendations" },
];

const AILayer = () => {
  return (
    <section className="section-padding bg-card" id="ai">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-lg font-semibold text-indigo-500 uppercase tracking-widest mb-3">
              AI Layer — Beyond Dashboards
            </p>

            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
              Real Estate-Specific Intelligence
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
Vertex analyzes structured financial data to surface patterns in lease exposure, revenue alignment, and operating efficiency - Insights that manual spreadsheets simply miss            </p>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
          {capabilities.map((cap, i) => (
            <ScrollReveal key={cap.label} delay={i * 60}>
              <div
                className="relative h-full flex flex-col items-center
                           p-8 rounded-2xl
                           bg-white/60 backdrop-blur-sm
                           border border-border/40
                           shadow-sm hover:shadow-lg
                           hover:-translate-y-1
                           transition-all duration-300
                           group overflow-hidden"
              >
                {/* Left Accent */}
                <div
                  className="absolute left-0 top-0 h-full w-[3px]
                             bg-[#8c22a5] opacity-60
                             group-hover:opacity-100
                             transition-opacity duration-300"
                />

                <div className="pl-4 flex flex-col items-center flex-grow text-center">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl
                               bg-[#8c22a5]/10
                               flex items-center justify-center
                               mb-6
                               group-hover:scale-105
                               transition-transform duration-300"
                  >
                    <cap.icon className="w-6 h-6 text-[#8c22a5]" />
                  </div>

                  {/* Label */}
                  <p className="text-sm font-semibold text-black leading-snug">
                    {cap.label}
                  </p>
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