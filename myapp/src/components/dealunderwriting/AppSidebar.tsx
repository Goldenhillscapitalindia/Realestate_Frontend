import { ArrowLeft, BarChart3, Building2, GitCompare, TrendingUp } from "lucide-react";
import type { Deal } from "./data";

interface AppSidebarProps {
  activeDealId: string;
  activeView: "deal" | "compare";
  deals: Deal[];
  onBackToLibrary?: () => void;
  onDealSelect: (id: string) => void;
  onViewChange: (view: "deal" | "compare") => void;
}

export function AppSidebar({
  activeDealId,
  activeView,
  deals,
  onBackToLibrary,
  onDealSelect,
  onViewChange,
}: AppSidebarProps) {
  return (
    <aside className="w-64 min-h-screen flex-shrink-0 self-stretch bg-[#14294d] text-white">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-white/10 p-5">
          {onBackToLibrary ? (
            <button
              type="button"
              onClick={onBackToLibrary}
              className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white"
              aria-label="Back to Deal Lens"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : null}

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#234b88]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Deal Lens</h1>
              <p className="text-xs text-white/65">Pre Underwriting Engine</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <p className="mb-3 px-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
            Deal Pipeline
          </p>
          <div className="space-y-2">
            {deals.map((deal) => {
              const isActive = activeView === "deal" && activeDealId === deal.id;
              return (
                <button
                  key={deal.id}
                  type="button"
                  onClick={() => {
                    onDealSelect(deal.id);
                    onViewChange("deal");
                  }}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    isActive
                      ? "border-[#1ebc9a]/50 bg-[#0c7a66]/18 text-[#6ef0d4]"
                      : "border-transparent bg-white/0 text-white/75 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{deal.name}</p>
                      <p className="mt-1 text-xs text-inherit/70">
                        {deal.units} units - {deal.strategy}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <p className="mb-3 px-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
              Analysis
            </p>
            <button
              type="button"
              onClick={() => onViewChange("compare")}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                activeView === "compare"
                  ? "border-[#1ebc9a]/50 bg-[#0c7a66]/18 text-[#6ef0d4]"
                  : "border-transparent bg-white/0 text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              <GitCompare className="h-4 w-4" />
              <span className="font-medium">Compare Deals</span>
            </button>
          </div>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-2 px-2 text-xs text-white/55">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{deals.length} deals in pipeline</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
