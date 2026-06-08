import { useMemo, useState } from "react";

export type DemandElasticityPayload = {
  status?: string;
  curve?: {
    slope: number;
    intercept: number;
    avgRent: number;
    avgOccupancy: number;
    rSquared: number;
  };
  zones?: {
    pricingPower?: { label: string; description: string };
    rentGrowthOpportunity?: { label: string; description: string };
    demandRisk?: { label: string; description: string };
    equilibrium?: { label: string; description: string };
  };
  subject?: {
    name: string;
    rent: number;
    occupancy: number;
    zone?: string;
    units?: number;
    elasticity?: number;
  };
  comparables?: Array<{
    name: string;
    rent: number;
    occupancy: number;
    zone?: string;
    units?: number;
    source?: string;
    elasticity?: number;
  }>;
  simulator?: {
    baseRent: number;
    marketRent: number;
    baseOccupancy: number;
    marketOccupancy: number;
    subjectUnits: number;
    minRentChangePct: number;
    maxRentChangePct: number;
    baseAnnualRevenue: number;
    marketPosition: string;
    zoneDescription: string;
  } | null;
};

const ZONE_COLORS = {
  pricingPower: { bg: "rgba(220,252,231,0.55)", border: "#86efac" },
  rentGrowthOpportunity: { bg: "rgba(254,243,199,0.55)", border: "#fcd34d" },
  demandRisk: { bg: "rgba(254,226,226,0.55)", border: "#fca5a5" },
  equilibrium: { bg: "rgba(241,245,249,0.55)", border: "#cbd5e1" },
};

const ZONE_LABEL_MAP: Record<string, { label: string; description: string; dotColor: string }> = {
  pricingPower: { label: "Pricing Power", description: "High rent · High occupancy", dotColor: "#16a34a" },
  rentGrowthOpportunity: { label: "Rent Growth Opp.", description: "Low rent · High occupancy", dotColor: "#d97706" },
  demandRisk: { label: "Demand Risk", description: "High rent · Low occupancy", dotColor: "#dc2626" },
  equilibrium: { label: "Equilibrium", description: "Efficient pricing", dotColor: "#1e293b" },
};

const W = 700;
const H = 340;
const PAD = { top: 32, right: 60, bottom: 56, left: 68 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function scaleX(rent: number, minR: number, maxR: number) {
  return PAD.left + ((rent - minR) / (maxR - minR)) * PLOT_W;
}

function scaleY(occ: number, minO: number, maxO: number) {
  return PAD.top + ((maxO - occ) / (maxO - minO)) * PLOT_H;
}

function niceRange(values: number[], padFraction = 0.08) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return { min: min - span * padFraction, max: max + span * padFraction };
}

function yTicks(minO: number, maxO: number, count = 5) {
  const step = (maxO - minO) / (count - 1);
  return Array.from({ length: count }, (_, i) => minO + i * step).reverse();
}

function xTicks(minR: number, maxR: number, count = 5) {
  const step = (maxR - minR) / (count - 1);
  return Array.from({ length: count }, (_, i) => minR + i * step);
}

type HoveredPoint = {
  svgX: number;
  svgY: number;
  name: string;
  rent: number;
  occupancy: number;
  units?: number;
  elasticity?: number;
};

