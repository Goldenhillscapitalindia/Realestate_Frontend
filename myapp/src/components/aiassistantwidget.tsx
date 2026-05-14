import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  FileText,
  Loader2,
  Send,
  Sparkles,
  Table2,
} from "lucide-react";
import { Bar, Bubble, Line, Pie, Scatter } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { authClient } from "@/lib/auth-api";
import { getAuthUser } from "@/lib/auth";


ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

type AssistantModule = "property_analytics" | "portfolio_intelligence" | "deal_lens" | "ic_memo";

type AssistantWidgetProps = {
  mode?: "widget" | "page" | "sidebar";
  module?: AssistantModule;
  propertyName?: string;
  title?: string;
  contextLabel?: string;
};

type BaseBlock = {
  type: string;
  row?: number;
  column?: number;
  total_columns?: number;
};

type TextBlock = BaseBlock & {
  type: "text";
  content: string;
};

type CardBlock = BaseBlock & {
  type: "card";
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
};

type TableBlock = BaseBlock & {
  type: "table";
  headers: string[];
  rows: Array<Array<string | number | null>>;
};

type ChartBlock = BaseBlock & {
  type: "chart";
  chartType: string;
  title: string;
  data: any;
};

type LinkBlock = BaseBlock & {
  type: "link";
  text: string;
  url: string;
};

type SuggestedQuestionsBlock = {
  type: "suggested_questions";
  questions: string[];
};

type AssistantBlock =
  | TextBlock
  | CardBlock
  | TableBlock
  | ChartBlock
  | LinkBlock
  | SuggestedQuestionsBlock;

type AssistantResponse = {
  answer?: AssistantBlock[] | string;
  error?: string;
  details?: string;
};

type ChatTurn = {
  id: string;
  question: string;
  blocks: AssistantBlock[];
  isLoading?: boolean;
  error?: string;
};

const fallbackSuggestedQuestionsByModule: Record<AssistantModule | "general_asset72", string[]> = {
  property_analytics: [
    "What drove revenue changes over the last 12 months?",
    "Which expenses increased the most YoY?",
    "What actions would improve NOI fastest?",
  ],
  portfolio_intelligence: [
    "Which properties contribute the most NOI?",
    "Which properties are underperforming?",
    "Which assets have highest rollover risk?",
  ],
  ic_memo: [
    "Generate acquisition summary",
    "Create IC memo",
    "Summarize investment thesis",
  ],
  deal_lens: [
    "Is this deal attractive?",
    "What are the biggest risks?",
    "What assumptions require validation?",
  ],
  general_asset72: [
    "What does Asset72 show about my property performance?",
    "Which property has the strongest occupancy?",
    "Explain NOI margin and operating expense ratio.",
  ],
};

const getFallbackSuggestedQuestions = (module?: AssistantModule) =>
  fallbackSuggestedQuestionsByModule[module ?? "general_asset72"];

const getCurrentUser = async () => {
  const cached = getAuthUser();
  if (cached?.email) return cached;

  const response = await authClient.get<{ user?: { email?: string; name?: string } }>("/api/auth/me/");
  return response.data?.user;
};

const isSuggestedQuestionsBlock = (block: AssistantBlock): block is SuggestedQuestionsBlock =>
  block?.type === "suggested_questions";

const getIcon = (icon?: string) => {
  const key = (icon || "").toLowerCase();
  if (key.includes("table")) return Table2;
  if (key.includes("file")) return FileText;
  if (key.includes("chart")) return BarChart3;
  if (key.includes("risk") || key.includes("activity")) return Activity;
  return Building2;
};

const normalizeBlocks = (answer: AssistantBlock[] | string): AssistantBlock[] => {
  if (typeof answer === "string") {
    return [
      {
        type: "text",
        row: 1,
        column: 1,
        total_columns: 1,
        content: answer,
      },
    ];
  }
  return Array.isArray(answer) ? answer : [];
};

