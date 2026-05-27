export type DisplayMetric = {
  value?: number;
  display?: string;
  yoyChange?: number;
};

export type PortfolioSnapshot = {
  badDebt?: DisplayMetric;
  noiMargin?: DisplayMetric;
  totalUnits?: number;
  occupied_units?: number;
  concessions?: DisplayMetric;
  vacancyLoss?: DisplayMetric;
  expensePerUnit?: DisplayMetric;
  revenuePerUnit?: DisplayMetric;
  totalProperties?: number;
  averageOccupancy?: DisplayMetric;
  grossPotentialRent?: DisplayMetric;
  netOperatingIncome?: DisplayMetric;
  operatingExpenseRatio?: DisplayMetric;
};

export type PortfolioNarrativeFields = {
  overview?: string;
  aiGuidedRecommendations?: string[];
};

export type PerformanceTrendPoint = {
  date: string;
  noi?: number;
};

export type RevenueExpensePoint = {
  date: string;
  revenue?: number;
  expense?: number;
};

export type PerformanceDriversPayload = {
  noi_trend_2025?: {
    data?: PerformanceTrendPoint[];
    summary?: {
      start_value?: number;
      end_value?: number;
      growth_pct?: number;
      trend_direction?: string;
    };
    currency?: string;
    frequency?: string;
  };
  revenue_vs_expense_2025?: {
    data?: RevenueExpensePoint[];
    derived_metrics?: {
      end_margin_pct?: number;
      start_margin_pct?: number;
      expense_growth_pct?: number;
      revenue_growth_pct?: number;
      noi_growth_pct?: number;
    };
    currency?: string;
    frequency?: string;
  };
};

export type RevenueLeaseKpiSummary = {
  renewal_rate_pct?: number;
  wtd_loss_to_lease_pct?: number;
  units_below_market_pct?: number;
  avg_lease_remaining_months?: number;
  mark_to_market_opportunity_usd?: number;
};

export type LeaseExpirationLadder = {
  data?: Array<{
    month?: string;
    expirations?: number;
  }>;
  unit?: string;
  frequency?: string;
  risk_flags?: {
    peak_month?: string;
    peak_expirations?: number;
    concentration_risk?: string;
  };
};

export type RevenueQualityLeaseIntelligence = {
  kpi_summary?: RevenueLeaseKpiSummary;
  lease_expiration_ladder_next_12_months?: LeaseExpirationLadder;
};

export type RevenueLeasesResponse = PortfolioNarrativeFields & {
  revenue_quality_lease_intelligence?: RevenueQualityLeaseIntelligence;
};

export type ExpenseCategory = {
  name?: string;
  current?: number;
  priorYear?: number;
  yoyGrowthPercent?: number;
  perUnit?: number;
  compositionPercent?: number;
};

export type ExpenseDashboard = {
  charts?: {
    expenseGrowth?: {
      type?: string;
      metric?: string;
      highlightColor?: string;
      highlightThreshold?: number;
    };
    expenseComposition?: {
      type?: string;
      metric?: string;
      groupBy?: string;
    };
  };
  summary?: {
    totalCurrent?: number;
    totalPriorYear?: number;
    overallYoYGrowth?: number;
  };
  categories?: ExpenseCategory[];
};

export type ExpenseIntelResponse = PortfolioNarrativeFields & {
  expensesDashboard?: ExpenseDashboard;
};

export type RiskScoreByProperty = {
  riskScore?: number;
  propertyName?: string;
};

export type RevenueConcentrationRow = {
  propertyName?: string;
  revenueSharePercent?: number;
};

export type UnderperformingAsset = {
  units?: number;
  location?: string;
  riskScore?: number;
  threshold?: {
    noiGrowthBelowPercent?: number;
  };
  propertyName?: string;
  noiGrowthPercent?: number;
  expenseGrowthPercent?: number;
};

export type RiskStabilityDashboard = {
  summaryMetrics?: {
    revenueAtRisk60Days?: number;
    revenueAtRisk90Days?: number;
    portfolioStabilityScore?: {
      score?: number;
      maxScore?: number;
    };
  };
  riskScoreByProperty?: RiskScoreByProperty[];
  revenueConcentration?: RevenueConcentrationRow[];
  underperformingAssets?: UnderperformingAsset[];
};

export type RiskStabilityResponse = PortfolioNarrativeFields & {
  riskStabilityDashboard?: RiskStabilityDashboard;
};

export type PortfolioAnalyticsResponse = {
  portfolioSnapshot?: PortfolioSnapshot;
  performance_drivers_response?: {
    performance_drivers?: PerformanceDriversPayload;
  };
  revenue_leases_response?: RevenueLeasesResponse;
  expense_intel_response?: ExpenseIntelResponse;
  risk_stability_response?: RiskStabilityResponse;
};

export type PortfolioAnalyticsRecord = {
  risk_stability_response?: RiskStabilityResponse | null;
  expense_intel_response?: ExpenseIntelResponse | null;
  revenue_leases_response?: RevenueLeasesResponse | null;
  performance_drivers_response?: (PortfolioNarrativeFields & {
    performance_drivers?: PerformanceDriversPayload;
  }) | null;
  property_name: string;
  submarket: string;
  region: string;
  address: string;
  location: string;
  portfolio_analytics_response?: (PortfolioNarrativeFields & {
    portfolioSnapshot?: PortfolioSnapshot;
  }) | null;
};
