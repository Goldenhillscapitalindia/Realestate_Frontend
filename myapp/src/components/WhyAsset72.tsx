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
    <section className="section-padding section-soft-alt" id="why">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal variant="up">
          <div className="mb-12 text-center">
            <p className="mb-3 text-base font-semibold uppercase tracking-widest text-indigo-500">
              Why Asset72?
            </p>
            <h2 className="font-display text-[2rem] font-extrabold text-foreground md:text-[2.35rem] lg:text-[2.8rem]">
              Forward-Looking. Integrated. Institutional.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
          {benefits.map((benefit, index) => (
            <ScrollReveal key={benefit.title} delay={index * 80} variant="scale">
              <div className="premium-panel-light group flex h-full flex-col justify-between p-8 text-center transition-all duration-300 hover:scale-[1.02]">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#0f4b8a]/15 bg-[#0f4b8a]/6">
                  <benefit.icon className="h-6 w-6 text-[#0f4b8a]" />
                </div>

                <div>
                  <h3 className="mb-2 font-display text-lg font-bold text-foreground">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyAsset72;
