import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-api";

// ── Types ────────────────────────────────────────────────────────────────────

type AmenityItem = { points: number; amenity: string; competitor_penetration: number };

type SubjectVsMarket = {
  amenity: string;
  position: "ADVANTAGE" | "GAP" | "PARITY" | string;
  subject_has: boolean;
  competitor_penetration: number;
};

type AmenityAnalysis = {
  amenity_score: {
    grade: string;
    label: string;
    score: number;
    unit_weight: number;
    community_weight: number;
  };
  unit_amenities: { score: number; missing: string[]; present: string[]; coverage: string };
  community_amenities: { score: number; missing: string[]; present: string[]; coverage: string };
  subject_vs_market: SubjectVsMarket[];
  competitive_position: {
    label: string;
    score: number;
    percentile: number;
    rank_label: string;
    comparable_count: number;
  };
  amenity_quality_index: { score: number; classification: string; premium_features: string[] };
  competitive_advantages: { items: AmenityItem[]; total_points: number };
  competitive_deficiencies: { items: AmenityItem[]; total_points: number };
  investment_insight?: { summary: string };
};

type ApiResponse = {
  deal_filters_response?: { amenity_analysis?: AmenityAnalysis };
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function gradeColor(grade: string) {
  if (grade === "A") return "bg-green-600 text-white";
  if (grade === "B" || grade === "B+") return "bg-blue-600 text-white";
  if (grade === "C") return "bg-yellow-500 text-white";
  return "bg-red-500 text-white";
}

function barColor(score: number) {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

function positionBadge(pos: string) {
  if (pos === "ADVANTAGE")
    return "bg-green-100 text-green-700 border border-green-200";
  if (pos === "GAP")
    return "bg-red-100 text-red-600 border border-red-200";
  return "bg-gray-100 text-gray-500 border border-gray-200";
}

function positionDot(pos: string) {
  if (pos === "ADVANTAGE") return "bg-green-600";
  if (pos === "GAP") return "bg-red-500";
  return "bg-gray-400";
}

// ── Quadrant SVG chart ───────────────────────────────────────────────────────

const QW = 1300;
const QH = 400;
const QP = { top: 36, right: 32, bottom: 52, left: 56 };
const plotW = QW - QP.left - QP.right;
const plotH = QH - QP.top - QP.bottom;

function qx(score: number) {
  return QP.left + (score / 100) * plotW;
}
function qy(score: number) {
  return QP.top + ((100 - score) / 100) * plotH;
}

function PositioningQuadrant({
  aqiScore,
  cpScore,
}: {
  aqiScore: number;
  cpScore: number;
}) {
  const midX = qx(50);
  const midY = qy(50);
  const sx = qx(aqiScore);
  const sy = qy(cpScore);

  return (
    <svg viewBox={`0 0 ${QW} ${QH}`} className="w-full h-auto" style={{ maxHeight: 360 }}>
      {/* Quadrant backgrounds */}
      <rect x={QP.left} y={QP.top} width={plotW / 2} height={plotH / 2} fill="#f8f9fa" />
      <rect x={midX} y={QP.top} width={plotW / 2} height={plotH / 2} fill="#f0fdf4" />
      <rect x={QP.left} y={midY} width={plotW / 2} height={plotH / 2} fill="#fff7ed" />
      <rect x={midX} y={midY} width={plotW / 2} height={plotH / 2} fill="#fef2f2" />

      {/* Quadrant labels */}
      <text x={QP.left + 8} y={QP.top + 16} fontSize={10} fill="#6b7280" fontWeight="600" letterSpacing="0.05em">COMPETITIVE BUT AGING</text>
      <text x={midX + 8} y={QP.top + 16} fontSize={10} fill="#15803d" fontWeight="600" letterSpacing="0.05em">BEST-IN-CLASS</text>
      <text x={QP.left + 8} y={midY + 18} fontSize={10} fill="#ef4444" fontWeight="600" letterSpacing="0.05em">AMENITY DEFICIENT</text>
      <text x={midX + 8} y={midY + 18} fontSize={10} fill="#6b7280" fontWeight="600" letterSpacing="0.05em">MODERN BUT LIMITED</text>

      {/* Border */}
      <rect x={QP.left} y={QP.top} width={plotW} height={plotH} fill="none" stroke="#e2e8f0" strokeWidth={1} />

      {/* Dividers */}
      <line x1={midX} y1={QP.top} x2={midX} y2={QP.top + plotH} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={QP.left} y1={midY} x2={QP.left + plotW} y2={midY} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 3" />

      {/* Axis labels */}
      <text x={QP.left - 8} y={QP.top + 4} fontSize={9} fill="#94a3b8" textAnchor="middle">High</text>
      <text x={QP.left - 8} y={QP.top + plotH + 4} fontSize={9} fill="#94a3b8" textAnchor="middle">Low</text>
      <text x={QP.left} y={QP.top + plotH + 20} fontSize={9} fill="#94a3b8">Low</text>
      <text x={QP.left + plotW} y={QP.top + plotH + 20} fontSize={9} fill="#94a3b8" textAnchor="end">High</text>

      {/* Y-axis label */}
      <text
        x={14}
        y={QP.top + plotH / 2}
        fontSize={11}
        fill="#94a3b8"
        textAnchor="middle"
        transform={`rotate(-90, 14, ${QP.top + plotH / 2})`}
      >
        COMPETITIVE POSITION
      </text>

      {/* X-axis label */}
      <text x={QP.left + plotW / 2} y={QH - 4} fontSize={11} fill="#94a3b8" textAnchor="middle">
        AMENITY QUALITY INDEX
      </text>

      {/* Subject point */}
      <circle cx={sx} cy={sy} r={8} fill="#1e293b" />

      {/* Tooltip BELOW point */}
      <rect x={sx - 50} y={sy + 14} width={100} height={24} rx={5} fill="#1e293b"
      />

      <text
        x={sx}
        y={sy + 30}
        fontSize={10}
        fill="white"
        textAnchor="middle"
        fontWeight="600"
      >
        Subject · {Math.round(aqiScore)} / {Math.round(cpScore)}
      </text>
      {/* Legend */}
      <circle cx={QP.left + plotW - 80} cy={QP.top - 16} r={5} fill="#1e293b" />
      <text x={QP.left + plotW - 72} y={QP.top - 12} fontSize={9} fill="#475569">Subject</text>
    </svg>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PfDealAmenities({ propertyName }: { propertyName: string }) {
  const [data, setData] = useState<AmenityAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyName) return;
    setLoading(true);
    setError(null);
    authClient
      .get<ApiResponse>("/api/user_properties/deal_amenities_fetch/", {
        params: { property_name: propertyName },
      })
      .then((res) => {
        const analysis = res.data?.deal_filters_response?.amenity_analysis;
        if (analysis) {
          setData(analysis);
        } else {
          setError("No amenity data available.");
        }
      })
      .catch(() => setError("Unable to load amenity analysis."))
      .finally(() => setLoading(false));
  }, [propertyName]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#d8e2f1] bg-white p-8 text-center text-[#62708d]">
        Loading amenity analysis...
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { amenity_score, unit_amenities, community_amenities, subject_vs_market,
    competitive_position, amenity_quality_index, competitive_advantages,
    competitive_deficiencies, investment_insight } = data;

  return (
    <div className="space-y-5">
      {/* ── Single unified Amenity Analysis card ── */}
      <div className="rounded-2xl border border-[#d8e2f1] bg-white p-7">
        {/* Header */}
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Section 04</p>
        <h2 className="mt-1 text-3xl font-bold text-[#0f172a]">Amenity Analysis</h2>
        <p className="mt-1 text-[15px] text-[#64748b]">
          Does this property have an amenity advantage that can support higher rents and occupancy relative to competitors?
        </p>
        {investment_insight?.summary && (
          <p className="mt-2 text-sm text-[#475569] italic">{investment_insight.summary}</p>
        )}

        {/* Top 3 score cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {/* Amenity Score */}
          <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#64748b]">Amenity Score</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-5xl font-bold text-[#0f172a]">{Math.round(amenity_score.score)}</span>
              <span className="mb-1 text-xl text-[#94a3b8]">/ 100</span>
              <span className={`mb-1 ml-auto rounded-md px-2 py-0.5 text-sm font-bold ${gradeColor(amenity_score.grade)}`}>
                Grade {amenity_score.grade}
              </span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-[#e2e8f0]">
              <div className={`h-2.5 rounded-full ${barColor(amenity_score.score)}`} style={{ width: `${amenity_score.score}%` }} />
            </div>
            <p className="mt-2 text-xs text-[#94a3b8]">
              Community {amenity_score.community_weight}% · Unit {amenity_score.unit_weight}% &nbsp; Weighted
            </p>
          </div>

          {/* Amenity Quality Index */}
          <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#64748b]">Amenity Quality Index</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-5xl font-bold text-[#0f172a]">{Math.round(amenity_quality_index.score)}</span>
              <span className="mb-1 text-xl text-[#94a3b8]">/ 100</span>
            </div>
            <div className="mt-2">
              <span className="rounded-full bg-[#fef3c7] px-3 py-0.5 text-xs font-semibold text-[#92400e]">
                {amenity_quality_index.classification}
              </span>
            </div>
            {amenity_quality_index.premium_features.length > 0 && (
              <p className="mt-2 text-xs text-[#64748b]">
                {amenity_quality_index.premium_features.join(", ")}
              </p>
            )}
          </div>

          {/* Competitive Position */}
          <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#64748b]">Competitive Position</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-5xl font-bold text-[#0f172a]">{competitive_position.score}</span>
              <span className="mb-1 text-xl text-[#94a3b8]">/ 100</span>
              <span className="mb-1 ml-auto rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700">
                ↑ {competitive_position.rank_label}
              </span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-[#e2e8f0]">
              <div className="h-2.5 rounded-full bg-green-500" style={{ width: `${competitive_position.score}%` }} />
            </div>
            <p className="mt-2 text-xs text-[#94a3b8]">
              vs. {competitive_position.comparable_count} comparable assets &nbsp;·&nbsp; {competitive_position.percentile}th percentile
            </p>
          </div>
        </div>

        {/* Community + Unit amenity cards */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Community Amenities", data: community_amenities },
            { label: "Unit Amenities", data: unit_amenities },
          ].map(({ label, data: d }) => (
            <div key={label} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#64748b]">{label}</p>
                <span className="text-xs text-[#94a3b8]">
                  Coverage <span className="font-semibold text-[#475569]">{d.coverage}</span>
                </span>
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold text-[#0f172a]">{Math.round(d.score)}</span>
                <span className="mb-1 text-lg text-[#94a3b8]">/ 100</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {d.present.map((item) => (
                  <span key={item} className="flex items-center gap-1 rounded-full border border-[#d1fae5] bg-[#f0fdf4] px-2.5 py-0.5 text-xs text-[#166534]">
                    <span className="text-green-600">✓</span> {item}
                  </span>
                ))}
                {d.missing.map((item) => (
                  <span key={item} className="flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-0.5 text-xs text-[#9ca3af] line-through">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Amenity Benchmark table */}
      <div className="rounded-2xl border border-[#d8e2f1] bg-white p-7">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748b]">Competitive Amenity Benchmark</p>
        <h3 className="mt-1 text-xl font-bold text-[#0f172a]">Subject Property vs. Market</h3>
        <div className="mt-1 flex flex-wrap gap-4 text-xs text-[#64748b]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-600 inline-block" /> Subject has, few competitors do</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> Subject lacks, most have</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400 inline-block" /> Market parity</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] text-xs font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">
                <th className="py-2 text-left">Amenity</th>
                <th className="py-2 text-center w-20">Subject</th>
                <th className="py-2 text-left">Competitor Penetration</th>
                <th className="py-2 text-right w-28">Position</th>
              </tr>
            </thead>
            <tbody>
              {subject_vs_market.map((row) => (
                <tr key={row.amenity} className="border-b border-[#f1f5f9]">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${positionDot(row.position)}`} />
                      <span className="text-[#1e293b]">{row.amenity}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-center">
                    {row.subject_has ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs">✓</span>
                    ) : (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 text-xs">✕</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-[#e2e8f0] max-w-[180px]">
                        <div className="h-2 rounded-full bg-[#475569]" style={{ width: `${row.competitor_penetration}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs text-[#64748b]">{row.competitor_penetration.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold uppercase ${positionBadge(row.position)}`}>
                      {row.position}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advantages / Deficiencies side-by-side */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Advantages */}
        <div className="rounded-2xl border border-green-200 bg-[#f0fdf4] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-600">↗</span>
              <span className="font-semibold text-[#0f172a]">Competitive Advantages</span>
            </div>
            <span className="rounded-full bg-green-700 px-3 py-0.5 text-sm font-bold text-white">
              +{competitive_advantages.total_points}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {competitive_advantages.items.length === 0 ? (
              <p className="text-sm text-[#94a3b8]">No advantages identified.</p>
            ) : (
              competitive_advantages.items.map((item) => (
                <div key={item.amenity} className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-[#0f172a]">{item.amenity}</p>
                    <p className="text-xs text-[#64748b]">only {item.competitor_penetration.toFixed(0)}% of competitors</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                    +{item.points}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deficiencies */}
        <div className="rounded-2xl border border-red-200 bg-[#fff5f5] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-red-500">↘</span>
              <span className="font-semibold text-[#0f172a]">Competitive Deficiencies</span>
            </div>
            <span className="rounded-full bg-red-600 px-3 py-0.5 text-sm font-bold text-white">
              {competitive_deficiencies.total_points}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {competitive_deficiencies.items.length === 0 ? (
              <p className="text-sm text-[#94a3b8]">No deficiencies identified.</p>
            ) : (
              competitive_deficiencies.items.map((item) => (
                <div key={item.amenity} className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-[#0f172a]">{item.amenity}</p>
                    <p className="text-xs text-[#64748b]">{item.competitor_penetration.toFixed(0)}% market penetration</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
                    {item.points}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Positioning Quadrant – full width */}
      <div className="rounded-2xl border border-[#d8e2f1] bg-white p-7">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748b]">Positioning Quadrant</p>
        <h3 className="mt-1 text-xl font-bold text-[#0f172a]">Amenity Quality vs. Competitive Position</h3>
        <div className="mt-5 w-full">
          <PositioningQuadrant
            aqiScore={amenity_quality_index.score}
            cpScore={competitive_position.score}
          />
        </div>
      </div>
    </div>
  );
}
