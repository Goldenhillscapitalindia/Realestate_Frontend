import { SectionHeader } from "./KpiStrip";
import { IcExecutionPrioritiesData, IcExecutionPriorityItem } from "./types";

const hasText = (value?: string | null) => Boolean(value?.trim());

const hasExecutionPriority = (item?: IcExecutionPriorityItem | null) =>
  Boolean(item && (hasText(item.action) || hasText(item.impact) || hasText(item.detail) || hasText(item.priority)));

const priorityStyles = {
  HIGH: { bg: "bg-[#B91C1C]", text: "text-white" },
  MEDIUM: { bg: "bg-[#EAB308]", text: "text-[#1F2937]" },
  MONITOR: { bg: "bg-[#475569]", text: "text-white" },
};

const ExecutionPriorities = ({ data }: { data?: IcExecutionPrioritiesData | null }) => {
  const items = (data?.items ?? []).filter(hasExecutionPriority);

  if (!items.length) return null;

  return (
    <section className="pdf-flow-block">
      <SectionHeader number="09" title="Execution Priorities" />
      <div className="space-y-3">
        {items.map((item, index) => {
          const priority = item?.priority ?? "MONITOR";
          const style = priorityStyles[priority];

          return (
            <div
              key={index}
              className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-9 min-w-[84px] flex-shrink-0 items-center justify-center rounded-lg px-3 ${style.bg}`}>
                  <span className={`text-[11px] font-bold tracking-[0.16em] ${style.text}`}>{item?.priority ?? ""}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 min-h-[20px] text-base font-semibold text-[#1E293B]">{item?.action ?? ""}</p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      <span className="text-[#0F766E]">→</span>
                      <span>{item?.impact ?? ""}</span>
                    </span>
                    <span className="text-sm text-slate-400">{item?.detail ?? ""}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ExecutionPriorities;
