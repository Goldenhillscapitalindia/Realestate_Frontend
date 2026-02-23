import React from "react";
import { Building2, DollarSign, Home, Scale, Sparkles } from "lucide-react";
import { PULSE_COLORS } from "./constants";

type MarketRadarHighlightsProps = {
  pulseCounts: Record<string, number>;
  assetType: "Multifamily" | "Industrial";
};

const MarketRadarHighlights: React.FC<MarketRadarHighlightsProps> = ({ pulseCounts, assetType }) => {
  const isIndustrial = assetType === "Industrial";

  const aiPulseText = isIndustrial
    ? "Large, logistics-driven industrial market anchored by regional distribution, strong transport connectivity, and a shift toward more disciplined, demand-aligned development."
    : "Atlanta is one of the largest and most established multifamily markets in the U.S. The market is currently normalizing after a heavy supply cycle, with demand steadily absorbing new inventory and construction activity slowing. While rent growth is muted in the near term, long-term fundamentals remain supportive due to population growth, job diversity, and relative affordability.";

  const marketSize = isIndustrial ? "~870M SF of industrial inventory" : "~550K market-rate apartment units";
  const marketSizeDesc = isIndustrial
    ? "One of the largest logistics and distribution hubs in the Southeast."
    : "Large, diversified metro with depth across urban and suburban submarkets.";

  const vacancyLabel = isIndustrial ? "8.1% vacancy" : "11.6% vacancy | Improving YoY";
  const vacancyDesc = isIndustrial
    ? "Vacancy remains elevated versus history following heavy recent development."
    : "Vacancy has declined over the past year as leasing conditions strengthened.";

  const avgRent = isIndustrial ? "~$9.80 per SF" : "~$1,640 average asking rent";
  const avgRentDesc = isIndustrial
    ? "Below the U.S. average, supporting tenant cost competitiveness."
    : "Below the U.S. average, supporting affordability and renter demand.";

  const demandSupplyTitle = "Demand-Supply Balance";
  const demandSupply = isIndustrial
    ? "Net absorption < new deliveries (last 12 months)"
    : "Demand > Supply (last 12 months)";
  const demandSupplyDesc = isIndustrial
    ? "The market is still working through recent supply additions."
    : "Absorption has outpaced deliveries, helping normalize market conditions.";

  const marketCycleDesc = isIndustrial
    ? "Conditions are normalizing as development slows and leasing gradually improves."
    : "Construction is moderating and market conditions are steadily improving.";

  const summaryCards = [
    {
      title: "Market Size",
      icon: <Building2 size={16} className="text-indigo-600" />,
      value: marketSize,
      description: marketSizeDesc,
    },
    {
      title: "Vacancy",
      icon: <Home size={16} className="text-emerald-600" />,
      value: vacancyLabel,
      description: vacancyDesc,
    },
    {
      title: "Average Rent",
      icon: <DollarSign size={16} className="text-blue-600" />,
      value: avgRent,
      description: avgRentDesc,
    },
    {
      title: demandSupplyTitle,
      icon: <Scale size={16} className="text-amber-600" />,
      value: demandSupply,
      description: demandSupplyDesc,
    },
  ];

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border border-slate-200 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,255,0.98) 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="mr-2 inline-block text-violet-500" />
          <h3 className="text-m font-semibold text-black">AI Market Pulse - ATLANTA</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-black">{aiPulseText}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-violet-400  p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-center gap-2 text-m font-semibold text-black">
              {card.icon}
              {card.title}
            </div>
            <p className="mt-3 text-sm font-semibold text-black">{card.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-black">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div
          className="rounded-2xl border border-slate-200 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,255,0.98) 100%)",
          }}
        >
          <p className="text-m text-black font-semibold">Market Cycle</p>
          <p className="mt-3 text-sm font-semibold text-black">Late Expansion - Stabilization</p>
          <p className="mt-2 text-xs leading-relaxed text-black">{marketCycleDesc}</p>
        </div>

        <div
          className="rounded-2xl border border-slate-200 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,255,0.98) 100%)",
          }}
        >
          <p className="text-s text-black font-semibold">Market Pulse</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-black">
            {Object.keys(PULSE_COLORS).map((key) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: PULSE_COLORS[key].dot,
                    boxShadow: `0 0 10px ${PULSE_COLORS[key].glow}`,
                  }}
                />
                <span className="flex-1">{PULSE_COLORS[key].label}</span>
                <span className="text-black">{pulseCounts[key] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketRadarHighlights;
