import { TrendingUp, Shield, BarChart3, Landmark } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const cases = [
  {
    icon: TrendingUp,
    title: "Private Equity Funds",
    description: "Monitor portfolio exposure + acquisition upside in one view.",
  },
  {
    icon: Shield,
    title: "Institutional Owners",
    description: "Ensure revenue resilience and operational consistency.",
  },
  {
    icon: BarChart3,
    title: "Asset Managers",
    description: "Prioritize risk, optimize lease strategy, and improve performance.",
  },
  {
    icon: Landmark,
    title: "Developers & Capital Markets",
    description: "Align market timing with deal execution.",
  },
];

const UseCases = () => {
  return (
    <section className="section-padding section-soft-alt" id="use-cases">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-lg font-semibold text-indigo-500 uppercase tracking-widest mb-3">
              Real Use Cases
            </p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-foreground">
              Designed for Institutional Real Estate
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">          {cases.map((c, i) => (
          <ScrollReveal key={c.title} delay={i * 80}>
            <div className="relative h-full flex flex-col 
                p-8 rounded-2xl bg-white/60 backdrop-blur-sm 
                border border-border/40 shadow-sm 
                hover:shadow-xl hover:-translate-y-1 
                transition-all duration-300 
                group overflow-hidden">

              {/* Left Accent Line */}
              <div className="absolute left-0 top-0 h-full w-[4px] 
                  bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-500 
                  opacity-70 group-hover:opacity-100 transition-opacity" />

              {/* Content wrapper to add spacing from accent */}
              <div className="pl-4 flex flex-col flex-grow">

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br 
                  from-indigo-50 to-indigo-100 
                  flex items-center justify-center mb-6">
                  <c.icon className="w-6 h-6 text-indigo-600" />
                </div>

                {/* Title */}
                <h3 className="font-display font-semibold text-xl text-foreground mb-3 tracking-tight">
                  {c.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {c.description}
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

export default UseCases;
