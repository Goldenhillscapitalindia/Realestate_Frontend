import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { AISnapshot } from "./AISnapshot";
import { AppSidebar } from "./AppSidebar";
import { ComparisonBar } from "./ComparisonBar";
import { ComparisonView } from "./ComparisonView";
import { DealCharts } from "./DealCharts";
import { DealHeader } from "./DealHeader";
import { DealScorecard } from "./DealScorecard";
import { getBarColor } from "./DealScorecard";
import { KeyMetrics } from "./KeyMetrics";
import { RisksOpportunities } from "./RisksOpportunities";
import { WhatMovesTheDeal } from "./WhatMovesTheDeal";
import { deleteUserDealUnderwriting, getDealById, useDealUnderwritingData } from "./data";
import PfDealUnderwritingUpload from "./pf_dealunderwriting_upload";
import { Search, Trash2 } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { exportElementToPdf } from "@/lib/pdf-export";

const DealCompAnalysis = lazy(() => import("./DealCompAnalysis"));

interface DealUnderwritingLensProps {
  onScreenChange?: (screen: "library" | "upload" | "detail") => void;
}

export default function DealUnderwritingLens({ onScreenChange }: DealUnderwritingLensProps) {
  const demoMode = isDemoMode();
  const [activeDealId, setActiveDealId] = useState("");
  const [activeView, setActiveView] = useState<"deal" | "compare">("deal");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [screen, setScreen] = useState<"library" | "upload" | "detail">("library");
  const [search, setSearch] = useState("");
  const [pendingPropertyName, setPendingPropertyName] = useState("");
  const [dealToDelete, setDealToDelete] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { deals, loading, error, refresh } = useDealUnderwritingData();

  const activeDeal = getDealById(deals, activeDealId) ?? deals[0];

  useEffect(() => {
    if (!activeDealId && deals.length) {
      setActiveDealId(deals[0].id);
    }
  }, [activeDealId, deals]);

  useEffect(() => {
    if (!pendingPropertyName) return;

    const matchedDeal = deals.find(
      (deal) => deal.name.trim().toLowerCase() === pendingPropertyName.trim().toLowerCase()
    );

    if (!matchedDeal) return;

    setActiveDealId(matchedDeal.id);
    setPendingPropertyName("");
    setScreen("detail");
  }, [deals, pendingPropertyName]);

  useEffect(() => {
    onScreenChange?.(screen);
  }, [onScreenChange, screen]);

  const openDeal = useCallback((id: string) => {
    setActiveDealId(id);
    setActiveView("deal");
    setScreen("detail");
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 2) return [current[1], id];
      return [...current, id];
    });
  }, []);

  const handleDealDelete = useCallback(async () => {
    const selectedName = dealToDelete.trim();
    if (!selectedName || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteUserDealUnderwriting(selectedName);
      if (activeDeal?.name?.trim().toLowerCase() === selectedName.toLowerCase()) {
        setActiveDealId("");
        setScreen("library");
      }
      setDealToDelete("");
      await refresh();
    } catch {
      alert("Unable to delete deal underwriting property.");
    } finally {
      setIsDeleting(false);
    }
  }, [dealToDelete, isDeleting, activeDeal, refresh]);

  const compareDeals = compareIds
    .map((id) => getDealById(deals, id))
    .filter((deal): deal is NonNullable<typeof deal> => Boolean(deal));

  const sidebarDeals = activeView === "compare" ? compareDeals : activeDeal ? [activeDeal] : [];

  const filteredDeals = deals.filter((deal) =>
    `${deal.name} ${deal.location} ${deal.submarket ?? ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-[28px] bg-[#f8fbff] text-[#62708d]">
        Loading deal underwriting data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-[28px] bg-[#f8fbff] text-[#b42318]">
        {error}
      </div>
    );
  }

  if (screen === "upload") {
    return (
      <PfDealUnderwritingUpload
        onBack={() => setScreen("library")}
        onSubmitted={async (propertyName) => {
          setPendingPropertyName(propertyName);
          await refresh();
        }}
      />
    );
  }

  if (!deals.length) {
    return (
      <section className="mx-auto max-w-[1280px] rounded-[32px] border border-[#d8e2f1] bg-white px-10 py-12 text-[#102149] shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            {/* <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#b48a41]">Deal Lens</p> */}
            <h1 className="mt-3 text-5xl font-bold tracking-[-0.04em]">Deal Lens</h1>
            <p className="mt-4 max-w-3xl text-lg text-[#587091]">
              No property data available for underwriting.
            </p>
          </div>
          {!demoMode ? (
            <button
              type="button"
              onClick={() => setScreen("upload")}
              className="rounded-full bg-[linear-gradient(90deg,#a54cf5,#5d6df9)] px-7 py-4 text-lg font-semibold text-white shadow-[0_18px_45px_rgba(118,90,255,0.35)] transition hover:scale-[1.02]"
            >
              + Add Property
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  if (screen === "library") {
    return (
      <section className="mx-auto max-w-[1280px] rounded-[32px] border border-[#d8e2f1] bg-white px-10 py-12 text-[#102149] shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            {/* <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#b48a41]">Deal Lens</p> */}
            <h1 className="mt-3 text-5xl font-bold tracking-[-0.04em]">Deal Lens</h1>
            <p className="mt-4 max-w-3xl text-lg text-[#587091]">
              Click a property to preview its stored memorandum, T12, and rent roll responses.
            </p>
          </div>
          {!demoMode ? (
            <div className="flex items-center gap-3">
              <select
                value={dealToDelete}
                onChange={(e) => setDealToDelete(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleDealDelete();
                  }
                }}
                className="h-12 min-w-[260px] rounded-full border border-[#d8e2f1] bg-white px-4 text-[15px] text-[#102149] outline-none focus:border-[#6677d7]"
              >
                <option value="">Select property to delete</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.name}>
                    {deal.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleDealDelete}
                disabled={!dealToDelete || isDeleting}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-[#f0c7c7] bg-[#fff4f4] px-5 text-sm font-semibold text-[#b42318] transition hover:bg-[#ffe9e9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>

              <button
                type="button"
                onClick={() => setScreen("upload")}
                className="rounded-full bg-[linear-gradient(90deg,#a54cf5,#5d6df9)] px-7 py-4 text-lg font-semibold text-white shadow-[0_18px_45px_rgba(118,90,255,0.35)] transition hover:scale-[1.02]"
              >
                + Add Property
              </button>
            </div>
          ) : null}
        </div>

        <div className="relative mt-10">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#707aa0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="h-14 w-full rounded-2xl border border-[#d8e2f1] bg-[#f9fbff] pl-14 pr-4 text-[16px] text-[#102149] placeholder:text-[#6f789d] outline-none transition focus:border-[#6677d7]"
          />
        </div>

        <div className="mt-8 rounded-[32px] border border-[#d8e2f1] bg-[#fbfcff] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
          <div className="space-y-4">
            {filteredDeals.map((deal) => (
              <button
                key={deal.id}
                type="button"
                onClick={() => openDeal(deal.id)}
                className="w-full rounded-[28px] border border-[#d8e2f1] bg-white px-10 py-8 text-left transition hover:border-[#5c74ea] hover:bg-[#f7faff]"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-4xl font-semibold tracking-[-0.03em] text-[#102149]">{deal.name}</p>
                    <p className="mt-2 text-xl text-[#587091]">{deal.location || deal.address || "-"}</p>
                  </div>

                  <div className="w-full max-w-[320px] shrink-0 lg:ml-8">
                    <div className="mb-2 flex items-center justify-between gap-4 text-lg">
                      <span className="font-semibold text-[#102149]">Overall Deal Score</span>
                      <span className="text-3xl font-bold text-[#102149]">{deal.scores.overall}</span>
                    </div>
                    <div className="h-4 rounded-full bg-[#edf2fb]">
                      <div
                        className={`h-4 rounded-full ${getBarColor(deal.scores.overall)}`}
                        style={{ width: `${deal.scores.overall}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {[
                    { label: "Memorandum", ready: deal.docStatus?.memorandum },
                    { label: "T12", ready: deal.docStatus?.t12 },
                    { label: "Rent Roll", ready: deal.docStatus?.rentRoll },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-sm font-semibold uppercase tracking-[0.12em] text-[#102149]">
                        {item.label}
                      </span>
                      <span
                        className={
                          item.ready
                            ? "rounded-full border border-[#14d8a4]/70 bg-[#0c3d36] px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[#58f0c8]"
                            : "rounded-full border border-[#d8e2f1] bg-[#f4f7fb] px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[#7b89a8]"
                        }
                      >
                        {item.ready ? "Ready" : "Missing"}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
            {!filteredDeals.length ? (
              <div className="rounded-3xl border border-[#d8e2f1] bg-white px-8 py-10 text-center text-[#94a1c3]">
                No properties match your search.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="flex min-h-screen gap-6 overflow-hidden rounded-[28px] bg-[#f5f7fb] shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
      <AppSidebar
        activeDealId={activeDeal.id}
        activeView={activeView}
        deals={sidebarDeals}
        onBackToLibrary={() => setScreen("library")}
        onDealSelect={openDeal}
        onViewChange={setActiveView}
      />
      <main className="min-w-0 flex-1 overflow-y-auto bg-[#f8fbff]">
        <div className="mx-auto max-w-[1480px] px-8 py-10 pb-28 2xl:px-10">
          {activeView === "deal" ? (
            <div id="deal-underwriting-pdf-export" className="space-y-6">
              <div className="pdf-flow-block deal-underwriting-first-page space-y-5 ">
                <DealHeader
                  deal={activeDeal}
                  isInCompare={compareIds.includes(activeDeal.id)}
                  onAddCompare={toggleCompare}
                  onExportPdf={() =>
                    exportElementToPdf({
                      elementId: "deal-underwriting-pdf-export",
                      fileName: `dealunderwriting_${activeDeal.name}`,
                      orientation: "l",
                      format: "a3",
                      pageMarginMm: 8,
                      paginateByChildren: true,
                      exportWidthPx: 1587,  // was 1240
                      imageScale: 2,
                      backgroundColor: "#dce4ef",
                      pageBackgroundColors: [
                        "#dce4ef",
                        "#e9e3eb",
                        "#e1ebe3",
                        "#f2ebe4",
                      ],
                      generatedPagePaddingPx: 0,
                    })
                  }
                />
                <div>
                  <AISnapshot deal={activeDeal} />
                </div>
                <div>
                  <KeyMetrics deal={activeDeal} />
                </div>
                <div className="grid gap-4 xl:grid-cols-3">
                  <div className="xl:col-span-1">
                    <DealScorecard deal={activeDeal} />
                  </div>
                  <div className="xl:col-span-2">
                    <WhatMovesTheDeal deal={activeDeal} />
                  </div>
                </div>
              </div>

              <DealCharts deal={activeDeal} />

              {activeDeal.compAnalysis ? (
                <Suspense fallback={null}>
                  <DealCompAnalysis
                    propertyName={activeDeal.name}
                    payload={activeDeal.compAnalysis}
                  />
                </Suspense>
              ) : null}
              <div className="pdf-flow-block">
                <RisksOpportunities deal={activeDeal} />
              </div>
            </div>
          ) : (
            <ComparisonView deals={compareDeals} />
          )}
          <div>
            <ComparisonBar
            compareIds={compareIds}
            deals={deals}
            onAdd={toggleCompare}
            onRemove={(id) => setCompareIds((current) => current.filter((item) => item !== id))}
            onCompare={() => setActiveView("compare")}
          />
          </div>
        </div>
      </main>
    </div>
  );
}
