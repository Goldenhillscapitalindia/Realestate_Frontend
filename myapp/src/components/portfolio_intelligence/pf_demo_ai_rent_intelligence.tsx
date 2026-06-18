import React, { useEffect, useMemo, useState } from "react";
import type { DemandElasticityPayload } from "../dealunderwriting/pf_deal_elasticity";
import { Bar, Line } from "react-chartjs-2";
import { ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth-api";
import { isDemoMode } from "@/lib/demo-mode";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

import "../ui/interactive-data-table.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Title);

const PfDealElasticity = React.lazy(() => import("../dealunderwriting/pf_deal_elasticity"));
const PfDealsRentStimulator = React.lazy(() => import("../dealunderwriting/pf_deals_rentstimulator"));

type AiChartEntry = {
  units: string;
  percentIncrease: any;
  annualRevenueLift: string | number | undefined;
  unitType?: string;
  inPlace?: number;
  recommended?: number;
  market?: number;
  month?: string;
  renewals?: number;
  newLeases?: number;
  projectedRevenue?: number;
};

type BasicInfo = {
  revenueAtRisk?: number;
  avgrenewalrate?: number;
  mtmcapturepotential?: number;
  projected12MonthRevenue?: number;
  totalprojectedrevenuelift?: number;
};

type AiRentResponse = {
  dashboard?: {
    charts?: {
      inPlaceVsRecommended?: AiChartEntry[];
      renewalVsNewLeaseSplit?: AiChartEntry[];
      revenueProjection12Months?: AiChartEntry[];
    };
    basic_info?: BasicInfo;
    unitSummary?: AiChartEntry[];
  };
  demandElasticity?: DemandElasticityPayload | null;
};

type PropertyRecord = {
  property_name?: string;
  address?: string;
  location?: string;
  class_type?: string;
  ai_rent_intelligence_response?: AiRentResponse;
};

const hasDisplayValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "string") return value.trim() !== "" && value.trim() !== "-";
  return true;
};

const formatCurrency = (value?: number | string) => {
  if (value === undefined || value === null) return "-";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatCompactCurrency = (value?: number | string) => {
  if (value === undefined || value === null) return "-";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  const formatted = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
    style: "currency",
    currency: "USD",
  }).format(num);
  return formatted.replace(/(\.\d+)([kK])$/, "$2");
};

const formatPercent = (value?: number | string) => {
  if (value === undefined || value === null) return "-";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  const scaled = num * 100;
  const decimals = scaled % 1 === 0 ? 0 : 1;
  return `${scaled.toFixed(decimals)}%`;
};

const formatSignedPercent = (value?: number | string) => {
  if (value === undefined || value === null) return "-";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  const sign = num > 0 ? "+" : "";
  const scaled = num * 100;
  const decimals = scaled % 1 === 0 ? 0 : 1;
  return `${sign}${scaled.toFixed(decimals)}%`;
};

const baseChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: { color: "#475569" },
      grid: { color: "rgba(15,23,42,0.06)" },
    },
    y: {
      ticks: { color: "#475569" },
      grid: { color: "rgba(15,23,42,0.12)" },
    },
  },
  plugins: {
    legend: {
      labels: { color: "#0f172a", font: { weight: "500" } },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `${context.dataset.label}: ${context.raw}`,
        // label: (context: any) => `${context.raw}`,

      },
    },
  },
};

type PfDemoAiRentIntelligenceProps = {
  propertyName?: string;
  embedded?: boolean;
};

