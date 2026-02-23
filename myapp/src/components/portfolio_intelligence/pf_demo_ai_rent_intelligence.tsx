import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Title);

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
};

type PropertyRecord = {
  property_name?: string;
  address?: string;
  location?: string;
  class_type?: string;
  ai_rent_intelligence_response?: AiRentResponse;
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
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
    style: "currency",
    currency: "USD",
  }).format(num);
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

const PfDemoAiRentIntelligence: React.FC = () => {
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
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchRentData = async (payload: { fetch: "all" | "specific"; property_name?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/get_ai_rent_intelligence_data/`, payload);
      const fetched = response.data?.data ?? [];
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
    fetchRentData({ fetch: "all" });
  }, []);

  const dashboard = selectedProperty?.ai_rent_intelligence_response?.dashboard;
  const inPlaceChart = dashboard?.charts?.inPlaceVsRecommended ?? [];
  const renewalSplit = dashboard?.charts?.renewalVsNewLeaseSplit ?? [];
  const revenueProjection = dashboard?.charts?.revenueProjection12Months ?? [];
  const basicInfo = dashboard?.basic_info;
  const unitSummary = dashboard?.unitSummary ?? [];

  const totalProjectedLift = basicInfo?.totalprojectedrevenuelift;

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

        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="text-lg font-semibold text-center  text-blue-700">Total Projected Revenue Lift</p>
          <p className="mt-1 text-2xl text-center font-semibold text-slate-900">{formatCompactCurrency(totalProjectedLift)}</p>
          <p className="text-[0.7rem] text-center  text-slate-500">per year</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="text-lg font-semibold text-center  text-blue-700">12-Mo Projected Revenue</p>
          <p className="mt-1 text-2xl text-center font-semibold text-slate-900">
            {formatCompactCurrency(basicInfo?.projected12MonthRevenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="text-lg font-semibold text-center  text-blue-700">Revenue at Risk</p>
          <p className="mt-1 text-2xl text-center font-semibold text-slate-900">
            {formatCompactCurrency(basicInfo?.revenueAtRisk)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="text-lg font-semibold text-center  text-blue-700">Avg Renewal Rate</p>
          <p className="mt-1 text-2xl text-center font-semibold text-slate-900">
            {formatPercent(basicInfo?.avgrenewalrate)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="text-lg font-semibold text-center  text-blue-700">MTM Capture</p>
          <p className="mt-1 text-2xl text-center font-semibold text-slate-900">
            {formatCompactCurrency(basicInfo?.mtmcapturepotential)}
          </p>
          {/* <p className="text-[0.7rem] text-slate-500">MTM Capture: {formatCompactCurrency(basicInfo?.mtmcapturepotential)}</p> */}
        </div>
      </div>
      {/* </div> */}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold  text-[#b1419d]">Unit Type Analytics</h3>
        </div>
        <div className="mt-4 overflow-x-auto bg-blue-50 rounded-lg shadow ">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="text-center text-m text-blue-600  ">
                <th className="pb-2 pr-4">Unit Type</th>
                <th className="pb-2 pr-4">Units</th>
                <th className="pb-2 pr-4">In-Place</th>
                <th className="pb-2 pr-4">Market</th>
                <th className="pb-2 pr-4">Recommended</th>
                <th className="pb-2 pr-4">% Increase</th>
                <th className="pb-2">Annual Rev Lift</th>
              </tr>
            </thead>
            <tbody>
              {unitSummary.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-400">
                    No unit summary found for this property.
                  </td>
                </tr>
              )}
              {unitSummary.map((row) => (
                <tr key={row.unitType} className="border-t border-slate-100 text-black text-center">
                  <td className="py-3 pr-4 font-semibold text-black">{row.unitType || "-"}</td>
                  <td className="pr-4">{row.units ?? "-"}</td>
                  <td className="pr-4">{formatCurrency(row.inPlace)}</td>
                  <td className="pr-4">{formatCurrency(row.market)}</td>
                  <td className="pr-4 text-black">{formatCurrency(row.recommended)}</td>
                  <td className={`pr-4 font-semibold ${row.percentIncrease && Number(row.percentIncrease) < 0 ? "text-rose-500" : "text-emerald-600"}`}>
                    {formatSignedPercent(row.percentIncrease)}
                  </td>
                  <td>{formatCurrency(row.annualRevenueLift)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

      {loading && <p className="text-sm font-semibold text-slate-500">Loading fresh AI recommendations-</p>}
      {!loading && properties.length === 0 && (
        <p className="text-sm text-rose-600">No rent intelligence data available for the requested property.</p>
      )}
    </div>
  );
};

export default PfDemoAiRentIntelligence;
