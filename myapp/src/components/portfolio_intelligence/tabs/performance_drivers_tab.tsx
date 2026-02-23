import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { PerformanceDriversPayload } from "../portfolio_analytics_types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const baseOptions: ChartOptions<"line"> = {
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
    },
  },
  plugins: {
    legend: {
      labels: { color: "#0f172a", font: { weight: "bold" as const } },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          if (typeof context.raw === "number") {
            return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
          }
          return context.dataset.label;
        },
      },
    },
  },
};

const PerformanceDriversTab: React.FC<{ data?: PerformanceDriversPayload }> = ({ data }) => {
  if (!data) {
    return <p className="text-sm text-slate-500">Performance driver data is unavailable.</p>;
  }

  const noiTrend = data.noi_trend_2025?.data ?? [];
  const revenueTrend = data.revenue_vs_expense_2025?.data ?? [];
  const derived = data.revenue_vs_expense_2025?.derived_metrics;

  const noiChartData = {
    labels: noiTrend.map((point) => point.date),
    datasets: [
      {
        label: "NOI",
        data: noiTrend.map((point) => point.noi ?? 0),
        borderColor: "#0d9488",
        backgroundColor: "rgba(13,148,136,0.2)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const revenueChartData = {
    labels: revenueTrend.map((point) => point.date),
    datasets: [
      {
        label: "Revenue",
        data: revenueTrend.map((point) => point.revenue ?? 0),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.2)",
        // fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: "Expense",
        data: revenueTrend.map((point) => point.expense ?? 0),
        borderColor: "#f97316",
        backgroundColor: "rgba(249,115,22,0.2)",
        // fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Revenue Growth */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-m uppercase tracking-wide text-center text-indigo-700">
            Revenue Growth
          </p>
          <p className="mt-2 text-2xl font-semibold text-center text-slate-900">
            {derived?.revenue_growth_pct !== undefined
              ? `${(derived.revenue_growth_pct * 100).toFixed(1)}%`
              : "-"}
          </p>
          <p className="text-sm text-center text-slate-500">
            Period-over-period growth
          </p>
        </div>

        {/* Expense Growth */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-m uppercase tracking-wide text-center text-indigo-700">
            Expense Growth
          </p>
          <p className="mt-2 text-2xl font-semibold text-center text-slate-900">
            {derived?.expense_growth_pct !== undefined
              ? `${(derived.expense_growth_pct * 100).toFixed(1)}%`
              : "-"}
          </p>
          <p className="text-sm text-center text-slate-500">
            Period-over-period growth
          </p>
        </div>
      </div>


      {noiTrend.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">NOI Trend</h3>
            <span className="text-sm text-slate-500">
              {data.noi_trend_2025?.currency ?? "USD"} · {data.noi_trend_2025?.frequency ?? "Monthly"}
            </span>
          </div>
          <div className="mt-4 h-64">
            <Line data={noiChartData} options={baseOptions} />
          </div>
        </div>
      )}

      {revenueTrend.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Revenue vs Expense</h3>
            <span className="text-sm text-slate-500">
              {data.revenue_vs_expense_2025?.currency ?? "USD"} · {data.revenue_vs_expense_2025?.frequency ?? "Monthly"}
            </span>
          </div>
          <div className="mt-4 h-64">
            <Line data={revenueChartData} options={baseOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDriversTab;
