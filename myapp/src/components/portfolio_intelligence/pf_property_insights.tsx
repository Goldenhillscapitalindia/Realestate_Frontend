import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Bar, Line } from "react-chartjs-2";
import { authClient } from "@/lib/auth-api";
import PfDemoAiRentIntelligence from "./pf_demo_ai_rent_intelligence";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { getPropertyNarrative } from "./property_narratives";
import { isDemoMode } from "@/lib/demo-mode";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TrendPoint = {
  month: string;
  value: number;
};

type RevenueExpensePoint = {
  month: string;
  revenue: number;
  expense: number;
};

type IntelligenceTips = {
  confidence?: string;
  nextActions?: string[];
  whyThisMatters?: string;
  nextBestActions?: string[];
};

type RiskAlert = IntelligenceTips & {
  riskScore?: number;
  renewalRate?: number;
  riskDrivers?: string[];
  expiringUnits?: number;
  expiringUnitsNext90Days?: number; // ✅ added (365 Western)
  monthlyImpact?: number;
  revenueAtRisk?: number;
  annualNoiImpact?: number;
  avgTenure?: number;
  avgTenureMonths?: number;
};

type MarketMomentum = IntelligenceTips & {
  absorption?: number | string;
  vacancyTrend?: string;
  monthlyImpact?: number;
  annualNoiImpact?: number;
  rentGrowthTrend?: string;
  concessionsTrend?: string;
  employmentGrowthYoY?: number;
  vacancy?: string;
  rentGrowth?: string;
  momentumView?: string;
};

type ReviewIntelligence = IntelligenceTips & {
  rating?: number;
  avgRating?: number;
  reviews90d?: number;
  responseRate?: number;
  sentimentPositive?: number;
  monthlyImpact?: number;
  annualNoiImpact?: number;
  ratingScore?: number | null;
  sentimentPercent?: number | null;
  keyStrengths?: string[];
  keyRisks?: string[];
};

type PropertyIntelligence = {
  riskAlert?: RiskAlert;
  marketMomentum?: MarketMomentum;
  reviewIntelligence?: ReviewIntelligence;
  overview?: string;
  aiGuidedRecommendations?: string[];
};

// ✅ rentComparison can be ARRAY (unit breakdown) or OBJECT (summary)
type RentComparisonEntry = {
  market?: number;
  inPlace?: number;
  unitType?: string;
};

type RentComparisonSummary = {
  averageMarketRent?: number | null;
  averageInPlaceRent?: number | null;
  totalMarkToMarket?: number | null;
  lossToLeasePercent?: number | null;
};

type PropertyResponseDetails = {
  kpis?: {
    noi?: number;
    noiYoY?: number;
    revenue?: number;
    noiMargin?: number;
    occupancy?: number;
    expenseYoY?: number;
    revenueYoY?: number;
    lossToLease?: number;
    renewalRate?: number;
    expenseRatio?: number;
    markToMarket?: number;
  };
  trends?: {
    noiTrend12Month?: TrendPoint[];
    revenueVsExpense?: RevenueExpensePoint[];
  };
  property?: {
    name?: string;
    units?: number;
    location?: string;
    yearBuilt?: number | null;
  };
  intelligence?: PropertyIntelligence;
  riskAlert?: RiskAlert;

  // ✅ union type
  rentComparison?: RentComparisonEntry[] | RentComparisonSummary;

  leaseExpirationLadder?: {
    month?: string;
    units?: number;
  }[];
};

type PropertyRecord = {
  property_name: string;
  submarket: string;
  region: string;
  property_response: PropertyResponseDetails | null;
};

const isValidNumber = (value: number | undefined | null): value is number =>
  typeof value === "number" && !Number.isNaN(value);

const hasDisplayValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "string") return value.trim() !== "" && value.trim() !== "-";
  return true;
};

const formatCurrency = (value?: number | null): string => {
  if (!isValidNumber(value)) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
};

const formatPercent = (value?: number | null): string => {
  if (!isValidNumber(value)) return "-";

  // if API sends 68 => 68%
  if (value > 1) return `${value.toFixed(1)}%`;

  // if API sends 0.68 => 68%
  return `${(value * 100).toFixed(1)}%`;
};

const formatWholeUnits = (value: number): string => Math.round(value).toLocaleString("en-US");

