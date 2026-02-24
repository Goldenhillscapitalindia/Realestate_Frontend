import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
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
};

type RiskAlert = IntelligenceTips & {
  renewalRate?: number;
  riskDrivers?: string[];
  expiringUnits?: number;
  expiringUnitsNext90Days?: number; // ✅ added (365 Western)
  monthlyImpact?: number;
  revenueAtRisk?: number;
  annualNoiImpact?: number;
  avgTenureMonths?: number;
};

type MarketMomentum = IntelligenceTips & {
  absorption?: number;
  vacancyTrend?: string;
  monthlyImpact?: number;
  annualNoiImpact?: number;
  rentGrowthTrend?: string;
  concessionsTrend?: string;
  employmentGrowthYoY?: number;
};

type ReviewIntelligence = IntelligenceTips & {
  rating?: number;
  avgRating?: number;
  reviews90d?: number;
  responseRate?: number;
  sentimentPositive?: number;
  monthlyImpact?: number;
  annualNoiImpact?: number;
};

type PropertyIntelligence = {
  riskAlert?: RiskAlert;
  marketMomentum?: MarketMomentum;
  reviewIntelligence?: ReviewIntelligence;
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
    className={`w-full rounded-3xl border bg-white p-4 text-left shadow-sm transition ${
      selected
        ? "border-sky-400 shadow-[0_0_0_2px_rgba(14,165,233,0.3)]"
        : "border-slate-100 hover:-translate-y-0.5 hover:border-slate-200"
    }`}
  >
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-900">{title}</p>

      {badge ? (
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            badgeClass ?? "bg-slate-100 text-slate-500"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </div>
    <div>
      <p className="text-3xl font-semibold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{caption}</p>
      {description ? <p className="mt-2 text-xs text-slate-500">{description}</p> : null}
    </div>
  </button>
);

type InsightDetail = {
  title: string;
  confidence: string;
  description: string;
  keyStats: { label: string; value: string }[];
  whyThisMatters: string[];
  monthlyImpact?: number;
  annualImpact?: number;
  nextActions: string[];
};

const PfPropertyInsights: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const propertyName = searchParams.get("property_name") ?? "";
  const submarket = searchParams.get("submarket") ?? "";
  const region = searchParams.get("region") ?? "";
  const [record, setRecord] = useState<PropertyRecord | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!propertyName || !submarket || !region) {
        if (isActive) setStatus("error");
        return;
      }

      setStatus("loading");
      try {
        const response = await axios.post<{ data: PropertyRecord }>(
          `${API_URL}/api/get_property_model_data/`,
          {
            fetch: "specific",
            property_name: propertyName,
            submarket,
            region,
          }
        );

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
  }, [API_URL, propertyName, region, submarket]);

  const reviewDetails = record?.property_response?.intelligence?.reviewIntelligence;
  const riskAlert = record?.property_response?.intelligence?.riskAlert;
  const marketMomentum = record?.property_response?.intelligence?.marketMomentum;

  // ✅ FIX #1: rentComparison may be OBJECT or ARRAY
  const rentComparisonList: RentComparisonEntry[] = useMemo(() => {
    const rc = record?.property_response?.rentComparison;
    return Array.isArray(rc) ? rc : [];
  }, [record?.property_response?.rentComparison]);

  // ✅ FIX #2: expiring units field differs across properties
  const expiringUnits = useMemo(() => {
    const v =
      riskAlert?.expiringUnits ??
      riskAlert?.expiringUnitsNext90Days;
    return isValidNumber(v) ? v : undefined;
  }, [riskAlert?.expiringUnits, riskAlert?.expiringUnitsNext90Days]);

  type InsightKey = "review" | "market" | "risk";
  const [selectedInsight, setSelectedInsight] = useState<InsightKey>("review");

  // reset selection if property changes
  useEffect(() => {
    setSelectedInsight("review");
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
    ];
  }, [record, riskAlert?.renewalRate]);

  const insightCards = useMemo(() => {
    const reviewValue = reviewDetails?.rating ? reviewDetails.rating.toFixed(1) : "-";
    const marketValue = marketMomentum?.absorption
      ? `${marketMomentum.absorption.toLocaleString()} units`
      : "-";
    const riskValue = expiringUnits !== undefined ? `${expiringUnits} units` : "-";

    return [
      {
        key: "review" as InsightKey,
        title: "Review Intelligence",
        value: reviewValue,
        caption: "Avg rating",
        badge: reviewDetails?.confidence ?? "Medium",
        badgeClass: "bg-amber-100 text-amber-700",
        description: `Sentiment ${reviewDetails?.sentimentPositive ?? 0}% positive.`,
      },
      {
        key: "market" as InsightKey,
        title: "Market Momentum",
        value: marketValue,
        caption: "Metro absorption",
        badge: marketMomentum?.confidence ?? "Medium",
        badgeClass: "bg-sky-100 text-sky-700",
        description: marketMomentum?.vacancyTrend
          ? `Vacancy ${marketMomentum.vacancyTrend.toLowerCase()}`
          : "Momentum data loading.",
      },
      {
        key: "risk" as InsightKey,
        title: "Risk Alert",
        value: riskValue,
        caption: "Units expiring",
        badge: riskAlert?.confidence ?? "High",
        badgeClass: "bg-rose-100 text-rose-700",
        description: "Actionable next steps to protect NOI.",
      },
    ];
  }, [marketMomentum, reviewDetails, riskAlert, expiringUnits]);

  const propertyMeta = record?.property_response?.property;
  const yearBuilt = propertyMeta?.yearBuilt;

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

  const detailPanel = useMemo<InsightDetail>(() => {
    const monthlyImpact =
      reviewDetails?.monthlyImpact ?? marketMomentum?.monthlyImpact ?? riskAlert?.monthlyImpact;
    const annualImpact =
      reviewDetails?.annualNoiImpact ?? marketMomentum?.annualNoiImpact ?? riskAlert?.annualNoiImpact;

    switch (selectedInsight) {
      case "market":
        return {
          title: "Market Momentum",
          confidence: marketMomentum?.confidence ?? "Medium confidence",
          description: "Monitor metro and submarket signals to capture demand shifts safely.",
          keyStats: [
            { label: "Absorption", value: marketMomentum?.absorption ? `${marketMomentum.absorption} units` : "-" },
            { label: "Vacancy", value: marketMomentum?.vacancyTrend ?? "-" },
            { label: "Rent Growth", value: marketMomentum?.rentGrowthTrend ?? "-" },
            {
              label: "Employment",
              value:
                marketMomentum?.employmentGrowthYoY !== undefined
                  ? `${(marketMomentum.employmentGrowthYoY * 100).toFixed(1)}% YoY`
                  : "-",
            },
          ],
          whyThisMatters: [
            "Absorption momentum helps dial lease pricing and concessions.",
            "Vacancy trends signal when to push appliance or renovation programs.",
            "Employment growth keeps demand steady even with seasonal dips.",
          ],
          monthlyImpact,
          annualImpact,
          nextActions:
            marketMomentum?.nextActions ??
            ["Update comps with new absorption data", "Benchmark against metro rent ladder", "Monitor employment & development news"],
        };
      case "risk":
        return {
          title: "Risk Alert",
          confidence: riskAlert?.confidence ?? "High confidence",
          description: "Prioritize expiring units and expense drivers before they erode NOI.",
          keyStats: [
            { label: "Expiring Units", value: expiringUnits !== undefined ? `${expiringUnits} units` : "-" },
            { label: "Revenue At Risk", value: formatCurrency(riskAlert?.revenueAtRisk) },
            { label: "Avg Tenure", value: riskAlert?.avgTenureMonths ? `${riskAlert.avgTenureMonths} months` : "-" },
            { label: "Renewal Rate", value: formatPercent(riskAlert?.renewalRate) },
          ],
          whyThisMatters:
            riskAlert?.riskDrivers?.length ? riskAlert.riskDrivers : [
              "Expiring leases can pressure occupancy and push concessions.",
              "Expense volatility hits NOI when not pre-empted.",
              "Focused renewals and maintenance reduce surprise churn.",
            ],
          monthlyImpact,
          annualImpact,
          nextActions:
            riskAlert?.nextActions ?? ["Launch 60-day renewal campaign", "Segment expiring units weekly", "Budget for preventive maintenance spend"],
        };
      default:
        return {
          title: "Review Intelligence",
          confidence: reviewDetails?.confidence ?? "Medium confidence",
          description: "Resident sentiment pinpoints maintenance, amenity, and communication levers for renewals.",
          keyStats: [
            { label: "Rating", value: reviewDetails?.rating ? `${reviewDetails.rating.toFixed(1)}/5` : "-" },
            { label: "Reviews (90d)", value: `${reviewDetails?.reviews90d ?? 0}` },
            { label: "Sentiment", value: `${reviewDetails?.sentimentPositive ?? 0}% Positive` },
            { label: "Response Rate", value: `${reviewDetails?.responseRate ?? 0}%` },
          ],
          whyThisMatters: [
            "Properties rated 4.5+ retain residents longer.",
            "Resolving maintenance complaints improves digital sentiment.",
            "Positive reviews lift discovery and lead flow organically.",
          ],
          monthlyImpact,
          annualImpact,
          nextActions:
            reviewDetails?.nextActions ?? ["Respond to all reviews within 24 hours", "Address recurring maintenance themes", "Highlight wins in marketing and leasing"],
        };
    }
  }, [marketMomentum, riskAlert, reviewDetails, selectedInsight, expiringUnits]);

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
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          type="button"
          onClick={() => navigate("/portfolio_intelligence", { state: { activeTab: "Properties" } })}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Back
        </button>

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
                  <span className="text-xs text-slate-400">Last 12 months</span>
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
                  <span className="text-xs text-slate-400">Last 12 months</span>
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
                <p className="mt-3 text-sm text-slate-400">No lease ladder data available</p>
              )}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-black">In-Place vs Market Rent</h3>
              </div>
              {rentComparisonChartData ? (
                <div className="mt-4 h-72">
                  <Bar data={rentComparisonChartData} options={baseBarOptions} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Rent comparison unavailable</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
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
                  <h3 className="text-2xl font-semibold text-indigo-900">{detailPanel.title}</h3>
                </div>
                <span className="rounded-full bg-blue-50 px-1 py-1 text-[13px] font-semibold text-black shadow-sm">
                  {detailPanel.confidence}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-900">{detailPanel.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {detailPanel.keyStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    <span className="block text-[15px] font-normal text-indigo-700">{stat.label}</span>
                    <span className="text-lg text-slate-900">{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-m font-semibold uppercase tracking-wide text-black">Why this matters</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  {detailPanel.whyThisMatters.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-black" />
                      <span className="text-black">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-m font-semibold uppercase tracking-wide text-black">Next best actions</p>
                <ol className="space-y-2 text-sm text-slate-600">
                  {detailPanel.nextActions.map((action, index) => (
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
      </div>
    </div>
  );
};

export default PfPropertyInsights;