const groupBlocksByRow = (blocks: AssistantBlock[]) => {
  const grouped = new Map<number, Exclude<AssistantBlock, SuggestedQuestionsBlock>[]>();

  blocks
    .filter((block): block is Exclude<AssistantBlock, SuggestedQuestionsBlock> => !isSuggestedQuestionsBlock(block))
    .forEach((block, index) => {
      const row = Number(block.row ?? index + 1);
      const existing = grouped.get(row) ?? [];
      existing.push(block);
      grouped.set(row, existing);
    });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([row, rowBlocks]) => [
      row,
      rowBlocks.sort((a, b) => Number(a.column ?? 1) - Number(b.column ?? 1)),
    ] as const);
};

const componentShell =
  "rounded-xl border shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition";

const TextRenderer = ({ block, isDark }: { block: TextBlock; isDark: boolean }) => (
  <div
    className={`${componentShell} p-5 ${
      isDark
        ? "border-cyan-400/15 bg-[#102833] text-slate-100"
        : "border-slate-200 bg-white text-slate-800"
    }`}
  >
    <div
      className={`prose max-w-none text-sm leading-6 ${
        isDark ? "prose-invert prose-p:text-slate-100" : "prose-slate"
      }`}
    >
      <ReactMarkdown>{block.content}</ReactMarkdown>
    </div>
  </div>
);