const PfDemoAiRentIntelligence: React.FC<PfDemoAiRentIntelligenceProps> = ({
  propertyName,
  embedded = false,
}) => {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [selectedPropertyName, setSelectedPropertyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProperty = useMemo(() => {
    if (!properties || properties.length === 0) return undefined;
    if (selectedPropertyName) {
      return (
        properties.find(
          (record) => record.property_name?.toLowerCase() === selectedPropertyName.toLowerCase()
        ) || properties[0]
      );
    }
    return properties[0];
  }, [properties, selectedPropertyName]);
  const fetchRentData = async (payload: { fetch: "all" | "specific"; property_name?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = isDemoMode()
        ? await authClient.post("/api/get_ai_rent_intelligence_data/", payload)
        : await authClient.get("/api/get_ai_rent_intelligence_data_user_view/", {
            params: payload,
          });
      const responseData = response.data?.data;
      const fetched = Array.isArray(responseData) ? responseData : responseData ? [responseData] : [];

      setProperties(fetched);
      if (payload.property_name && fetched.length) {
        setSelectedPropertyName(fetched[0].property_name ?? "");
      } else if (!payload.property_name) {
        setSelectedPropertyName("");
      }
    } catch (err) {
      setError("Unable to load AI rent intelligence data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyName) {
      fetchRentData({ fetch: "specific", property_name: propertyName });
      return;
    }
    fetchRentData({ fetch: "all" });
  }, [propertyName]);

  const dashboard = selectedProperty?.ai_rent_intelligence_response?.dashboard;
  const inPlaceChart = dashboard?.charts?.inPlaceVsRecommended ?? [];
  const renewalSplit = dashboard?.charts?.renewalVsNewLeaseSplit ?? [];
  const revenueProjection = dashboard?.charts?.revenueProjection12Months ?? [];
  const basicInfo = dashboard?.basic_info;
  const unitSummary = dashboard?.unitSummary ?? [];
  const aiRentDemandElasticity =
    selectedProperty?.ai_rent_intelligence_response?.demandElasticity ?? null;

  const hasAiRentDemandElasticity =
    aiRentDemandElasticity?.status === "ready" &&
    !!aiRentDemandElasticity?.subject &&
    (aiRentDemandElasticity?.comparables?.length ?? 0) > 0;

  const totalProjectedLift = basicInfo?.totalprojectedrevenuelift;
  const summaryCards = [
    {
      title: "Total Projected Revenue Lift",
      value: formatCompactCurrency(totalProjectedLift),
      caption: "per year",
    },
    {
      title: "12-Mo Projected Revenue",
      value: formatCompactCurrency(basicInfo?.projected12MonthRevenue),
    },
    {
      title: "Revenue at Risk",
      value: formatCompactCurrency(basicInfo?.revenueAtRisk),
    },
    {
      title: "Avg Renewal Rate",
      value: formatPercent(basicInfo?.avgrenewalrate),
    },
    {
      title: "MTM Capture",
      value: formatCompactCurrency(basicInfo?.mtmcapturepotential),
    },
  ].filter((card) => hasDisplayValue(card.value));

  const hasInPlaceChart = inPlaceChart.some(
    (item) => hasDisplayValue(item.inPlace) || hasDisplayValue(item.recommended) || hasDisplayValue(item.market)
  );
  const hasRenewalSplitChart = renewalSplit.some(
    (item) => hasDisplayValue(item.renewals) || hasDisplayValue(item.newLeases)
  );
  const hasRevenueProjectionChart = revenueProjection.some(
    (item) => hasDisplayValue(item.projectedRevenue)
  );

  const inPlaceChartData = {
    labels: inPlaceChart.map((item) => item.unitType ?? ""),
    datasets: [
      {
        label: "In-Place",
        data: inPlaceChart.map((item) => item.inPlace ?? 0),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
      {
        label: "Recommended",
        data: inPlaceChart.map((item) => item.recommended ?? 0),
        backgroundColor: "#10b981",
        borderRadius: 6,
      },
    ],
  };

  const revenueLineData = {
    labels: revenueProjection.map((entry) => entry.month ?? ""),
    datasets: [
      {
        label: "Projected Revenue",
        data: revenueProjection.map((entry) => entry.projectedRevenue ?? 0),
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14,165,233,0.2)",
        tension: 0.35,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const renewalVsNewData = {
    labels: renewalSplit.map((entry) => entry.month ?? ""),
    datasets: [
      {
        label: "Renewals",
        data: renewalSplit.map((entry) => entry.renewals ?? 0),
        backgroundColor: "#e47f3c",
        stack: "stacked",
      },
      {
        label: "New Leases",
        data: renewalSplit.map((entry) => entry.newLeases ?? 0),
        backgroundColor: "#7d5eec",
        stack: "stacked",
      },
    ],
  };

  const chartContainerClass = "rounded-2xl bg-white/80 p-6 shadow-lg border border-slate-200";

  return (
    <div className="space-y-6 text-slate-900">
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      {/* <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm"> */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#b1419d]">{selectedProperty?.property_name ?? "No Property"}</h2>

        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          {!embedded ? (
          <div className="w-full md:w-auto">
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 shadow-inner focus:border-sky-500 focus:outline-none"
              value={selectedProperty?.property_name ?? ""}
              onChange={(event) => setSelectedPropertyName(event.target.value)}
            >
              {properties.map((property, index) => {
                const optionLabel = property.property_name ?? property.address ?? `Property ${index + 1}`;
                return (
                  <option key={`${optionLabel}-${index}`} value={property.property_name ?? optionLabel}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
          </div>
          ) : null}

        </div>
      </div>
      {summaryCards.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="text-lg font-semibold text-center text-blue-700">{card.title}</p>
              <p className="mt-1 text-2xl text-center font-semibold text-slate-900">{card.value}</p>
              {card.caption ? <p className="text-[0.7rem] text-center text-slate-500">{card.caption}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
      {/* </div> */}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold  text-[#b1419d]">Unit Type Analytics</h3>
        </div>
        <div className="interactive-data-table-shell mt-4">
          <table className="interactive-data-table min-w-[980px] text-sm text-black">
            <colgroup>
              <col style={{ width: "21%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "4%" }} />
            </colgroup>
            <thead className="interactive-data-table__head">
              <tr>
                <th scope="col">Unit Type</th>
                <th scope="col" className="text-right">Units</th>
                <th scope="col" className="text-right">In-Place</th>
                <th scope="col" className="text-right">Market</th>
                <th scope="col" className="text-right">Recommended</th>
                <th scope="col" className="text-right">% Increase</th>
                <th scope="col" className="text-right">Annual Rev Lift</th>
                <th scope="col">
                  <span className="sr-only">Row indicator</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {unitSummary.length === 0 && (
                <tr>
                  <td colSpan={8} className="interactive-data-table__state-cell">
                    <div className="interactive-data-table__state">
                      No unit summary found for this property.
                    </div>
                  </td>
                </tr>
              )}
              {unitSummary.map((row) => (
                <tr key={row.unitType} className="interactive-data-table__row">
                  <td className="interactive-data-table__cell interactive-data-table__cell--first">
                    <span className="interactive-data-table__primary">{row.unitType || "-"}</span>
                  </td>
                  <td className="interactive-data-table__cell text-right tabular-nums">
                    <span className="interactive-data-table__value">{row.units ?? "-"}</span>
                  </td>
                  <td className="interactive-data-table__cell text-right tabular-nums">
                    <span className="interactive-data-table__value">{formatCurrency(row.inPlace)}</span>
                  </td>
                  <td className="interactive-data-table__cell text-right tabular-nums">
                    <span className="interactive-data-table__value">{formatCurrency(row.market)}</span>
                  </td>
                  <td className="interactive-data-table__cell text-right tabular-nums">
                    <span className="interactive-data-table__value">{formatCurrency(row.recommended)}</span>
                  </td>
                  <td className="interactive-data-table__cell text-right tabular-nums">
                    <span
                      className={`block font-semibold ${row.percentIncrease && Number(row.percentIncrease) < 0 ? "text-rose-500" : "text-emerald-600"
                        }`}
                    >
                      {formatSignedPercent(row.percentIncrease)}
                    </span>
                  </td>
                  <td className="interactive-data-table__cell text-right tabular-nums">
                    <span className="interactive-data-table__value">{formatCurrency(row.annualRevenueLift)}</span>
                  </td>
                  <td className="interactive-data-table__cell interactive-data-table__cell--last interactive-data-table__arrow-cell">
                    {/* <ChevronRight className="interactive-data-table__arrow" strokeWidth={2.6} aria-hidden="true" /> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {hasInPlaceChart ? (
      <div >
        <div className={chartContainerClass}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold   text-[#b1419d]">
              In-Place vs Recommended Rent
            </h3>
          </div>
          <div className="mt-4 h-72">
            <Bar data={inPlaceChartData} options={baseChartOptions} />
          </div>
        </div>

        </div>
      ) : null}

      {hasAiRentDemandElasticity ? (
        <React.Suspense fallback={null}>
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
            <PfDealElasticity payload={aiRentDemandElasticity} />
            <PfDealsRentStimulator payload={aiRentDemandElasticity} />
          </div>
        </React.Suspense>
      ) : null}
      {hasRenewalSplitChart ? (
      <div >
        <div className={chartContainerClass}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold   text-[#b1419d]">
              Renewal vs New Lease Split
            </h3>
          </div>
          <div className="mt-4 h-72">
            <Bar
              data={renewalVsNewData}
              options={{
                ...baseChartOptions,
                scales: {
                  ...baseChartOptions.scales,
                  y: {
                    ...baseChartOptions.scales.y,
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
      ) : null}
      {/* {hasRevenueProjectionChart ? (
      <div className={chartContainerClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold   text-[#b1419d]">
            12-Month Revenue Projection
          </h3>
        </div>
        <div className="mt-4 h-72">
          <Line data={revenueLineData} options={baseChartOptions} />
        </div>
      </div>
      ) : null} */}

      {loading && <p className="text-sm font-semibold text-slate-500">Loading fresh AI recommendations-</p>}
      {!loading && properties.length === 0 && (
        <p className="text-sm text-rose-600">No properties available. Add a property.</p>
      )}
    </div>
  );
};

export default PfDemoAiRentIntelligence;
