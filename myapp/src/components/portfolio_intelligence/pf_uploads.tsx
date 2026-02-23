import React, { useMemo, useState } from "react";
import axios from "axios";

const tabs = ["Portfolio Analytics", "Properties", "AI Rent Intelligence"] as const;
type UploadTab = (typeof tabs)[number];

const PfUploads: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UploadTab>("Portfolio Analytics");
  const API_URL = import.meta.env.VITE_API_URL;

  const [propertyForm, setPropertyForm] = useState({
    property_name: "",
    submarket: "",
    region: "",
    address: "",
    location: "",
    class_type: "",
    units: "",
    occupancy: "",
    rent_per_sqft: "",
    property_response: "",
  });
  const [propertyStatus, setPropertyStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [propertyError, setPropertyError] = useState<string | null>(null);

  const [portfolioAnalyticsForm, setPortfolioAnalyticsForm] = useState({
    property_name: "",
    submarket: "",
    region: "",
    address: "",
    location: "",
    portfolio_analytics_response: "",
    performance_drivers_response: "",
    revenue_leases_response: "",
    expense_intel_response: "",
    risk_stability_response: "",
  });
  const [portfolioStatus, setPortfolioStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  const handlePropertyChange =
    (field: keyof typeof propertyForm) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPropertyForm((prev) => ({ ...prev, [field]: e.target.value }));
      };
  const handleaiRentIntelligenceChange =
    (field: keyof typeof propertyForm) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPropertyForm((prev) => ({ ...prev, [field]: e.target.value }));
      };
  const handlePortfolioAnalyticsChange =
    (field: keyof typeof portfolioAnalyticsForm) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPortfolioAnalyticsForm((prev) => ({ ...prev, [field]: e.target.value }));
      };

  const parseResponseField = (raw: string, label: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed);
    } catch {
      throw new Error(`${label} must be valid JSON.`);
    }
  };

  const handlePropertySave = async () => {
    setPropertyStatus("saving");
    setPropertyError(null);

    let parsedResponse: unknown = null;
    const rawResponse = propertyForm.property_response.trim();
    if (rawResponse) {
      try {
        parsedResponse = JSON.parse(rawResponse);
      } catch {
        setPropertyStatus("error");
        setPropertyError("Property Response must be valid JSON.");
        return;
      }
    }

    try {
      await axios.post(`${API_URL}/api/property_upload/`, {
        property_name: propertyForm.property_name,
        submarket: propertyForm.submarket,
        region: propertyForm.region,
        address: propertyForm.address,
        location: propertyForm.location,
        class_type: propertyForm.class_type,
        units: propertyForm.units ? Number(propertyForm.units) : null,
        occupancy: propertyForm.occupancy,
        rent_per_sqft: propertyForm.rent_per_sqft,
        property_response: parsedResponse,
      });
      setPropertyStatus("success");
    } catch (error) {
      console.error(error);
      setPropertyStatus("error");
      setPropertyError("Failed to save property.");
    }
  };

  const handlePortfolioAnalyticsSave = async () => {
    setPortfolioStatus("saving");
    setPortfolioError(null);

    let parsedPortfolioResponse: unknown = null;
    let parsedPerformanceDriversResponse: unknown = null;
    let parsedRevenueLeasesResponse: unknown = null;
    let parsedExpenseIntelResponse: unknown = null;
    let parsedRiskStabilityResponse: unknown = null;

    try {
      parsedPortfolioResponse = parseResponseField(
        portfolioAnalyticsForm.portfolio_analytics_response,
        "Portfolio Analytics Response"
      );
      parsedPerformanceDriversResponse = parseResponseField(
        portfolioAnalyticsForm.performance_drivers_response,
        "Performance Drivers Response"
      );
      parsedRevenueLeasesResponse = parseResponseField(
        portfolioAnalyticsForm.revenue_leases_response,
        "Revenue & Leases Response"
      );
      parsedExpenseIntelResponse = parseResponseField(
        portfolioAnalyticsForm.expense_intel_response,
        "Expense Intel Response"
      );
      parsedRiskStabilityResponse = parseResponseField(
        portfolioAnalyticsForm.risk_stability_response,
        "Risk & Stability Response"
      );
    } catch (error) {
      setPortfolioStatus("error");
      setPortfolioError(error instanceof Error ? error.message : "Failed to parse JSON responses.");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/portfolio_analytics_upload/`, {
        property_name: portfolioAnalyticsForm.property_name,
        submarket: portfolioAnalyticsForm.submarket,
        region: portfolioAnalyticsForm.region,
        address: portfolioAnalyticsForm.address,
        location: portfolioAnalyticsForm.location,
        portfolio_analytics_response: parsedPortfolioResponse,
        performance_drivers_response: parsedPerformanceDriversResponse,
        revenue_leases_response: parsedRevenueLeasesResponse,
        expense_intel_response: parsedExpenseIntelResponse,
        risk_stability_response: parsedRiskStabilityResponse,
      });
      setPortfolioStatus("success");
    } catch (error) {
      console.error(error);
      setPortfolioStatus("error");
      setPortfolioError("Failed to save portfolio analytics.");
    }
  };
  const handleaiRentIntelligenceSave = async () => {
    setPropertyStatus("saving");
    setPropertyError(null);
    let parsedResponse: unknown = null;
    const rawResponse = propertyForm.property_response.trim();
    if (rawResponse) {
      try {
        parsedResponse = JSON.parse(rawResponse);
      } catch {
        setPropertyStatus("error");
        setPropertyError("AI Rent Intelligence Response must be valid JSON.");
        return;
      }
    }

    try { await axios.post(`${API_URL}/api/ai_rent_intelligence_upload/`, {
        property_name: propertyForm.property_name,
        address: propertyForm.address,
        location: propertyForm.location,
        class_type: propertyForm.class_type,
        ai_rent_intelligence_response: parsedResponse,
      });
      setPropertyStatus("success");
    } catch (error) {
      console.error(error);
      setPropertyStatus("error");
      setPropertyError("Failed to save AI rent intelligence.");
    }
  };
  const tabLabel = useMemo(() => activeTab.toUpperCase(), [activeTab]);

  return (
    <section
      className="min-h-screen px-6 py-10 text-black"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% 0%, rgba(214,237,255,0.7) 0%, rgba(248,250,255,0.9) 40%, rgba(255,255,255,1) 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-black">{tabLabel}</p>
            <h1 className="mt-2 text-3xl font-semibold text-black">Portfolio Uploads</h1>
            <p className="mt-2 text-sm text-black">
              Manage data ingestion for analytics, property records, and AI rent intelligence.
            </p>
          </div>
          <div className="flex gap-2 rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm">
            {tabs.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-black hover:text-black"
                    }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)]"
          style={{
            backdropFilter: "blur(12px)",
          }}
        >
          {activeTab === "Portfolio Analytics" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-black">Portfolio Analytics</h2>
                <p className="mt-2 text-sm text-black">
                  Provide property metadata to enrich portfolio intelligence and downstream analysis.
                </p>
              </div>
              <form className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Property Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Enter property name"
                    value={portfolioAnalyticsForm.property_name}
                    onChange={handlePortfolioAnalyticsChange("property_name")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Submarket
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Enter submarket"
                    value={portfolioAnalyticsForm.submarket}
                    onChange={handlePortfolioAnalyticsChange("submarket")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Region
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Enter region"
                    value={portfolioAnalyticsForm.region}
                    onChange={handlePortfolioAnalyticsChange("region")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Street address"
                    value={portfolioAnalyticsForm.address}
                    onChange={handlePortfolioAnalyticsChange("address")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="City, State"
                    value={portfolioAnalyticsForm.location}
                    onChange={handlePortfolioAnalyticsChange("location")}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Portfolio Analytics Response                  </label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Notes or responses about the property"
                    value={portfolioAnalyticsForm.portfolio_analytics_response}
                    onChange={handlePortfolioAnalyticsChange("portfolio_analytics_response")}
                  />
                </div>
                                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Performance Drivers Response                  </label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Notes or responses about the property"
                    value={portfolioAnalyticsForm.performance_drivers_response}
                    onChange={handlePortfolioAnalyticsChange("performance_drivers_response")}
                  />
                </div>
                                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Revenue & leases Response                  </label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Notes or responses about the property"
                    value={portfolioAnalyticsForm.revenue_leases_response}
                    onChange={handlePortfolioAnalyticsChange("revenue_leases_response")}
                  />
                </div>
                                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Expense Intel Response                  </label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Notes or responses about the property"
                    value={portfolioAnalyticsForm.expense_intel_response}
                    onChange={handlePortfolioAnalyticsChange("expense_intel_response")}
                  />
                </div>
                                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Risk & Stability Response                  </label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Notes or responses about the property"
                    value={portfolioAnalyticsForm.risk_stability_response}
                    onChange={handlePortfolioAnalyticsChange("risk_stability_response")}
                  />
                </div>
                {portfolioStatus === "error" ? (
                  <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {portfolioError ?? "Failed to save portfolio analytics."}
                  </div>
                ) : null}
                {portfolioStatus === "success" ? (
                  <div className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Portfolio Analytics Response saved successfully.
                  </div>
                ) : null}
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handlePortfolioAnalyticsSave}
                    disabled={portfolioStatus === "saving"}
                    className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/40 hover:bg-slate-800 disabled:opacity-60"
                  >
                    {portfolioStatus === "saving" ? "Saving..." : "Save Portfolio Analytics"}
                  </button>
                </div>
              </form>
            </div>
          ) : null}
          {activeTab === "Properties" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-black">Property Upload</h2>
                <p className="mt-2 text-sm text-black">
                  Provide property metadata to enrich portfolio intelligence and downstream analysis.
                </p>
              </div>
              <form className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Property Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Enter property name"
                    value={propertyForm.property_name}
                    onChange={handlePropertyChange("property_name")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Submarket
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Enter submarket"
                    value={propertyForm.submarket}
                    onChange={handlePropertyChange("submarket")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Region
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Enter region"
                    value={propertyForm.region}
                    onChange={handlePropertyChange("region")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Street address"
                    value={propertyForm.address}
                    onChange={handlePropertyChange("address")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="City, State"
                    value={propertyForm.location}
                    onChange={handlePropertyChange("location")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Class
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Class A / B / C"
                    value={propertyForm.class_type}
                    onChange={handlePropertyChange("class_type")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Units
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Total units"
                    value={propertyForm.units}
                    onChange={handlePropertyChange("units")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Occupancy
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="e.g. 94%"
                    value={propertyForm.occupancy}
                    onChange={handlePropertyChange("occupancy")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Rent / Sqft
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="e.g. $2.15"
                    value={propertyForm.rent_per_sqft}
                    onChange={handlePropertyChange("rent_per_sqft")}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Property Response
                  </label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Notes or responses about the property"
                    value={propertyForm.property_response}
                    onChange={handlePropertyChange("property_response")}
                  />
                </div>
                {propertyStatus === "error" ? (
                  <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {propertyError ?? "Failed to save property."}
                  </div>
                ) : null}
                {propertyStatus === "success" ? (
                  <div className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Property saved successfully.
                  </div>
                ) : null}
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handlePropertySave}
                    disabled={propertyStatus === "saving"}
                    className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/40 hover:bg-slate-800 disabled:opacity-60"
                  >
                    {propertyStatus === "saving" ? "Saving..." : "Save Property"}
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {activeTab === "AI Rent Intelligence" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-black">AI Rent Intelligence</h2>
                <p className="mt-2 text-sm text-black">
                  Input property details and AI-generated rent intelligence responses for analysis and insights.
                </p>
              </div>
              <form className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Property Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Enter property name"
                    value={propertyForm.property_name}
                    onChange={handleaiRentIntelligenceChange("property_name")}
                  />
                </div>
                {/* <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Submarket
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Enter submarket"
                    value={propertyForm.submarket}
                    onChange={handlePropertyChange("submarket")}
                  />
                </div> */}
                {/* <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Region
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Enter region"
                    value={propertyForm.region}
                    onChange={handlePropertyChange("region")}
                  />
                </div> */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Street address"
                    value={propertyForm.address}
                    onChange={handleaiRentIntelligenceChange("address")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="City, State"
                    value={propertyForm.location}
                    onChange={handleaiRentIntelligenceChange("location")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Class
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Class A / B / C"
                    value={propertyForm.class_type}
                    onChange={handleaiRentIntelligenceChange("class_type")}
                  />
                </div>
                {/* <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Units
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Total units"
                    value={propertyForm.units}
                    onChange={handlePropertyChange("units")}
                  />
                </div> */}
                {/* <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Occupancy
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="e.g. 94%"
                    value={propertyForm.occupancy}
                    onChange={handlePropertyChange("occupancy")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Rent / Sqft
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="e.g. $2.15"
                    value={propertyForm.rent_per_sqft}
                    onChange={handlePropertyChange("rent_per_sqft")}
                  />
                </div> */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black">
                    Ai Rent Intelligence Response
                  </label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black shadow-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Notes or responses about the property"
                    value={propertyForm.property_response}
                    onChange={handleaiRentIntelligenceChange("property_response")}
                  />
                </div>
                {propertyStatus === "error" ? (
                  <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {propertyError ?? "Failed to save property."}
                  </div>
                ) : null}
                {propertyStatus === "success" ? (
                  <div className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Property saved successfully.
                  </div>
                ) : null}
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleaiRentIntelligenceSave}
                    disabled={propertyStatus === "saving"}
                    className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/40 hover:bg-slate-800 disabled:opacity-60"
                  >
                    {propertyStatus === "saving" ? "Saving..." : "Save Property"}
                  </button>
                </div>
              </form>
            </div>
          ) : null}

        </div>
      </div>
    </section>
  );
};

export default PfUploads;
