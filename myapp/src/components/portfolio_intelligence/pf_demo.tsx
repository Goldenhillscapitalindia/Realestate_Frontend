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
  FileText,
  History,
  Landmark,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import MarketRadar from "../market_radar/MarketRadar";
import PfDemoIcMemo from "./pf_demo_ic_memo";
import { productRoutes } from "@/lib/product-routes";
import { isDemoMode } from "@/lib/demo-mode";
import { isUserLoggedIn } from "@/lib/auth";
import DealUnderwritingLens from "../dealunderwriting/DealUnderwritingLens";
import AssistantWidget from "../aiassistantwidget";
import Seo from "@/components/Seo";
import "./pf_demo.css";

const tabs = [
  "Portfolio Analytics",
  "Properties",
  "AI Rent Intelligence",
  "Market Signal Radar",
  "IC Memo",
  "Deal Underwriting Lens",
] as const;
type DemoTab = (typeof tabs)[number];
type AssistantModule = "property_analytics" | "portfolio_intelligence" | "deal_lens" | "ic_memo";

const aiRailButtons = [
  { label: "AI Assistant", icon: Sparkles },
  { label: "Chat", icon: MessageSquare },
  { label: "History", icon: History },
  { label: "Controls", icon: SlidersHorizontal },
] as const;

const routeToTab: Record<string, DemoTab> = {
  "/portfolio_intelligence": "Portfolio Analytics",
  [productRoutes.portfolioIntelligence]: "Portfolio Analytics",
  [productRoutes.propertyIntelligence]: "Properties",
  [productRoutes.aiRentIntelligence]: "AI Rent Intelligence",
  [productRoutes.marketRadar]: "Market Signal Radar",
  "/ic_memo": "IC Memo",
  [productRoutes.dealLens]: "Deal Underwriting Lens",
};

const getTabFromPath = (pathname: string): DemoTab =>
  routeToTab[pathname] ?? "Portfolio Analytics";

const seoByPath: Record<
  string,
  {
    title: string;
    description: string;
    canonicalPath: string;
  }
> = {
  [productRoutes.portfolioIntelligence]: {
    title: "Portfolio Intelligence | Asset72",
    description:
      "Aggregate asset-level data into portfolio-wide risk and allocation visibility. Track NOI, occupancy, and performance across your entire real estate portfolio.",
    canonicalPath: productRoutes.portfolioIntelligence,
  },
  [productRoutes.propertyIntelligence]: {
    title: "Property Intelligence | Asset72",
    description:
      "Monitor leasing performance, revenue quality, expense drift, and occupancy trends at the asset level with always-on property intelligence.",
    canonicalPath: productRoutes.propertyIntelligence,
  },
  [productRoutes.aiRentIntelligence]: {
    title: "AI Rent Intelligence | Asset72",
    description:
      "AI rent analysis that surfaces below-market pricing and revenue exposure across unit types from your rent roll. Identify rent growth opportunities.",
    canonicalPath: productRoutes.aiRentIntelligence,
  },
  [productRoutes.marketRadar]: {
    title: "Market Radar | Asset72",
    description:
      "Real-time competitive market intelligence around your assets - supply pipeline, rent trends, and market positioning signals for smarter decisions.",
    canonicalPath: productRoutes.marketRadar,
  },
  [productRoutes.dealLens]: {
    title: "Deal Lens - Pre-Underwriting Intelligence | Asset72",
    description:
      "Screen real estate deals before full diligence. Asset72 Deal Lens analyzes lease rollover, in-place vs market rents, and occupancy risk from T12s and rent rolls.",
    canonicalPath: productRoutes.dealLens,
  },
};

