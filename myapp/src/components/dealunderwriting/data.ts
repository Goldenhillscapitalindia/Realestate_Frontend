import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-api";
import { isDemoMode } from "@/lib/demo-mode";

export type DealSignal = "Strong Buy" | "Buy" | "Neutral" | "Avoid";

type ChartInsightRecord = { insight?: string; impact?: string; drives?: string };

type DemoDealUnderwritingRecord = {
  id?: number;
  property_name?: string;
  memorandum?: {
    location?: string | null;
    siteSize?: string | null;
    yearBuilt?: number | null;
    parkingSpace?: string | null;
  } | null;
  t12?: {
    NOI?: string | number | null;
    "NOI Margin"?: string | number | null;
    Taxes?: string | number | null;
    Grounds?: string | number | null;
    Payroll?: string | number | null;
    Renting?: string | number | null;
    Insurance?: string | number | null;
    Utilities?: string | number | null;
    Maintenance?: string | number | null;
    Administrative?: string | number | null;
    "Management Fees"?: string | number | null;
    "Professional Fees"?: string | number | null;
    "Operating Expenses"?: string | number | null;
    "Operating Expense Ratio"?: string | number | null;
    "Revenue per Unit"?: string | number | null;
    "Expense per Unit"?: string | number | null;
    "Revenue per Month"?: Record<string, string | number> | null;
    "Expense per Month"?: Record<string, string | number> | null;
    "NOI per Month"?: Record<string, string | number> | null;
    Vacancy?: Record<string, string | number> | null;
    "Vacancy per Month"?: Record<string, string | number> | null;
    "Gross Potential Rent"?: string | number | null;
    "Gross Potential Rent Monthly"?: Record<string, string | number> | null;
    "Gross Potential Rent per Month"?: Record<string, string | number> | null;
    "Expense Categories"?: {
      current?: Record<string, string | number> | null;
      monthly?: Record<string, Record<string, string | number>> | null;
    } | null;
  } | null;
  rent_roll?: {
    "Avg Tenure"?: string | null;
    "Average Occupancy"?: string | number | null;
    "Vacancy Loss"?: string | number | null;
    "Projected Revenue Lift"?: string | number | null;
    "Revenue at Risk"?: string | number | null;
    "Revenue at Risk (60d)"?: string | number | null;
    "Revenue at Risk (90d)"?: string | number | null;
    "Avg Renewal Rate"?: string | number | null;
    "Renewal Rate"?: string | number | null;
    "MTM Capture"?: {
      "Loss to Lease"?: string | number | null;
      "MTM Units"?: string | number | null;
      "MTM Market Rent"?: string | number | null;
      "MTM In-Place Rent"?: string | number | null;
    } | null;
    validation?: {
      total_units?: number | null;
      vacant_units?: number | null;
      occupied_units?: number | null;
    } | null;
    "Lease Expiration Ladder"?: Record<string, string | number> | null;
    "Lease Expiration Floorplan"?: Array<Record<string, string | number>> | null;
    "In Place vs Market Rent"?: Array<Record<string, string | number>> | null;
    "In Place vs Recommended Rent"?: Array<Record<string, string | number>> | null;
    "Raw Rent Roll Rows"?: Array<Record<string, unknown>> | null;
  } | null;
  created_at?: string;
  updated_at?: string;
};

type DealUnderwritingApiRecord = {
  propertyName: string;
  address: string;
  location: string;
  submarket: string;
  region: string;
  classType: string;
  header: {
    units: number | null;
    yearBuilt: number | null;
    locationAddress: string | null;
    locationSubtitle: string | null;
  };
  aiAcquisitionSnapshot: {
    recommendation: DealSignal;
    confidenceScore: number;
    investmentThesis: string;
  };
  kpiCards: {
    noOfUnits: number | null;
    yearBuilt: number | null;
    rentPerSqft: number | null;
    occupancyRate: number | null;
    occupancyUnits?: { occupied: number | null; total: number | null } | null;
    vacancyLoss: number | null;
    parkingSpace?: number | null;
    parkingSpaces?: number | null;
    parking_space?: number | null;
    siteSize?: number | null;
    site_size?: number | null;
    siteAcreage?: number | null;
    noiMargin: number | null;
    revenuePerUnit: number | null;
    expenseRatio: number | null;
    rentVsMarketGap: number | null;
    totalProjectedRevenueLift: number | null;
  };
  dealScorecard: {
    marketPosition: number;
    cashFlowStability: number;
    valueAddPotential: number;
    riskLevel: number;
    overallDealScore: number;
  };
  whatDrivesThisInvestment: {
    rentIncrease: number;
    expenseOptimization: number;
    occupancyImprovement: number;
    totalPotentialNoiUplift: number;
  };
  risks: Array<{ title: string; severity: "High" | "Medium" | "Low"; impact: string; explanation: string }>;
  opportunities: Array<{ title: string; severity: "High" | "Medium" | "Low"; impact: string; explanation: string }>;
  performanceAnalytics: {
    tenantMix?: Array<{ unitType: string; count: number; percent: number }>;
    rentVsMarket?: Array<{ unitType: string; market: number; inPlace: number }>;
    noiGrowthProjection?: Array<{ year: number; noi: number }>;
    revenueVsExpenses?: Array<{ month: string; revenue: number; expense: number }>;
    expenseBreakdown?: Array<{ category: string; amount: number; percent?: number }>;
    expenseDistribution?: Array<{ category: string; amount: number; percent?: number }>;
    leaseExpiration?: Array<{ month: string; units: number }>;
    occupancyVsVacancy?: Array<{ month: string; occupancyRate: number; vacancyRate: number }>;
    leaseExpirationFloorplan?: {
      title?: string;
      xlabels?: string[];
      ylabels?: string[];
      data?: number[][];
    };
    tenantMixInsights?: ChartInsightRecord;
    rentVsMarketInsights?: ChartInsightRecord;
    revenueVsExpensesInsights?: ChartInsightRecord;
    expenseDistributionInsights?: ChartInsightRecord;
    leaseExpirationInsights?: ChartInsightRecord;
    occupancyVsVacancyInsights?: ChartInsightRecord;
  };
  sourceOverview?: string | null;
  dealMemorandumResponse?: unknown;
  deal_memorandum_response?: unknown;
  dealT12Response?: unknown;
  deal_t12_response?: unknown;
  dealRentrollResponse?: unknown;
  deal_rentroll_response?: unknown;
};

