import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import PfDemoPortfolioAnalytics, {
  portfolioAnalyticsTabDefinitions,
  PortfolioAnalyticsTabId,
} from "./pf_demo_portfolio_analytics";
import PfDemoProperties, { PropertyRecord } from "./pf_demo_properties";
import PfDemoAiRentIntelligence from "./pf_demo_ai_rent_intelligence";
import PfPropertyInsights from "./pf_property_insights";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  TrendingUp,
  FileText,
  Landmark,
} from "lucide-react";
import MarketRadar from "../market_radar/MarketRadar";
import PfDemoIcMemo from "./pf_demo_ic_memo";
import { productRoutes } from "@/lib/product-routes";
import { isDemoMode } from "@/lib/demo-mode";
import { isUserLoggedIn } from "@/lib/auth";
import DealUnderwritingLens from "../dealunderwriting/DealUnderwritingLens";

const tabs = [
  "Portfolio Analytics",
  "Properties",
  "AI Rent Intelligence",
  "Market Signal Radar",
  "IC Memo",
  "Deal Underwriting Lens",
] as const;
type DemoTab = (typeof tabs)[number];

const routeToTab: Record<string, DemoTab> = {
  "/portfolio_intelligence": "Portfolio Analytics",
  [productRoutes.portfolioIntelligence]: "Portfolio Analytics",
  [productRoutes.propertyIntelligence]: "Properties",
  "/ai_rent_intelligence": "AI Rent Intelligence",
  "/market_radar": "Market Signal Radar",
  "/ic_memo": "IC Memo",
  "/deal_lens": "Deal Underwriting Lens",
};

const PfDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DemoTab>("Portfolio Analytics");
  const [selectedProperty, setSelectedProperty] = useState<
    Pick<PropertyRecord, "property_name" | "submarket" | "region"> | null
  >(null);
  const [portfolioSubTab, setPortfolioSubTab] = useState<PortfolioAnalyticsTabId>("snapshot");
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(true);
  const [isIcMemoStarted, setIsIcMemoStarted] = useState(false);
  const [dealLensScreen, setDealLensScreen] = useState<"library" | "upload" | "detail">("library");
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isDealLensTab = activeTab === "Deal Underwriting Lens";
  const hidePortfolioSidebar = isDealLensTab && dealLensScreen === "detail";
  const isAuthenticatedUserView = isUserLoggedIn() && !isDemoMode();

  const handleSidebarBack = () => {
    if (isAuthenticatedUserView) {
      if (activeTab === "Portfolio Analytics") {
        navigate(productRoutes.propertyIntelligence);
        return;
      }

      if (activeTab === "Properties") {
        navigate("/");
        return;
      }
    }

    navigate("/", { state: { scrollTo: "demos" } });
  };

  useEffect(() => {
    const requestedTab = location.state?.activeTab as DemoTab | undefined;
    if (requestedTab && tabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
      return;
    }

    const tabFromRoute = routeToTab[location.pathname];
    if (tabFromRoute) {
      setActiveTab(tabFromRoute);
    }
  }, [location.pathname, location.state]);

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeTab, portfolioSubTab]);

  const activeContent = useMemo(() => {
    if (activeTab === "Portfolio Analytics") {
      return (
        <PfDemoPortfolioAnalytics
          activeSubTab={portfolioSubTab}
          onSubTabChange={setPortfolioSubTab}
          showTabMenu={false}
        />
      );
    }
    if (activeTab === "Properties") {
      if (selectedProperty) {
        return (
          <PfPropertyInsights
            propertyContext={selectedProperty}
            onBack={() => setSelectedProperty(null)}
          />
        );
      }
      return <PfDemoProperties onSelectProperty={setSelectedProperty} />;
    }
    if (activeTab === "AI Rent Intelligence") return <PfDemoAiRentIntelligence />;
    if (activeTab === "Market Signal Radar") {
      return (
        <MarketRadar
          showHeaderCard={false}
          openDetailsInPlace={true}
          showPanelCard={false}
        />
      );
    }
    if (activeTab === "IC Memo") {
      return (
        <PfDemoIcMemo
          hasStarted={isIcMemoStarted}
          onGenerate={() => setIsIcMemoStarted(true)}
          onBack={() => setIsIcMemoStarted(false)}
          data={null}
        />
      );
    }
    return <DealUnderwritingLens onScreenChange={setDealLensScreen} />;
  }, [activeTab, isIcMemoStarted, portfolioSubTab, selectedProperty]);

  useEffect(() => {
    if (!isDealLensTab) {
      setDealLensScreen("library");
    }
  }, [isDealLensTab]);

  return (
    <section
      className="h-screen overflow-hidden text-black"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% 0%, rgba(232,239,250,0.85) 0%, rgba(241,246,252,0.95) 40%, rgba(248,251,255,1) 100%)",
      }}
    >
      <div className={`grid h-screen ${hidePortfolioSidebar ? "grid-cols-[minmax(0,1fr)]" : "grid-cols-[220px_minmax(0,1fr)] md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]"}`}>
        {!hidePortfolioSidebar ? (
          <aside
            className="sticky top-0 z-30 h-screen w-[220px] overflow-y-auto bg-[#0d1b4f] px-4 py-5 text-white md:w-[240px] lg:w-[260px] xl:w-[280px]"
          >
            {isAuthenticatedUserView ? (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-2 whitespace-nowrap text-[22px] leading-none text-white"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
            </div>
          ) : null}
            {!isAuthenticatedUserView ? (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleSidebarBack}
                  className="back-button-hex back-button-theme-sidebar flex items-center gap-2 whitespace-nowrap"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
              </div>
            ) : null}
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h1 className="text-2xl font-semibold">Portfolio Intelligence</h1>
            </div>
            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveTab("Deal Underwriting Lens")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition ${activeTab === "Deal Underwriting Lens"
                    ? "bg-[#0fa77d] text-white shadow-[0_6px_18px_rgba(15,167,125,0.35)]"
                    : "bg-white/5 text-blue-100 hover:bg-white/10"
                  }`}
              >
                <FileText className="h-4 w-4" />
                <span className="flex-1">Deal Lens</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("Properties");
                  setSelectedProperty(null);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition ${activeTab === "Properties"
                    ? "bg-[#0fa77d] text-white shadow-[0_6px_18px_rgba(15,167,125,0.35)]"
                    : "bg-white/5 text-blue-100 hover:bg-white/10"
                  }`}
              >
                <Building2 className="h-4 w-4" />
                <span className="flex-1">Property Intelligence</span>
              </button>

              

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("Portfolio Analytics");
                    setIsPortfolioMenuOpen((prev) => !prev);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition ${activeTab === "Portfolio Analytics"
                      ? "bg-[#0fa77d] text-white shadow-[0_6px_18px_rgba(15,167,125,0.35)]"
                      : "bg-white/5 text-blue-100 hover:bg-white/10"
                    }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="flex-1">Portfolio Analytics</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isPortfolioMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isPortfolioMenuOpen && (
                  <div className="mt-2 space-y-2 rounded-2xl bg-white p-3 shadow-lg">
                    {portfolioAnalyticsTabDefinitions.map((subTab) => {
                      const isSubActive =
                        activeTab === "Portfolio Analytics" && portfolioSubTab === subTab.id;
                      return (
                        <button
                          key={subTab.id}
                          type="button"
                          onClick={() => {
                            setActiveTab("Portfolio Analytics");
                            setPortfolioSubTab(subTab.id);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] font-semibold transition ${isSubActive
                              ? "bg-[#dff3eb] text-[#066b52]"
                              : "text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full ${isSubActive ? "bg-[#0b8f6b]" : "bg-slate-300"
                              }`}
                          />
                          {subTab.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* <button
                type="button"
                onClick={() => setActiveTab("Market Signal Radar")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition ${activeTab === "Market Signal Radar"
                    ? "bg-[#0fa77d] text-white shadow-[0_6px_18px_rgba(15,167,125,0.35)]"
                    : "bg-white/5 text-blue-100 hover:bg-white/10"
                  }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="flex-1">Market Signal Radar</span>
              </button> */}
              
              <button
                type="button"
                onClick={() => setActiveTab("IC Memo")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition ${activeTab === "IC Memo"
                    ? "bg-[#0fa77d] text-white shadow-[0_6px_18px_rgba(15,167,125,0.35)]"
                    : "bg-white/5 text-blue-100 hover:bg-white/10"
                  }`}
              >
                <Landmark className="h-4 w-4" />
                <span className="flex-1">IC Memo</span>
              </button>
              
            </nav>
          </aside>
        ) : null}

        <main
          ref={mainScrollRef}
          className={`h-screen min-w-0 overflow-y-auto ${hidePortfolioSidebar ? "px-0 py-0" : "px-4 py-6 md:px-6 md:pt-7"} ${isDealLensTab ? "bg-[#f3f6fb]" : "bg-[#f3f6fb]"
            }`}
        >
          <div className={hidePortfolioSidebar ? "w-full" : isDealLensTab ? "mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8 xl:px-12" : "mx-auto w-full max-w-[1420px]"}>
            {activeContent}
          </div>
        </main>
      </div>
    </section>
  );
};

export default PfDemo;

