import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import type { DemandElasticityPayload } from "./pf_deal_elasticity";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value));

function getMarketPosition(projectedRent: number, marketRent: number): string {
  const ratio = projectedRent / marketRent;
  if (ratio < 0.95) return "Growth Opp.";
  if (ratio <= 1.0) return "Equilibrium";
  if (ratio <= 1.05) return "Premium Pricing";
  return "Demand Risk";
}

function getZoneDescription(projectedRent: number, marketRent: number): string {
  const ratio = projectedRent / marketRent;
  if (ratio < 0.95) return "Low rent - High occupancy";
  if (ratio <= 1.0) return "Market-rate pricing";
  if (ratio <= 1.05) return "Above market - Moderate risk";
  return "High rent - Low occupancy risk";
}

function signedPercent(value: number) {
  if (value === 0) return "0.0%";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function signedPp(value: number) {
  if (value === 0) return "0.0pp";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}pp`;
}

function signedCurrency(value: number) {
  if (value === 0) return "$0";
  return `${value > 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;
}

function metricTone(value: number, inverse = false) {
  if (value === 0) return "text-emerald-700";
  const positive = inverse ? value < 0 : value > 0;
  return positive ? "text-emerald-600" : "text-red-600";
}

export default function PfDealsRentStimulator({ payload }: { payload: DemandElasticityPayload }) {
  const simulator = payload.simulator;
  const [rentChangePct, setRentChangePct] = useState(0);

  const scenario = useMemo(() => {
    if (!simulator) return null;
    if (!(simulator.marketRent > 0) || !(simulator.baseOccupancy >= 0)) return null;

    const projectedRent = simulator.baseRent * (1 + rentChangePct / 100);
    const rawOccupancy =
      simulator.baseOccupancy -
      (simulator.baseOccupancy - (simulator.marketOccupancy ?? simulator.baseOccupancy)) *
        (projectedRent / simulator.marketRent);
    const projectedOccupancy = clamp(Number.isFinite(rawOccupancy) ? rawOccupancy : simulator.baseOccupancy, 0, 100);
    const occupancyImpactPp = projectedOccupancy - simulator.baseOccupancy;
    const annualRevenue = projectedRent * simulator.subjectUnits * 12 * (projectedOccupancy / 100);
    const revenueImpact = annualRevenue - simulator.baseAnnualRevenue;

    return {
      projectedRent,
      projectedOccupancy,
      annualRevenue,
      revenueImpact,
      occupancyImpactPp,
      marketPosition: getMarketPosition(projectedRent, simulator.marketRent),
      zoneDescription: getZoneDescription(projectedRent, simulator.marketRent),
    };
  }, [rentChangePct, simulator]);

  if (!simulator || !scenario) return null;

  return (
    <aside className="pdf-flow-block flex min-h-full flex-col overflow-hidden rounded-3xl border border-[#d8e2f1] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4 border-b border-[#d8e2f1] px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Pricing Strategy Simulator</h2>
          <p className="mt-1 text-sm text-slate-600">Model rent moves against comparable market rents</p>
        </div>
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      </div>

      <div className="flex flex-1 flex-col gap-5 px-6 py-7">
        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Rent Change Scenario</p>
            <p className={`text-2xl font-black ${rentChangePct < 0 ? "text-red-600" : "text-emerald-600"}`}>
              {signedPercent(rentChangePct)}
            </p>
          </div>
          <input
            type="range"
            min={simulator.minRentChangePct}
            max={simulator.maxRentChangePct}
            step={0.5}
            value={rentChangePct}
            aria-label="Rent change scenario"
            onChange={(event) => setRentChangePct(Number(event.target.value))}
            className="mt-5 h-2 w-full cursor-pointer accent-[#102149]"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
            <span>{simulator.minRentChangePct}%</span>
            <span>0%</span>
            <span>+{simulator.maxRentChangePct}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <MetricCard label="Projected Rent" value={formatCurrency(scenario.projectedRent)} />
          <MetricCard
            label="Projected Occupancy"
            value={`${scenario.projectedOccupancy.toFixed(1)}%`}
            helper={signedPp(scenario.occupancyImpactPp)}
            tone={metricTone(scenario.occupancyImpactPp)}
          />
          <MetricCard label="Annual Revenue" value={formatCurrency(scenario.annualRevenue)} />
          <MetricCard
            label="Revenue Impact"
            value={signedCurrency(scenario.revenueImpact)}
            tone={metricTone(scenario.revenueImpact)}
          />
        </div>

        <div className="mt-1 grid grid-cols-2 gap-4 rounded-xl border border-[#d8e2f1] bg-[#f8fbff] px-4 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">Market Position</p>
            <p className="mt-2 text-base font-bold text-slate-950">{scenario.marketPosition}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">Occupancy Impact</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">{scenario.zoneDescription}</p>
            <p className={`mt-0.5 text-xs font-medium ${metricTone(scenario.occupancyImpactPp)}`}>
              {signedPp(scenario.occupancyImpactPp)}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MetricCard({ label, value, helper, tone = "text-slate-950" }: { label: string; value: string; helper?: string; tone?: string }) {
  return (
    <div className="min-h-[86px] rounded-xl border border-[#d8e2f1] bg-white px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">{label}</p>
      <p className={`mt-2 text-lg font-black ${tone}`}>{value}</p>
      {helper ? <p className={`mt-1 text-xs font-medium ${tone}`}>{helper}</p> : null}
    </div>
  );
}