export interface Deal {
  id: string;
  name: string;
  address: string;
  location: string;
  submarket?: string;
  region?: string;
  strategy: "Core" | "Core+" | "Value-Add" | "Opportunistic";
  units: number;
  yearBuilt: number;
  askingPrice: number;
  signal: DealSignal;
  confidence: number;
  thesis: string;
  metrics: {
    noOfUnits?: number;
    yearBuilt?: number;
    noi: number;
    noiMargin: number;
    revenuePerUnit: number;
    expenseRatio: number;
    totalExpenses: number;
    occupancy: number;
    occupancyUnits?: { occupied: number; total: number };
    vacancyLoss: number;
    rentGap: number;
    totalProjectedRevenueLift?: number;
    rentPerSqft?: number;
    parkingSpace?: number;
    siteSize?: number;
  };
  scores: {
    overall: number;
    marketPosition: number;
    cashFlowStability: number;
    valueAddPotential: number;
    riskLevel: number;
  };
  movers: {
    rentIncrease: number;
    expenseOptimization: number;
    occupancyImprovement: number;
    totalPotentialNoiUplift?: number;
  };
  risks: Array<{ title: string; severity: "High" | "Medium" | "Low"; impact: string; explanation: string }>;
  opportunities: Array<{ title: string; severity: "High" | "Medium" | "Low"; impact: string; explanation: string }>;
  tenantMix: Array<{ name: string; percentage: number; count?: number }>;
  rentVsMarket: Array<{ type: string; current: number; market: number }>;
  noiProjection: Array<{ year: string; noi: number }>;
  revenueVsExpenses: Array<{ month: string; revenue: number; expenses: number }>;
  expenseBreakdown: Array<{ category: string; amount: number; percent?: number }>;
  expenseDistribution: Array<{ category: string; amount: number; percent?: number }>;
  leaseExpirations: Array<{ year: string; units: number }>;
  occupancyHistory: Array<{ month: string; occupancy: number; vacancy: number }>;
  leaseExpirationFloorplan?: {
    title: string;
    xlabels: string[];
    ylabels: string[];
    data: number[][];
  };
  docStatus?: {
    memorandum: boolean;
    t12: boolean;
    rentRoll: boolean;
  };
  chartInsights: Record<
    "tenantMix" | "rentVsMarket" | "noiProjection" | "revenueVsExpenses" | "expenseBreakdown" | "expenseDistribution" | "leaseExpirations" | "occupancyVacancy",
    { insight: string; impact: string; drives: string }
  >;
}

