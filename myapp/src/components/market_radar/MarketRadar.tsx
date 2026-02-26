import React, { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { useNavigate } from "react-router-dom";
import { MarketRadarItem } from "./types";
import { normalizeItems, normalizePulseKey } from "./utils";
import MarketRadarHeader from "./MarketRadarHeader";
import MarketRadarHighlights from "./MarketRadarHighlights";
import MarketRadarMap from "./MarketRadarMap";
import MarketRadarTable from "./MarketRadarTable";
import AddSubmarketModal from "./AddSubmarketModal";
import MarketRadarView from "../market-radar-view/components/MarketRadarView";


type MarketRadarProps = {
  showBackButton?: boolean;
  showHeaderCard?: boolean;
  openDetailsInPlace?: boolean;
  showPanelCard?: boolean;
};

const MarketRadar: React.FC<MarketRadarProps> = ({
  showBackButton = false,
  showHeaderCard = true,
  openDetailsInPlace = false,
  showPanelCard = true,
}) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState<MarketRadarItem[]>([]);
  const [assetType, setAssetType] = useState<"Multifamily" | "Industrial">(() => {
    if (typeof window === "undefined") return "Multifamily";
    const stored = window.sessionStorage.getItem("marketRadarAssetType");
    return stored === "Industrial" || stored === "Multifamily" ? stored : "Multifamily";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MarketRadarItem | null>(null);
  const navigate = useNavigate();
  const embedded = openDetailsInPlace;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem("marketRadarAssetType", assetType);
  }, [assetType]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_URL}/api/get_market_radar_data/`, {
          fetch: "all",
          construction_type: assetType === "Multifamily" ? "multi_family" : "industrial",
        });
        const payload = response.data?.data ?? response.data ?? [];
        const rows = Array.isArray(payload) ? payload : [payload];
        const normalized = normalizeItems(rows);
        if (!active) return;
        setData(normalized);
        setLastUpdated(new Date());
      } catch (err) {
        console.error(err);
        if (!active) return;
        setError("Failed to load market radar data.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [API_URL, assetType]);

  const pulseCounts = useMemo(() => {
    return data.reduce<Record<string, number>>((acc, item) => {
      const key = normalizePulseKey(item.marketPulse);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [data]);

  const mapCenter = useMemo(() => {
    if (!data.length) {
      return { lat: 39.5, lng: -98.35 };
    }
    const total = data.reduce(
      (acc, item) => {
        acc.lat += item.latitude;
        acc.lng += item.longitude;
        return acc;
      },
      { lat: 0, lng: 0 }
    );
    return { lat: total.lat / data.length, lng: total.lng / data.length };
  }, [data]);

  const mapBounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!data.length) return null;
    const lats = data.map((item) => item.latitude);
    const lngs = data.map((item) => item.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ];
  }, [data]);

  const mapCenterLatLng = useMemo<LatLngExpression>(
    () => [mapCenter.lat, mapCenter.lng],
    [mapCenter.lat, mapCenter.lng]
  );

  const handleUpload = async (payload: FormData) => {
    setUploading(true);
    setUploadError(null);
    try {
      await axios.post(`${API_URL}/api/market_radar_upload/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
      setUploadError("Unable to upload submarket.");
    } finally {
      setUploading(false);
    }
  };

  if (openDetailsInPlace && selectedItem) {
    return (
      <MarketRadarView
        subMarketName={selectedItem.sub_market_name}
        region={selectedItem.region}
        assetType={assetType}
        onBack={() => setSelectedItem(null)}
        embedded={openDetailsInPlace}
      />
    );
  }

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
      <div className={embedded ? "w-full space-y-6" : "mx-auto max-w-6xl space-y-6"}>
        <div className="flex flex-wrap items-center gap-3">
          {showBackButton && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:border-slate-400 hover:text-black"
              onClick={() => navigate("/", { state: { scrollTo: "#platform" } })}
            >
              Back
            </button>
          )}
          <div className="flex flex-1 justify-center gap-2 ">
            {["Multifamily", "Industrial"].map((tab) => {
              const isActive = assetType === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAssetType(tab as "Multifamily" | "Industrial")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-900 text-white shadow-sm"
                      : "text-black hover:text-black bg-slate-200"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
        {showHeaderCard && <MarketRadarHeader />}
        <MarketRadarHighlights pulseCounts={pulseCounts} assetType={assetType} />
        {showPanelCard ? (
          <div
            className="rounded-2xl border border-slate-200 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,255,0.98) 100%)",
            }}
          >
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <MarketRadarMap data={data} mapCenter={mapCenterLatLng} mapBounds={mapBounds} />
              <MarketRadarTable
                data={data}
                loading={loading}
                error={error}
                onAddSubmarket={() => setIsAddOpen(true)}
                onSelectsub_market_name={(item) => {
                  if (openDetailsInPlace) {
                    setSelectedItem(item);
                    return;
                  }
                  navigate(`/market_radar_view/${encodeURIComponent(item.sub_market_name)}`, {
                    state: { region: item.region, assetType },
                  });
                }}
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <MarketRadarMap data={data} mapCenter={mapCenterLatLng} mapBounds={mapBounds} />
            <MarketRadarTable
              data={data}
              loading={loading}
              error={error}
              onAddSubmarket={() => setIsAddOpen(true)}
              onSelectsub_market_name={(item) => {
                if (openDetailsInPlace) {
                  setSelectedItem(item);
                  return;
                }
                navigate(`/market_radar_view/${encodeURIComponent(item.sub_market_name)}`, {
                  state: { region: item.region, assetType },
                });
              }}
            />
          </div>
        )}
        {/* <MarketRadarFooter count={data.length} lastUpdated={lastUpdated} /> */}
      </div>
      <AddSubmarketModal
        open={isAddOpen}
        loading={uploading}
        error={uploadError}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleUpload}
      />
    </section>
  );
};

export default MarketRadar;
