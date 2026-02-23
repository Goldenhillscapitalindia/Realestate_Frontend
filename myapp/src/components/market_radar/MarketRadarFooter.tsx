import React from "react";

type MarketRadarFooterProps = {
  count: number;
  lastUpdated: Date | null;
};

const MarketRadarFooter: React.FC<MarketRadarFooterProps> = ({ count, lastUpdated }) => (
  <div
    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 px-6 py-3 text-xs text-black shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
    style={{
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,255,0.98) 100%)",
    }}
  >
    <div className="flex items-center gap-6">
      <span className="text-black">{count} markets tracked</span>
      <span>
        Last updated:{" "}
        <span className="text-black">
          {lastUpdated ? lastUpdated.toLocaleTimeString() : "Loading..."}
        </span>
      </span>
    </div>
    <span className="text-black">Click a market to view detailed analysis</span>
  </div>
);

export default MarketRadarFooter;