type DealDataState = {
  deals: Deal[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

type DealUnderwritingMixedResponse =
  | DemoDealUnderwritingRecord
  | DealUnderwritingApiRecord;

const defaultDealIds = ["deal-a", "deal-b", "deal-c"];
const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const parseLooseNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    if (!cleaned) return fallback;
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

const toPercent = (value: unknown, fallback = 0) => {
  const parsed = parseLooseNumber(value, fallback);
  return parsed <= 1 ? parsed * 100 : parsed;
};

const createDealId = (value: string, index: number) =>
  value?.trim().toLowerCase().replace(/\s+/g, "-") || defaultDealIds[index] || `deal-${index + 1}`;

function getStrategy(classType?: string, riskLevel?: number, rentGap?: number): Deal["strategy"] {
  const normalized = (classType ?? "").toUpperCase();
  if (normalized === "A") return "Core";
  if (normalized === "B" && (riskLevel ?? 0) < 35) return "Core+";
  if ((rentGap ?? 0) >= 10 || normalized === "C") return "Value-Add";
  return "Opportunistic";
}

function getSeverity(score: number): "High" | "Medium" | "Low" {
  if (score >= 65) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

function getSignal(overall: number, riskLevel: number): DealSignal {
  if (overall >= 80 && riskLevel < 45) return "Strong Buy";
  if (overall >= 68 && riskLevel < 55) return "Buy";
  if (overall >= 55) return "Neutral";
  return "Avoid";
}

function getDemoSignalOverride(propertyName?: string): DealSignal | null {
  const normalizedName = propertyName?.trim().toLowerCase();
  if (normalizedName === "summit ridge apartments") return "Buy";
  return null;
}

function getConfidence(overall: number, riskLevel: number) {
  return clamp(Math.round(overall - riskLevel * 0.15 + 15));
}

function deriveScores(
  propertyResponse: {
    kpis?: {
      noi?: number;
      noiMargin?: number;
      revenue?: number;
      expenseRatio?: number;
      occupancy?: number;
      lossToLease?: number;
      markToMarket?: number;
    };
  } | null | undefined,
  aiRent:
    | {
        dashboard?: {
          basic_info?: {
            revenueAtRisk?: number;
            avgrenewalrate?: number;
            mtmcapturepotential?: number;
            totalprojectedrevenuelift?: number;
          };
        };
      }
    | null
    | undefined
) {
  const kpis = propertyResponse?.kpis;
  const occupancy = toPercent(kpis?.occupancy);
  const noiMargin = toPercent(kpis?.noiMargin);
  const expenseRatio = toPercent(kpis?.expenseRatio);
  const lossToLease = toPercent(kpis?.lossToLease);
  const riskScore = 50;
  const mtm = toNumber(aiRent?.dashboard?.basic_info?.mtmcapturepotential ?? kpis?.markToMarket, 0);
  const totalLift = toNumber(aiRent?.dashboard?.basic_info?.totalprojectedrevenuelift, 0);
  const marketPosition = clamp(Math.round(occupancy * 0.45 + noiMargin * 0.2 + 50));
  const cashFlowStability = clamp(Math.round(occupancy * 0.55 + noiMargin * 0.35 - expenseRatio * 0.1 + 10));
  const valueAddPotential = clamp(Math.round(lossToLease * 1.6 + Math.min(mtm / 10000, 25) + Math.min(totalLift / 30000, 25)));
  const riskLevel = clamp(Math.round(riskScore || 100 - occupancy + expenseRatio * 0.4));
  const overall = clamp(Math.round(marketPosition * 0.25 + cashFlowStability * 0.3 + valueAddPotential * 0.25 + (100 - riskLevel) * 0.2));
  return { marketPosition, cashFlowStability, valueAddPotential, riskLevel, overall };
}

function mergeChartInsight(
  fallback: { insight: string; impact: string; drives: string },
  override?: ChartInsightRecord | null
) {
  if (!override) return fallback;
  return {
    insight: override.insight?.trim() || fallback.insight,
    impact: override.impact?.trim() || fallback.impact,
    drives: override.drives?.trim() || fallback.drives,
  };
}

function buildChartInsights(propertyName: string, occupancy: number, rentGap: number, noiMargin: number) {
  return {
    tenantMix: { insight: `${propertyName} unit mix is mapped from backend underwriting data.`, impact: "Supports demand and retention analysis.", drives: "Cash Flow Stability" },
    rentVsMarket: { insight: `Current rents are approximately ${rentGap.toFixed(1)}% below market.`, impact: "Highlights mark-to-market upside.", drives: "Value-Add Potential" },
    noiProjection: { insight: "NOI projection is sourced from the underwriting performance analytics response.", impact: "Shows expected earnings direction.", drives: "Overall Deal Score" },
    revenueVsExpenses: { insight: "Revenue and expense trends come from the underwriting response.", impact: "Makes margin pressure or expansion visible.", drives: "NOI Margin" },
    expenseBreakdown: { insight: "Expense categories are taken directly from the underwriting payload when available.", impact: "Shows where costs concentrate.", drives: "Expense Ratio" },
    expenseDistribution: { insight: "Distribution mirrors the expense category mix from the backend.", impact: "Helps prioritize savings work.", drives: "Expense Optimization" },
    leaseExpirations: { insight: "Lease rollover timing is sourced from the underwriting response.", impact: "Shows concentration risk by month.", drives: "Risk Level" },
    occupancyVacancy: { insight: `Occupancy is currently ${occupancy.toFixed(1)}%.`, impact: "Anchors the current income base.", drives: "Cash Flow Stability" },
  };
}

function formatCompactCurrencyValue(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getDealDocStatus(record: DealUnderwritingApiRecord) {
  const hasMemorandumData = Boolean(
    record.dealMemorandumResponse ??
    record.deal_memorandum_response ??
    record.header?.locationAddress ??
    record.header?.locationSubtitle ??
    record.header?.yearBuilt ??
    record.address ??
    record.location
  );

  const hasT12Data = Boolean(
    record.dealT12Response ??
    record.deal_t12_response ??
    record.kpiCards ??
    record.performanceAnalytics?.revenueVsExpenses?.length ??
    record.performanceAnalytics?.expenseBreakdown?.length ??
    record.performanceAnalytics?.expenseDistribution?.length
  );

  const hasRentRollData = Boolean(
    record.dealRentrollResponse ??
    record.deal_rentroll_response ??
    record.performanceAnalytics?.rentVsMarket?.length ??
    record.performanceAnalytics?.leaseExpiration?.length ??
    record.performanceAnalytics?.tenantMix?.length ??
    record.performanceAnalytics?.occupancyVsVacancy?.length ??
    record.performanceAnalytics?.leaseExpirationFloorplan?.data?.length
  );

  return {
    memorandum: hasMemorandumData,
    t12: hasT12Data,
    rentRoll: hasRentRollData,
  };
}

function parseSiteSize(value: string | null | undefined) {
  if (!value) return 0;
  const acreMatch = value.match(/([0-9.]+)\s*acres?/i);
  if (acreMatch) return parseLooseNumber(acreMatch[1], 0);
  return parseLooseNumber(value, 0);
}

function parseParkingSpaces(value: string | null | undefined) {
  return parseLooseNumber(value, 0);
}

function buildLeaseExpirationFloorplan(floorplan: Array<Record<string, string | number>> | null | undefined) {
  if (!floorplan?.length) return undefined;
  const ylabels = floorplan
    .map((row) => String(row["Unit Type"] ?? "").trim())
    .filter(Boolean);
  if (!ylabels.length) return undefined;
  const data = floorplan.map((row) => monthOrder.map((month) => parseLooseNumber(row[month], 0)));
  return {
    title: "Lease Expirations and Occupied Units by Floorplan",
    xlabels: monthOrder,
    ylabels,
    data,
  };
}

function buildDemoExpenseBreakdownFromT12(t12: DemoDealUnderwritingRecord["t12"]) {
  const current = t12?.["Expense Categories"]?.current;
  if (current) {
    const total = Object.entries(current).reduce((sum, [, amount]) => sum + parseLooseNumber(amount, 0), 0);
    return Object.entries(current)
      .map(([category, amount]) => {
        const numericAmount = parseLooseNumber(amount, 0);
        return {
          category,
          amount: numericAmount,
          percent: total > 0 ? Math.round((numericAmount / total) * 1000) / 10 : undefined,
        };
      })
      .filter((item) => item.amount > 0);
  }

  const fallbackEntries = [
    ["Taxes", t12?.Taxes],
    ["Grounds", t12?.Grounds],
    ["Payroll", t12?.Payroll],
    ["Renting", t12?.Renting],
    ["Insurance", t12?.Insurance],
    ["Utilities", t12?.Utilities],
    ["Maintenance", t12?.Maintenance],
    ["Administrative", t12?.Administrative],
    ["Management Fees", t12?.["Management Fees"]],
    ["Professional Fees", t12?.["Professional Fees"]],
    ["Operating Expenses", t12?.["Operating Expenses"]],
  ] as const;

  const items = fallbackEntries
    .map(([category, amount]) => ({ category, amount: parseLooseNumber(amount, 0) }))
    .filter((item) => item.amount > 0);
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return items.map((item) => ({
    ...item,
    percent: total > 0 ? Math.round((item.amount / total) * 1000) / 10 : undefined,
  }));
}

function buildDemoDeal(record: DemoDealUnderwritingRecord, index: number): Deal {
  const memorandum = record.memorandum ?? {};
  const t12 = record.t12 ?? {};
  const rentRoll = record.rent_roll ?? {};
  const validation = rentRoll.validation ?? {};

  const units = toNumber(validation.total_units, 0);
  const occupiedUnits = toNumber(validation.occupied_units, 0);

  const occupancy = toPercent(
    rentRoll["Average Occupancy"],
    units > 0 ? (occupiedUnits / units) * 100 : 0
  );

  const noi = parseLooseNumber(t12.NOI, 0);
  const noiMargin = toPercent(t12["NOI Margin"], 0);
  const expenseRatio = toPercent(t12["Operating Expense Ratio"], 100 - noiMargin);

  const revenuePerMonth = monthOrder.map((month) => ({
    month,
    value: parseLooseNumber(t12["Revenue per Month"]?.[month], 0),
  }));

  const expensePerMonth = monthOrder.map((month) => ({
    month,
    value: parseLooseNumber(t12["Expense per Month"]?.[month], 0),
  }));

  const noiPerMonth = monthOrder.map((month) => ({
    month,
    value: parseLooseNumber(t12["NOI per Month"]?.[month], 0),
  }));

  const totalRevenue = revenuePerMonth.reduce((sum, item) => sum + item.value, 0);
  const totalExpenses = expensePerMonth.reduce((sum, item) => sum + item.value, 0);

  const revenuePerUnit =
    parseLooseNumber(t12["Revenue per Unit"], 0) || (units > 0 ? totalRevenue / units : 0);

  const rentVsMarket = (rentRoll["In Place vs Market Rent"] ?? []).map((item) => ({
    type: String(item["Unit Type"] ?? "Unit"),
    current: parseLooseNumber(item["Avg In Place Rent"], 0),
    market: parseLooseNumber(item["Avg Market Rent"], 0),
  }));

  const averageRentGap = rentVsMarket.length
    ? rentVsMarket.reduce((sum, item) => {
        return sum + (item.market > 0 ? ((item.market - item.current) / item.market) * 100 : 0);
      }, 0) / rentVsMarket.length
    : 0;

  const dealScorecard = deriveScores(
    {
      kpis: {
        noi,
        noiMargin,
        revenue: totalRevenue,
        expenseRatio,
        occupancy,
        lossToLease: parseLooseNumber(rentRoll["MTM Capture"]?.["Loss to Lease"], 0),
        markToMarket: parseLooseNumber(rentRoll["Projected Revenue Lift"], 0),
      },
    },
    {
      dashboard: {
        basic_info: {
          revenueAtRisk: parseLooseNumber(rentRoll["Revenue at Risk"], 0),
          avgrenewalrate: toPercent(rentRoll["Avg Renewal Rate"] ?? rentRoll["Renewal Rate"], 0),
          mtmcapturepotential: parseLooseNumber(rentRoll["MTM Capture"]?.["Loss to Lease"], 0),
          totalprojectedrevenuelift: parseLooseNumber(rentRoll["Projected Revenue Lift"], 0),
        },
      },
    }
  );

  const signal =
    getDemoSignalOverride(record.property_name) ??
    getSignal(dealScorecard.overall, dealScorecard.riskLevel);

  const confidence = getConfidence(dealScorecard.overall, dealScorecard.riskLevel);

  const expenseBreakdown = buildDemoExpenseBreakdownFromT12(t12);

  const revenueVsExpenses = monthOrder.map((month, index) => ({
    month,
    revenue: revenuePerMonth[index].value,
    expenses: expensePerMonth[index].value,
  }));

  const occupancyHistory = monthOrder.map((month) => {
    const vacancyAmount = parseLooseNumber(
      t12["Vacancy per Month"]?.[month] ?? t12.Vacancy?.[month],
      0
    );
    const grossPotential = parseLooseNumber(
      t12["Gross Potential Rent per Month"]?.[month] ?? t12["Gross Potential Rent Monthly"]?.[month],
      0
    );
    const vacancyRate =
      grossPotential > 0 ? clamp((vacancyAmount / grossPotential) * 100, 0, 100) : clamp(100 - occupancy, 0, 100);

    return {
      month,
      occupancy: clamp(100 - vacancyRate, 0, 100),
      vacancy: vacancyRate,
    };
  });

  const leaseExpirations = monthOrder.map((month) => ({
    year: month,
    units: parseLooseNumber(rentRoll["Lease Expiration Ladder"]?.[month], 0),
  }));

  const floorplan = buildLeaseExpirationFloorplan(rentRoll["Lease Expiration Floorplan"]);
  const tenantMix =
    floorplan?.ylabels
      .map((label, rowIndex) => {
        const rowTotal = floorplan.data[rowIndex].reduce((sum, value) => sum + value, 0);
        return {
          name: label,
          count: rowTotal,
          percentage: units > 0 ? Math.round((rowTotal / units) * 1000) / 10 : 0,
        };
      })
      .filter((item) => item.count > 0) ?? [];

  const moversLift = parseLooseNumber(rentRoll["Projected Revenue Lift"], 0);

  const risks: Deal["risks"] = [
    {
      title: "Revenue At Risk",
      severity: getSeverity(dealScorecard.riskLevel),
      impact: `-${formatCompactCurrencyValue(parseLooseNumber(rentRoll["Revenue at Risk"], 0))} exposure`,
      explanation: `${parseLooseNumber(rentRoll["Revenue at Risk (60d)"], 0)} in 60d and ${parseLooseNumber(rentRoll["Revenue at Risk (90d)"], 0)} in 90d pipeline risk.`,
    },
    {
      title: "Vacancy Exposure",
      severity: getSeverity(clamp(100 - occupancy)),
      impact: `-${formatCompactCurrencyValue(parseLooseNumber(rentRoll["Vacancy Loss"], 0))} vacancy loss`,
      explanation: `${occupiedUnits} occupied out of ${units} total units with ${occupancy.toFixed(1)}% average occupancy.`,
    },
    {
      title: "Expense Pressure",
      severity: getSeverity(Math.round(expenseRatio)),
      impact: `${expenseRatio.toFixed(1)}% expense ratio`,
      explanation: "Operating expenses are mapped from the T12 expense categories and monthly expense totals.",
    },
  ];

  const opportunities: Deal["opportunities"] = [
    {
      title: "Projected Revenue Lift",
      severity: "High",
      impact: `+${formatCompactCurrencyValue(moversLift)} upside`,
      explanation: "Projected revenue lift is mapped directly from the rent roll response.",
    },
    {
      title: "Mark-to-Market Capture",
      severity: "Medium",
      impact: `+${formatCompactCurrencyValue(parseLooseNumber(rentRoll["MTM Capture"]?.["Loss to Lease"], 0))} upside`,
      explanation: `${parseLooseNumber(rentRoll["MTM Capture"]?.["MTM Units"], 0)} MTM units remain below market.`,
    },
    {
      title: "Recommended Rent Growth",
      severity: "Medium",
      impact: `${(rentRoll["In Place vs Recommended Rent"] ?? []).length} unit types with pricing recommendations`,
      explanation: "Recommended rents are mapped from the in-place vs recommended rent table.",
    },
  ];

  return {
    id: createDealId(record.property_name || "", index),
    name: record.property_name || `Property ${index + 1}`,
    address: memorandum.location || "",
    location: memorandum.location || "",
    submarket: "",
    region: "",
    strategy: getStrategy(undefined, dealScorecard.riskLevel, averageRentGap),
    units,
    yearBuilt: toNumber(memorandum.yearBuilt, 0),
    askingPrice: totalRevenue > 0 ? Math.round(totalRevenue * 8.5) : 0,
    signal,
    confidence,
    thesis: `${record.property_name || "This property"} demo underwriting is mapped from memorandum, T12, and rent roll data from /api/deal_underwriting_data/.`,
    metrics: {
      noOfUnits: units,
      yearBuilt: toNumber(memorandum.yearBuilt, 0),
      noi,
      noiMargin,
      revenuePerUnit,
      expenseRatio,
      totalExpenses,
      occupancy,
      occupancyUnits: { occupied: occupiedUnits, total: units },
      vacancyLoss: parseLooseNumber(rentRoll["Vacancy Loss"], clamp(100 - occupancy, 0, 100)),
      rentGap: clamp(averageRentGap, -100, 100),
      totalProjectedRevenueLift: moversLift,
      rentPerSqft: 0,
      parkingSpace: parseParkingSpaces(memorandum.parkingSpace),
      siteSize: parseSiteSize(memorandum.siteSize),
    },
    scores: dealScorecard,
    movers: {
      rentIncrease: moversLift,
      expenseOptimization: Math.round(totalExpenses * Math.min(expenseRatio / 100, 0.12)),
      occupancyImprovement: Math.round((100 - occupancy) / 100 * Math.max(totalRevenue, 0) * 0.4),
      totalPotentialNoiUplift: moversLift,
    },
    risks,
    opportunities,
    tenantMix,
    rentVsMarket,
    noiProjection: noiPerMonth.map((item) => ({
      year: item.month,
      noi: item.value,
    })),
    revenueVsExpenses,
    expenseBreakdown,
    expenseDistribution: expenseBreakdown,
    leaseExpirations,
    occupancyHistory,
    leaseExpirationFloorplan: floorplan,
    docStatus: {
      memorandum: Boolean(record.memorandum),
      t12: Boolean(record.t12),
      rentRoll: Boolean(record.rent_roll),
    },
    chartInsights: {
      tenantMix: { insight: "Tenant mix is mapped from the lease expiration floorplan table.", impact: "Shows full unit-type concentration.", drives: "Market Position" },
      rentVsMarket: { insight: `Average rent gap is ${averageRentGap.toFixed(1)}%.`, impact: "Highlights mark-to-market upside or over-market exposure.", drives: "Value-Add Potential" },
      noiProjection: { insight: "NOI projection is mapped from all 12 monthly NOI values in the T12 response.", impact: "Shows full monthly earnings trend.", drives: "Overall Deal Score" },
      revenueVsExpenses: { insight: "Revenue and expense charts are mapped from all 12 T12 monthly values.", impact: "Shows margin compression or expansion over time.", drives: "NOI Margin" },
      expenseBreakdown: { insight: "Expense breakdown is mapped from T12 expense categories.", impact: "Identifies the largest cost buckets.", drives: "Expense Ratio" },
      expenseDistribution: { insight: "Expense distribution mirrors the T12 category totals.", impact: "Shows where optimization work is likely to matter most.", drives: "Expense Optimization" },
      leaseExpirations: { insight: "Lease expirations are mapped from the full 12-month rent roll ladder.", impact: "Shows rollover concentration by month.", drives: "Risk Level" },
      occupancyVacancy: { insight: "Occupancy and vacancy are derived from full 12-month vacancy and rent data.", impact: "Anchors recurring income stability.", drives: "Cash Flow Stability" },
    },
  };
}

function mapUserApiRecordToDeal(record: DealUnderwritingApiRecord, index: number): Deal {
  const defaultChartInsights = buildChartInsights(
    record.propertyName,
    toNumber(record.kpiCards.occupancyRate, 0),
    toNumber(record.kpiCards.rentVsMarketGap, 0),
    toNumber(record.kpiCards.noiMargin, 0)
  );

  const units = toNumber(record.header.units ?? record.kpiCards.noOfUnits, 0);
  const revenuePerUnit = toNumber(record.kpiCards.revenuePerUnit, 0);
  const estimatedRevenue =
    revenuePerUnit > 0 && units > 0
      ? revenuePerUnit * units
      : record.performanceAnalytics.revenueVsExpenses?.reduce((sum, item) => sum + toNumber(item.revenue), 0) || 0;

  const noiMargin = toNumber(record.kpiCards.noiMargin, 0);
  const totalExpenses =
    record.performanceAnalytics.revenueVsExpenses?.reduce((sum, item) => sum + toNumber(item.expense), 0) ||
    estimatedRevenue * (toNumber(record.kpiCards.expenseRatio, 0) / 100);

  const noi = estimatedRevenue > 0 ? estimatedRevenue * (noiMargin / 100) : Math.max(estimatedRevenue - totalExpenses, 0);
  const rentGap = toNumber(record.kpiCards.rentVsMarketGap, 0);
  const docStatus = getDealDocStatus(record);

  return {
    id: createDealId(record.propertyName, index),
    name: record.propertyName,
    address: record.address || record.header.locationAddress || "",
    location: record.location || record.header.locationSubtitle || "",
    submarket: record.submarket,
    region: record.region,
    strategy: getStrategy(record.classType, record.dealScorecard.riskLevel, rentGap),
    units,
    yearBuilt: toNumber(record.header.yearBuilt, 0),
    askingPrice: estimatedRevenue > 0 ? Math.round(estimatedRevenue * 8.5) : 0,
    signal: record.aiAcquisitionSnapshot.recommendation || "Neutral",
    confidence: clamp(toNumber(record.aiAcquisitionSnapshot.confidenceScore, 0)),
    thesis: record.aiAcquisitionSnapshot.investmentThesis || record.sourceOverview || "",
    metrics: {
      noOfUnits: toNumber(record.kpiCards.noOfUnits, units),
      yearBuilt: toNumber(record.kpiCards.yearBuilt ?? record.header.yearBuilt, 0),
      noi,
      noiMargin,
      revenuePerUnit,
      expenseRatio: toNumber(record.kpiCards.expenseRatio, 0),
      totalExpenses,
      occupancy: toNumber(record.kpiCards.occupancyRate, 0),
      occupancyUnits: record.kpiCards.occupancyUnits
        ? {
            occupied: toNumber(record.kpiCards.occupancyUnits.occupied, 0),
            total: toNumber(record.kpiCards.occupancyUnits.total, units),
          }
        : undefined,
      vacancyLoss: toNumber(record.kpiCards.vacancyLoss, 0),
      rentGap,
      totalProjectedRevenueLift: toNumber(record.kpiCards.totalProjectedRevenueLift, 0),
      rentPerSqft: toNumber(record.kpiCards.rentPerSqft, 0),
      parkingSpace: toNumber(record.kpiCards.parkingSpace ?? record.kpiCards.parkingSpaces ?? record.kpiCards.parking_space, 0),
      siteSize: toNumber(record.kpiCards.siteSize ?? record.kpiCards.site_size ?? record.kpiCards.siteAcreage, 0),
    },
    scores: {
      overall: toNumber(record.dealScorecard.overallDealScore, 0),
      marketPosition: toNumber(record.dealScorecard.marketPosition, 0),
      cashFlowStability: toNumber(record.dealScorecard.cashFlowStability, 0),
      valueAddPotential: toNumber(record.dealScorecard.valueAddPotential, 0),
      riskLevel: toNumber(record.dealScorecard.riskLevel, 0),
    },
    movers: {
      rentIncrease: toNumber(record.whatDrivesThisInvestment.rentIncrease, 0),
      expenseOptimization: toNumber(record.whatDrivesThisInvestment.expenseOptimization, 0),
      occupancyImprovement: toNumber(record.whatDrivesThisInvestment.occupancyImprovement, 0),
      totalPotentialNoiUplift: toNumber(record.whatDrivesThisInvestment.totalPotentialNoiUplift, 0),
    },
    risks: record.risks ?? [],
    opportunities: record.opportunities ?? [],
    tenantMix: (record.performanceAnalytics.tenantMix ?? []).map((item) => ({
      name: item.unitType,
      percentage: toNumber(item.percent),
      count: toNumber(item.count),
    })),
    rentVsMarket: (record.performanceAnalytics.rentVsMarket ?? []).map((item) => ({
      type: item.unitType,
      current: toNumber(item.inPlace),
      market: toNumber(item.market),
    })),
    noiProjection: (record.performanceAnalytics.noiGrowthProjection ?? []).map((item) => ({
      year: String(item.year),
      noi: toNumber(item.noi),
    })),
    revenueVsExpenses: (record.performanceAnalytics.revenueVsExpenses ?? []).map((item) => ({
      month: item.month,
      revenue: toNumber(item.revenue),
      expenses: toNumber(item.expense),
    })),
    expenseBreakdown: (record.performanceAnalytics.expenseBreakdown ?? []).map((item) => ({
      category: item.category,
      amount: toNumber(item.amount),
      percent: toNumber(item.percent),
    })),
    expenseDistribution: (record.performanceAnalytics.expenseDistribution ?? record.performanceAnalytics.expenseBreakdown ?? []).map((item) => ({
      category: item.category,
      amount: toNumber(item.amount),
      percent: toNumber(item.percent),
    })),
    leaseExpirations: (record.performanceAnalytics.leaseExpiration ?? []).map((item) => ({
      year: item.month,
      units: toNumber(item.units),
    })),
    occupancyHistory: (record.performanceAnalytics.occupancyVsVacancy ?? []).map((item) => ({
      month: item.month,
      occupancy: toNumber(item.occupancyRate),
      vacancy: toNumber(item.vacancyRate),
    })),
    leaseExpirationFloorplan: record.performanceAnalytics.leaseExpirationFloorplan
      ? {
          title: record.performanceAnalytics.leaseExpirationFloorplan.title || "Lease Expirations and Occupied Units by Floorplan",
          xlabels: record.performanceAnalytics.leaseExpirationFloorplan.xlabels ?? [],
          ylabels: record.performanceAnalytics.leaseExpirationFloorplan.ylabels ?? [],
          data: record.performanceAnalytics.leaseExpirationFloorplan.data ?? [],
        }
      : undefined,
    docStatus,
    chartInsights: {
      ...defaultChartInsights,
      tenantMix: mergeChartInsight(defaultChartInsights.tenantMix, record.performanceAnalytics.tenantMixInsights),
      rentVsMarket: mergeChartInsight(defaultChartInsights.rentVsMarket, record.performanceAnalytics.rentVsMarketInsights),
      revenueVsExpenses: mergeChartInsight(defaultChartInsights.revenueVsExpenses, record.performanceAnalytics.revenueVsExpensesInsights),
      expenseDistribution: mergeChartInsight(defaultChartInsights.expenseDistribution, record.performanceAnalytics.expenseDistributionInsights),
      leaseExpirations: mergeChartInsight(defaultChartInsights.leaseExpirations, record.performanceAnalytics.leaseExpirationInsights),
      occupancyVacancy: mergeChartInsight(defaultChartInsights.occupancyVacancy, record.performanceAnalytics.occupancyVsVacancyInsights),
    },
  };
}

function hasDealUnderwritingData(record: DealUnderwritingApiRecord) {
  return Boolean(
    record.propertyName &&
      (record.aiAcquisitionSnapshot ||
        record.kpiCards ||
        record.dealScorecard ||
        record.whatDrivesThisInvestment ||
        record.performanceAnalytics ||
        record.sourceOverview)
  );
}

function isMappedDealRecord(
  record: DealUnderwritingMixedResponse
): record is DealUnderwritingApiRecord {
  return typeof (record as DealUnderwritingApiRecord)?.propertyName === "string";
}

function isRawDemoDealRecord(
  record: DealUnderwritingMixedResponse
): record is DemoDealUnderwritingRecord {
  return typeof (record as DemoDealUnderwritingRecord)?.property_name === "string";
}

async function loadUserDealUnderwriting(propertyNames?: string[]) {
  const params = propertyNames?.length ? { property_names: propertyNames } : undefined;
  const response = await authClient.get<{ data?: DealUnderwritingApiRecord[] }>(
    "/api/dealunderwriting_demouser/",
    { params }
  );
  const cachedRecords = response.data?.data ?? [];

  if (cachedRecords.length) {
    return cachedRecords;
  }

  const payload = propertyNames?.length ? { property_names: propertyNames } : {};
  const fallbackResponse = await authClient.post<{ data?: DealUnderwritingApiRecord[] }>(
    "/api/dealunderwriting_demouser/",
    payload
  );
  return fallbackResponse.data?.data ?? [];
}

export async function deleteUserDealUnderwriting(propertyName: string) {
  return authClient.post("/api/user_properties/deal_delete/", {
    property_name: propertyName,
  });
}

async function loadDemoDealUnderwriting(): Promise<Deal[]> {
  const response = await authClient.get<
    DealUnderwritingMixedResponse[] | { data?: DealUnderwritingMixedResponse[] }
  >("/api/deal_underwriting_data/");

  const payload = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.data)
      ? response.data.data
      : [];

  return payload
    .map((record, index) => {
      if (isMappedDealRecord(record)) {
        return mapUserApiRecordToDeal(record, index);
      }

      if (isRawDemoDealRecord(record)) {
        return buildDemoDeal(record, index);
      }

      return null;
    })
    .filter((deal): deal is Deal => Boolean(deal));
}

export function useDealUnderwritingData(_requestedIds: string[] = []): DealDataState {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBaseData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode()) {
        const demoDeals = await loadDemoDealUnderwriting();
        setDeals(demoDeals);
      } else {
        const records = await loadUserDealUnderwriting();
        setDeals(records.filter(hasDealUnderwritingData).map((record, index) => mapUserApiRecordToDeal(record, index)));
      }
    } catch {
      setError("Unable to load deal underwriting data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBaseData().catch(() => {
      setError("Unable to load deal underwriting data.");
    });
  }, [loadBaseData]);

  return { deals, loading, error, refresh: loadBaseData };
}

export function getDealById(deals: Deal[], id: string) {
  return deals.find((deal) => deal.id === id);
}
