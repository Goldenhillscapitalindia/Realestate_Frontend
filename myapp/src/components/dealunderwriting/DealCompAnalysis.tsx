import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

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

export type DealCompAnalysisPayload = {
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
    markerColor?: "green" | "red" | string;
  }>;
  map?: {
    provider?: string;
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

const ACCENT_PURPLE = "#7C3AED";

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
  const pct = value > 1 ? value : value * 100;
  const sign = pct > 0 ? "+" : pct < 0 ? "-" : "";
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
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

function buildLegendItems(legend: unknown): Array<{ label: string; color: string }> {
  if (Array.isArray(legend)) {
    return legend
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const candidate = item as Record<string, unknown>;
        const label = typeof candidate.label === "string" ? candidate.label : null;
        const colorValue =
          typeof candidate.color === "string"
            ? candidate.color
            : typeof candidate.markerColor === "string"
              ? candidate.markerColor
              : null;
        if (!label || !colorValue) return null;
        return { label, color: colorToHex(colorValue) };
      })
      .filter((item): item is { label: string; color: string } => item !== null);
  }

  if (legend && typeof legend === "object") {
    return Object.entries(legend as Record<string, unknown>)
      .map(([label, colorValue]) => {
        if (typeof colorValue !== "string") return null;
        return { label, color: colorToHex(colorValue) };
      })
      .filter((item): item is { label: string; color: string } => item !== null);
  }

  return [];
}

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

