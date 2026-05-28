import { SectionHeader } from "./KpiStrip";
import { IcRiskAsset, IcRiskMetric, IcRiskRadarData } from "./types";

const hasText = (value?: string | null) => Boolean(value?.trim());

const hasRiskMetric = (metric?: IcRiskMetric | null) =>
  Boolean(metric && (hasText(metric.label) || hasText(metric.value) || hasText(metric.detail)));

const hasRiskAsset = (asset?: IcRiskAsset | null) =>
  Boolean(
    asset &&
      (hasText(asset.name) ||
        hasText(asset.description) ||
        hasText(asset.badge) ||
        asset.stats?.some((stat) => hasText(stat.label) || hasText(stat.value)))
  );

const metricLevelStyles = {
  low: {
    wrap: "bg-[#f4fbf7] border border-[#c7e8d7] border-l-2 border-l-[#1f9d68]",
    pill: "text-[#1f9d68]",
    dot: "bg-[#1f9d68]",
  },
  medium: {
    wrap: "bg-[#fffaf2] border border-[#edd9ab] border-l-2 border-l-[#c78512]",
    pill: "text-[#c78512]",
    dot: "bg-[#c78512]",
  },
  high: {
    wrap: "bg-[#fff7f7] border border-[#efcaca] border-l-2 border-l-[#c73636]",
    pill: "text-[#c73636]",
    dot: "bg-[#c73636]",
  },
};

const RiskMetricCard = ({ label, value, detail, level = "medium" }: IcRiskMetric) => {
  const style = metricLevelStyles[level];
  const stageLabel = detail ?? (level === "high" ? "ELEVATED" : level === "low" ? "LOW" : "WATCH");

  return (
    <div className={`rounded-xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)] ${style.wrap}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        <span className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${style.pill}`}>
          {stageLabel}
        </span>
      </div>
      <p className="min-h-[32px] text-2xl font-bold text-slate-950">{value ?? ""}</p>
      <p className="min-h-[16px] text-sm font-medium text-slate-700">{label ?? ""}</p>
    </div>
  );
};

const RiskAssetCard = ({ asset, fallbackTone }: { asset?: IcRiskAsset | null; fallbackTone: "red" | "yellow" }) => {
  const tone =
    asset?.badgeLevel === "red" || fallbackTone === "red"
      ? {
          wrap: "bg-[#fff8f8] border border-[#efd5d5] border-l-2 border-l-[#c73636] shadow-[0_1px_3px_rgba(15,23,42,0.05)]",
          badge: "bg-[#d14343] text-white",
          stat: "text-[#b42318]",
        }
      : {
          wrap: "bg-[#fffbf5] border border-[#efdfbe] border-l-2 border-l-[#c78512] shadow-[0_1px_3px_rgba(15,23,42,0.05)]",
          badge: "bg-[#c78512] text-white",
          stat: "text-[#a56a12]",
        };

  return (
    <div className={`rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)] ${tone.wrap}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="min-h-[20px] text-base font-bold text-slate-950">{asset?.name ?? ""}</h4>
        <span className={`inline-flex h-7 items-center justify-center whitespace-nowrap rounded-full px-3 text-xs font-bold leading-none ${tone.badge}`}>
          <span className="pdf-pill-text">{asset?.badge ?? ""}</span>
        </span>
      </div>
      <div className="mb-3 space-y-2 text-sm leading-7 text-slate-700">
        {(asset?.description ?? "")
          .split(". ")
          .filter(Boolean)
          .map((line, index, arr) => (
            <p key={index}>
              {line}
              {index < arr.length - 1 && !line.endsWith(".") ? "." : ""}
            </p>
          ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {Array.from({ length: Math.max(asset?.stats?.length ?? 0, 2) }).map((_, index) => {
          const stat = asset?.stats?.[index];
          return (
            <span key={index} className="text-slate-700">
              {stat?.label ?? ""}{" "}
              <span className={`font-bold ${tone.stat}`}>{stat?.value ?? ""}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

const RiskRadar = ({ data }: { data?: IcRiskRadarData | null }) => {
  const metrics = (data?.metrics ?? []).filter(hasRiskMetric);
  const assets = (data?.assets ?? []).filter(hasRiskAsset);

  if (!metrics.length && !assets.length) return null;

  return (
    <section>
      <SectionHeader number="06" title="Risk Radar" />
      {metrics.length ? (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((metric, index) => (
            <RiskMetricCard key={index} {...metric} />
          ))}
        </div>
      ) : null}

      {assets.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-rose-600">
            Underperforming Assets
          </p>
          <div className="grid grid-cols-1 gap-4">
            {assets.map((asset, index) => (
              <RiskAssetCard key={index} asset={asset} fallbackTone={index === 0 ? "red" : "yellow"} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default RiskRadar;
