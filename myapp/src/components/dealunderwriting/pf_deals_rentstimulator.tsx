import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import type { DemandElasticityPayload } from "./pf_deal_elasticity";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Elasticity model lookups (spec defaults)
const BETA = { tight: 0.2, balanced: 0.55, soft: 1.1 };
const CLASS = { a: 0.7, b: 1.0, c: 1.4 };
const PHASE = { immediate: 0.35, stabilized: 1.0 };

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value));

function getMarketPosition(revenueDelta: number, premium: number, change: number): string {
  if (Math.abs(change) < 0.5) return "Hold";
  if (revenueDelta < 0) return "Demand Risk";
  return premium < 0.08 ? "Growth Opportunity" : "Defensive";
}

function getZoneDescription(revenueDelta: number, premium: number, change: number): string {
  if (Math.abs(change) < 0.5) return "Stable market-aligned pricing";
  if (revenueDelta < 0) return "Aggressive pricing may pressure occupancy";
  return premium < 0.08 ? "Below-market rents with pricing upside" : "Premium rents supported by demand";
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

  const zeroMarkerPosition = useMemo(() => {
    if (!simulator) return 50;
    const range = simulator.maxRentChangePct - simulator.minRentChangePct;
    if (!(range > 0)) return 50;
    return clamp(((0 - simulator.minRentChangePct) / range) * 100, 0, 100);
  }, [simulator]);

  const scenario = useMemo(() => {
    if (!simulator) return null;

    if (
      !(simulator.baseRent > 0) ||
      !(simulator.marketRent > 0) ||
      !(simulator.baseOccupancy >= 0)
    ) {
      return null;
    }

    // ---------------------------
    // Market softness
    // ---------------------------
    let marketCondition: keyof typeof BETA = "balanced";

    if ((simulator.vacancyRate ?? 0) <= 5) {
      marketCondition = "tight";
    } else if ((simulator.vacancyRate ?? 0) <= 7.5) {
      marketCondition = "balanced";
    } else {
      marketCondition = "soft";
    }

    // Negative absorption = softer market
    if ((simulator.netAbsorption ?? 0) < 0) {
      marketCondition = "soft";
    }

    // Pipeline pressure
    const pipelinePct =
      simulator.inventory && simulator.pipeline
        ? (simulator.pipeline / simulator.inventory) * 100
        : 0;

    if (pipelinePct > 3) {
      marketCondition = "soft";
    }

    // ---------------------------
    // Elasticity coefficients
    // ---------------------------
    const beta = (BETA[marketCondition] ?? 0.55) * (CLASS[simulator.assetClass] ?? 1.0);

    const phaseMultiplier = PHASE[simulator.horizon] ?? 1.0;

    // ---------------------------
    // Rent after slider move
    // ---------------------------
    const projectedRent = simulator.baseRent * (1 + rentChangePct / 100);

    // Current premium to market
    const currentPremium = simulator.baseRent / simulator.marketRent - 1;

    // New premium after rent move
    const newPremium = projectedRent / simulator.marketRent - 1;

    // Sensitivity rises when pricing above market
    const sensitivity = beta * (1 + 4 * Math.max(0, newPremium));

    // Occupancy impact in percentage points
    let occupancyImpactPp = -sensitivity * (newPremium - currentPremium) * 100;

    // Rent cuts refill slower
    if (newPremium < currentPremium) {
      occupancyImpactPp *= 0.5;
    }

    // Horizon adjustment
    occupancyImpactPp *= phaseMultiplier;

    // Avoid floating point noise
    if (Math.abs(rentChangePct) < 0.01) {
      occupancyImpactPp = 0;
    }

    const projectedOccupancy = clamp(simulator.baseOccupancy + occupancyImpactPp,80,100);

    // Recalculate actual pp after clamp
    const finalOccupancyImpact = projectedOccupancy - simulator.baseOccupancy;

    // Base revenue derived from current rent + occupancy
    const baseRevenue = simulator.baseRent * simulator.subjectUnits * 12 * (simulator.baseOccupancy / 100);

    const annualRevenue = projectedRent * simulator.subjectUnits * 12 * (projectedOccupancy / 100);

    const revenueImpact = annualRevenue - baseRevenue;

    return {
      projectedRent,
      projectedOccupancy,
      annualRevenue,
      revenueImpact,
      occupancyImpactPp: finalOccupancyImpact,

      marketPosition: getMarketPosition( revenueImpact, newPremium, rentChangePct),

      zoneDescription: getZoneDescription(revenueImpact, newPremium,rentChangePct),
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
          <div className="relative mt-1 h-4 text-[11px] text-slate-600">
            <span className="absolute left-0 top-0">{simulator.minRentChangePct}%</span>
            <span className="absolute top-0 -translate-x-1/2" style={{ left: `${zeroMarkerPosition}%` }}>
              0%
            </span>
            <span className="absolute right-0 top-0">+{simulator.maxRentChangePct}%</span>
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
