import React from "react";

type UnitTypeAnalyticsItem = {
  unit_type: string;
  unit_count: number | string;
  avg_in_place_rent: number | string;
  occupancy_pct: number | string;
  rent_vs_market_pct: number | string;
  avg_market_rent?: number | string;
  avg_unit_size_sqft?: number | string;
};

type Props = {
  data: UnitTypeAnalyticsItem[];
};

const formatCurrency = (value: number | string) => {
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatPercent = (value: number | string) => {
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return `${num}%`;
};

const formatSignedPercent = (value: number | string) => {
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num}%`;
};

const UnitTypeAnalytics: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-black">
        No unit type analytics available.
      </div>
    );
  }

  return (
    <>
     {/* <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"> */}
     <h3 className="text-[25px] font-semibold text-blue-900">Unit Type Analytics</h3>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => {
          const rentDelta =
            typeof item.rent_vs_market_pct === "string"
              ? Number(item.rent_vs_market_pct)
              : item.rent_vs_market_pct;
          const deltaColor =
            !Number.isNaN(rentDelta) && rentDelta < 0 ? "text-rose-500" : "text-emerald-600";

          return (
            <div
              key={item.unit_type}
              className="rounded-2xl border border-slate-200 bg-blue-50 p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-black">{item.unit_type}</p>
                <span className="text-sm font-medium text-black">{item.unit_count} units</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[0.8rem] font-semibold uppercase  text-indigo-600">
                    Avg In-Place Rent
                  </p>
                  <p className="mt-1 text-xl font-semibold text-black">
                    {formatCurrency(item.avg_in_place_rent)}
                  </p>
                </div>
                <div>
                  <p className="text-[0.8rem] font-semibold uppercase  text-indigo-600">
                    Occupancy
                  </p>
                  <p className="mt-1 text-xl font-semibold text-black">
                    {formatPercent(item.occupancy_pct)}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-blue-80 px-4 py-3">
                  <p className="text-[0.8rem] font-semibold uppercase  text-indigo-600 text-center">
                  Rent vs Market
                </p>
                <p className={`mt-1 text-center text-base font-semibold ${deltaColor}`}>
                  {formatSignedPercent(item.rent_vs_market_pct)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
     {/* </div> */}
    </>
  );
};

export default UnitTypeAnalytics;
