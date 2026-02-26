import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PULSE_STYLES } from "../constants";
import { MarketRadarViewData } from "../types";
import { normalizeApiPayload, buildViewData } from "../utils";
import AiOutcomeSection from "./AiOutcomeSection";
import CapitalMarketsSection from "./CapitalMarketsSection";
import DecisionSupportSection from "./DecisionSupportSection";
import HealthIndicatorsSection from "./HealthIndicatorsSection";
import KeyTrendsSection from "./KeyTrendsSection";
import MarketRadarViewHeader from "./MarketRadarViewHeader";
import StatusFooter from "./StatusFooter";
import VacancyRentSupplyGrid from "./VacancyRentSupplyGrid";


type MarketRadarViewProps = {
  subMarketName?: string;
  region?: string;
  assetType?: "Multifamily" | "Industrial";
  onBack?: () => void;
  embedded?: boolean;
};

const MarketRadarView: React.FC<MarketRadarViewProps> = ({
  subMarketName,
  region: regionProp,
  assetType: assetTypeProp,
  onBack,
  embedded = false,
}) => {
  const { sub_market_name = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const targetSubMarket = subMarketName ?? sub_market_name;
  const region = regionProp ?? (location.state as { region?: string } | null)?.region ?? "";
  const assetType =
    assetTypeProp ??
    (location.state as { assetType?: "Multifamily" | "Industrial" } | null)?.assetType ??
    "Multifamily";
  const API_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState<MarketRadarViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_URL}/api/get_market_radar_data/`, {
          sub_market_name: targetSubMarket,
          region,
          fetch: "specific" ,
          construction_type: assetType === "Multifamily" ? "multi_family" : "industrial",
        });
        const payload = response.data?.data ?? response.data;
        if (!active) return;
        setData(normalizeApiPayload(payload, targetSubMarket));
      } catch (err) {
        console.error(err);
        if (!active) return;
        setError("Unable to load market radar view.");
        setData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [API_URL, targetSubMarket, region, assetType]);

  const viewData = useMemo(
    () => buildViewData(data, targetSubMarket),
    [data, targetSubMarket]
  );

  const pulseStyle = PULSE_STYLES[viewData.pulseKey];

  return (
    <section
      className={embedded ? "text-black" : "min-h-screen px-6 py-10 text-black"}
      style={
        embedded
          ? undefined
          : {
              background:
                "linear-gradient(180deg, rgba(248,250,255,1) 0%, rgba(240,244,255,1) 100%)",
            }
      }
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <MarketRadarViewHeader
          sub_market_name={viewData.sub_market_name}
          region={viewData.region}
          pulseLabel={viewData.pulseLabel}
          pulseDot={pulseStyle.dot}
          onBack={onBack ?? (() => navigate(-1))}
        />
        <HealthIndicatorsSection indicators={viewData.healthIndicators} />
        <KeyTrendsSection trends={viewData.keyTrends} />
        <VacancyRentSupplyGrid
          supplyDemand={viewData.supplyDemand}
          vacancy={viewData.vacancyDynamics}
          rent={viewData.rentPerformance}
          supply={viewData.supplyPipeline}
        />
        <CapitalMarketsSection data={viewData.capitalMarkets} />
        <AiOutcomeSection data={viewData.aiOutcome} />
        <DecisionSupportSection data={viewData.decisionSupport} />
        <StatusFooter loading={loading} error={error} />
      </div>
    </section>
  );
};

export default MarketRadarView;
