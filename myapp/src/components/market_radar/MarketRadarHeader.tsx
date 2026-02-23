import { Sparkle, Sparkles, Wifi, WifiIcon } from "lucide-react";
import React from "react";

const MarketRadarHeader: React.FC = () => (
  <div
    className="rounded-2xl border border-slate-200 px-6 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
    style={{
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(244,247,255,0.98) 100%)",
    }}
  >
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-black">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
        >
    <Wifi size={23} className="mr-2 inline-block text-violet-500" />
        </div>
        <div>
          {/* <p className="text-sm uppercase tracking-[0.2em] text-black">Market Signal Radar</p> */}
          <h2 className="text-xl font-semibold text-black">Market Signal Radar</h2>
        </div>
      </div>
      <div
        className="rounded-full px-4 py-1 text-sm font-semibold text-violet-600"
        style={{
          backgroundColor: "rgba(124, 58, 237, 0.1)",
          border: "1px solid rgba(124, 58, 237, 0.35)",
        }}
      >
        AI-Powered
      </div>
    </div>
  </div>
);

export default MarketRadarHeader;
