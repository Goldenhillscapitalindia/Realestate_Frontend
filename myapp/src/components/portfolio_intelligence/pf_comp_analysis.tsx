import React, { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { authClient } from "@/lib/auth-api";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import "./pf_comp_analysis.css";

type UnitType = "Studio" | "1BD" | "2BD" | "3BD" | string;

type Coords = { lat: number; lng: number };

type CompAnalysisMarker = {
  type: "subject" | "comp";
  coords?: Coords;
  latitude?: number | null;
  longitude?: number | null;
  markerColor?: "blue" | "green" | "red" | string;
  markerSize?: "large" | "small" | string;
  name?: string;
  address?: string;
  buildingClass?: string;
  distanceMiles?: number;
  inPlaceRents?: Record<string, number | null | undefined>;
  vsYourAvg?: number | null;
};

type MarkerWithCoords = CompAnalysisMarker & { coords: Coords };

type CompAnalysisPayload = {
  propertyName?: string;
  summary?: {
    yourAvgInPlaceRent?: number | null;
    classMatchedMarketAvg?: number | null;
    totalRentGap?: number | null;
    totalRentGapPct?: number | null;
    comparablesFound?: number | null;
  };
  chart?: {
    unitTypes?: UnitType[];
    inPlace?: Array<number | null>;
    market?: Array<number | null>;
  };
  subjectProperty?: {
    name?: string;
    address?: string;
    buildingClass?: string;
    avgInPlaceRent?: number;
    inPlaceRents?: Record<string, number | null | undefined>;
  };
  comparables?: Array<{
    name?: string;
    address?: string;
    buildingClass?: string;
    distanceMiles?: number;
    coords?: Coords;
    latitude?: number | null;
    longitude?: number | null;
    source?: string;
    inPlaceRents?: Record<string, number | null | undefined>;
    compAvgInPlaceRent?: number;
    vsYourAvg?: number;
    occupancy?: number | null;
    markerColor?: "green" | "red" | string;
  }>;
  map?: {
    leafletEnabled?: boolean;
    markers?: CompAnalysisMarker[];
    diagnostics?: {
      subjectAddress?: string;
      geocodeTargetsCount?: number;
      geocodedCount?: number;
      geocodeFailedCount?: number;
    };
    legend?: unknown;
  };
};

const formatCurrency = (value?: number | null): string => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
};

