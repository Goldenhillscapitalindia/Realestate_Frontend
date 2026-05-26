import { Brain, TrendingUp } from "lucide-react";
import type { Deal } from "./data";

const signalStyles: Record<string, string> = {
  "Strong Buy": "border-emerald-300 bg-emerald-500/15 text-emerald-100",
  Buy: "border-sky-300 bg-sky-500/15 text-sky-100",
  Neutral: "border-amber-300 bg-amber-500/15 text-amber-100",
  Avoid: "border-red-300 bg-red-500/15 text-red-100",
};

export function AISnapshot({ deal }: { deal: Deal }) {
  return (
    <section className="pdf-ai-snapshot mb-6 rounded-2xl bg-[#2f568f] p-6 text-white shadow-[0_20px_50px_rgba(13,27,79,0.18)]">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#d7e5ff]">
        <Brain className="h-4 w-4" />
        <span>AI Acquisition Snapshot</span>
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
        <div className="flex items-center gap-4">
          <TrendingUp className="h-9 w-9 text-[#bcd4ff]" />
          <div>
            <p className="pdf-ai-label text-md text-[#d7e5ff]">Recommendation</p>
            <span
              className={`pdf-signal-pill mt-2 inline-flex h-8 items-center justify-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold leading-none ${
                signalStyles[deal.signal]
              }`}
            >
              <span className="pdf-signal-pill-text">{deal.signal}</span>
            </span>
          </div>
        </div>

        <div className="md:pl-9">
          <p className="pdf-ai-label text-md text-[#d7e5ff]">Investment Thesis</p>
          <p className="mt-2 text-base leading-7 text-white/95">{deal.thesis}</p>
        </div>
      </div>
    </section>
  );
}
