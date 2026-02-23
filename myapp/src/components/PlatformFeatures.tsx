import { ScrollReveal } from "./ScrollReveal";
import { Brain, Radar, Search } from "lucide-react";

const features = [
  {
    icon: Brain,
    emoji: "🧠",
    title: "Portfolio Intelligence",
    subtitle: "Protect NOI before it erodes — not after.",
    points: [
      "Revenue at Risk monitoring",
      "Lease expiration concentration",
      "Renewal probability modeling",
      "Expense behavior detection",
      "Stability scoring across assets",
      "AI-guided recommended actions",
    ],
    image: portfolioDashboard,
    alt: "Portfolio Intelligence Dashboard",
  },
  {
    icon: Radar,
    emoji: "📡",
    title: "Market Radar Signal",
    subtitle: "Know where markets are headed before your competitors do.",
    points: [
      "Absorption velocity trend lines",
      "Vacancy and rent movement indicators",
      "Competitive rent shift alerts",
      "Supply pipeline exposure signals",
    ],
    image: marketRadar,
    alt: "Market Radar Dashboard",
  },
  {
    icon: Search,
    emoji: "🔎",
    title: "Deal Lens",
    subtitle: "Underwrite with confidence, not guesswork.",
    points: [
      "Mark-to-market lift analytics",
      "Risk-adjusted return forecast",
      "Expense benchmarking vs peers",
      "Value creation simulations",
    ],
    image: dealLens,
    alt: "Deal Lens Dashboard",
  },
];

const PlatformFeatures = () => {
  return (
    <section className="section-padding section-soft" id="platform">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">
              What Vertex Does
            </p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              One Unified Intelligence Platform
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {["Portfolio Intelligence", "Market Radar Signals", "Deal Underwriting Lens"].map((t) => (
                <span
                  key={t}
                  className="inline-block px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="space-y-24">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 50}>
              <div
                className={`flex flex-col ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                } items-center gap-12 lg:gap-16`}
              >
                {/* Text */}
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-3">
                    <span className="text-3xl">{feature.emoji}</span>
                    <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <p className="text-base font-semibold text-foreground pt-2">
                    <span className="text-accent">Outcome:</span> {feature.subtitle}
                  </p>
                </div>

                {/* Image */}
                <div className="flex-1 w-full">
                  <div className="rounded-xl overflow-hidden float-shadow border border-border">
                    <img
                      src={feature.image}
                      alt={feature.alt}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;