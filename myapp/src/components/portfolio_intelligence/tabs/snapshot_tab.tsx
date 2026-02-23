import React from "react";
import { PortfolioSnapshot } from "../portfolio_analytics_types";

const SnapshotTab: React.FC<{ data?: PortfolioSnapshot }> = ({ data }) => {
  if (!data) {
    return <p className="text-sm text-slate-500">Snapshot is not yet available.</p>;
  }
  const trendingMetrics = [
    { label: "Total Properties", value: data.totalProperties?.toLocaleString() ?? "-", note: "Active assets" },
    { label: "Total Units", value: data.totalUnits?.toLocaleString() ?? "-", note: "Units under management" },
    { label: "NOI Margin", value: data.noiMargin?.display ?? "-", note: "Trailing 12 months" },
    {
      label: "Vacancy Loss",
      value: data.vacancyLoss?.display ?? "-",
      detail:
        data.vacancyLoss?.yoyChange !== undefined
          ? `YoY ${(data.vacancyLoss.yoyChange * 100).toFixed(1)}%`
          : undefined,
    },
    {
      label: "Gross Potential Rent",
      value: data.grossPotentialRent?.display ?? "-",
      detail:
        data.grossPotentialRent?.yoyChange !== undefined
          ? `YoY ${(data.grossPotentialRent.yoyChange * 100).toFixed(1)}%`
          : undefined,
    },
    { label: "Average Occupancy", value: data.averageOccupancy?.display ?? "-", note: "Trailing average" },

  ];


  const extraCards = [
    { label: "Expense / Unit", value: data.expensePerUnit?.display ?? "-" },
    { label: "Revenue / Unit", value: data.revenuePerUnit?.display ?? "-" },
  ];

  const topCards = [

    {
      label: "Net Operating Income",
      value: data.netOperatingIncome?.display ?? "-",
      detail:
        data.netOperatingIncome?.yoyChange !== undefined
          ? `YoY ${(data.netOperatingIncome.yoyChange * 100).toFixed(1)}%`
          : undefined,
    },
    {
      label: "Concessions",
      value: data.concessions?.display ?? "-",
      detail:
        data.concessions?.yoyChange !== undefined
          ? `YoY ${(data.concessions.yoyChange * 100).toFixed(1)}%`
          : undefined,
    },
    { label: "Operating Expense Ratio", value: data.operatingExpenseRatio?.display ?? "-" },
    { label: "Bad Debt", value: data.badDebt?.display ?? "-" },


  ];

  return (
    <div className="space-y-5 text-slate-900">
      <div className="grid gap-4 sm:grid-cols-2">
        {trendingMetrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-m font-semibold text-center text-purple-700">{metric.label}</p>
            <p className="mt-3 text-3xl font-bold text-center text-slate-900">{metric.value}</p>
            {metric.detail && <p className="text-sm text-center text-slate-500">{metric.detail}</p>}
            <p className="text-sm text-center text-slate-500">{metric.note}</p>

          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-m font-semibold text-indigo-700">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
            {/* <p className="text-sm text-slate-500">{card.note}</p> */}
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {extraCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-m font-semibold text-indigo-700">{card.label}</p>
            <p className="mt-3 text-xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default SnapshotTab;
