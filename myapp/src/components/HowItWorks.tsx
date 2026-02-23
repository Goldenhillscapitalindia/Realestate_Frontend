import { ScrollReveal } from "./ScrollReveal";
import { Database, Cpu, Zap } from "lucide-react";

const steps = [
  {
    icon: Database,
    number: "01",
    title: "Connect Your Data",
    description: "APIs or secure data sync with PMS, financial systems, and market data.",
  },
  {
    icon: Cpu,
    number: "02",
    title: "Vertex Models & Scores",
    description: "Our intelligence engine analyzes exposure, behavior, and trends continuously.",
  },
  {
    icon: Zap,
    number: "03",
    title: "Clear Actions & Signals",
    description: "Stability scores, renewal timing signals, risk alerts, and recommended tactics.",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-card">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">
              How Vertex Works
            </p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-foreground">
              A Simple, Smart, Connected Flow
            </h2>
          </div>
        </ScrollReveal>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-primary/20 via-accent/40 to-primary/20" />

          {steps.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 120}>
              <div className="card-glass p-8 text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                <span className="text-xs font-bold text-accent tracking-widest uppercase mb-2 block">
                  Step {step.number}
                </span>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;