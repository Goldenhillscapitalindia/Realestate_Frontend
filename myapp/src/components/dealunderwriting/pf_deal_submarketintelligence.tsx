import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-api";

// ── Types ────────────────────────────────────────────────────────────────────

type StatusColor = "red" | "green" | "amber";

type InsightCard = {
  label: string;
  value: string;
  subDetail: string;
  status: { tag: string; color: StatusColor };
  insight: string;
};

type SubmarketIntelligence = {
  vacancyRate: number | null;
  inventory: number | null;
  pipeline: number | null;
  netAbsorption: number | null;
  marketAskingRent: number | null;
  rentGrowth: number | null;
  insights: InsightCard[];
  summary: string;
};

type ApiResponse = {
  submarketIntelligence?: SubmarketIntelligence;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function statusBorderColor(color: StatusColor) {
  if (color === "green") return "border-t-[3px] border-t-green-400";
  if (color === "red") return "border-t-[3px] border-t-red-400";
  return "border-t-[3px] border-t-amber-400";
}

function statusBadgeColor(color: StatusColor) {
  if (color === "green") return "bg-green-400/15 text-green-300 border border-green-400/40";
  if (color === "red") return "bg-red-400/15 text-red-300 border border-red-400/40";
  return "bg-amber-400/15 text-amber-300 border border-amber-400/40";
}

function insightDotColor(color: StatusColor) {
  if (color === "green") return "bg-green-500";
  if (color === "red") return "bg-red-500";
  return "bg-amber-400";
}

function metricIcon(label: string) {
  if (label === "Vacancy Rate")
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  if (label === "Inventory")
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    );
  if (label === "Pipeline")
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    );
  if (label === "Net Absorption")
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    );
  if (label === "Rent Growth")
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    >
      <polyline points="3 17 9 11 13 15 21 7" /><polyline points="15 7 21 7 21 13" />
    </svg>
  );
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function iconColor(color: StatusColor) {
  if (color === "green") return "text-green-400";
  if (color === "red") return "text-red-400";
  return "text-amber-400";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PfDealSubmarketIntelligence({ propertyName }: { propertyName: string }) {
  const [data, setData] = useState<SubmarketIntelligence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyName) return;
    setLoading(true);

    authClient
      .post<ApiResponse>("/api/user_properties/submarket_intelligence/", {
        property_name: propertyName,
      })
      .then((res) => {
        setData(res.data.submarketIntelligence ?? null);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [propertyName]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-56 animate-pulse rounded bg-gray-100" />
        <div className="grid grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { insights, summary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {/* <p className="text-xs font-semibold uppercase tracking-widest text-[#57719c]">Section 05</p> */}
          <h2 className="mt-1 text-2xl font-bold text-[#102149]">Submarket Intelligence</h2>
          <p className="mt-1 text-sm text-[#62708d]">
            Supply, demand, and pricing fundamentals shaping this submarket for{" "}
            <span className="font-medium">{propertyName}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-[#d8e2f1] px-3 py-1 text-xs font-medium text-[#57719c]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#57719c]" />
            6 fundamentals tracked
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-[#d8e2f1] px-3 py-1 text-xs font-medium text-[#57719c]">
            Source: CoStar, Yardi
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {insights.map((card) => (
            <div
              key={card.label}
              className={`bg-[#2f568f] rounded-xl p-5 shadow-sm transition-transform hover:-translate-y-0.5 ${statusBorderColor(card.status.color)}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-semibold tracking-[0.12em] text-white/65 uppercase">
                  {card.label}
                </span>
                <span className={iconColor(card.status.color)}>
                  {metricIcon(card.label)}
                </span>
              </div>

              <div className="mt-3 text-3xl font-bold text-white">{card.value}</div>
              <div className="mt-1 text-xs text-white/60">{card.subDetail}</div>

              <div className="mt-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider ${statusBadgeColor(card.status.color)}`}
                >
                  {card.status.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metric Insights */}
      {insights.length > 0 && (
        <div className="rounded-2xl border border-[#d8e2f1] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-[#57719c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3 className="text-sm font-semibold text-[#102149]">Metric Insights</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {insights.map((card) => (
              <div key={card.label} className="rounded-xl border border-[#edf2fb] bg-[#eff3f9] p-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${insightDotColor(card.status.color)}`} />
                  <span className="text-sm font-semibold text-[#102149]">{card.label}</span>
                  <span className="text-xs text-[#57719c]">{card.value}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#4a5568]">{card.insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="rounded-2xl bg-[#2f568f] p-6">
          <div className="mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-[#7eb3ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#7eb3ff]">
              Submarket Summary
            </p>
          </div>
          <p className="text-sm leading-relaxed text-[#ffffff]">{summary}</p>
        </div>
      )}
    </div>
  );
}
