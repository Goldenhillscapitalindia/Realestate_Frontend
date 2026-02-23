import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Block } from "../Realestate_components/Utils/RComponentsUtils";
import RealEstateResponses from "./ShowPropertyResponse";

type FileType = "memorandum" | "t12" | "rent_roll";

type PropertyResponse = {
  memorandum?: { response?: Block[] };
  t12?: { response?: Block[] };
  rent_roll?: { response?: Block[] };
};

type PropertyRecord = {
  property_name: string;
  submarket: string;
  region: string;
  property_response: PropertyResponse | null;
};

const PfPropertyResponse: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const propertyName = searchParams.get("property_name") ?? "";
  const submarket = searchParams.get("submarket") ?? "";
  const region = searchParams.get("region") ?? "";

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [record, setRecord] = useState<PropertyRecord | null>(null);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      if (!propertyName || !submarket || !region) {
        setStatus("error");
        return;
      }
      setStatus("loading");
      try {
        const response = await axios.post<{ data: PropertyRecord }>(
          `${API_URL}/api/get_property_model_data/`,
          {
            fetch: "specific",
            property_name: propertyName,
            submarket,
            region,
          }
        );
        if (isActive) {
          setRecord(response.data?.data ?? null);
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
  }, [API_URL, propertyName, submarket, region]);

  const responses = useMemo<Record<FileType, Block[]>>(() => {
    return {
      memorandum: record?.property_response?.memorandum?.response ?? [],
      t12: record?.property_response?.t12?.response ?? [],
      rent_roll: record?.property_response?.rent_roll?.response ?? [],
    };
  }, [record]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-black">
        Loading property response...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-black">
        Failed to load property response.
      </div>
    );
  }

  return (
    <RealEstateResponses
      responses={responses}
      onBack={() => navigate("/portfolio_intelligence", { state: { activeTab: "Properties" } })}
      titleText={record?.property_name ? `${record.property_name} ` : "Property Response"}
    />
  );
};

export default PfPropertyResponse;
