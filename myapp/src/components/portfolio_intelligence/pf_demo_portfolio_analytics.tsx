import React, { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-api";
import { isDemoMode } from "@/lib/demo-mode";
import SnapshotTab from "./tabs/snapshot_tab";
import PerformanceDriversTab from "./tabs/performance_drivers_tab";
import RevenueQualityLeaseIntelligenceTab from "./tabs/revenue_quality_lease_intelligence_tab";
import ExpenseIntelTab from "./tabs/expense_intel_tab";
import RiskStabilityTab from "./tabs/risk_stability_tab";
import { PortfolioGuidedRecommendationCard } from "./tabs/portfolio_narrative_cards";
import {
  PortfolioAnalyticsRecord,
  PortfolioNarrativeFields,
} from "./portfolio_analytics_types";

export const portfolioAnalyticsTabDefinitions = [
  { id: "snapshot", label: "Snapshot" },
  { id: "performance_drivers", label: "Performance Drivers" },
  { id: "revenue_quality_lease_intelligence", label: "Revenue & Leases" },
  { id: "expenses_dashboard", label: "Expense Intel" },
  { id: "risk_stability_dashboard", label: "Risk & Stability" },
] as const;

export type PortfolioAnalyticsTabId =
  (typeof portfolioAnalyticsTabDefinitions)[number]["id"];

type PfDemoPortfolioAnalyticsProps = {
  activeSubTab?: PortfolioAnalyticsTabId;
  onSubTabChange?: (tab: PortfolioAnalyticsTabId) => void;
  showTabMenu?: boolean;
};

type PortfolioAnalyticsListResponse = {
  data?: PortfolioAnalyticsRecord[];
};

const API_URL = import.meta.env.VITE_API_URL;

const PfDemoPortfolioAnalytics: React.FC<PfDemoPortfolioAnalyticsProps> = ({
  activeSubTab,
  onSubTabChange,
  showTabMenu = true,
}) => {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [insightsStatus, setInsightsStatus] = useState<"idle" | "loading" | "error">("idle");
  const [selectedRecord, setSelectedRecord] = useState<PortfolioAnalyticsRecord | null>(null);
  const [internalActiveTab, setInternalActiveTab] =
    useState<PortfolioAnalyticsTabId>("snapshot");

  const activeTab = activeSubTab ?? internalActiveTab;

  const setActiveTab = (tab: PortfolioAnalyticsTabId) => {
    if (onSubTabChange) onSubTabChange(tab);
    else setInternalActiveTab(tab);
  };



 useEffect(() => {
  let isMounted = true;

  const load = async () => {
    setStatus("loading");

    try {
      const demoMode = isDemoMode();

      const response = demoMode
        ? await authClient.post<PortfolioAnalyticsListResponse>(
            `${API_URL}/api/get_portfolio_analytics_model_data/`,
            { fetch: "all" }
          )
        : await authClient.get<PortfolioAnalyticsListResponse>(
            "/api/get_portfolio_analytics_model_data_user_view/",
            { params: { fetch: "all" } }
          );

      if (!isMounted) return;

      const baseRecord = response.data?.data?.[0] ?? null;
      setSelectedRecord(baseRecord);
      setStatus("idle");
      setInsightsStatus("idle");
    } catch {
      if (isMounted) {
        setStatus("error");
        setInsightsStatus("error");
      }
    }
  };

  load();

  return () => {
    isMounted = false;
  };
}, []);


  const activeTabContent = useMemo(() => {
    if (!selectedRecord) return null;

    const portfolioResponse = selectedRecord.portfolio_analytics_response;
    const performanceDriversData =
      selectedRecord?.performance_drivers_response?.performance_drivers;

    const revenueLeaseData =
      selectedRecord?.revenue_leases_response?.revenue_quality_lease_intelligence;

    const expenseIntelData =
      selectedRecord?.expense_intel_response?.expensesDashboard;

    const riskStabilityData =
      selectedRecord?.risk_stability_response?.riskStabilityDashboard;


    switch (activeTab) {
      case "snapshot":
        return <SnapshotTab data={portfolioResponse?.portfolioSnapshot} />;
      case "performance_drivers":
        return <PerformanceDriversTab data={performanceDriversData} />;
      case "revenue_quality_lease_intelligence":
        return (
          <RevenueQualityLeaseIntelligenceTab
            data={revenueLeaseData}
          />
        );
      case "expenses_dashboard":
        return <ExpenseIntelTab data={expenseIntelData} />;
      case "risk_stability_dashboard":
        return <RiskStabilityTab data={riskStabilityData} />;
      default:
        return null;
    }
  }, [activeTab, selectedRecord]);

  const activeTabDefinition = useMemo(
    () => portfolioAnalyticsTabDefinitions.find((tab) => tab.id === activeTab),
    [activeTab]
  );

  const activeApiNarrative = useMemo<PortfolioNarrativeFields | null>(() => {
    if (!selectedRecord) return null;

    switch (activeTab) {
      case "snapshot":
        return selectedRecord.portfolio_analytics_response ?? null;
      case "performance_drivers":
        return selectedRecord.performance_drivers_response ?? null;
      case "revenue_quality_lease_intelligence":
        return selectedRecord.revenue_leases_response ?? null;
      case "expenses_dashboard":
        return selectedRecord.expense_intel_response ?? null;
      case "risk_stability_dashboard":
        return selectedRecord.risk_stability_response ?? null;
      default:
        return null;
    }
  }, [activeTab, selectedRecord]);

  const hasInsightsOverview = Boolean(activeApiNarrative?.overview?.trim());
  const hasInsightsRecommendations = Boolean(activeApiNarrative?.aiGuidedRecommendations?.length);
  const isInsightsLoading = insightsStatus === "loading";

  const overviewText = hasInsightsOverview
    ? activeApiNarrative?.overview?.trim()
    : isInsightsLoading
      ? ""
      : "AI overview is not available yet.";

  const recommendations = hasInsightsRecommendations
    ? activeApiNarrative?.aiGuidedRecommendations ?? []
    : isInsightsLoading
      ? []
      : ["AI guided recommendations are not available yet."];

  return (
    <>
      {showTabMenu && (
        <div className="mb-4 max-w-sm">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="absolute -top-2 left-8 h-4 w-4 rotate-45 border-l border-t border-slate-200 bg-white" />
            <div className="relative space-y-2">
              {portfolioAnalyticsTabDefinitions.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${isActive ? "bg-[#eef7f3] text-[#0b7a5c]" : "text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${isActive ? "bg-[#0fa77d]" : "bg-slate-300"
                        }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div>
        {status === "loading" ? (
          <p className="text-sm text-slate-500">Loading analytics...</p>
        ) : status === "error" ? (
          <p className="text-sm text-rose-600">Unable to load analytics right now. Please try again later.</p>
        ) : selectedRecord ? (
          <div className="space-y-4">
            <section className="portfolio-recommendation-card relative overflow-hidden rounded-[30px] border border-blue-900/20 bg-gradient-to-br from-[#0f172a] via-[#1d2f6f] to-[#143f7a] p-6 text-white shadow-[0_24px_64px_rgba(15,23,42,0.35)] md:p-8">
              <div className="relative z-10">
                <h2 className="text-3xl font-semibold leading-tight">
                  {activeTabDefinition?.label ?? "Overview"}
                </h2>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                  Overview
                </p>
                {isInsightsLoading && !hasInsightsOverview ? (
                  <div className="mt-4 space-y-3">
                    <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                      AI analyzing...
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-white/15" />
                      <div className="h-4 w-[92%] animate-pulse rounded bg-white/15" />
                      <div className="h-4 w-[78%] animate-pulse rounded bg-white/15" />
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-white/95 md:text-[15px]">
                    {overviewText}
                  </p>
                )}
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-300/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-indigo-300/20 blur-2xl" />
            </section>
            {activeTabContent}
            <PortfolioGuidedRecommendationCard
              recommendations={recommendations}
              isLoading={isInsightsLoading && !hasInsightsRecommendations}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500">No analytics data available.</p>
        )}
      </div>
    </>
  );
};

export default PfDemoPortfolioAnalytics;