const PfDemo: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DemoTab>(() => getTabFromPath(location.pathname));
  const [selectedProperty, setSelectedProperty] = useState<
    Pick<PropertyRecord, "property_name" | "submarket" | "region"> | null
  >(null);
  const [portfolioSubTab, setPortfolioSubTab] = useState<PortfolioAnalyticsTabId>("snapshot");
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(true);
  const [isIcMemoStarted, setIsIcMemoStarted] = useState(false);
  const [dealLensScreen, setDealLensScreen] = useState<"library" | "upload" | "detail">("library");
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const isDealLensTab = activeTab === "Deal Underwriting Lens";
  const hidePortfolioSidebar = isDealLensTab && dealLensScreen === "detail";
  const isAuthenticatedUserView = isUserLoggedIn() && !isDemoMode();
  const seoConfig = seoByPath[location.pathname];

  const assistantContext = useMemo<{
    module: AssistantModule;
    propertyName?: string;
    title: string;
    contextLabel: string;
  } | null>(() => {
    if (activeTab === "Portfolio Analytics") {
      const subTabLabel =
        portfolioAnalyticsTabDefinitions.find((tab) => tab.id === portfolioSubTab)?.label ??
        "Portfolio Analytics";
      return {
        module: "portfolio_intelligence",
        title: "Portfolio AI Analyst",
        contextLabel: subTabLabel,
      };
    }

    if (activeTab === "Properties") {
      return {
        module: "property_analytics",
        propertyName: selectedProperty?.property_name,
        title: "Property AI Analyst",
        contextLabel: selectedProperty
          ? `${selectedProperty.property_name}${selectedProperty.submarket ? ` · ${selectedProperty.submarket}` : ""}`
          : "Property Intelligence",
      };
    }

    if (activeTab === "IC Memo") {
      return {
        module: "ic_memo",
        title: "IC Intelligence AI Analyst",
        contextLabel: "Investment Committee Intelligence",
      };
    }

    if (activeTab === "Deal Underwriting Lens") {
      return {
        module: "deal_lens",
        title: "Deal Lens AI Analyst",
        contextLabel: "Deal Underwriting Lens",
      };
    }

    if (activeTab === "AI Rent Intelligence") {
      return {
        module: "property_analytics",
        title: "Rent Intelligence AI Analyst",
        contextLabel: "AI Rent Intelligence",
      };
    }

    return null;
  }, [activeTab, portfolioSubTab, selectedProperty]);

  const showAiSidebar = Boolean(assistantContext);
  const isAiSidebarVisible = showAiSidebar && isAiSidebarOpen;

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

    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname, location.state]);

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeTab, portfolioSubTab]);

  useEffect(() => {
    setIsAiSidebarOpen(false);
  }, [activeTab, portfolioSubTab, selectedProperty?.property_name]);

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
      className={`pf-demo-shell h-screen overflow-hidden text-black ${
        isAiSidebarVisible ? "xl:pr-[492px]" : showAiSidebar ? "xl:pr-[72px]" : ""
      }`}
      style={{
        background:
          "radial-gradient(1200px 600px at 10% 0%, rgba(232,239,250,0.85) 0%, rgba(241,246,252,0.95) 40%, rgba(248,251,255,1) 100%)",
      }}
    >
      {seoConfig ? (
        <Seo
          title={seoConfig.title}
          description={seoConfig.description}
          canonicalPath={seoConfig.canonicalPath}
        />
      ) : null}
      <div className={`pf-demo-layout grid h-screen ${hidePortfolioSidebar ? "grid-cols-[minmax(0,1fr)]" : "grid-cols-[220px_minmax(0,1fr)] md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]"}`}>
        {!hidePortfolioSidebar ? (
          <aside
            className="pf-demo-sidebar sticky top-0 z-30 h-screen w-[220px] overflow-y-auto bg-[#0d1b4f] px-4 py-5 text-white md:w-[240px] lg:w-[260px] xl:w-[280px]"
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
                <span className="flex-1">IC Intelligence</span>
              </button>
              
            </nav>
          </aside>
        ) : null}

        <main
          ref={mainScrollRef}
          className={`pf-demo-main h-screen min-w-0 overflow-y-auto ${hidePortfolioSidebar ? "px-0 py-0" : "px-4 py-6 md:px-6 md:pt-7"} ${isDealLensTab ? "bg-[#f3f6fb]" : "bg-[#f3f6fb]"
            }`}
        >
          <div className={`pf-demo-content ${hidePortfolioSidebar ? "w-full" : isDealLensTab ? "mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8 xl:px-12" : "mx-auto w-full max-w-[1420px]"}`}>
            {activeContent}
          </div>
        </main>
      </div>

      {showAiSidebar && assistantContext ? (
        <aside
          className={`fixed right-0 top-0 z-40 hidden h-screen border-l border-[#DCE6F2] bg-white shadow-[0_24px_80px_rgba(8,27,92,0.18)] xl:flex ${
            isAiSidebarVisible ? "w-[492px]" : "w-[72px]"
          }`}
        >
          {isAiSidebarVisible ? (
            <div className="h-full w-[420px] min-w-0 border-r border-[#DCE6F2]">
              <AssistantWidget
                mode="sidebar"
                module={assistantContext.module}
                dataScope={isAuthenticatedUserView ? "user" : "demo"}
                propertyName={assistantContext.propertyName}
                title={assistantContext.title}
                contextLabel={assistantContext.contextLabel}
              />
            </div>
          ) : null}

          <div className="flex h-full w-[72px] shrink-0 flex-col items-center bg-[#F8FAFC]">
            <button
              type="button"
              onClick={() => setIsAiSidebarOpen((prev) => !prev)}
              className="mt-6 flex h-10 w-10 items-center justify-center rounded-xl border border-[#DCE6F2] bg-white text-[#64748B] shadow-[0_2px_6px_rgba(8,27,92,0.06)] transition-all duration-200 hover:-translate-y-[1px] hover:border-[#102A7A] hover:text-[#081B5C] hover:shadow-[0_6px_16px_rgba(8,27,92,0.12)]"
              aria-label={isAiSidebarVisible ? "Close AI sidebar" : "Open AI sidebar"}
              title={isAiSidebarVisible ? "Close AI sidebar" : "Open AI sidebar"}
            >
              {isAiSidebarVisible ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5" />
              )}
            </button>

            <div className="mt-8 flex flex-col items-center gap-3">
              {aiRailButtons.map(({ label, icon: Icon }) => {
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setIsAiSidebarOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DCE6F2] bg-white text-[#64748B] shadow-[0_2px_6px_rgba(8,27,92,0.06)] transition-all duration-200 hover:-translate-y-[1px] hover:border-[#102A7A] hover:text-[#081B5C] hover:shadow-[0_6px_16px_rgba(8,27,92,0.12)]"
                    aria-label={`Open AI ${label}`}
                    title={label}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>

            <div className="mb-8 mt-auto">
              <span className="block rotate-180 [writing-mode:vertical-rl] text-[10px] font-bold uppercase tracking-[0.24em] text-[#081B5C]">
                Asset72 AI
              </span>
            </div>
          </div>
        </aside>
      ) : null}
    </section>
  );
};

export default PfDemo;

