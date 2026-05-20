import { useState } from "react";

import { ScrollReveal } from "./ScrollReveal";
import dealLens from "../assets/deal_lens.png";
import expenseintel from "../assets/Expenses Intel.jpg";
import marketRadar from "../assets/market_signal_radar.png";
import properties from "../assets/properties.png";
import portfolioDashboard from "../assets/performance_drvers.png";
import revenueleases from "../assets/Revenue & Leases.jpg";

const screens = [
  { label: "Expense Intel", tooltip: "Deep insights into expense patterns", image: expenseintel },
  { label: "Performance Drivers", tooltip: "Key factors driving portfolio performance", image: portfolioDashboard },
  { label: "Revenue & Leases Analysis", tooltip: "Analyze revenue streams and lease trends", image: revenueleases },
  { label: "Risk & Stability Dashboard", tooltip: "Monitor risks and asset stability", image: portfolioDashboard },
  { label: "Market Signal Radar", tooltip: "Track real-time market signals", image: marketRadar },
  { label: "Deal Underwriting Lens", tooltip: "Evaluate deals with AI-powered insights", image: dealLens },
  { label: "Properties", tooltip: "View and manage property portfolio", image: properties },
];

const PlatformExperience = () => {
  const [active, setActive] = useState(0);

  return (
    <section className="section-padding section-dark section-dark-grid" style={{ background: "linear-gradient(180deg, #0b1a3a 0%, #0e1d35 50%, #0b1a3a 100%)" }}>
      <div className="absolute left-[7%] top-20 h-56 w-56 rounded-full bg-[#17345a] opacity-65 blur-3xl" />
      <div className="absolute right-[10%] bottom-16 h-60 w-60 rounded-full bg-emerald/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <ScrollReveal variant="up">
          <div className="mb-12 text-center">
            <p className="mb-3 text-base font-semibold uppercase tracking-widest text-emerald-light">
              Platform Experience
            </p>
            <h2 className="mb-4 font-display text-[2rem] font-extrabold text-white md:text-[2.35rem] lg:text-[2.8rem]">
              Designed for Decision-Makers
            </h2>
            <p className="text-base text-white/68">Every screen has a purpose, every insight drives action.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100} variant="scale">
          <div className="premium-panel-dark p-5 md:p-6">
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {screens.map((screen, index) => (
                <button
                  key={screen.label}
                  onClick={() => setActive(index)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    active === index
                      ? "bg-white text-[#0a1224] shadow-lg"
                      : "border border-white/10 bg-white/5 text-white/68 hover:border-emerald/30 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {screen.label}
                </button>
              ))}
            </div>

            <div className="mx-auto max-w-[980px]">
              <div className="premium-image-frame">
                <img
                  src={screens[active].image}
                  alt={screens[active].label}
                  title={screens[active].tooltip}
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-4 text-center text-sm text-white/58">{screens[active].tooltip}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PlatformExperience;
