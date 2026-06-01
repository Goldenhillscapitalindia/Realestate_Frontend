import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Fragment, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import type { Deal } from "./data";
import { ChartInsight } from "./ChartInsight";

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const colors = ["#274b87", "#3b65ad", "#5f8ad4", "#88ace7", "#b5ccf4", "#dbe7fb", "#12325f", "#7f9fda"];

function formatMoney(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function ChartCard({
  title,
  children,
  insight,
}: {
  title: string;
  children: React.ReactNode;
  insight?: { insight: string; impact: string; drives: string };
}) {
  return (
    <div className="rounded-2xl border border-[#294e86] bg-white p-5">
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#57719c]">{title}</h4>
      <div className="h-64">{children}</div>
      {insight ? <ChartInsight {...insight} /> : null}
    </div>
  );
}

function FloorplanHeatmap({
  title,
  xlabels,
  ylabels,
  data,
}: {
  title: string;
  xlabels: string[];
  ylabels: string[];
  data: number[][];
}) {
  const flatValues = data.flat();
  const maxValue = Math.max(...flatValues, 0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);

  const getCellColor = (value: number) => {
    if (value <= 0 || maxValue <= 0) return "#f5f2ea";
    const ratio = value / maxValue;
    const alpha = 0.22 + ratio * 0.7;
    return `rgba(200, 33, 111, ${alpha.toFixed(2)})`;
  };

  return (
    <div className="relative rounded-2xl bg-[#fffdfa] p-5 text-[#2a2a2a]">
      <h5 className="mb-4 text-center text-[15px] font-semibold text-[#2a2a2a]">{title}</h5>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `80px repeat(${xlabels.length}, minmax(0, 1fr))` }}
      >
        {/* Header row */}
        <div />
        {xlabels.map((label) => (
          <div key={label} className="pb-1 text-center text-xs font-medium text-[#494949]">
            {label}
          </div>
        ))}

        {/* Data rows */}
        {ylabels.map((rowLabel, rowIndex) => (
          <Fragment key={rowLabel}>
            <div className="flex items-center pr-1 text-xs font-medium leading-tight text-[#494949]">
              {rowLabel}
            </div>
            {xlabels.map((columnLabel, columnIndex) => {
              const value = data[rowIndex]?.[columnIndex] ?? 0;
              return (
                <div
                  key={`${rowLabel}-${columnLabel}`}
                  className="h-7 w-full rounded-sm cursor-default"
                  style={{
                    backgroundColor: getCellColor(value),
                    border: value > 0
                      ? "1px solid rgba(200,33,111,0.12)"
                      : "1px solid rgba(224,218,205,0.75)",
                  }}
                  onMouseEnter={(e) => {
                    if (value > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parentRect = e.currentTarget.closest(".relative")!.getBoundingClientRect();
                      setTooltip({
                        x: rect.left - parentRect.left + rect.width / 2,
                        y: rect.top - parentRect.top - 8,
                        label: `${columnLabel}\nValue: ${value}`,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded border border-[#d8bfd0] bg-white px-2 py-1 text-xs text-[#2a2a2a] shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            whiteSpace: "pre-line",
          }}
        >
          {tooltip.label}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-3 text-xs text-[#494949]">
        <span>0</span>
        <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-[#f3d7e3] via-[#e888b2] to-[#c8216f]" />
        <span>{maxValue}</span>
      </div>
    </div>
  );
}
const axisColor = "rgba(15,23,42,0.08)";
const tickColor = "#475569";

function hasChartData(arr: Array<Record<string, number | string>>): boolean {
  return arr.some((item) =>
    Object.values(item).some((v) => typeof v === "number" && v !== 0)
  );
}

function OccupancyDonut({ occupied, total }: { occupied: number; total: number }) {
  const vacant = Math.max(total - occupied, 0);
  const occupiedRatio = total > 0 ? Math.min(Math.max(occupied / total, 0), 1) : 0;
  const pct = Math.round(occupiedRatio * 100);
  const radius = 68;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - occupiedRatio * circumference;
  const vacantColor = "#f59e0b";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg width="176" height="176" viewBox="0 0 176 176">
          <circle cx="88" cy="88" r={radius} fill="none" stroke={vacantColor} strokeWidth={strokeWidth} />
          <circle
            cx="88" cy="88" r={radius}
            fill="none"
            stroke="#274b87"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 88 88)"
          />
        </svg>
        <div className="absolute flex flex-col items-center leading-tight">
          <span className="text-4xl font-bold text-[#102149]">{occupied}</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#57719c]">Occupied</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-[#57719c]">
        <span className="font-medium text-[#102149]">{pct}% of {total}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#274b87]" />Occupied: {occupied}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b]" />Vacant: {vacant}</span>
      </div>
    </div>
  );
}

export function DealCharts({ deal }: { deal: Deal }) {
  const ci = deal.chartInsights;

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" as const, labels: { color: tickColor } } },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: tickColor }, grid: { color: axisColor } },
      y: { ticks: { color: tickColor }, grid: { color: axisColor } },
    },
    plugins: { legend: { labels: { color: tickColor } } },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: tickColor }, grid: { color: axisColor } },
      y: {
        ticks: {
          color: tickColor,
          callback: (value: string | number) => formatMoney(Number(value)),
        },
        grid: { color: axisColor },
      },
    },
    plugins: { legend: { labels: { color: tickColor } } },
  };

  return (
    <>
      <section className="pdf-flow-block mb-2">
        <h3 className="text-xl font-semibold uppercase tracking-[0.12em] text-[#102149]">Performance Analytics</h3>
      </section>
      <section className="pdf-flow-block mb-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Tenant Mix" insight={ci.tenantMix}>
          <Pie
            data={{
              labels: deal.tenantMix.map((item) => `${item.name} ${item.percentage}%`),
              datasets: [{ data: deal.tenantMix.map((item) => item.count ?? item.percentage), backgroundColor: colors }],
            }}
            options={pieOptions}
          />
        </ChartCard>

        <ChartCard title="Rent vs Market" insight={ci.rentVsMarket}>
          <Bar
            data={{
              labels: deal.rentVsMarket.map((item) => item.type),
              datasets: [
                { label: "Current", data: deal.rentVsMarket.map((item) => item.current), backgroundColor: "#274b87" },
                { label: "Market", data: deal.rentVsMarket.map((item) => item.market), backgroundColor: "#8cb3f4" },
              ],
            }}
            options={barOptions}
          />
        </ChartCard>

        <ChartCard
          title={hasChartData(deal.revenueVsExpenses as unknown as Array<Record<string, number | string>>) ? "Revenue vs Expenses" : "Revenue vs Expenses vs NOI"}
          insight={ci.revenueVsExpenses}
        >
          {hasChartData(deal.revenueVsExpenses as unknown as Array<Record<string, number | string>>) ? (
            <Line
              data={{
                labels: deal.revenueVsExpenses.map((item) => item.month),
                datasets: [
                  { label: "Revenue", data: deal.revenueVsExpenses.map((item) => item.revenue), borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.15)", tension: 0.35 },
                  { label: "Expense", data: deal.revenueVsExpenses.map((item) => item.expenses), borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.15)", tension: 0.35 },
                ],
              }}
              options={lineOptions}
            />
          ) : (
            <Bar
              data={{
                labels: ["Revenue", "Expenses", "NOI"],
                datasets: [
                  {
                    label: " ",
                    data: [
                      deal.metrics.noi + deal.metrics.totalExpenses,
                      deal.metrics.totalExpenses,
                      deal.metrics.noi,
                    ],
                    backgroundColor: ["#274b87", "#f59e0b", "#22c55e"],
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                  },
                ],
              }}
              options={{
                ...barOptions,
                plugins: {
                  ...barOptions.plugins,
                  legend: { display: false },
                },
              }}
            />
          )}
        </ChartCard>
      </section>
      <section className="pdf-flow-block mb-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Expense Distribution" insight={ci.expenseDistribution}>
          <Pie
            data={{
              labels: deal.expenseDistribution.map((item) => `${item.category} ${item.percent?.toFixed(1) ?? 0}%`),
              datasets: [{ data: deal.expenseDistribution.map((item) => item.amount), backgroundColor: colors }],
            }}
            options={pieOptions}
          />
        </ChartCard>

        <ChartCard title="Lease Expirations" insight={ci.leaseExpirations}>
          <Bar
            data={{
              labels: deal.leaseExpirations.map((item) => item.year),
              datasets: [{ label: "Units", data: deal.leaseExpirations.map((item) => item.units), backgroundColor: "#274b87" }],
            }}
            options={barOptions}
          />
        </ChartCard>

        <ChartCard title="Occupancy vs Vacancy" insight={ci.occupancyVacancy}>
          {hasChartData(deal.occupancyHistory as unknown as Array<Record<string, number | string>>) ? (
            <Line
              data={{
                labels: deal.occupancyHistory.map((item) => item.month),
                datasets: [
                  { label: "Occupancy %", data: deal.occupancyHistory.map((item) => item.occupancy), borderColor: "#274b87", backgroundColor: "rgba(39,75,135,0.1)", tension: 0.35 },
                  { label: "Vacancy %", data: deal.occupancyHistory.map((item) => item.vacancy), borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)", tension: 0.35 },
                ],
              }}
              options={barOptions}
            />
          ) : (
            <OccupancyDonut
              occupied={deal.metrics.occupancyUnits?.occupied ?? Math.round((deal.metrics.occupancy / 100) * (deal.metrics.noOfUnits ?? 0))}
              total={deal.metrics.occupancyUnits?.total ?? deal.metrics.noOfUnits ?? 0}
            />
          )}
        </ChartCard>
      </section>
      {deal.leaseExpirationFloorplan?.xlabels?.length && deal.leaseExpirationFloorplan?.ylabels?.length ? (
        <section className="pdf-flow-block mb-4">
          <FloorplanHeatmap
            title={deal.leaseExpirationFloorplan.title}
            xlabels={deal.leaseExpirationFloorplan.xlabels}
            ylabels={deal.leaseExpirationFloorplan.ylabels}
            data={deal.leaseExpirationFloorplan.data}
          />
        </section>
      ) : null}
    </>
  );
}
