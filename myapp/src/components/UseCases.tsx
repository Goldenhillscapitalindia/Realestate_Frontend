import { BarChart3, Landmark, Shield, TrendingUp } from "lucide-react";

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
    <section className="section-padding section-dark section-dark-grid" id="use-cases">
      <div className="absolute left-[10%] bottom-16 h-44 w-44 rounded-full bg-[#16365f] opacity-70 blur-3xl" />
      <div className="absolute right-[8%] top-20 h-52 w-52 rounded-full bg-emerald/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <ScrollReveal variant="up">
          <div className="mb-14 text-center">
            <p className="mb-3 text-base font-semibold uppercase tracking-widest text-emerald-light">
              Real Use Cases
            </p>
            <h2 className="font-display text-[2rem] font-extrabold text-white md:text-[2.35rem] lg:text-[2.8rem]">
              Designed for Institutional Real Estate
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 items-stretch">
          {cases.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 80} variant={index % 2 === 0 ? "left" : "right"}>
              <div className="premium-panel-dark group relative flex h-full flex-col overflow-hidden p-7">
                <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-b from-emerald-light via-[#7eb8ff] to-emerald-light opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="pl-4 flex flex-col flex-grow">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/8 transition-transform duration-300 group-hover:scale-105">
                    <item.icon className="h-6 w-6 text-emerald-light" />
                  </div>

                  <h3 className="mb-3 font-display text-xl font-semibold tracking-tight text-white">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-white/68">{item.description}</p>
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
