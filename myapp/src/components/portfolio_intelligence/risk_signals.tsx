import React from "react";

type RiskSignal = {
  signal: string;
  description: string;
  metric?: string;
  severity: string;
};

type Props = {
  data: RiskSignal[];
};

const severityStyles: Record<string, { badge: string; card: string }> = {
  High: { badge: "bg-red-100 text-red-700", card: "border-red-200 bg-red-50" },
  Medium: { badge: "bg-amber-100 text-amber-700", card: "border-amber-200 bg-amber-50" },
  Low: { badge: "bg-emerald-100 text-emerald-700", card: "border-emerald-200 bg-emerald-50" },
};

const RiskSignals: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-black">
        No risk signals available.
      </div>
    );
  }

  return (
<>          <h3 className="text-[25px] font-semibold text-blue-900">Risk Signals</h3>

    <div className="grid gap-4 mt-2 md:grid-cols-2 xl:grid-cols-3">

      {data.map((item, idx) => {
        const severityKey = item.severity?.toLowerCase() || "medium";
        const style = severityStyles[severityKey] ?? severityStyles.medium;
        return (
          <div
            key={`${item.signal}-${idx}`}
            className={`rounded-2xl border p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] ${style.card}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-black">{item.signal}</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
                {item.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-black">{item.description}</p>
            {item.metric ? (
              <p className="mt-3 text-sm font-semibold text-black">{item.metric}</p>
            ) : null}
          </div>
        );
      })}
    </div>
    </>
  );
};

export default RiskSignals;
