import React from "react";
import { PortfolioSnapshot } from "../portfolio_analytics_types";

const SnapshotTab: React.FC<{ data?: PortfolioSnapshot }> = ({ data }) => {
  if (!data) {
    return <p className="text-sm text-slate-500">Snapshot is not yet available.</p>;
  }

  return (
    <div className="space-y-4 text-slate-900">
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Portfolio Scale
          </p>
          <div className="mt-4 space-y-2">
            <div>
              <p className="text-5xl font-bold leading-none">{data.totalProperties?.toLocaleString() ?? "-"}</p>
              <p className="mt-1 text-lg text-slate-500">Active Assets</p>
            </div>
            <div className="pt-2">
              <p className="text-5xl font-bold leading-none">{data.totalUnits?.toLocaleString() ?? "-"}</p>
              <p className="mt-1 text-lg text-slate-500">Units Under Management</p>
            </div>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-4xl font-bold leading-none">{data.grossPotentialRent?.display ?? "-"}</p>
            <p className="mt-1 text-lg text-slate-500">Gross Potential Rent</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Portfolio Profitability
          </p>
          <div className="mt-8 text-center">
            <p className="text-6xl font-bold leading-none">{data.noiMargin?.display ?? "-"}</p>
            <p className="mt-2 text-lg text-slate-500">NOI Margin</p>
            <p className="mt-4 text-2xl font-medium text-slate-700">
              {data.netOperatingIncome?.display ?? "-"} Net Operating Income
            </p>
            {data.noiMargin?.yoyChange !== undefined && (
              <p className="mt-1 text-xl font-semibold text-emerald-600">
                YoY Growth: {(data.noiMargin.yoyChange * 100).toFixed(1)}%
              </p>
            )}
          </div>
          <div className="mt-10">
            <div className="h-2 w-full rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-emerald-600"
                style={{ width: `${Math.min(Math.max(data.noiMargin?.value ?? 0, 0), 1) * 100}%` }}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                Healthy Margin Profile
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Revenue Momentum
          </p>
          <div className="mt-4">
            <p className="text-4xl font-bold leading-none">{data.revenuePerUnit?.display ?? "-"}</p>
            <p className="mt-1 text-lg text-slate-500">Revenue / Unit</p>
          </div>
          <div className="mt-3">
            <p className="text-5xl font-bold leading-none">{data.averageOccupancy?.display ?? "-"}</p>
            <p className="mt-1 text-lg text-slate-500">Average Occupancy</p>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xl text-slate-700">
                Vacancy Loss: <span className="font-medium">{data.vacancyLoss?.display ?? "-"}</span>
              </p>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                Above Target
              </span>
            </div>
            <div className="mt-4 flex justify-center">
              <svg width="170" height="44" viewBox="0 0 170 44" fill="none" aria-hidden="true">
                <polyline
                  points="4,34 40,20 70,26 104,14 132,23 166,17"
                  stroke="#2B5FB7"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Operating Pressure
          </p>
          <div className="mt-4">
            <p className="text-5xl font-bold leading-none">{data.operatingExpenseRatio?.display ?? "-"}</p>
            <p className="mt-1 text-lg text-slate-500">Operating Expense Ratio</p>
          </div>
          <div className="mt-3">
            <p className="text-5xl font-bold leading-none">{data.expensePerUnit?.display ?? "-"}</p>
            <p className="mt-1 text-lg text-slate-500">Expense / Unit</p>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-xl text-slate-700">
              Concessions: <span className="font-medium">{data.concessions?.display ?? "-"}</span>
              <span className="mx-4" />
              Bad Debt: <span className="font-medium">{data.badDebt?.display ?? "-"}</span>
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Expenses Stable - Concessions Slightly Elevated
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Portfolio Signals
          </p>
          <button type="button" className="text-sm font-medium text-blue-700 hover:text-blue-800">
            View Detailed Drivers -&gt;
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-slate-700">
          <li className="flex gap-2">
            <span className="pt-1 text-blue-700">&bull;</span>
            <span>NOI margin remains strong despite elevated vacancy.</span>
          </li>
          <li className="flex gap-2">
            <span className="pt-1 text-blue-700">&bull;</span>
            <span>Expense ratio stable; administrative costs trending upward.</span>
          </li>
          <li className="flex gap-2">
            <span className="pt-1 text-blue-700">&bull;</span>
            <span>Revenue per unit continues to outpace expense growth.</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default SnapshotTab;