export default function PfDealElasticity({ payload }: { payload: DemandElasticityPayload }) {
  const { curve, subject, comparables = [] } = payload;
  const [hovered, setHovered] = useState<HoveredPoint | null>(null);

  const allRents = useMemo(
    () => [subject?.rent ?? 0, ...comparables.map((c) => c.rent)].filter(Boolean),
    [subject, comparables],
  );
  const allOccs = useMemo(
    () => [subject?.occupancy ?? 0, ...comparables.map((c) => c.occupancy)].filter(Boolean),
    [subject, comparables],
  );

  const rentRange = useMemo(() => niceRange(allRents), [allRents]);
  const occRange = useMemo(() => niceRange(allOccs), [allOccs]);

  const { min: minR, max: maxR } = rentRange;
  const { min: minO, max: maxO } = occRange;

  const avgRent = curve?.avgRent ?? (minR + maxR) / 2;
  const avgOcc = curve?.avgOccupancy ?? (minO + maxO) / 2;

  const sx = (r: number) => scaleX(r, minR, maxR);
  const sy = (o: number) => scaleY(o, minO, maxO);

  const quadrants = [
    { zone: "rentGrowthOpportunity", x: PAD.left, y: PAD.top, w: sx(avgRent) - PAD.left, h: sy(avgOcc) - PAD.top },
    { zone: "pricingPower", x: sx(avgRent), y: PAD.top, w: PAD.left + PLOT_W - sx(avgRent), h: sy(avgOcc) - PAD.top },
    { zone: "equilibrium", x: PAD.left, y: sy(avgOcc), w: sx(avgRent) - PAD.left, h: PAD.top + PLOT_H - sy(avgOcc) },
    { zone: "demandRisk", x: sx(avgRent), y: sy(avgOcc), w: PAD.left + PLOT_W - sx(avgRent), h: PAD.top + PLOT_H - sy(avgOcc) },
  ];

  const regressionLine = useMemo(() => {
    if (!curve) return null;
    const { slope, intercept } = curve;
    const occ1 = intercept + slope * minR;
    const occ2 = intercept + slope * maxR;
    return {
      x1: sx(minR),
      y1: sy(Math.min(Math.max(occ1, minO), maxO)),
      x2: sx(maxR),
      y2: sy(Math.min(Math.max(occ2, minO), maxO)),
    };
  }, [curve, minR, maxR, minO, maxO]);

  const yTickValues = useMemo(() => yTicks(minO, maxO), [minO, maxO]);
  const xTickValues = useMemo(() => xTicks(minR, maxR), [minR, maxR]);

  const rSquared = curve?.rSquared;

  if (!subject && comparables.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-500">
        No demand elasticity data available.
      </div>
    );
  }

  return (
    <div className="pdf-flow-block rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Demand Curve · Rent vs Occupancy</h2>
          <p className="mt-1 text-sm text-slate-500">Subject vs competitive set with market regression</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#16a34a",
              }}
            />
            Subject
          </span>
          <span className="flex items-center gap-1.5">
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "2px solid #475569",
                background: "white",
              }}
            />
            Competitor
          </span>
          {rSquared != null && (
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
              R² {rSquared.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: "block" }}
          aria-label="Demand Curve: Rent vs Occupancy"
        >
          {/* Quadrant backgrounds */}
          {quadrants.map((q) => {
            const colors = ZONE_COLORS[q.zone as keyof typeof ZONE_COLORS];
            return (
              <rect
                key={q.zone}
                x={q.x}
                y={q.y}
                width={Math.max(0, q.w)}
                height={Math.max(0, q.h)}
                fill={colors.bg}
              />
            );
          })}

          {/* Grid lines */}
          {yTickValues.map((tick) => (
            <line
              key={`gy-${tick}`}
              x1={PAD.left}
              x2={PAD.left + PLOT_W}
              y1={sy(tick)}
              y2={sy(tick)}
              stroke="#e2e8f0"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          ))}
          {xTickValues.map((tick) => (
            <line
              key={`gx-${tick}`}
              x1={sx(tick)}
              x2={sx(tick)}
              y1={PAD.top}
              y2={PAD.top + PLOT_H}
              stroke="#e2e8f0"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          ))}

          {/* Avg crosshairs */}
          <line
            x1={sx(avgRent)}
            x2={sx(avgRent)}
            y1={PAD.top}
            y2={PAD.top + PLOT_H}
            stroke="#94a3b8"
            strokeWidth={1.2}
            strokeDasharray="5 4"
          />
          <line
            x1={PAD.left}
            x2={PAD.left + PLOT_W}
            y1={sy(avgOcc)}
            y2={sy(avgOcc)}
            stroke="#94a3b8"
            strokeWidth={1.2}
            strokeDasharray="5 4"
          />

          {/* Regression line */}
          {regressionLine && (
            <line
              x1={regressionLine.x1}
              y1={regressionLine.y1}
              x2={regressionLine.x2}
              y2={regressionLine.y2}
              stroke="#1e293b"
              strokeWidth={1.8}
              strokeDasharray="7 4"
              opacity={0.7}
            />
          )}

          {/* Axes */}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={PLOT_W}
            height={PLOT_H}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={1}
          />

          {/* Y-axis ticks + labels */}
          {yTickValues.map((tick) => (
            <text
              key={`yl-${tick}`}
              x={PAD.left - 8}
              y={sy(tick) + 4}
              textAnchor="end"
              fontSize={11}
              fill="#64748b"
            >
              {tick.toFixed(0)}%
            </text>
          ))}

          {/* X-axis ticks + labels */}
          {xTickValues.map((tick) => (
            <text
              key={`xl-${tick}`}
              x={sx(tick)}
              y={PAD.top + PLOT_H + 18}
              textAnchor="middle"
              fontSize={11}
              fill="#64748b"
            >
              ${Math.round(tick).toLocaleString("en-US")}
            </text>
          ))}

          {/* Axis titles */}
          <text
            x={PAD.left - 46}
            y={PAD.top + PLOT_H / 2}
            textAnchor="middle"
            fontSize={11}
            fill="#475569"
            fontWeight={600}
            transform={`rotate(-90, ${PAD.left - 46}, ${PAD.top + PLOT_H / 2})`}
          >
            OCCUPANCY (%)
          </text>
          <text
            x={PAD.left + PLOT_W / 2}
            y={H - 6}
            textAnchor="middle"
            fontSize={11}
            fill="#475569"
            fontWeight={600}
          >
            IN-PLACE RENT ($/UNIT/MONTH)
          </text>

          {/* Comparable dots (hollow) */}
          {comparables.map((comp, i) => {
            const cx = sx(comp.rent);
            const cy = sy(comp.occupancy);
            return (
              <g
                key={`comp-${i}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered({ svgX: cx, svgY: cy, name: comp.name, rent: comp.rent, occupancy: comp.occupancy, units: comp.units, elasticity: comp.elasticity })}
                onMouseLeave={() => setHovered(null)}
              >
                {/* larger invisible hit area */}
                <circle cx={cx} cy={cy} r={16} fill="transparent" />
                <circle cx={cx} cy={cy} r={9} fill="white" stroke="#475569" strokeWidth={1.8} />
              </g>
            );
          })}

          {/* Subject dot (filled green with ring) */}
          {subject && (
            <g
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered({ svgX: sx(subject.rent), svgY: sy(subject.occupancy), name: subject.name, rent: subject.rent, occupancy: subject.occupancy, units: subject.units, elasticity: subject.elasticity })}
              onMouseLeave={() => setHovered(null)}
            >
              <circle cx={sx(subject.rent)} cy={sy(subject.occupancy)} r={16} fill="transparent" />
              <circle cx={sx(subject.rent)} cy={sy(subject.occupancy)} r={13} fill="white" stroke="#16a34a" strokeWidth={2.5} opacity={0.4} />
              <circle cx={sx(subject.rent)} cy={sy(subject.occupancy)} r={9} fill="#16a34a" stroke="white" strokeWidth={2} />
            </g>
          )}

          {/* Hover tooltip */}
          {hovered && (() => {
            const TIP_W = 176;
            const TIP_H = hovered.units != null || hovered.elasticity != null ? 118 : 82;
            const flipX = hovered.svgX + 18 + TIP_W > W - PAD.right;
            const tipX = flipX ? hovered.svgX - 18 - TIP_W : hovered.svgX + 18;
            const tipY = Math.max(PAD.top, Math.min(hovered.svgY - 30, PAD.top + PLOT_H - TIP_H));
            return (
              <foreignObject x={tipX} y={tipY} width={TIP_W} height={TIP_H} style={{ overflow: "visible" }}>
                <div
                  style={{
                    background: "white",
                    borderRadius: 10,
                    padding: "10px 13px",
                    boxShadow: "0 6px 24px rgba(15,23,42,0.14)",
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                    lineHeight: 1.5,
                    width: TIP_W,
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 7, fontSize: 13 }}>
                    {hovered.name}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: 3 }}>
                    <span>Rent</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>${Math.round(hovered.rent).toLocaleString("en-US")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: 3 }}>
                    <span>Occupancy</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{hovered.occupancy.toFixed(1)}%</span>
                  </div>
                  {hovered.units != null && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: 3 }}>
                      <span>Units</span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{hovered.units}</span>
                    </div>
                  )}
                  {hovered.elasticity != null && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                      <span>Elasticity</span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{hovered.elasticity.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </foreignObject>
            );
          })()}
        </svg>
      </div>

      {/* Zone legend */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Object.entries(ZONE_LABEL_MAP).map(([key, info]) => {
          const zoneColors = ZONE_COLORS[key as keyof typeof ZONE_COLORS];
          return (
            <div
              key={key}
              className="flex items-start gap-2 rounded-xl border px-3 py-2.5"
              style={{ borderColor: zoneColors.border, background: zoneColors.bg }}
            >
              <span
                style={{
                  display: "inline-block",
                  marginTop: 3,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: info.dotColor,
                  flexShrink: 0,
                }}
              />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-800">{info.label}</p>
                <p className="text-[11px] text-slate-500">{info.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
