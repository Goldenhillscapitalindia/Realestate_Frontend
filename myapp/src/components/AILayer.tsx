import { ScrollReveal } from "./ScrollReveal";
import { RefreshCw, AlertTriangle, TrendingDown, Wind, Heart } from "lucide-react";

const capabilities = [
  { icon: RefreshCw, label: "Renewal probability signals" },
  { icon: AlertTriangle, label: "Revenue leakage alerts" },
  { icon: TrendingDown, label: "Expense anomaly insights" },
  { icon: Wind, label: "Market momentum shifts" },
  { icon: Heart, label: "Resident sentiment influence" },
];

const AILayer = () => {
  return (
    <section className="section-padding bg-card" id="ai">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">
              AI Layer — Beyond Dashboards
            </p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
              Real Estate-Specific Intelligence
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Vertex models more than data — it understands behavior, risk, and impact.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {capabilities.map((cap, i) => (
            <ScrollReveal key={cap.label} delay={i * 60}>
              <div className="card-glass p-6 text-center group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                  <cap.icon className="w-5 h-5 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                </div>
                <p className="text-sm font-medium text-foreground leading-snug">
                  {cap.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AILayer;
