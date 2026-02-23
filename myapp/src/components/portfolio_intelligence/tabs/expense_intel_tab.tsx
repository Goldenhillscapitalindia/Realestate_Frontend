import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { ExpenseDashboard } from "../portfolio_analytics_types";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const fmtCurrency = (value?: number) =>
  value === undefined ? "-" : `$${value.toLocaleString()}`;

const fmtPercent = (value?: number) =>
  value === undefined ? "-" : `${(value * 100).toFixed(1)}%`;

const ExpenseIntelTab: React.FC<{ data?: ExpenseDashboard }> = ({ data }) => {
  if (!data) {
    return (
      <p className="text-sm text-slate-500">
        Expense intelligence is not available.
      </p>
    );
  }

  const categories = data.categories ?? [];

  /* -------------------- Doughnut Data -------------------- */

  const compositionData = {
    labels: categories.map((cat) => cat.name ?? "Category"),
    datasets: [
      {
        data: categories.map(
          (cat) => (cat.compositionPercent ?? 0) * 100
        ),
        backgroundColor: [
          "#3b82f6",
          "#6366f1",
          "#0ea5e9",
          "#14b8a6",
          "#f97316",
          "#ef4444",
        ],
        borderWidth: 2,
      },
    ],
  };

const compositionOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "55%",
  plugins: {
    legend: {
      position: "right" as const,
      labels: {
        boxWidth: 14,
        padding: 16,
        color: "#334155",
        font: { size: 12 },
      },
    },
    tooltip: {
      backgroundColor: "#0f172a",
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 10,
      borderRadius: 8,
      callbacks: {
        label: function (context: any) {
          const label = context.label || "";
          const value = context.raw;
          return `${label}: ${value.toFixed(1)}%`;
        },
      },
    },
  },
};


  /* -------------------- Bar Chart Data -------------------- */

  const growthData = {
    labels: categories.map((cat) => cat.name ?? ""),
    datasets: [
      {
        label: "YoY Growth",
        data: categories.map(
          (cat) => (cat.yoyGrowthPercent ?? 0) * 100
        ),
        borderRadius: 8,
        barThickness: 28,
        backgroundColor: categories.map((cat) =>
          (cat.yoyGrowthPercent ?? 0) >= 0
            ? "#fbbf24"
            : "#ef4444"
        ),
      },
    ],
  };
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: 10,
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: "#475569",
        font: { size: 12 },
      },
    },
    y: {
      grid: { color: "rgba(148,163,184,0.15)" },
      ticks: {
        color: "#475569",
        font: { size: 12 },
        callback: function (value: any) {
          return value + "%";
        },
      },
      beginAtZero: true,
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0f172a",
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 10,
      borderRadius: 8,
      callbacks: {
        label: function (context: any) {
          const value = context.raw;
          return `${value.toFixed(1)}%`;
        },
      },
    },
  },
};


  return (
    <div className="space-y-8 text-slate-900">
      {/* -------------------- Summary Cards -------------------- */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm text-indigo-700">Total Current</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {fmtCurrency(data.summary?.totalCurrent)}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm text-indigo-700">Total Prior Year</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {fmtCurrency(data.summary?.totalPriorYear)}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm text-indigo-700">Overall YoY</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {fmtPercent(data.summary?.overallYoYGrowth)}
          </p>
        </div>
      </div>

      {/* -------------------- Table -------------------- */}

      <div className="overflow-x-auto rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-sm font-semibold tracking-wide text-blue-900">
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Current</th>
              <th className="px-4 py-3">Prior Year</th>
              <th className="px-4 py-3">YoY Growth</th>
              <th className="px-4 py-3">Per Unit</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.name}
                className="border-t border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="px-4 py-3 font-semibold text-black">
                  {category.name}
                </td>
                <td className="px-4 py-3 text-black">
                  {fmtCurrency(category.current)}
                </td>
                <td className="px-4 py-3 text-black">
                  {fmtCurrency(category.priorYear)}
                </td>
                <td
                  className={`px-4 py-3 font-semibold ${
                    (category.yoyGrowthPercent ?? 0) < 0
                      ? "text-rose-500"
                      : "text-emerald-600"
                  }`}
                >
                  {fmtPercent(category.yoyGrowthPercent)}
                </td>
                <td className="px-4 py-3 text-black">
                  {fmtCurrency(category.perUnit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* -------------------- Charts -------------------- */}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <h3 className="text-lg font-semibold text-slate-900">
            Expense Composition
          </h3>
          <div className="mt-6 h-[360px]">
            <Doughnut
              data={compositionData}
              options={compositionOptions}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <h3 className="text-lg font-semibold text-slate-900">
            Expense Growth (YoY %)
          </h3>
          <div className="mt-6 h-[360px]">
            <Bar data={growthData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseIntelTab;