export default function DealCompAnalysis({
  propertyName,
  payload,
}: {
  propertyName: string;
  payload: DealCompAnalysisPayload;
}) {
  const [classFilter, setClassFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<
    "name" | "class" | "distance" | "vsYourAvg" | "source" | `ut:${string}`
  >("distance");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const normalizedPayload = useMemo(() => payload ?? null, [payload]);

  const summary = normalizedPayload?.summary;
  const chart = normalizedPayload?.chart;
  const unitTypes = (chart?.unitTypes ?? []) as UnitType[];
  const inPlaceSeries = (chart?.inPlace ?? []) as Array<number | null>;
  const marketSeries = (chart?.market ?? []) as Array<number | null>;

  const leafletMarkers: MarkerWithCoords[] = useMemo(() => {
    if (!normalizedPayload?.map?.markers) return [];
    return normalizedPayload.map.markers
      .map((marker) => {
        const coords = normalizeCoords(marker);
        if (!coords) return null;
        return { ...marker, coords } as MarkerWithCoords;
      })
      .filter((marker): marker is MarkerWithCoords => Boolean(marker));
  }, [normalizedPayload?.map?.markers]);

  const mapEnabled = normalizedPayload?.map?.leafletEnabled !== false;
  const hasMarkers = leafletMarkers.length > 0;
  const legendItems = useMemo(() => buildLegendItems(normalizedPayload?.map?.legend), [normalizedPayload?.map?.legend]);

  const mapCenter = useMemo<LatLngExpression>(() => {
    const subjectMarker = leafletMarkers.find((marker) => marker.type === "subject");
    if (subjectMarker) return [subjectMarker.coords.lat, subjectMarker.coords.lng];
    if (leafletMarkers.length > 0) {
      const total = leafletMarkers.reduce(
        (acc, marker) => ({ lat: acc.lat + marker.coords.lat, lng: acc.lng + marker.coords.lng }),
        { lat: 0, lng: 0 },
      );
      return [total.lat / leafletMarkers.length, total.lng / leafletMarkers.length];
    }
    return [39.5, -98.35];
  }, [leafletMarkers]);

  const mapBounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!leafletMarkers.length) return null;
    const lats = leafletMarkers.map((marker) => marker.coords.lat);
    const lngs = leafletMarkers.map((marker) => marker.coords.lng);
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
          data: inPlaceSeries.map((value) => (typeof value === "number" ? value : 0)),
          backgroundColor: "#0ea5e9",
          borderRadius: 6,
        },
        {
          label: "Market",
          data: marketSeries.map((value) => (typeof value === "number" ? value : 0)),
          backgroundColor: "#16a34a",
          borderRadius: 6,
        },
      ],
    };
  }, [inPlaceSeries, marketSeries, unitTypes]);

  const comparableRows = useMemo(() => {
    const comps = normalizedPayload?.comparables ?? [];
    const filtered =
      classFilter === "All"
        ? comps
        : comps.filter((comp) => (comp.buildingClass ?? "").toUpperCase() === classFilter.toUpperCase());

    const getUnitRent = (
      row: {
        inPlaceRents?: Record<string, number | null | undefined>;
      },
      unitType: string,
    ) => {
      const value = row.inPlaceRents?.[unitType];
      return typeof value === "number" ? value : null;
    };

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      let av: string | number = "";
      let bv: string | number = "";

      if (sortKey === "name") {
        av = (a.name ?? "").toLowerCase();
        bv = (b.name ?? "").toLowerCase();
      } else if (sortKey === "class") {
        av = (a.buildingClass ?? "").toLowerCase();
        bv = (b.buildingClass ?? "").toLowerCase();
      } else if (sortKey === "distance") {
        av = typeof a.distanceMiles === "number" ? a.distanceMiles : Number.POSITIVE_INFINITY;
        bv = typeof b.distanceMiles === "number" ? b.distanceMiles : Number.POSITIVE_INFINITY;
      } else if (sortKey === "vsYourAvg") {
        av = typeof a.vsYourAvg === "number" ? a.vsYourAvg : Number.POSITIVE_INFINITY;
        bv = typeof b.vsYourAvg === "number" ? b.vsYourAvg : Number.POSITIVE_INFINITY;
      } else if (sortKey === "source") {
        av = (a.source ?? "").toLowerCase();
        bv = (b.source ?? "").toLowerCase();
      } else if (sortKey.startsWith("ut:")) {
        const unitType = sortKey.slice(3);
        av = getUnitRent(a, unitType) ?? Number.POSITIVE_INFINITY;
        bv = getUnitRent(b, unitType) ?? Number.POSITIVE_INFINITY;
      }

      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * dir;
    });

    return sorted;
  }, [normalizedPayload?.comparables, classFilter, sortDir, sortKey]);

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    for (const comp of normalizedPayload?.comparables ?? []) {
      const buildingClass = (comp.buildingClass ?? "").trim();
      if (buildingClass) set.add(buildingClass.toUpperCase());
    }
    const ordered = ["A", "B", "C"].filter((item) => set.has(item));
    const rest = Array.from(set)
      .filter((item) => !ordered.includes(item))
      .sort();
    return ["All", ...ordered, ...rest];
  }, [normalizedPayload?.comparables]);

  if (!normalizedPayload) return null;

  const subjectName = normalizedPayload.subjectProperty?.name ?? propertyName;
  const subjectLocation = normalizedPayload.subjectProperty?.address ?? "";
  const subjectClass = normalizedPayload.subjectProperty?.buildingClass ?? "-";

  return (
    <div
      className="pdf-flow-block space-y-6 rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
      data-pdf-split-children="true"
    >
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Comp Analysis</h2>
        <p className="mt-1 text-sm text-slate-600">Class-matched competitive analysis mapped from deal lens data.</p>
      </div>

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
            {summary?.comparablesFound ?? normalizedPayload.comparables?.length ?? "-"}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold" style={{ color: ACCENT_PURPLE }}>
          In-Place vs Market Rent
        </h3>
        <p className="text-sm text-slate-600">Per unit type, monthly $</p>
        {inPlaceSeries.some((value) => value === null) ? (
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
                      callback: (value: string | number) => `$${Number(value).toLocaleString("en-US")}`,
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
        {legendItems.length ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
            {legendItems.map((item) => (
              <span key={`${item.label}-${item.color}`}>
                <span style={{ color: item.color }}>•</span> {item.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            <span style={{ color: "#2563eb" }}>●</span> Subject property&nbsp;&nbsp;
            <span style={{ color: "#16a34a" }}>●</span> Above your avg&nbsp;&nbsp;
            <span style={{ color: "#dc2626" }}>●</span> Below your avg
          </p>
        )}
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

                {leafletMarkers.map((marker, index) => {
                  const isSubject = marker.type === "subject";
                  const color = colorToHex(isSubject ? "blue" : marker.markerColor);
                  const icon = createPinIcon(color, isSubject);
                  const rents = marker.inPlaceRents ?? {};

                  return (
                    <Marker
                      key={`${marker.type}-${marker.name ?? "marker"}-${index}`}
                      position={[marker.coords.lat, marker.coords.lng]}
                      icon={icon}
                    >
                      <Popup>
                        <div className="text-[13px] text-slate-900" style={{ minWidth: 180 }}>
                          <div className="text-[14px] font-semibold">{marker.name ?? "Property"}</div>
                          {marker.address ? (
                            <div className="mt-0.5 text-[12px] text-slate-500">{marker.address}</div>
                          ) : null}
                          <div className="mt-1 text-[12px] text-slate-600">
                            Class: {marker.buildingClass ?? "-"}
                            {typeof marker.distanceMiles === "number"
                              ? ` · ${marker.distanceMiles.toFixed(1)} mi away`
                              : ""}
                          </div>
                          {unitTypes.length > 0 ? (
                            <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                              {unitTypes.map((unitType) => (
                                <div key={unitType} className="flex items-center justify-between gap-4">
                                  <span className="text-slate-600">{unitType}</span>
                                  <span className="font-semibold">
                                    {formatCurrency(typeof rents[unitType] === "number" ? rents[unitType] : null)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                          {!isSubject ? (
                            <div className="mt-2 border-t border-slate-100 pt-2">
                              <span className="text-slate-600">Vs your avg: </span>
                              <span
                                className="font-semibold"
                                style={{
                                  color:
                                    typeof marker.vsYourAvg === "number"
                                      ? marker.vsYourAvg > 0
                                        ? "#16a34a"
                                        : marker.vsYourAvg < 0
                                          ? "#dc2626"
                                          : "#475569"
                                      : "#475569",
                                }}
                              >
                                {formatGap(marker.vsYourAvg ?? null)}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
            {!hasMarkers ? (
              <p className="mt-3 text-xs font-semibold text-slate-500">
                No map markers available — coordinates may not have been geocoded for this property yet.
              </p>
            ) : null}
            {normalizedPayload.map?.diagnostics && (normalizedPayload.map.diagnostics.geocodeFailedCount ?? 0) > 0 ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <span className="font-semibold">Geocoding note:</span>{" "}
                {normalizedPayload.map.diagnostics.geocodeFailedCount} of{" "}
                {normalizedPayload.map.diagnostics.geocodeTargetsCount ?? "-"} addresses could not be mapped.
              </div>
            ) : null}
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
            <p className="text-sm text-slate-600">{(normalizedPayload.comparables?.length ?? 0)} properties shown</p>
          </div>
          <div className="inline-flex items-center rounded-2xl bg-slate-100 p-1">
            {classOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setClassFilter(option)}
                className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                  classFilter === option ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="deal-lens-comps-table mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full table-auto">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="hover:text-slate-900"
                    onClick={() => {
                      setSortKey("name");
                      setSortDir((direction) => (sortKey === "name" ? (direction === "asc" ? "desc" : "asc") : "asc"));
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
                      setSortDir((direction) => (sortKey === "class" ? (direction === "asc" ? "desc" : "asc") : "asc"));
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
                      setSortDir((direction) => (sortKey === "distance" ? (direction === "asc" ? "desc" : "asc") : "asc"));
                    }}
                  >
                    Distance
                  </button>
                </th>
                {unitTypes.map((unitType) => (
                  <th key={unitType} className="px-4 py-3">
                    <button
                      type="button"
                      className="hover:text-slate-900"
                      onClick={() => {
                        const nextSortKey = `ut:${unitType}` as const;
                        setSortKey(nextSortKey);
                        setSortDir((direction) =>
                          sortKey === nextSortKey ? (direction === "asc" ? "desc" : "asc") : "asc"
                        );
                      }}
                    >
                      {unitType} IP
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="hover:text-slate-900"
                    onClick={() => {
                      setSortKey("vsYourAvg");
                      setSortDir((direction) => (sortKey === "vsYourAvg" ? (direction === "asc" ? "desc" : "asc") : "asc"));
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
                      setSortKey("source");
                      setSortDir((direction) => (sortKey === "source" ? (direction === "asc" ? "desc" : "asc") : "asc"));
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
                  {subjectName + " (You)"}
                  <div className="mt-1 text-xs font-medium text-slate-600">
                    {subjectLocation}
                  </div>
                </td>
                <td className="px-4 py-4">{subjectClass}</td>
                <td className="px-4 py-4">-</td>
                {unitTypes.map((unitType) => (
                  <td key={unitType} className="px-4 py-4">
                    {formatCurrency(normalizedPayload.subjectProperty?.inPlaceRents?.[unitType] ?? null)}
                  </td>
                ))}
                <td className="px-4 py-4">-</td>
                <td className="px-4 py-4 text-slate-600">Subject</td>
              </tr>

              {comparableRows.map((comp, index) => (
                <tr key={`${comp.name ?? "comp"}-${index}`} className="border-t text-sm">
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {comp.name ?? "-"}
                    <div className="mt-1 text-xs font-medium text-slate-600">{comp.address ?? ""}</div>
                  </td>
                  <td className="px-4 py-4">{comp.buildingClass ?? "-"}</td>
                  <td className="px-4 py-4">
                    {typeof comp.distanceMiles === "number" ? `${comp.distanceMiles.toFixed(1)} mi` : "-"}
                  </td>
                  {unitTypes.map((unitType) => (
                    <td key={unitType} className="px-4 py-4">
                      {formatCurrency(comp.inPlaceRents?.[unitType] ?? null)}
                    </td>
                  ))}
                  <td
                    className={`px-4 py-4 font-semibold ${
                      (comp.markerColor ?? "") === "green"
                        ? "text-green-600"
                        : (comp.markerColor ?? "") === "red"
                          ? "text-red-600"
                          : "text-slate-800"
                    }`}
                  >
                    {formatGap(comp.vsYourAvg ?? null)}
                  </td>
                  <td className="px-4 py-4 text-indigo-600">{comp.source ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
