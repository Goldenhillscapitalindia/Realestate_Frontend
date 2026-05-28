import { IcKpiItem, IcSignal } from "./types";

const hasText = (value?: string | null) => Boolean(value?.trim());

const hasKpiItem = (item?: IcKpiItem | null) =>
  Boolean(item && (hasText(item.label) || hasText(item.value) || hasText(item.subtitle)));

export const SectionHeader = ({ number, title }: { number: string; title: string }) => (
  <div className="pdf-section-header mb-5 flex items-center gap-3">
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0d1b4f] text-xs font-bold text-white">
      {number}
    </span>
    <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
    <div className="h-px flex-1 bg-slate-200" />
  </div>
);

const signalStyles: Record<IcSignal, { dot: string; border: string }> = {
  green: { dot: "bg-emerald-500", border: "border-emerald-100" },
  yellow: { dot: "bg-amber-400", border: "border-amber-100" },
  red: { dot: "bg-rose-500", border: "border-rose-100" },
  neutral: { dot: "bg-slate-300", border: "border-slate-200" },
};

const KpiCard = ({ label, value, signal = "neutral", subtitle }: IcKpiItem) => {
  const style = signalStyles[signal];
  return (
    <div className={`rounded-xl border bg-white p-5 ${style.border}`}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
          {label ?? ""}
        </span>
        <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
      </div>
      <p className="min-h-[32px] text-2xl font-bold tracking-tight text-slate-900">
        {value ?? ""}
      </p>
      <p className="mt-1 min-h-[16px] text-xs text-slate-500">{subtitle ?? ""}</p>
    </div>
  );
};

const KpiStrip = ({ items = [] }: { items?: IcKpiItem[] | null }) => {
  const visibleItems = (items ?? []).filter(hasKpiItem);

  if (!visibleItems.length) return null;

  return (
    <section>
      <SectionHeader number="02" title="Portfolio KPIs" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {visibleItems.map((item, index) => (
          <KpiCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
};

export default KpiStrip;
