import { ScrollReveal } from "./ScrollReveal";
import { Brain, Radar, Search } from "lucide-react";
import portfolioDashboard from "../assets/portfoli_intelligence.png";
import marketRadar from "../assets/market_signal_radar.png";
import dealLens from "../assets/deal_lens.png";
import AccessBlockedModal from "./AccessBlockedModal";
import { useLoginGuard } from "@/hooks/use-login-guard";

const features = [
  {
    icon: Brain,
    emoji: "🧠",
    title: "Portfolio Intelligence",
    subheading: "We don’t react to risk.We detect it early and act before it impacts NOI.",
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
    title: "Market Signal Radar ",
    subheading: "We don’t guess the future.We surface real-time competitive pressure around your asset using AI-driven market intelligence.",
    subtitle: "Make pricing and asset decisions with market clarity — not assumptions.",
    points: [
      "Demand and absorption trend tracking",
      "Competitive rent benchmarking",
      "Vacancy movement indicators",
      "Development pipeline visibility",
    ],
    image: marketRadar,
    alt: "Market Radar Dashboard",
  },
  {
    icon: Search,
    emoji: "🔎",
    title: "Deal Lens",
subheading:"AI-powered underwriting that turns financials into insight.Analyze T12s, Rent Rolls, and OMs in minutes — not days.",
    subtitle: "Underwrite smarter. Price with precision. Deploy capital with confidence.",
    points: [
      "Extracts and structures data from T12, Rent Roll, and OM",
      "Breaks down true in-place revenue performance",
      "Analyzes tenant mix risk and concentration",
      "Visualizes risk exposure",
      "Translates financial performance into investment-grade clarity",
    ],
    image: dealLens,
    alt: "Deal Lens Dashboard",
  },
];

const PlatformFeatures = () => {
  const { isModalOpen, setIsModalOpen, guardNavigation, goToLogin } = useLoginGuard();
  return (
    <section className="section-padding section-soft" id="platform">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-lg font-semibold text-indigo-500 uppercase tracking-widest mb-3">
              What Vertex Does
            </p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              One Unified Intelligence Platform
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {[
                { label: "Portfolio Intelligence", route: "/portfolio_intelligence" },
                { label: "Market Signal Radar ", route: "/market_radar" },
                { label: "Deal Underwriting Lens", route: "/deal_lens" },
              ].map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => tab.route && guardNavigation(tab.route)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-200 border border-border text-sm font-medium text-foreground transition hover:border-foreground/40"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="space-y-24">
          {features.map((feature, i) => {
            const isMarketRadar = feature.title === "Market Radar Signal";
            return (
              <ScrollReveal key={feature.title} delay={i * 50}>
                <div
                  className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-16`}
                >
                  {/* Text */}
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-3">
                      <span className="text-3xl">{feature.emoji}</span>
                      <h3 className="font-display font-bold text-2xl md:text-3xl text-blue-700">
                        {feature.title}
                      </h3>

                    </div>
                    <p className="text-lg text-foreground leading-relaxed">
                      {feature.subheading}
                    </p>
                    <ul className="space-y-3">
                      {feature.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-2.5 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <p className="text-base font-semibold text-foreground pt-2">
                      <span className="text-blue-700">Outcome:</span> {feature.subtitle}
                    </p>
                  </div>

                  {/* Image */}
                  <div
                    className={`flex-1 w-full rounded-xl overflow-hidden float-shadow border border-border ${isMarketRadar ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (isMarketRadar) {
                        guardNavigation("/market_radar");
                      }
                    }}
                    role={isMarketRadar ? "button" : undefined}
                    aria-label={isMarketRadar ? "View Market Radar" : undefined}
                    tabIndex={isMarketRadar ? 0 : undefined}
                    onKeyDown={
                      isMarketRadar
                        ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            guardNavigation("/market_radar");
                          }
                        }
                        : undefined
                    }
                  >
                    <img
                      src={feature.image}
                      alt={feature.alt}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
      <AccessBlockedModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onGoToLogin={goToLogin}
      />
    </section>
  );
};

export default PlatformFeatures;
