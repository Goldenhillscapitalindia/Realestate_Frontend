import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PfDemoPortfolioAnalytics from "./pf_demo_portfolio_analytics";
import PfDemoProperties from "./pf_demo_properties";
import PfDemoAiRentIntelligence from "./pf_demo_ai_rent_intelligence";

const tabs = ["Portfolio Analytics", "Properties", "AI Rent Intelligence"] as const;
type DemoTab = (typeof tabs)[number];

const tabComponents: Record<DemoTab, React.FC> = {
  "Portfolio Analytics": PfDemoPortfolioAnalytics,
  Properties: PfDemoProperties,
  "AI Rent Intelligence": PfDemoAiRentIntelligence,
};

const PfDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DemoTab>("Portfolio Analytics");
  const ActiveTab = useMemo(() => tabComponents[activeTab], [activeTab]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const requestedTab = location.state?.activeTab as DemoTab | undefined;
    if (requestedTab && tabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [location.state]);

  return (
    <section
      className="min-h-screen px-6 py-10 text-black"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% 0%, rgba(214,237,255,0.7) 0%, rgba(248,250,255,0.92) 40%, rgba(255,255,255,1) 100%)",
      }}
    >          <button
            type="button"
            onClick={() => navigate("/", { state: { scrollTo: "demos" } })}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            ← Back
          </button>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
          {/* <button
            type="button"
            onClick={() => navigate("/", { state: { scrollTo: "demos" } })}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            ← Back
          </button> */}
            <div>
              <h1 className="text-3xl font-bold text-black text-[#003366]">Portfolio Intelligence</h1>
              {/* <p className="text-sm text-black">318 Properties - $30.2B AUM</p> */}
            </div>
          </div>

        </div>

        {/* <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"> */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-sky-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <ActiveTab />
          </div>
        {/* </div> */}
      </div>
    </section>
  );
};

export default PfDemo;