const CardRenderer = ({ block, isDark }: { block: CardBlock; isDark: boolean }) => {
  const Icon = getIcon(block.icon);

  return (
    <div
      className={`${componentShell} h-full p-5 ${
        isDark
          ? "border-cyan-400/15 bg-[#133244] text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isDark ? "bg-cyan-400/10 text-cyan-300" : "bg-sky-50 text-sky-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-tight">{block.title}</h3>
          {block.subtitle && (
            <p className={`mt-1 text-xs ${isDark ? "text-cyan-100/70" : "text-slate-500"}`}>
              {block.subtitle}
            </p>
          )}
        </div>
      </div>
      {block.description && (
        <div className={`mt-4 text-sm leading-6 ${isDark ? "text-slate-200" : "text-slate-600"}`}>
          <ReactMarkdown>{block.description}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

const TableRenderer = ({ block, isDark }: { block: TableBlock; isDark: boolean }) => (
  <div
    className={`${componentShell} overflow-hidden ${
      isDark
        ? "border-cyan-400/15 bg-[#102833] text-slate-100"
        : "border-slate-200 bg-white text-slate-800"
    }`}
  >
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className={isDark ? "bg-cyan-400/10 text-cyan-100" : "bg-slate-50 text-slate-600"}>
          <tr>
            {(block.headers || []).map((header) => (
              <th key={header} className="whitespace-nowrap px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(block.rows || []).map((row, rowIndex) => (
            <tr
              key={`row-${rowIndex}`}
              className={isDark ? "border-t border-white/10" : "border-t border-slate-100"}
            >
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top">
                  {cell ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ChartRenderer = ({ block, isDark }: { block: ChartBlock; isDark: boolean }) => {
  const type = (block.chartType || "").toLowerCase();
  const chartMap: Record<string, React.ElementType> = {
    pie: Pie,
    bar: Bar,
    line: Line,
    area: Line,
    scatter: Scatter,
    bubble: Bubble,
    stackedbar: Bar,
  };
  const ChartComponent = chartMap[type];

  const chartData = useMemo(() => {
    if (["scatter", "bubble"].includes(type) && Array.isArray(block.data)) {
      return {
        datasets: [
          {
            label: block.title,
            data: block.data,
            backgroundColor: isDark ? "#22d3ee" : "#0ea5e9",
          },
        ],
      };
    }

    if (type === "area" && block.data?.datasets) {
      return {
        ...block.data,
        datasets: block.data.datasets.map((dataset: any) => ({
          ...dataset,
          fill: true,
          backgroundColor: dataset.fillColor || dataset.backgroundColor || "rgba(14,165,233,0.22)",
          borderColor: dataset.borderColor || "#0ea5e9",
          tension: 0.35,
        })),
      };
    }

    return block.data;
  }, [block.data, block.title, isDark, type]);

  if (!ChartComponent) {
    return (
      <div
        className={`${componentShell} p-5 text-sm ${
          isDark ? "border-rose-400/30 bg-rose-950/30 text-rose-100" : "border-rose-200 bg-rose-50 text-rose-700"
        }`}
      >
        Unsupported chart type: {block.chartType}
      </div>
    );
  }

  const options: any = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: isDark ? "#dbeafe" : "#334155" },
      },
      tooltip: {
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        bodyColor: isDark ? "#ffffff" : "#0f172a",
        titleColor: isDark ? "#ffffff" : "#0f172a",
        borderColor: isDark ? "rgba(34,211,238,0.35)" : "rgba(148,163,184,0.4)",
        borderWidth: 1,
      },
    },
    ...(type !== "pie"
      ? {
          scales: {
            x: {
              stacked: type === "stackedbar",
              ticks: { color: isDark ? "#cbd5e1" : "#475569" },
              grid: { color: isDark ? "rgba(148,163,184,0.12)" : "rgba(148,163,184,0.22)" },
            },
            y: {
              stacked: type === "stackedbar",
              ticks: { color: isDark ? "#cbd5e1" : "#475569" },
              grid: { color: isDark ? "rgba(148,163,184,0.12)" : "rgba(148,163,184,0.22)" },
            },
          },
        }
      : {}),
  };

  return (
    <div
      className={`${componentShell} p-5 ${
        isDark
          ? "border-cyan-400/15 bg-[#102833] text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <h3 className="mb-4 text-base font-semibold">{block.title}</h3>
      <div className="h-[340px] w-full">
        <ChartComponent data={chartData} options={options} />
      </div>
    </div>
  );
};

const LinkRenderer = ({ block, isDark }: { block: LinkBlock; isDark: boolean }) => (
  <a
    href={block.url || "#"}
    target="_blank"
    rel="noreferrer"
    className={`${componentShell} flex items-center justify-between gap-3 p-5 text-sm font-semibold ${
      isDark
        ? "border-cyan-400/20 bg-[#102833] text-cyan-200 hover:border-cyan-300/50"
        : "border-slate-200 bg-white text-sky-700 hover:border-sky-200"
    }`}
  >
    {block.text}
    <ArrowRight className="h-4 w-4" />
  </a>
);

const BlocksRenderer = ({
  blocks,
  isDark,
  compact = false,
}: {
  blocks: AssistantBlock[];
  isDark: boolean;
  compact?: boolean;
}) => {
  const rows = groupBlocksByRow(blocks);

  // Global counter so each block (across all rows) animates in one-by-one
  let blockOrder = 0;

  return (
    <div className="w-full space-y-4">
      {rows.map(([row, rowBlocks]) => {
        const totalColumns = Math.max(
          ...rowBlocks.map((block) => Number(block.total_columns ?? 1)),
          1,
        );

        return (
          <div
            key={row}
            className="grid gap-4"
            style={{
              gridTemplateColumns: compact
                ? "minmax(0, 1fr)"
                : `repeat(${Math.min(totalColumns, 4)}, minmax(0, 1fr))`,
            }}
          >
            {rowBlocks.map((block, index) => {
              const orderIndex = blockOrder++;
              return (
                <motion.div
                  key={`${row}-${block.type}-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: orderIndex * 0.25, duration: 0.45, ease: "easeOut" }}
                  className="min-w-0 max-lg:col-span-full"
                >
                  {block.type === "text" && <TextRenderer block={block as TextBlock} isDark={isDark} />}
                  {block.type === "card" && <CardRenderer block={block as CardBlock} isDark={isDark} />}
                  {block.type === "table" && <TableRenderer block={block as TableBlock} isDark={isDark} />}
                  {block.type === "chart" && <ChartRenderer block={block as ChartBlock} isDark={isDark} />}
                  {block.type === "link" && <LinkRenderer block={block as LinkBlock} isDark={isDark} />}
                </motion.div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const AssistantWidget: React.FC<AssistantWidgetProps> = ({
  module,
  propertyName,
  title = "Asset72 AI Analyst",
  contextLabel,
}) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AssistantBlock[]>([]);
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const latestQuestion = useRef("");
  const turnCounterRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = useMemo(() => {
    const fromAnswer = answer.find(isSuggestedQuestionsBlock)?.questions;
    return fromAnswer && fromAnswer.length >= 3 ? fromAnswer : getFallbackSuggestedQuestions(module);
  }, [answer, module]);

  const updateQuestion = (value: string) => {
    latestQuestion.current = value;
    setQuestion(value);
  };

  useEffect(() => {
    latestQuestion.current = question;
  }, [question]);

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    // Keep the newest chat turn visible after each question or response update.
    if (chatTurns.length > 0 || loading) {
      requestAnimationFrame(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }, [chatTurns, loading]);

  const handleSubmit = async (e?: React.FormEvent | Event, customQuestion?: string) => {
    if (e?.preventDefault) e.preventDefault();
    const query = (customQuestion ?? latestQuestion.current ?? question).trim();
    if (!query || loading) return;

    const turnId = `turn-${Date.now()}-${turnCounterRef.current}`;
    turnCounterRef.current += 1;
    setLoading(true);
    setChatTurns((prev) => [
      ...prev,
      {
        id: turnId,
        question: query,
        blocks: [],
        isLoading: true,
      },
    ]);
    updateQuestion("");

    try {
      const user = await getCurrentUser();
      const email = user?.email;

      if (!email) {
        throw new Error("Please log in again before using the assistant.");
      }

      const payload: Record<string, string> = {
        email,
        question: query,
      };
      if (module) payload.module = module;
      if (propertyName?.trim()) payload.property_name = propertyName.trim();

      const response = await authClient.post<AssistantResponse>("/api/assistant_chat/", payload);

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      if (!response.data?.answer) {
        throw new Error("Invalid assistant response.");
      }

      const normalizedAnswer = normalizeBlocks(response.data.answer);
      setAnswer(normalizedAnswer);
      setChatTurns((prev) =>
        prev.map((turn) =>
          turn.id === turnId
            ? {
                ...turn,
                blocks: normalizedAnswer,
                isLoading: false,
              }
            : turn,
        ),
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.details ||
        err?.message ||
        "Failed to fetch assistant response.";
      setChatTurns((prev) =>
        prev.map((turn) =>
          turn.id === turnId
            ? {
                ...turn,
                blocks: [],
                isLoading: false,
                error: message,
              }
            : turn,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-col bg-white text-slate-900">
      <header className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sky-600" />
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        </div>
        {contextLabel ? (
          <p className="mt-2 text-xs leading-5 text-slate-500">{contextLabel}</p>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {chatTurns.length === 0 && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Ask AI
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ask about the active view's risks, drivers, recommendations, or next diligence
              questions.
            </p>
          </div>
        )}

        <div className="space-y-5">
          {chatTurns.map((turn) => {
            const visibleBlocks = turn.blocks.filter((block) => !isSuggestedQuestionsBlock(block));

            return (
              <div key={turn.id} className="space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[86%] rounded-2xl rounded-tr-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm leading-6 text-slate-950 shadow-sm">
                    {turn.question}
                  </div>
                </div>

                <div className="min-w-0">
                  {turn.isLoading ? (
                    <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-700">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Reviewing Asset72 data...
                    </div>
                  ) : null}

                  {turn.error ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
                      {turn.error}
                    </div>
                  ) : null}

                  {!turn.isLoading && !turn.error && visibleBlocks.length > 0 ? (
                    <BlocksRenderer blocks={visibleBlocks} isDark={false} compact />
                  ) : null}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {!loading && suggestedQuestions.length > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Suggested questions
            </p>
            {suggestedQuestions.slice(0, 3).map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => {
                  updateQuestion(suggested);
                  handleSubmit(undefined, suggested);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-slate-950"
              >
                {suggested}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-sky-300 focus-within:bg-white">
          <input
            ref={inputRef}
            type="search"
            placeholder="Ask the analyst..."
            value={question}
            onChange={(event) => updateQuestion(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send question"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );

  return sidebarContent;
};

export default AssistantWidget;
