import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { RevenueQualityLeaseIntelligence } from "../portfolio_analytics_types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const formatPercent = (value?: number) => (value === undefined ? "-" : `${value.toFixed(1)}%`);
const formatPercentvalue = (value?: number) => (value === undefined ? "-" : `${(value * 100).toFixed(1)}%`);
const formatCurrency = (value?: number) =>
  value === undefined ? "-" : `$${value.toLocaleString()}`;

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#475569" },
    },
    y: {
      grid: { color: "rgba(148,163,184,0.2)" },
      ticks: { color: "#475569" },
      beginAtZero: true,
    },
  },
  plugins: {
    legend: { display: false },
  },
};

const RevenueQualityLeaseIntelligenceTab: React.FC<{ data?: RevenueQualityLeaseIntelligence }> = ({
  data,
}) => {
  if (!data) {
    return <p className="text-sm text-slate-500">Revenue & lease intelligence is not available.</p>;
  }

  const summary = data.kpi_summary;
  const ladder = data.lease_expiration_ladder_next_12_months?.data ?? [];

  const ladderData = {
    labels: ladder.map((row) => row.month ?? ""),
    datasets: [
      {
        label: "Expirations",
        data: ladder.map((row) => row.expirations ?? 0),
        backgroundColor: "#14b8a6",
        borderRadius: 10,
      },
    ],
  };

  const cards = [
    { label: "Renewal Rate", value: formatPercent(summary?.renewal_rate_pct) },
    { label: "Loss-to-Lease (WTD)", value: formatPercentvalue(summary?.wtd_loss_to_lease_pct) },
    { label: "Units Below Market", value: formatPercentvalue(summary?.units_below_market_pct) },
    {
      label: "Avg Lease Remaining",
      value: summary?.avg_lease_remaining_months ? `${summary.avg_lease_remaining_months.toFixed(1)} months` : "-",
    },
    { label: "Mark-to-Market Opportunity", value: formatCurrency(summary?.mark_to_market_opportunity_usd) },
  ];

  return (
    <div className="space-y-6 text-slate-900">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-s text-indigo-700">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      {ladder.length ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Lease Expiration Ladder — Next 12 Months
            </h3>
            <span className="text-sm text-slate-500">
              {data.lease_expiration_ladder_next_12_months?.unit ?? "leases"}
            </span>
          </div>
          <div className="mt-4 h-56">
            <Bar data={ladderData} options={chartOptions} />
          </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 bg-blue-50 p-4 rounded-xl mt-4">
          {data.lease_expiration_ladder_next_12_months?.risk_flags && (
            <p className="mt-3 text-lg uppercase tracking-wide text-red-500">
              Peak month: {data.lease_expiration_ladder_next_12_months.risk_flags.peak_month} (
              {data.lease_expiration_ladder_next_12_months.risk_flags.peak_expirations} expirations)
            </p>
          )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No lease expiration ladder data found.</p>
      )}
    </div>
  );
};

export default RevenueQualityLeaseIntelligenceTab;
