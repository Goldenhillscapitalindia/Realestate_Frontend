import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import SnapshotTab from "./tabs/snapshot_tab";
import PerformanceDriversTab from "./tabs/performance_drivers_tab";
import RevenueQualityLeaseIntelligenceTab from "./tabs/revenue_quality_lease_intelligence_tab";
import ExpenseIntelTab from "./tabs/expense_intel_tab";
import RiskStabilityTab from "./tabs/risk_stability_tab";
import { PortfolioAnalyticsRecord } from "./portfolio_analytics_types";

const tabDefinitions = [
  { id: "snapshot", label: "Snapshot" },
  { id: "performance_drivers", label: "Performance Drivers" },
  { id: "revenue_quality_lease_intelligence", label: "Revenue & Leases" },
  { id: "expenses_dashboard", label: "Expense Intel" },
  { id: "risk_stability_dashboard", label: "Risk & Stability" },
] as const;

type TabId = (typeof tabDefinitions)[number]["id"];

const PfDemoPortfolioAnalytics: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [selectedRecord, setSelectedRecord] = useState<PortfolioAnalyticsRecord | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("snapshot");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setStatus("loading");
      try {
        const response = await axios.post<{ data: PortfolioAnalyticsRecord[] }>(
          `${API_URL}/api/get_portfolio_analytics_model_data/`,
          { fetch: "all" }
        );
        if (!isMounted) return;
        const record = response.data?.data?.[0] ?? null;
        setSelectedRecord(record);
        setStatus("idle");
      } catch (error) {
        if (isMounted) setStatus("error");
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  const activeTabContent = useMemo(() => {
    if (!selectedRecord) return null;

    switch (activeTab) {
      case "snapshot":
        return (
          <SnapshotTab
            data={selectedRecord.portfolio_analytics_response?.portfolioSnapshot}
          />
        );

      case "performance_drivers":
        return (
          <PerformanceDriversTab
            data={selectedRecord.performance_drivers_response?.performance_drivers}
          />
        );

      case "revenue_quality_lease_intelligence":
        return (
          <RevenueQualityLeaseIntelligenceTab
            data={
              selectedRecord.revenue_leases_response
                ?.revenue_quality_lease_intelligence
            }
          />
        );

      case "expenses_dashboard":
        return (
          <ExpenseIntelTab
            data={selectedRecord.expense_intel_response?.expensesDashboard}
          />
        );

      case "risk_stability_dashboard":
        return (
          <RiskStabilityTab
            data={
              selectedRecord.risk_stability_response
                ?.riskStabilityDashboard
            }
          />
        );

      default:
        return null;
    }
  }, [activeTab, selectedRecord]);

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div className="flex flex-wrap gap-2 mb-2">
            {tabDefinitions.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive
                      ? "bg-slate-900 text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

          {status === "loading" ? (
            <p className="text-sm text-slate-500">Loading analytics...</p>
          ) : status === "error" ? (
            <p className="text-sm text-rose-600">Unable to load analytics right now. Please try again later.</p>
          ) : selectedRecord ? (
            activeTabContent
          ) : (
            <p className="text-sm text-slate-500">No analytics data available.</p>
          )}
    </>
  );
};

export default PfDemoPortfolioAnalytics;
