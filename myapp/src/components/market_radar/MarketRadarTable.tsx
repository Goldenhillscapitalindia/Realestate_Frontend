import React, { useMemo, useState } from "react";
import { PULSE_COLORS } from "./constants";
import { normalizePulseKey } from "./utils";
import type { MarketRadarItem } from "./types";

type MarketRadarTableProps = {
  data: MarketRadarItem[];
  loading: boolean;
  error: string | null;
  onAddSubmarket: () => void;
  onSelectsub_market_name: (item: MarketRadarItem) => void;
};

const MarketRadarTable: React.FC<MarketRadarTableProps> = ({
  data,
  loading,
  error,
  onAddSubmarket,
  onSelectsub_market_name,
}) => {
  const [query, setQuery] = useState("");

  const filteredData = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data;
    return data.filter((item) => {
      const submarket = item.sub_market_name?.toLowerCase() ?? "";
      const region = item.region?.toLowerCase() ?? "";
      return submarket.includes(normalized) || region.includes(normalized);
    });
  }, [data, query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-m font-semibold text-black">SubMarket Pulse</p>
        <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search submarket or region"
            className="h-9 w-full rounded-full border border-slate-200 bg-white px-4 text-xs text-black placeholder:text-black focus:border-slate-300 focus:outline-none sm:w-64"
          />
          <button
            type="button"
            onClick={onAddSubmarket}
            className="h-9 rounded-full border border-violet-300 bg-violet-50 px-4 text-xs font-semibold text-violet-700 hover:border-violet-400"
          >
            Add Submarket +
          </button>
        </div>
      </div>
      <div className="max-h-[420px] overflow-hidden rounded-2xl border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-left text-sm text-black">
            <thead className="sticky top-0 bg-blue-50 text-m  text-indigo-500">
              <tr>
                <th className="px-4 py-3">Submarket Name</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Market Pulse</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => {
                const pulseKey = normalizePulseKey(item.marketPulse);
                const color = PULSE_COLORS[pulseKey]?.dot ?? "#21C7D9";
                return (
                  <tr
                    key={`${item.sub_market_name}-${idx}`}
                    className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                    onClick={() => onSelectsub_market_name(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectsub_market_name(item);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <td className="px-4 py-3 text-black">{item.sub_market_name}</td>
                    <td className="px-4 py-3 text-black">{item.region}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: "rgba(248, 250, 252, 0.9)",
                          border: `1px solid ${color}`,
                          color,
                        }}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                        {item.marketPulse}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!filteredData.length && !loading && (
                <tr>
                  <td className="px-4 py-6 text-center text-black" colSpan={3}>
                    No market radar data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
            <div className="flex gap-3 rounded-full border border-slate-200 bg-white/70 px-10 py-1 text-m text-black">
              {Object.keys(PULSE_COLORS).map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PULSE_COLORS[key].dot }} />
                  <span>{PULSE_COLORS[key].label}</span>
                </div>
              ))}
            </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default MarketRadarTable;
