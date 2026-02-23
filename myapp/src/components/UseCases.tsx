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
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">
              Real Use Cases
            </p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-foreground">
              Designed for Institutional Real Estate
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cases.map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 80}>
              <div className="card-glass p-8 group cursor-default">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-5 group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors">
                  <c.icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {c.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {c.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
