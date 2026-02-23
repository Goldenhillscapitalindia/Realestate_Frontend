import { ScrollReveal } from "./ScrollReveal";
import { Eye, Layers, Users, Zap } from "lucide-react";

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

const WhyVertex = () => {
  return (
    <section className="section-padding bg-card" id="why">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">
              Why Vertex
            </p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-foreground">
              Forward-Looking. Integrated. Institutional.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <ScrollReveal key={b.title} delay={i * 80}>
              <div className="card-glass p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-5">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyVertex;