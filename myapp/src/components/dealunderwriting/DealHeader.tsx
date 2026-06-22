import { Building2, Calendar, Download, MapPin } from "lucide-react";
import type { Deal } from "./data";

const strategyColors: Record<string, string> = {
  Core: "border-green-300 bg-green-100 text-green-800",
  "Core+": "border-blue-300 bg-blue-100 text-blue-800",
  "Value-Add": "border-amber-300 bg-amber-100 text-amber-800",
  Opportunistic: "border-red-300 bg-red-100 text-red-800",
};

export function DealHeader({
  deal,
  isInCompare,
  onAddCompare,
  onExportPdf,
}: {
  deal: Deal;
  isInCompare: boolean;
  onAddCompare: (id: string) => void;
  onExportPdf?: () => void;
}) {
  const strategyLabel = deal.dealScorecard?.investmentStyleFit?.bestMatch || deal.strategy;
  const strategyClass = strategyColors[strategyLabel] ?? strategyColors[deal.strategy];

  const noiLabel = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(deal.metrics.noi);

  return (
    <section className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <span className={`pdf-pill-text inline-flex h-8 items-center justify-center whitespace-nowrap rounded-full border px-3 text-sm font-semibold leading-none ${strategyClass}`}>
            {strategyLabel}
          </span>

          <h2 className="break-words text-2xl font-semibold text-[#102149] md:text-3xl xl:text-4xl">{deal.name}</h2>
        </div>

        <div className="pl-4 flex flex-wrap items-center gap-3 text-base text-[#62708d] md:text-lg">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {deal.address}
          </span>
          <span className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            {deal.units} units
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Built {deal.yearBuilt}
          </span>
          <span className="flex items-center gap-1">
            {/* <DollarSign className="h-4 w-4" /> */}
            {noiLabel} NOI
          </span>
        </div>
      </div>

      <div
        data-html2canvas-ignore="true"
        className="flex flex-wrap items-center gap-3 self-start"
      >
        <button
          type="button"
          onClick={onExportPdf}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-[#284f88] bg-white px-5 py-3 text-base font-semibold text-[#284f88] transition hover:bg-[#284f88] hover:text-white md:text-lg"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
        <button
          type="button"
          onClick={() => onAddCompare(deal.id)}
          className={`rounded-xl px-5 py-3 text-base font-semibold transition md:text-lg ${isInCompare
              ? "bg-[#284f88] text-white"
              : "border-2 border-[#284f88] bg-white text-[#284f88] hover:bg-[#284f88] hover:text-white"
            }`}
        >
          {isInCompare ? "In Compare" : "+ Add to Compare"}
        </button>
      </div>
    </section>
  );
}
