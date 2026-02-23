import React from "react";

const kpis = [
  {
    label: "Portfolio NOI",
    value: "$775.4M",
    delta: "+2.6% YoY",
    deltaClass: "text-emerald-600",
    accent: "border-l-4 border-emerald-500",
    icon: "$",
  },
  {
    label: "Weighted Avg Occupancy",
    value: "93.1%",
    delta: "-0.1% MoM",
    deltaClass: "text-red-600",
    accent: "border-l-4 border-sky-500",
    icon: "🏢",
  },
  {
    label: "Revenue at Risk",
    value: "$147.3M",
    delta: "5,914 units expiring in 60 days",
    deltaClass: "text-black",
    accent: "border-l-4 border-amber-500",
    icon: "⚠️",
  },
  {
    label: "Identified Upside",
    value: "$14.6M",
    delta: "Annualized NOI opportunity",
    deltaClass: "text-black",
    accent: "border-l-4 border-emerald-500",
    icon: "📈",
  },
];

const PortfolioKpis: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={`rounded-2xl border bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] ${kpi.accent}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                {kpi.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {kpi.value}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-lg shadow-sm">
              {kpi.icon}
            </div>
          </div>

          <p className={`mt-3 text-sm ${kpi.deltaClass}`}>
            {kpi.delta}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PortfolioKpis;