const formatGap = (value?: number | null): string => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value))}`;
};

const formatPct = (value?: number | null): string => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  const pct = Math.abs(value) > 1 ? value : value * 100;
  const sign = pct > 0 ? "+" : pct < 0 ? "-" : "";
  return `${sign}${Math.abs(pct).toFixed(2)}%`;
};

function colorToHex(color?: string) {
  if (!color) return "#64748b";
  if (color === "blue") return "#2563eb";
  if (color === "green") return "#16a34a";
  if (color === "red") return "#dc2626";
  return color;
}

function normalizeCoords(input: {
  coords?: Coords;
  latitude?: number | null;
  longitude?: number | null;
}): Coords | null {
  if (input.coords && typeof input.coords.lat === "number" && typeof input.coords.lng === "number") {
    return input.coords;
  }
  if (typeof input.latitude === "number" && typeof input.longitude === "number") {
    return { lat: input.latitude, lng: input.longitude };
  }
  return null;
}

const ACCENT_PURPLE = "#7C3AED";

/** SVG pin marker matching Market Radar's kite icon style */
function createPinIcon(color: string, large = false) {
  const w = large ? 30 : 24;
  const h = large ? 42 : 34;
  return L.divIcon({
    className: "",
    html: `
      <svg width="${w}" height="${h}" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(15,23,42,0.25)" />
          </filter>
        </defs>
        <path d="M13 0 L26 14 L13 36 L0 14 Z" fill="${color}" filter="url(#pin-shadow)" />
        <circle cx="13" cy="14" r="4" fill="#FFFFFF" opacity="0.9" />
      </svg>
    `,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 4],
  });
}

/** Syncs the Leaflet map view to bounds/center — same pattern as Market Radar */
function MapViewUpdater({ center, bounds }: { center: LatLngExpression; bounds: LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView(center, 13);
    }
  }, [bounds, center, map]);
  return null;
}

export default function PfCompAnalysis({ propertyName }: { propertyName: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [payload, setPayload] = useState<CompAnalysisPayload | null>(null);
  const [classFilter, setClassFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<
    "name" | "class" | "distance" | "vsYourAvg" | "occupancy" | "source" | `ut:${string}`
  >("distance");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchAnalysis = async (activeFlag?: { current: boolean }) => {
    setStatus("loading");
    try {
      const res = await authClient.get<CompAnalysisPayload>("/api/get_property_comp_analysis/", {
        params: { property_name: propertyName },
      });
      if (activeFlag && !activeFlag.current) return;
      setPayload(res.data ?? null);
      setStatus("idle");
    } catch {
      if (activeFlag && !activeFlag.current) return;
      setStatus("error");
    }
  };

  useEffect(() => {
    const active = { current: true };
    void fetchAnalysis(active);
    return () => {
      active.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyName]);

  const summary = payload?.summary;
  const chart = payload?.chart;
  const unitTypes = (chart?.unitTypes ?? []) as UnitType[];
  const inPlaceSeries = (chart?.inPlace ?? []) as Array<number | null>;
  const marketSeries = (chart?.market ?? []) as Array<number | null>;

  /** Derive map markers from backend payload — synchronous, no geocoding needed */
  const leafletMarkers: MarkerWithCoords[] = useMemo(() => {
    if (!payload?.map?.markers) return [];
    return payload.map.markers
      .map((m) => {
        const coords = normalizeCoords(m);
        if (!coords) return null;
        return { ...m, coords } as MarkerWithCoords;
      })
      .filter((m): m is MarkerWithCoords => !!m);
  }, [payload?.map?.markers]);

  const mapEnabled = payload?.map?.leafletEnabled !== false;
  const hasMarkers = leafletMarkers.length > 0;

  /** Compute map center from subject marker (same approach as Market Radar) */
  const mapCenter = useMemo<LatLngExpression>(() => {
    const subjectMarker = leafletMarkers.find((m) => m.type === "subject");
    if (subjectMarker) return [subjectMarker.coords.lat, subjectMarker.coords.lng];
    if (leafletMarkers.length > 0) {
      const total = leafletMarkers.reduce(
        (acc, m) => ({ lat: acc.lat + m.coords.lat, lng: acc.lng + m.coords.lng }),
        { lat: 0, lng: 0 },
      );
      return [total.lat / leafletMarkers.length, total.lng / leafletMarkers.length];
    }
    return [39.5, -98.35]; // US center fallback
  }, [leafletMarkers]);

  /** Compute map bounds from all markers (same approach as Market Radar) */
  const mapBounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!leafletMarkers.length) return null;
    const lats = leafletMarkers.map((m) => m.coords.lat);
    const lngs = leafletMarkers.map((m) => m.coords.lng);
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  }, [leafletMarkers]);

  const chartData = useMemo(() => {
    if (!unitTypes.length) return null;
    return {
      labels: unitTypes,
      datasets: [
        {
          label: "In-Place",
          data: inPlaceSeries.map((v) => (typeof v === "number" ? v : 0)),
          backgroundColor: "#0ea5e9",
          borderRadius: 6,
        },
        {
          label: "Market",
          data: marketSeries.map((v) => (typeof v === "number" ? v : 0)),
          backgroundColor: "#16a34a",
          borderRadius: 6,
        },
      ],
    };
  }, [inPlaceSeries, marketSeries, unitTypes]);

  const comparableRows = useMemo(() => {
    const comps = payload?.comparables ?? [];
    const filtered =
      classFilter === "All"
        ? comps
        : comps.filter((c) => (c.buildingClass ?? "").toUpperCase() === classFilter.toUpperCase());

    const getUt = (row: any, ut: string) => {
      const v = row?.inPlaceRents?.[ut];
      return typeof v === "number" ? v : null;
    };

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const ak: any = a;
      const bk: any = b;
      let av: any = null;
      let bv: any = null;

      if (sortKey === "name") {
        av = (ak.name ?? "").toString().toLowerCase();
        bv = (bk.name ?? "").toString().toLowerCase();
      } else if (sortKey === "class") {
        av = (ak.buildingClass ?? "").toString().toLowerCase();
        bv = (bk.buildingClass ?? "").toString().toLowerCase();
      } else if (sortKey === "distance") {
        av = typeof ak.distanceMiles === "number" ? ak.distanceMiles : Number.POSITIVE_INFINITY;
        bv = typeof bk.distanceMiles === "number" ? bk.distanceMiles : Number.POSITIVE_INFINITY;
      } else if (sortKey === "vsYourAvg") {
        av = typeof ak.vsYourAvg === "number" ? ak.vsYourAvg : Number.POSITIVE_INFINITY;
        bv = typeof bk.vsYourAvg === "number" ? bk.vsYourAvg : Number.POSITIVE_INFINITY;
      } else if (sortKey === "occupancy") {
        av = typeof ak.occupancy === "number" ? ak.occupancy : Number.NEGATIVE_INFINITY;
        bv = typeof bk.occupancy === "number" ? bk.occupancy : Number.NEGATIVE_INFINITY;
      } else if (sortKey === "source") {
        av = (ak.source ?? "").toString().toLowerCase();
        bv = (bk.source ?? "").toString().toLowerCase();
      } else if (sortKey.startsWith("ut:")) {
        const ut = sortKey.slice(3);
        av = getUt(ak, ut) ?? Number.POSITIVE_INFINITY;
        bv = getUt(bk, ut) ?? Number.POSITIVE_INFINITY;
      }

      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * dir;
    });

    return sorted;
  }, [payload?.comparables, classFilter, sortDir, sortKey]);

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of payload?.comparables ?? []) {
      const cls = (c.buildingClass ?? "").trim();
      if (cls) set.add(cls.toUpperCase());
    }
    const ordered = ["A", "B", "C"].filter((c) => set.has(c));
    const rest = Array.from(set)
      .filter((c) => !ordered.includes(c))
      .sort();
    return ["All", ...ordered, ...rest];
  }, [payload?.comparables]);



  if (status === "loading") {
    return (
      <div className="space-y-6 rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[92px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
        <div className="h-[420px] animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
        <div className="h-[460px] animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
      </div>
    );
  }

  if (status === "error" || !payload) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold text-red-600">Unable to load competitive analysis.</p>
        <button
          type="button"
          onClick={() => void fetchAnalysis()}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6D28D9]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Your avg in-place rent</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(summary?.yourAvgInPlaceRent ?? null)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Class-matched market avg</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: ACCENT_PURPLE }}>
            {formatCurrency(summary?.classMatchedMarketAvg ?? null)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Total rent gap</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatGap(summary?.totalRentGap ?? null)}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            {formatPct(summary?.totalRentGapPct ?? null)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Comparables found</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {summary?.comparablesFound ?? payload.comparables?.length ?? "-"}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold" style={{ color: ACCENT_PURPLE }}>
          In-Place vs Market Rent
        </h3>
        <p className="text-sm text-slate-600">Per unit type, monthly $</p>
        {inPlaceSeries.some((v) => v === null) ? (
          <p className="mt-2 text-xs font-semibold text-slate-500">
            In-place rents are missing for this property (backend returned null). Blue bars may show as 0.
          </p>
        ) : null}
        <div className="mt-4 h-72">
          {chartData ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" as const },
                  title: { display: false },
                },
                scales: {
                  x: { ticks: { color: "#475569" }, grid: { color: "rgba(15,23,42,0.05)" } },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: "#475569",
                      callback: (v: any) => `$${Number(v).toLocaleString("en-US")}`,
                    },
                    grid: { color: "rgba(15,23,42,0.08)" },
                  },
                },
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
              No chart data available.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold" style={{ color: ACCENT_PURPLE }}>
          Competitor Map
        </h3>
        <p className="text-sm text-slate-600">
          <span style={{ color: "#2563eb" }}>●</span> Subject property&nbsp;&nbsp;
          <span style={{ color: "#16a34a" }}>●</span> Above your avg&nbsp;&nbsp;
          <span style={{ color: "#dc2626" }}>●</span> Below your avg
        </p>
        {mapEnabled ? (
          <>
            <div className="mt-4 h-[360px] w-full overflow-hidden rounded-2xl border border-slate-200">
              <MapContainer
                style={{ height: "100%", width: "100%" }}
                center={mapCenter}
                zoom={4}
                scrollWheelZoom={true}
                zoomControl={true}
              >
                <MapViewUpdater center={mapCenter} bounds={mapBounds} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {leafletMarkers.map((m, idx) => {
                  const isSubject = m.type === "subject";
                  const color = colorToHex(isSubject ? "blue" : m.markerColor);
                  const icon = createPinIcon(color, isSubject);
                  const rents = m.inPlaceRents ?? {};

                  return (
                    <Marker
                      key={`${m.type}-${m.name ?? "marker"}-${idx}`}
                      position={[m.coords.lat, m.coords.lng]}
                      icon={icon}
                    >
                      <Popup>
                        <div className="text-[13px] text-slate-900" style={{ minWidth: 180 }}>
                          {/* Title: property name */}
                          <div className="text-[14px] font-semibold">{m.name ?? "Property"}</div>

                          {/* Subtitle: street address */}
                          {m.address && (
                            <div className="mt-0.5 text-[12px] text-slate-500">{m.address}</div>
                          )}

                          {/* Meta row: class + distance */}
                          <div className="mt-1 text-[12px] text-slate-600">
                            Class: {m.buildingClass ?? "-"}
                            {typeof m.distanceMiles === "number"
                              ? ` · ${m.distanceMiles.toFixed(1)} mi away`
                              : ""}
                          </div>

                          {/* Per unit-type rents */}
                          {unitTypes.length > 0 && (
                            <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                              {unitTypes.map((ut) => (
                                <div key={ut} className="flex items-center justify-between gap-4">
                                  <span className="text-slate-600">{ut}</span>
                                  <span className="font-semibold">
                                    {formatCurrency(typeof rents[ut] === "number" ? rents[ut] : null)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Vs your avg */}
                          {!isSubject && (
                            <div className="mt-2 border-t border-slate-100 pt-2">
                              <span className="text-slate-600">Vs your avg: </span>
                              <span
                                className="font-semibold"
                                style={{
                                  color:
                                    typeof m.vsYourAvg === "number"
                                      ? m.vsYourAvg > 0
                                        ? "#16a34a"
                                        : m.vsYourAvg < 0
                                          ? "#dc2626"
                                          : "#475569"
                                      : "#475569",
                                }}
                              >
                                {formatGap(m.vsYourAvg ?? null)}
                              </span>
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
            {!hasMarkers && (
              <p className="mt-3 text-xs font-semibold text-slate-500">
                No map markers available — coordinates may not have been geocoded for this property yet.
              </p>
            )}
            {payload.map?.diagnostics && (payload.map.diagnostics.geocodeFailedCount ?? 0) > 0 && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <span className="font-semibold">Geocoding note:</span>{" "}
                {payload.map.diagnostics.geocodeFailedCount} of{" "}
                {payload.map.diagnostics.geocodeTargetsCount ?? "-"} addresses could not be mapped.
              </div>
            )}
          </>
        ) : (
          <p className="mt-3 text-xs font-semibold text-slate-500">Map is disabled for this environment.</p>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: ACCENT_PURPLE }}>
              Comparable Properties
            </h3>
            <p className="text-sm text-slate-600">{(payload.comparables?.length ?? 0)} properties shown</p>
          </div>
          <div className="inline-flex items-center rounded-2xl bg-slate-100 p-1">
            {classOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setClassFilter(opt)}
                className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                  classFilter === opt ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="pf-comp-analysis-table mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full table-auto">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="hover:text-slate-900"
                    onClick={() => {
                      setSortKey("name");
                      setSortDir((d) => (sortKey === "name" ? (d === "asc" ? "desc" : "asc") : "asc"));
                    }}
                  >
                    Property Name
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="hover:text-slate-900"
                    onClick={() => {
                      setSortKey("class");
                      setSortDir((d) => (sortKey === "class" ? (d === "asc" ? "desc" : "asc") : "asc"));
                    }}
                  >
                    Class
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="hover:text-slate-900"
                    onClick={() => {
                      setSortKey("distance");
                      setSortDir((d) => (sortKey === "distance" ? (d === "asc" ? "desc" : "asc") : "asc"));
                    }}
                  >
                    Distance
                  </button>
                </th>
                {unitTypes.map((ut) => (
                  <th key={ut} className="px-4 py-3">
                    <button
                      type="button"
                      className="hover:text-slate-900"
                      onClick={() => {
                        const key = `ut:${ut}` as const;
                        setSortKey(key);
                        setSortDir((d) => (sortKey === key ? (d === "asc" ? "desc" : "asc") : "asc"));
                      }}
                    >
                      {ut} IP
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="hover:text-slate-900"
                    onClick={() => {
                      setSortKey("vsYourAvg");
                      setSortDir((d) => (sortKey === "vsYourAvg" ? (d === "asc" ? "desc" : "asc") : "asc"));
                    }}
                  >
                    vs. Your Avg
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="hover:text-slate-900"
                    onClick={() => {
                      setSortKey("occupancy");
                      setSortDir((d) => (sortKey === "occupancy" ? (d === "asc" ? "desc" : "asc") : "asc"));
                    }}
                  >
                    Occupancy
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="hover:text-slate-900"
                    onClick={() => {
                      setSortKey("source");
                      setSortDir((d) => (sortKey === "source" ? (d === "asc" ? "desc" : "asc") : "asc"));
                    }}
                  >
                    Source
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-sky-50/60 text-sm">
                <td className="px-4 py-4 font-semibold text-slate-900">
                  {(payload.subjectProperty?.name ?? propertyName) + " (You)"}
                  <div className="mt-1 text-xs font-medium text-slate-600">{payload.subjectProperty?.address ?? ""}</div>
                </td>
                <td className="px-4 py-4">{payload.subjectProperty?.buildingClass ?? "-"}</td>
                <td className="px-4 py-4">-</td>
                {unitTypes.map((ut) => (
                  <td key={ut} className="px-4 py-4">
                    {formatCurrency(payload.subjectProperty?.inPlaceRents?.[ut] ?? null)}
                  </td>
                ))}
                <td className="px-4 py-4">-</td>
                <td className="px-4 py-4">-</td>
                <td className="px-4 py-4 text-slate-600">Subject</td>
              </tr>

              {comparableRows.map((c, idx) => (
                <tr key={`${c.name ?? "comp"}-${idx}`} className="border-t text-sm">
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {c.name ?? "-"}
                    <div className="mt-1 text-xs font-medium text-slate-600">{c.address ?? ""}</div>
                  </td>
                  <td className="px-4 py-4">{c.buildingClass ?? "-"}</td>
                  <td className="px-4 py-4">{typeof c.distanceMiles === "number" ? `${c.distanceMiles.toFixed(1)} mi` : "-"}</td>
                  {unitTypes.map((ut) => (
                    <td key={ut} className="px-4 py-4">
                      {formatCurrency(c.inPlaceRents?.[ut] ?? null)}
                    </td>
                  ))}
                  <td className={`px-4 py-4 font-semibold ${(c.markerColor ?? "") === "green" ? "text-green-600" : (c.markerColor ?? "") === "red" ? "text-red-600" : "text-slate-800"}`}>
                    {formatGap(c.vsYourAvg ?? null)}
                  </td>
                  <td className="px-4 py-4">
                    {typeof c.occupancy === "number" ? `${c.occupancy.toFixed(1)}%` : "-"}
                  </td>
                  <td className="px-4 py-4 text-indigo-600">{c.source ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
