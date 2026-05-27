import { IcHeroData, IcHeroHighlight } from "./types";

const badgeTone = (signal?: string | null) => {
  if (signal === "green") return "bg-emerald-400/15 text-emerald-200";
  if (signal === "yellow") return "bg-amber-300/15 text-amber-100";
  if (signal === "red") return "bg-rose-300/15 text-rose-100";
  return "bg-white/10 text-white/80";
};

const HeroHighlight = ({ icon, text, signal }: IcHeroHighlight) => (
  <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/5 p-3">
    <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${badgeTone(signal)}`}>
      {icon ?? ""}
    </span>
    <span className="min-h-[40px] text-sm leading-snug text-white/80">{text ?? ""}</span>
  </div>
);

const HeroSection = ({ data }: { data?: IcHeroData | null }) => {
  const highlights = data?.highlights ?? [];

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[#0A1B54] p-8 text-white md:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(75,102,191,0.14),transparent_34%),linear-gradient(135deg,#081544_0%,#0A1B54_58%,#12286A_100%)]" />
      <div className="relative z-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9cb2ff]">
              Confidential - Investment Committee Memo
            </p>
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              {data?.companyName ?? ""}
            </h1>
            <p className="text-lg font-light text-white/65">{data?.reportTitle ?? ""}</p>
          </div>
          <div className="text-right">
            <div className="pdf-report-month inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 backdrop-blur-sm">
              <span className="block h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
              <span className="pdf-report-month-text block whitespace-nowrap text-sm font-medium leading-none">{data?.reportMonth ?? ""}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#9cb2ff]">
            Performance Verdict
          </p>
          <p className="max-w-3xl text-xl font-semibold leading-relaxed md:text-2xl">
            {data?.verdict ?? ""}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: Math.max(highlights.length, 4) }).map((_, index) => (
            <HeroHighlight key={index} {...(highlights[index] ?? {})} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
