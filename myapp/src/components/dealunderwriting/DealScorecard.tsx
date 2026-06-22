import { AlertTriangle, BarChart2, Building2, CheckCircle, Settings2, Sparkles, TrendingUp } from "lucide-react";
import type { Deal } from "./data";

export function getBarColor(score: number, invert?: boolean) {
  const effective = invert ? 100 - score : score;
  if (effective >= 75) return "bg-[#19b68f]";
  if (effective >= 50) return "bg-[#f3a122]";
  return "bg-[#ef4444]";
}

// Score-based color (green / yellow / red) for circles + accent borders
function getScoreColor(score: number) {
  if (score >= 85) return "#19b68f";   // STRONG BUY
  if (score >= 70) return "#34d399";   // BUY
  if (score >= 55) return "#f3a122";   // HOLD
  if (score >= 40) return "#fb923c";   // WATCH
  return "#ef4444";                    // AVOID
}

function getRecStyle(rec: string) {
  const u = (rec ?? "").toUpperCase();
  if (u.includes("STRONG BUY")) return { color: "#19b68f", bg: "#e8faf4", label: "STRONG BUY" };
  if (u.includes("BUY")) return { color: "#19b68f", bg: "#e8faf4", label: "BUY" };
  if (u.includes("HOLD")) return { color: "#f3a122", bg: "#fef8ed", label: "HOLD" };
  if (u.includes("AVOID")) return { color: "#ef4444", bg: "#fef2f2", label: "AVOID" };
  return { color: "#6b7280", bg: "#f9fafb", label: rec || "—" };
}

function CircularScore({ score, color }: { score: number; color: string }) {
  const r = 37;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(score, 100) / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-xl font-bold text-white">{score}</span>
        <span className="mt-0.5 text-[9px] text-white/60">/100</span>
      </div>
      
    </div>
  );
}

const CATEGORIES = [
  { key: "pricing" as const, label: "PRICING", Icon: TrendingUp },
  { key: "stability" as const, label: "STABILITY", Icon: Building2 },
  { key: "market" as const, label: "MARKET", Icon: BarChart2 },
  { key: "operations" as const, label: "OPERATIONS", Icon: Settings2 },
  { key: "upside" as const, label: "UPSIDE", Icon: Sparkles },
];

const SCORE_MARKERS = [0, 40, 55, 70, 85, 100];

