import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type PropertyRecord = {
  property_name: string;
  submarket: string;
  region: string;
  address: string;
  location: string;
  class_type: string;
  units: number | string;
  occupancy: string;
  rent_per_sqft: string;
  property_response: unknown;
};

const PfDemoProperties: React.FC = () => {
  const [data, setData] = useState<PropertyRecord[]>([]);
  const [selected, setSelected] = useState<PropertyRecord | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setStatus("loading");
      try {
        const response = await axios.post<{ data: PropertyRecord[] }>(
          `${API_URL}/api/get_property_model_data/`,
          { fetch: "all" }
        );

        if (isActive) {
          const rows = response.data?.data ?? [];
          setData(rows);
          setSelected(rows[0] ?? null);
          setStatus("idle");
        }
      } catch (error) {
        if (isActive) {
          setStatus("error");
        }
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [API_URL]);

  const handleRowClick = (row: PropertyRecord) => {
    setSelected(row);
    const params = new URLSearchParams({
      property_name: row.property_name,
      submarket: row.submarket,
      region: row.region,
    });
    navigate(`/portfolio_intelligence/property-insights?${params.toString()}`);
  };


  return (


    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-blue-200 text-s uppercase tracking-wide text-black">
          <tr>
            <th className="px-4 py-3">Property</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Class</th>
            <th className="px-4 py-3">Units</th>
            <th className="px-4 py-3">Occupancy</th>
            <th className="px-4 py-3">Rent/sqft</th>
          </tr>
        </thead>
        <tbody>
          {status === "loading" ? (
            <tr>
              <td className="px-4 py-4 text-black" colSpan={6}>
                Loading...
              </td>
            </tr>
          ) : null}
          {status === "error" ? (
            <tr>
              <td className="px-4 py-4 text-red-500" colSpan={6}>
                Failed to load properties.
              </td>
            </tr>
          ) : null}
          {status === "idle" && data.length === 0 ? (
            <tr>
              <td className="px-4 py-4 text-black" colSpan={6}>
                No properties available.
              </td>
            </tr>
          ) : null}
          {data.map((row) => {
            const isActive = selected?.property_name === row.property_name;
            return (
              <tr
                key={`${row.property_name}-${row.location}`}
                className={`cursor-pointer border-t border-slate-100 transition ${isActive ? "bg-sky-50" : "hover:bg-slate-50"
                  }`}
                onClick={() => handleRowClick(row)}
              >
                <td className="px-4 py-3 font-semibold text-black">{row.property_name}</td>
                <td className="px-4 py-3 text-black">{row.location}</td>
                <td className="px-4 py-3 text-black">{row.class_type}</td>
                <td className="px-4 py-3 text-black">{row.units}</td>
                <td className="px-4 py-3 text-black">{row.occupancy}</td>
                <td className="px-4 py-3 text-black">{row.rent_per_sqft}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
};

export default PfDemoProperties;