const formatYoY = (value?: number | null): string | undefined => {
  if (!isValidNumber(value)) return undefined;

  const percent = value * 100;
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(1)}%`;
};

const baseBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: { color: "#475569" },
      grid: { color: "rgba(15,23,42,0.05)" },
    },
    y: {
      beginAtZero: true,
      ticks: { color: "#475569" },
      grid: { color: "rgba(15,23,42,0.08)" },
    },
  },
  plugins: {
    legend: {
      labels: { color: "#0f172a", font: { weight: 500 } },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `${context.dataset.label}: ${context.raw} units`,
      },
    },
  },
};

const rentComparisonBarOptions: ChartOptions<"bar"> = {
  ...baseBarOptions,
  plugins: {
    ...baseBarOptions.plugins,
    tooltip: {
      ...baseBarOptions.plugins.tooltip,
      callbacks: {
        label: (context: any) => {
          const value = typeof context.raw === "number" ? formatCurrency(context.raw) : context.raw;
          return `${context.dataset.label}: ${value} units`;
        },
      },
    },
  },
};

const trendLineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#475569" },
    },
    y: {
      grid: { color: "rgba(148,163,184,0.2)" },
      ticks: {
        color: "#475569",
        callback: (value) => formatCurrency(Number(value)),
      },
    },
  },
  plugins: {
    legend: {
      display: false,
      labels: { color: "#0f172a", font: { weight: 600 } },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.raw;
          if (typeof value === "number") {
            return `${context.dataset.label}: ${formatCurrency(value)}`;
          }
          return context.dataset.label;
        },
      },
    },
  },
};

type InsightCardProps = {
  title: string;
  value: string;
  caption: string;
  badge?: string;
  badgeClass?: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
};

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  value,
  caption,
  badge,
  badgeClass,
  description,
  selected,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-3xl border bg-white p-4 text-left shadow-sm transition ${selected
      ? "border-sky-400 shadow-[0_0_0_2px_rgba(14,165,233,0.3)]"
      : "border-slate-100 hover:-translate-y-0.5 hover:border-slate-200"
      }`}
  >
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-900">{title}</p>

      {badge ? (
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${badgeClass ?? "bg-slate-100 text-slate-800"
            }`}
        >
          {badge}
        </span>
      ) : null}
    </div>
    <div>
      <p className="text-3xl font-semibold text-slate-900">{value}</p>
      <p className="text-sm text-slate-800">{caption}</p>
      {description ? <p className="mt-2 text-xs text-slate-800">{description}</p> : null}
    </div>
  </button>
);

type PropertyContext = {
  property_name: string;
  submarket: string;
  region: string;
};

type PfPropertyInsightsProps = {
  propertyContext?: PropertyContext;
  onBack?: () => void;
};

const PfPropertyInsights: React.FC<PfPropertyInsightsProps> = ({ propertyContext, onBack }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const propertyName = propertyContext?.property_name ?? searchParams.get("property_name") ?? "";
  const submarket = propertyContext?.submarket ?? searchParams.get("submarket") ?? "";
  const region = propertyContext?.region ?? searchParams.get("region") ?? "";
  const [record, setRecord] = useState<PropertyRecord | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!propertyName) {
        if (isActive) setStatus("error");
        return;
      }

      setStatus("loading");
      try {
        const params = {
          fetch: "specific",
          property_name: propertyName,
          ...(submarket ? { submarket } : {}),
          ...(region ? { region } : {}),
        };
        const fallbackParams = {
          fetch: "specific",
          property_name: propertyName,
        };

        const fetchSpecificPost = async (url: string) => {
          try {
            return await authClient.post<{ data: PropertyRecord }>(url, params);
          } catch {
            return await authClient.post<{ data: PropertyRecord }>(url, fallbackParams);
          }
        };

        const fetchSpecificGet = async (url: string) => {
          try {
            return await authClient.get<{ data: PropertyRecord }>(url, { params });
          } catch {
            return await authClient.get<{ data: PropertyRecord }>(url, { params: fallbackParams });
          }
        };

        const response = isDemoMode()
          ? await fetchSpecificPost("/api/get_property_model_data/")
          : await (async () => {
              try {
                const userResponse = await fetchSpecificGet("/api/get_property_model_data_user_view/");
                if (!userResponse.data?.data) {
                  throw new Error("No user data");
                }
                return userResponse;
              } catch {
                return fetchSpecificPost("/api/get_property_model_data/");
              }
            })();

        if (isActive) {
          setRecord(response.data?.data ?? null);
          setStatus("idle");
        }
      } catch {
        if (isActive) setStatus("error");
      }
    };

    fetchData();
    return () => {
      isActive = false;
    };
  }, [propertyName, region, submarket]);

  const reviewDetails = record?.property_response?.intelligence?.reviewIntelligence;
  const riskAlert =
    record?.property_response?.riskAlert ??
    record?.property_response?.intelligence?.riskAlert;
  const marketMomentum = record?.property_response?.intelligence?.marketMomentum;
  const intelligence = record?.property_response?.intelligence;
  const riskScore = isValidNumber(riskAlert?.riskScore) ? riskAlert.riskScore : undefined;
  const riskLevel = (() => {
    if (!isValidNumber(riskScore)) return "N/A";
    if (riskScore < 35) return "Low";
    if (riskScore < 65) return "Medium";
    return "High";
  })();
  const riskMarkerLeft = isValidNumber(riskScore)
    ? `${Math.min(100, Math.max(0, riskScore))}%`
    : "0%";

  // ✅ FIX #1: rentComparison may be OBJECT or ARRAY
  const rentComparisonList: RentComparisonEntry[] = useMemo(() => {
    const rc = record?.property_response?.rentComparison;
    return Array.isArray(rc) ? rc : [];
  }, [record?.property_response?.rentComparison]);

  // ✅ FIX #2: expiring units field differs across properties
  const expiringUnits = useMemo(() => {
    const v =
      riskAlert?.expiringUnitsNext90Days ??
      riskAlert?.expiringUnits;
    return isValidNumber(v) ? v : undefined;
  }, [riskAlert?.expiringUnitsNext90Days, riskAlert?.expiringUnits]);

  const avgTenure = useMemo(() => {
    const v = riskAlert?.avgTenure ?? riskAlert?.avgTenureMonths;
    return isValidNumber(v) ? v : undefined;
  }, [riskAlert?.avgTenure, riskAlert?.avgTenureMonths]);

  type InsightKey = "review" | "market";
  type ViewMode = "property_analytics" | "ai_rent_intelligence";
  const [viewMode, setViewMode] = useState<ViewMode>("property_analytics");
  const [selectedInsight, setSelectedInsight] = useState<InsightKey>("review");

  // reset selection if property changes
  useEffect(() => {
    setSelectedInsight("review");
    setViewMode("property_analytics");
  }, [propertyName, submarket, region]);

  const kpiCards = useMemo(() => {
    const kpis = record?.property_response?.kpis;
    if (!kpis) return [];

    return [
      { label: "Occupancy", value: formatPercent(kpis.occupancy) },
      { label: "NOI", value: formatCurrency(kpis.noi) },
      { label: "NOI YoY", value: formatYoY(kpis.noiYoY) ?? "-" },
      { label: "Revenue", value: formatCurrency(kpis.revenue) },
      { label: "Revenue YoY", value: formatYoY(kpis.revenueYoY) ?? "-" },
      { label: "NOI Margin", value: formatPercent(kpis.noiMargin) },
      { label: "Renewal Rate", value: formatPercent(riskAlert?.renewalRate) },
      { label: "Expense Ratio", value: formatPercent(kpis.expenseRatio) },
      { label: "Expense YoY", value: formatYoY(kpis.expenseYoY) ?? "-" },
      { label: "Loss to Lease", value: formatPercent(kpis.lossToLease) },
      { label: "Mark-to-Market", value: formatCurrency(kpis.markToMarket) },
    ].filter((card) => hasDisplayValue(card.value));
  }, [record, riskAlert?.renewalRate]);

  const hasRiskAlertValues =
    riskScore !== undefined ||
    expiringUnits !== undefined ||
    avgTenure !== undefined ||
    isValidNumber(riskAlert?.revenueAtRisk) ||
    isValidNumber(riskAlert?.renewalRate);

  const insightCards = useMemo(() => {
    const reviewValue = isValidNumber(reviewDetails?.ratingScore)
      ? reviewDetails?.ratingScore?.toFixed(1) ?? "-"
      : isValidNumber(reviewDetails?.avgRating)
        ? reviewDetails?.avgRating?.toFixed(1) ?? "-"
        : isValidNumber(reviewDetails?.rating)
          ? reviewDetails?.rating?.toFixed(1) ?? "-"
          : "-";
    const marketValue = marketMomentum?.absorption
      ? typeof marketMomentum.absorption === "number"
        ? `${marketMomentum.absorption.toLocaleString()} units`
        : marketMomentum.absorption
      : "-";

    return [
      {
        key: "review" as InsightKey,
        title: "Review Intelligence",
        value: reviewValue,
        caption: "Rating score",
        badge: reviewDetails?.confidence ?? "Medium",
        badgeClass: "bg-amber-100 text-amber-700",
        description: `Sentiment ${reviewDetails?.sentimentPercent ?? reviewDetails?.sentimentPositive ?? 0}% positive.`,
      },
      {
        key: "market" as InsightKey,
        title: "Market Momentum",
        value: marketValue,
        caption: "Metro absorption",
        badge: marketMomentum?.confidence ?? "Medium",
        badgeClass: "bg-sky-100 text-sky-700",
        description: marketMomentum?.vacancy
          ? `Vacancy ${marketMomentum.vacancy.toLowerCase()}`
          : marketMomentum?.vacancyTrend
            ? `Vacancy ${marketMomentum.vacancyTrend.toLowerCase()}`
          : "Momentum data loading.",
      },
    ];
  }, [marketMomentum, reviewDetails]);

  const propertyMeta = record?.property_response?.property;
  const yearBuilt = propertyMeta?.yearBuilt;
  const propertyNarrative = useMemo(
    () => getPropertyNarrative(record?.property_name ?? propertyName),
    [record?.property_name, propertyName]
  );
  const fallbackExecutionPriorities = [
    "Launch a 60-day early renewal push before peak expirations.",
    "Align pricing to market where loss-to-lease is still meaningful.",
    "Stagger turnover planning to protect occupancy and cash flow.",
    "Address resident experience drivers that affect retention.",
    "Tighten expense control actions to defend NOI.",
  ];
  const trends = record?.property_response?.trends;
  const noiTrend = trends?.noiTrend12Month ?? [];
  const revenueExpense = trends?.revenueVsExpense ?? [];

  const noiChartData = useMemo(
    () => ({
      labels: noiTrend.map((point) => point.month),
      datasets: [
        {
          label: "NOI",
          data: noiTrend.map((point) => point.value ?? 0),
          borderColor: "#047857",
          backgroundColor: "rgba(4, 120, 87, 0.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    }),
    [noiTrend]
  );

  const revenueExpenseChartData = useMemo(
    () => ({
      labels: revenueExpense.map((point) => point.month),
      datasets: [
        {
          label: "Revenue",
          data: revenueExpense.map((point) => point.revenue ?? 0),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.2)",
          tension: 0.35,
          pointRadius: 3,
          borderWidth: 2,
        },
        {
          label: "Expense",
          data: revenueExpense.map((point) => point.expense ?? 0),
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          tension: 0.35,
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    }),
    [revenueExpense]
  );

  const revenueLineOptions = useMemo<ChartOptions<"line">>(() => {
    return {
      ...trendLineOptions,
      plugins: {
        ...trendLineOptions.plugins,
        legend: {
          ...(trendLineOptions.plugins?.legend ?? {}),
          display: true,
        },
      },
    };
  }, []);

  const leaseData = record?.property_response?.leaseExpirationLadder ?? [];

  const leaseChartData = useMemo(() => {
    const entries = leaseData
      .filter((item): item is { month: string; units: number } => Boolean(item.month) && isValidNumber(item.units))
      .map((item) => ({ month: item.month, units: item.units }));

    if (!entries.length) return null;

    return {
      labels: entries.map((entry) => entry.month),
      datasets: [
        {
          label: "Expiring Units",
          data: entries.map((entry) => entry.units),
          backgroundColor: "#a974be",
          borderRadius: 8,
        },
      ],
    };
  }, [leaseData]);

  const rentComparisonEntries = useMemo(() => {
    return rentComparisonList
      .filter((entry) => Boolean(entry.unitType) && isValidNumber(entry.market) && isValidNumber(entry.inPlace))
      .map((entry) => ({
        unitType: entry.unitType ?? "Unknown",
        market: entry.market ?? 0,
        inPlace: entry.inPlace ?? 0,
      }));
  }, [rentComparisonList]);

  const rentComparisonChartData = useMemo(() => {
    if (!rentComparisonEntries.length) return null;

    return {
      labels: rentComparisonEntries.map((entry) => entry.unitType),
      datasets: [
        { label: "In-Place", data: rentComparisonEntries.map((entry) => entry.inPlace), backgroundColor: "#0ea5e9", borderRadius: 6 },
        { label: "Market", data: rentComparisonEntries.map((entry) => entry.market), backgroundColor: "#f97316", borderRadius: 6 },
      ],
    };
  }, [rentComparisonEntries]);

  const selectedInsightTitle = selectedInsight === "market" ? "Market Momentum" : "Review Intelligence";
  const selectedWhyThisMatters = selectedInsight === "market"
    ? marketMomentum?.whyThisMatters
    : reviewDetails?.whyThisMatters;
  const selectedNextBestActions = selectedInsight === "market"
    ? marketMomentum?.nextBestActions
    : reviewDetails?.nextBestActions;
  const fallbackWhyThisMatters = selectedInsight === "market"
    ? [
      "Absorption momentum helps dial lease pricing and concessions.",
      "Vacancy trends signal when to push appliance or renovation programs.",
      "Employment growth keeps demand steady even with seasonal dips.",
    ]
    : [
      "Properties rated 4.5+ retain residents longer.",
      "Resolving maintenance complaints improves digital sentiment.",
      "Positive reviews lift discovery and lead flow organically.",
    ];
  const fallbackNextBestActions = selectedInsight === "market"
    ? [
      "Push 3-4% renewals aligned with submarket growth",
      "Monitor vacancy weekly during rollover periods",
      "Benchmark pricing monthly against nearby comps",
    ]
    : [
      "Respond to all reviews within 24 hours",
      "Address recurring maintenance themes",
      "Highlight wins in marketing and leasing",
    ];

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <p className="text-sm font-semibold">Loading property insights...</p>
      </div>
    );
  }

  if (status === "error" || !record) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <p className="text-sm font-semibold text-red-500">Unable to load property insights.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="w-full space-y-6">
        <button
          type="button"
          onClick={onBack ?? (() => navigate("/portfolio_intelligence", { state: { activeTab: "Properties" } }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Back
        </button>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setViewMode("property_analytics")}
            className={`rounded-[22px] border p-5 text-center transition ${
              viewMode === "property_analytics"
                ? "border-[#0fa77d] bg-[#0fa77d] text-white shadow-[0_12px_28px_rgba(15,167,125,0.28)]"
                : "border-[#d8e4f5] bg-white text-[#162a4c] hover:border-[#a9bddf]"
            }`}
          >
            {/* <p className="text-[13px] font-semibold uppercase tracking-[0.14em]">Property Analytics</p> */}
            <p className="mt-2 text-2xl font-semibold">Property Analytics</p>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("ai_rent_intelligence")}
            className={`rounded-[22px] border p-5 text-center transition ${
              viewMode === "ai_rent_intelligence"
                ? "border-[#0fa77d] bg-[#0fa77d] text-white shadow-[0_12px_28px_rgba(15,167,125,0.28)]"
                : "border-[#d8e4f5] bg-white text-[#162a4c] hover:border-[#a9bddf]"
            }`}
          >
            {/* <p className="text-[13px] font-semibold uppercase tracking-[0.14em]">Rent Strategy</p> */}
            <p className="mt-2 text-2xl font-semibold">AI Rent Intelligence</p>
          </button>
        </div>

        {viewMode === "ai_rent_intelligence" ? (
          <div className="rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <PfDemoAiRentIntelligence
              propertyName={record.property_name}
              embedded
            />
          </div>
        ) : null}

        {viewMode === "property_analytics" ? (
        <>
        <section className="portfolio-recommendation-card relative overflow-hidden rounded-[30px] border border-blue-900/20 bg-gradient-to-br from-[#0f172a] via-[#1d2f6f] to-[#143f7a] p-6 text-white shadow-[0_24px_64px_rgba(15,23,42,0.35)] md:p-8">
          <div className="relative z-10">
            <h2 className="text-3xl font-semibold leading-tight">{record.property_name}</h2>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Overview</p>
            <p className="mt-3 text-sm leading-7 text-white/95 md:text-[15px]">
              {intelligence?.overview ?? propertyNarrative.overview.join(" ")}
            </p>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-indigo-300/20 blur-2xl" />
        </section>
        <div className="space-y-6 rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-indigo-900">{record.property_name}</h1>
              <p className="text-sm text-pink-600">
                {record.submarket} - {record.region}
              </p>
            </div>
            <div className="text-right text-s text-black">
              <p>
                Units: {record.property_response?.property?.units ?? "-"}{" "}
                {yearBuilt ? `- Built ${yearBuilt}` : ""}
              </p>
              <p className="text-right text-s text-blue-600">{propertyMeta?.location ?? "-"}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpiCards.map((card) => (
              <div key={card.label} className="space-y-1 rounded-3xl border border-slate-100 bg-blue-50/50 p-4">
                <p className="text-s font-semibold uppercase tracking-wide text-center text-blue-700">{card.label}</p>
                <p className="text-xl font-semibold text-center text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {noiTrend.length ? (
              <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-m font-semibold text-black">NOI Trend (12 Month)</h3>
                  <span className="text-xs text-slate-700">Last 12 months</span>
                </div>
                <div className="mt-4 h-64">
                  <Line data={noiChartData} options={trendLineOptions} />
                </div>
              </div>
            ) : null}

            {revenueExpense.length ? (
              <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-m font-semibold text-black">Revenue vs Expense</h3>
                  <span className="text-xs text-slate-700">Last 12 months</span>
                </div>
                <div className="mt-4 h-64">
                  <Line data={revenueExpenseChartData} options={revenueLineOptions} />
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-black">Lease Expiration Ladder</h3>
              </div>
              {leaseChartData ? (
                <div className="mt-4 h-72">
                  <Bar data={leaseChartData} options={baseBarOptions} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-700">No lease ladder data available</p>
              )}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-black">In-Place vs Market Rent</h3>
              </div>
              {rentComparisonChartData ? (
                <div className="mt-4 h-72">
                  <Bar data={rentComparisonChartData} options={rentComparisonBarOptions} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Rent comparison unavailable</p>
              )}
            </div>
          </div>
        </div>

        {hasRiskAlertValues ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-rose-700">Risk Alert</h3>
              <p className="mt-1 text-sm text-slate-700">Actionable next steps to protect NOI.</p>
            </div>
            {/* <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold text-rose-700">
              {riskAlert?.confidence ?? "High"}
            </span> */}
          </div>
          {isValidNumber(riskScore) ? (
            <div className="mt-5 rounded-2xl border border-white bg-white px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                  Property Risk Score
                </p>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-slate-900">{riskScore}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {riskLevel} Risk
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="absolute inset-y-0 left-0 w-1/3 bg-emerald-500" />
                  <div className="absolute inset-y-0 left-1/3 w-1/3 bg-amber-400" />
                  <div className="absolute inset-y-0 right-0 w-1/3 bg-rose-500" />
                  <div
                    className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow"
                    style={{ left: riskMarkerLeft }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          ) : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Expiring Units</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{expiringUnits !== undefined ? `${expiringUnits}` : "-"}</p>
            </div>
            <div className="rounded-2xl border border-white bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Revenue At Risk(90 Days)</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(riskAlert?.revenueAtRisk)}</p>
            </div>
            <div className="rounded-2xl border border-white bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Avg Tenure</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{avgTenure !== undefined ? `${avgTenure} months` : "-"}</p>
            </div>
            {/* <div className="rounded-2xl border border-white bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Renewal Rate</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{formatPercent(riskAlert?.renewalRate)}</p>
            </div> */}
          </div>
        </div>
        ) : null}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">AI Insights</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
            <div className="space-y-3">
              {insightCards.map((card) => (
                <InsightCard
                  key={card.key}
                  title={card.title}
                  value={card.value}
                  caption={card.caption}
                  badge={card.badge}
                  badgeClass={card.badgeClass}
                  description={card.description}
                  selected={selectedInsight === card.key}
                  onClick={() => setSelectedInsight(card.key)}
                />
              ))}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-indigo-900">{selectedInsightTitle}</h3>
                </div>
                <span className="rounded-full bg-blue-50 px-1 py-1 text-[13px] font-semibold text-black shadow-sm">
                  {selectedInsight === "market"
                    ? `${marketMomentum?.confidence ?? "Medium"} confidence`
                    : `${reviewDetails?.confidence ?? "Medium"} confidence`}
                </span>
              </div>

              {selectedInsight === "market" ? (
                <>
                  <p className="mt-2 text-sm text-slate-900">Monitor metro and submarket signals to capture demand shifts safely.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800">
                      <span className="block text-[15px] font-normal text-indigo-700">Absorption</span>
                      <span className="text-lg text-slate-900">{marketMomentum?.absorption ? String(marketMomentum.absorption) : "-"}</span>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800">
                      <span className="block text-[15px] font-normal text-indigo-700">Vacancy</span>
                      <span className="text-lg text-slate-900">{marketMomentum?.vacancy ?? marketMomentum?.vacancyTrend ?? "-"}</span>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800">
                      <span className="block text-[15px] font-normal text-indigo-700">Rent Growth</span>
                      <span className="text-lg text-slate-900">{marketMomentum?.rentGrowth ?? marketMomentum?.rentGrowthTrend ?? "-"}</span>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800">
                      <span className="block text-[15px] font-normal text-indigo-700">Momentum View</span>
                      <span className="text-lg text-slate-900">{marketMomentum?.momentumView ?? "-"}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-slate-900">Resident sentiment pinpoints maintenance, amenity, and communication levers for renewals.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800">
                      <span className="block text-[15px] font-normal text-indigo-700">Rating</span>
                      <span className="text-lg text-slate-900">
                        {isValidNumber(reviewDetails?.ratingScore)
                          ? `${reviewDetails?.ratingScore?.toFixed(1)}`
                          : isValidNumber(reviewDetails?.avgRating)
                            ? `${reviewDetails?.avgRating?.toFixed(1)}`
                            : "-"}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800">
                      <span className="block text-[15px] font-normal text-indigo-700">Sentiment</span>
                      <span className="text-lg text-slate-900">{`${reviewDetails?.sentimentPercent ?? reviewDetails?.sentimentPositive ?? 0}% Positive`}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-m font-semibold uppercase tracking-wide text-black">Key strengths</p>
                      <ul className="mt-2 space-y-2 text-sm text-slate-800">
                      {(reviewDetails?.keyStrengths?.length ? reviewDetails.keyStrengths : ["No strengths available"]).map((item: string) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                            <span className="text-black">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-m font-semibold uppercase tracking-wide text-black">Key risks</p>
                      <ul className="mt-2 space-y-2 text-sm text-slate-800">
                      {(reviewDetails?.keyRisks?.length ? reviewDetails.keyRisks : ["No risks available"]).map((item: string) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                            <span className="text-black">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-4 space-y-2">
                <p className="text-m font-semibold uppercase tracking-wide text-black">Why this matters</p>
                <ul className="space-y-2 text-sm text-slate-800">
                  {(selectedWhyThisMatters
                    ? [selectedWhyThisMatters]
                    : fallbackWhyThisMatters).map((item: string) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-black" />
                      <span className="text-black">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-m font-semibold uppercase tracking-wide text-black">Next best actions</p>
                <ol className="space-y-2 text-sm text-slate-800">
                  {(selectedNextBestActions?.length
                    ? selectedNextBestActions
                    : fallbackNextBestActions).map((action: string, index: number) => (
                    <li
                      key={`${action}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-indigo-50 px-3 py-2"
                    >
                      <span className="text-xs font-semibold text-black">{index + 1}</span>
                      <span className="text-black">{action}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[30px] border border-blue-900/20 bg-gradient-to-br from-[#172554] via-[#203a7a] to-[#2f4d99] p-6 text-white shadow-[0_24px_64px_rgba(15,23,42,0.28)] md:p-8">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Execution Priorities</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">AI Guided Recommendations</h2>
            <div className="mt-6 space-y-4">
              {(intelligence?.aiGuidedRecommendations?.length
                ? intelligence.aiGuidedRecommendations
                : fallbackExecutionPriorities).map((item: string, index: number) => (
                <div
                  key={`${item}-${index}`}
                  className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-[15px] leading-8 text-white/95"
                >
                  <span className="mr-3 inline-block h-2.5 w-2.5 rounded-full bg-cyan-300 align-middle" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-indigo-300/20 blur-2xl" />
        </section>
        </>
        ) : null}
      </div>
    </div>
  );
};

export default PfPropertyInsights;