export function DealScorecard({ deal }: { deal: Deal }) {
  const sc = deal.dealScorecard;
  const overall = deal.scores.overall;
  const overallRec = sc?.recommendation || deal.signal || "";
  const { color: overallColor, label: overallLabel } = getRecStyle(overallRec);
  const fit = sc?.investmentStyleFit;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e1e7f5] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#2f568f] px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#19b68f]" />
          <span className="text-sm font-bold uppercase tracking-[0.15em] text-white">Deal Scorecard</span>
        </div>
        <span className="font-mono text-sm tracking-[0.15em] text-[#8295b8]">{deal.id?.toUpperCase?.() ?? ""}</span>
      </div>

      <div className="flex divide-x divide-[#e1e7f5]">
        {/* Left: Overall + Category Cards */}
        <div className="min-w-0 flex-1 space-y-5 p-6">
          {/* Overall Score (unchanged) */}
          <div className="rounded-xl border border-[#e1e7f5] bg-[#f9fbff] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#9aa7c0]">Overall Deal Score</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div className="flex items-end gap-2">
                <span className="text-7xl font-bold leading-none text-[#102149]">{overall}</span>
                <span className="mb-2 text-2xl text-[#9aa7c0]">/ 100</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: overallColor }}
                >
                  ✓ {overallLabel}
                </button>
                <span className="text-xs text-[#9aa7c0]">Recommendation</span>
              </div>
            </div>
            <div className="relative mt-4">
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#e8edf8]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${overall}%`, backgroundColor: overallColor }}
                />
                {[40, 55, 70, 85].map((pos) => (
                  <div key={pos} className="absolute top-0 h-full w-px bg-white/60" style={{ left: `${pos}%` }} />
                ))}
              </div>
              <div className="relative h-5 mt-0.5">
                {SCORE_MARKERS.map((pos) => (
                  <span
                    key={pos}
                    className="absolute top-1 text-[10px] text-[#9aa7c0]"
                    style={{
                      left: `${pos}%`,
                      transform: pos === 0 ? "none" : pos === 100 ? "translateX(-100%)" : "translateX(-50%)",
                    }}
                  >
                    {pos}
                  </span>
                ))}
              </div>
            </div>
            {sc?.overallSummary && (
              <p className="mt-3 rounded-lg border border-[#d1f5ea] bg-[#f0fdf8] px-3 py-2 text-sm text-[#102149]">
                <span className="mr-1 text-[#19b68f]">↗</span>
                {sc.overallSummary}
              </p>
            )}
          </div>

          {/* Category Cards — Variant 2: navy header (score) + white body (explanation) */}
          <div className="grid grid-cols-5 gap-2 items-stretch">
            {CATEGORIES.map(({ key, label, Icon }) => {
              const cat = sc?.[key];
              const score = cat?.score ?? 0;
              const rec = cat?.recommendation ?? "";
              const scoreColor = getScoreColor(score);
              // const { bg, label: recLabel } = getRecStyle(rec);
              const explanation =
                cat?.explanation?.trim() || (sc as Record<string, any>)?.[`${key}Explanation`] || "";

              return (
                <div
                  key={key}
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-[#e1e7f5] bg-white shadow-sm"
                >
                  {/* Top accent stripe */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: scoreColor }} />

                  {/* Navy header: icon + score */}
                  <div
                    className="relative px-4 pt-4 pb-7"
                    style={{ background: "linear-gradient(180deg, #284D82 0%, #1F3D68 100%)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-4 w-4 text-[#b7c8e8]" />
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#dbe6f8]">{label}</span>
                    </div>

                    <div className="mt-3 flex flex-col items-center gap-2">
                      <CircularScore score={score} color={scoreColor} />
                      {/* {rec && (
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                          style={{ color: scoreColor, backgroundColor: bg }}
                        >
                          {recLabel}
                        </span>
                      )} */}
                    </div>

                    {/* Curved divider into white body */}
                    <svg
                      className="absolute -bottom-px left-0 h-3 w-full"
                      viewBox="0 0 100 8"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <path d="M0,8 Q50,0 100,8 L100,8 L0,8 Z" fill="#ffffff" />
                    </svg>
                  </div>

                  {/* White body: explanation */}
                  <div className="flex-1 bg-white px-4 py-4">
                    {explanation && (
                      <p className="text-xs leading-relaxed text-[#334466]">{explanation}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Investment Style Fit (unchanged) */}
        {fit && (
          <div className="w-72 shrink-0 space-y-4 p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#102149]">Investment Style Fit</p>
              <p className="mt-0.5 text-xs text-[#9aa7c0]">Algorithmic profile match across institutional strategies.</p>
            </div>

            {(
              [
                { label: "Core", value: fit.core },
                { label: "Core+", value: fit.corePlus },
                { label: "Value Add", value: fit.valueAdd },
                { label: "Opportunistic", value: fit.opportunistic },
              ] as const
            ).map(({ label, value }) => {
              const isBest = label.toLowerCase() === fit.bestMatch?.toLowerCase();
              const barColor = value >= 75 ? "#19b68f" : value >= 50 ? "#f3a122" : "#ef4444";
              return (
                <div
                  key={label}
                  className={`rounded-xl p-3 ${isBest ? "border-2 border-[#19b68f] bg-[#f0fdf8]" : "border border-[#e1e7f5]"}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {isBest && <span className="text-[#19b68f]">✓</span>}
                      <span className="text-sm font-semibold text-[#102149]">{label}</span>
                      {isBest && (
                        <span className="rounded-full bg-[#19b68f] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          Best Match
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-[#102149]">{value}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8edf8]">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: barColor }} />
                  </div>
                </div>
              );
            })}

            {fit.recommendation && (
              <div className="rounded-xl border border-[#e1e7f5] bg-[#f9fbff] p-3">
                <p className="text-xs text-[#102149]">
                  <span className="font-semibold">Recommendation: </span>
                  {fit.recommendation}
                </p>
              </div>
            )}

            {fit.strengths.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#19b68f]">Strengths</p>
                <ul className="mt-2 space-y-1.5">
                  {fit.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-1.5 text-xs text-[#102149]">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#19b68f]" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {fit.watchItems.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#f3a122]">Watch Items</p>
                <ul className="mt-2 space-y-1.5">
                  {fit.watchItems.map((w) => (
                    <li key={w} className="flex items-start gap-1.5 text-xs text-[#102149]">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f3a122]" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}