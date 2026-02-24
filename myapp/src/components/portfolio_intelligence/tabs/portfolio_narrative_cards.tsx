import React from "react";
import type { PortfolioNarrative } from "../portfolio_narratives";

type PortfolioNarrativeCardProps = {
  tabLabel: string;
  narrative: PortfolioNarrative;
};

export const PortfolioOverviewCard: React.FC<PortfolioNarrativeCardProps> = ({
  tabLabel,
  narrative,
}) => {
  return (
    <section className="portfolio-story-card relative overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.12)] md:p-8">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-900">
              Overview
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {tabLabel}
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            Portfolio Intelligence Summary
          </h3>
          <div className="space-y-3 text-[15px] leading-7 text-slate-700">
            {narrative.overview.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
        <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <img
            src={narrative.imageUrl}
            alt="Real estate visual"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/10 to-transparent" />
          <div className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
            Portfolio View
          </div>
          <div className="portfolio-float-icon absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
            Insight
          </div>
        </div>
      </div>
    </section>
  );
};

export const PortfolioGuidedRecommendationCard: React.FC<PortfolioNarrativeCardProps> = ({
  narrative,
}) => {
  return (
    <section className="portfolio-recommendation-card relative overflow-hidden rounded-[30px] border border-blue-900/20 bg-gradient-to-br from-[#0f172a] via-[#1d2f6f] to-[#143f7a] p-6 text-white shadow-[0_24px_64px_rgba(15,23,42,0.35)] md:p-8">
      <div className="absolute -top-20 right-0 h-52 w-52 rounded-full bg-sky-300/20 blur-3xl" />
      <div className="absolute -bottom-20 left-0 h-52 w-52 rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Execution Priorities
          </span>
        </div>
        <h3 className="mt-4 text-2xl font-semibold md:text-3xl">AI Guided Recommendations</h3>
        <ul className="mt-5 space-y-3">
          {narrative.recommendations.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[15px] leading-7 backdrop-blur-sm"
            >
              <span className="portfolio-float-icon mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
