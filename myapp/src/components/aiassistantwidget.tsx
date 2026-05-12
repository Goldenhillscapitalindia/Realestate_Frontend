import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  FileText,
  GitCompare,
  Lightbulb,
  Loader2,
  Moon,
  PieChart,
  Send,
  Sparkles,
  Sun,
  Table2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

type AssistantWidgetProps = {
  mode?: "widget" | "page";
};

type ThemeMode = "dark" | "light";

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

const websiteSuggestions = [
  {
    title: "Summarize my portfolio performance",
    icon: Activity,
    prompt: "Summarize my Asset72 portfolio performance with the most important KPIs.",
  },
  {
    title: "Show key risks across my properties",
    icon: BarChart3,
    prompt: "What are the key risks across my properties?",
  },
  {
    title: "Explain rent upside",
    icon: PieChart,
    prompt: "Show the rent upside and mark-to-market opportunity in my Asset72 data.",
  },
  {
    title: "Compare my properties",
    icon: GitCompare,
    prompt: "Compare my properties by occupancy, NOI, expenses, and revenue risk.",
  },
];

const suggestedFallback = [
  "What does Asset72 show about my property performance?",
  "Which property has the strongest occupancy?",
  "Explain NOI margin and operating expense ratio.",
];

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
}: {
  blocks: AssistantBlock[];
  isDark: boolean;
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
              gridTemplateColumns: `repeat(${Math.min(totalColumns, 4)}, minmax(0, 1fr))`,
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

const AssistantWidget: React.FC<AssistantWidgetProps> = ({ mode = "page" }) => {
  const navigate = useNavigate();
  const isPage = mode === "page";
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const isDark = theme === "dark";
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AssistantBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const latestQuestion = useRef("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const responseTopRef = useRef<HTMLElement | null>(null);

  const suggestedQuestions = useMemo(() => {
    const fromAnswer = answer.find(isSuggestedQuestionsBlock)?.questions;
    return fromAnswer && fromAnswer.length >= 3 ? fromAnswer : suggestedFallback;
  }, [answer]);

  const visibleBlocks = useMemo(
    () => answer.filter((block) => !isSuggestedQuestionsBlock(block)),
    [answer],
  );

  const updateQuestion = (value: string) => {
    latestQuestion.current = value;
    setQuestion(value);
  };

  useEffect(() => {
    latestQuestion.current = question;
  }, [question]);

  useEffect(() => {
    if (isPage) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isPage]);

  useEffect(() => {
    // When the response first arrives (or while loading/error), scroll to the
    // TOP of the response area so the user sees blocks animate in from the start —
    // not the bottom of the page.
    if (loading || error || visibleBlocks.length > 0) {
      responseTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [error, loading, visibleBlocks.length]);

  const handleSubmit = async (e?: React.FormEvent | Event, customQuestion?: string) => {
    if (e?.preventDefault) e.preventDefault();
    const query = (customQuestion ?? latestQuestion.current ?? question).trim();
    if (!query || loading) return;

    setHasInteracted(true);
    setLoading(true);
    setError(null);
    setAnswer([]);

    try {
      const user = await getCurrentUser();
      const email = user?.email;

      if (!email) {
        throw new Error("Please log in again before using the assistant.");
      }

      const response = await authClient.post<AssistantResponse>("/api/assistant_chat/", {
        email,
        question: query,
      });

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      if (!response.data?.answer) {
        throw new Error("Invalid assistant response.");
      }

      setAnswer(normalizeBlocks(response.data.answer));
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.details ||
        err?.message ||
        "Failed to fetch assistant response.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const openAssistant = () => {
    if (!isPage) navigate("/assistant");
  };

  const closeAssistant = () => {
    if (isPage) navigate(-1);
  };

  const content = (
    <div
      className={`relative min-h-screen overflow-hidden px-4 pb-12 pt-6 ${
        isDark
          ? "bg-[#08191d] text-[#e6f7ff]"
          : "bg-gradient-to-b from-[#f7fbff] via-white to-[#eef6ff] text-slate-800"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.13),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(45,212,191,0.12),transparent_34%),linear-gradient(120deg,rgba(15,42,50,0.68),rgba(8,25,29,0.92))]"
            : "bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,0.09),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.10),transparent_32%),radial-gradient(circle_at_48%_72%,rgba(20,184,166,0.10),transparent_38%)]"
        }`}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-end gap-4">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
              isDark
                ? "border-white/15 bg-white/5 text-white hover:border-cyan-300/40"
                : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300"
            }`}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <span className={`text-[11px] font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>
            Theme
          </span>
        </div>

        {isPage && (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={closeAssistant}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                isDark
                  ? "border-white/15 bg-white/5 text-slate-200 hover:border-white/30"
                  : "border-slate-200 bg-white text-slate-500 shadow-sm hover:border-slate-300"
              }`}
              aria-label="Close assistant"
            >
              <X className="h-5 w-5" />
            </button>
            <span className={`text-[11px] font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>
              Cancel
            </span>
          </div>
        )}
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-9 pb-28 pt-12">
        <section className="text-center">
          <div
            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
              isDark ? "bg-cyan-400/10 text-cyan-300" : "bg-sky-50 text-sky-600"
            }`}
          >
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className={`text-3xl font-bold sm:text-4xl ${isDark ? "text-white" : "text-slate-950"}`}>
            Welcome to <span className={isDark ? "text-cyan-300" : "text-sky-600"}>Asset72 AI</span>
          </h1>
          <p className={`mt-3 text-base sm:text-lg ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Your assistant for property intelligence, portfolio analytics, rent insights, and deal underwriting.
          </p>
        </section>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="w-full max-w-4xl"
        >
          <div
            className={`flex items-center rounded-2xl border px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition ${
              isDark
                ? "border-cyan-300/20 bg-[#102833] focus-within:border-cyan-300/60"
                : "border-slate-200 bg-white focus-within:border-sky-300"
            }`}
          >
            <input
              ref={inputRef}
              type="search"
              placeholder="Ask Asset72 AI about your properties..."
              value={question}
              onChange={(event) => updateQuestion(event.target.value)}
              className={`min-h-11 flex-1 bg-transparent text-base outline-none ${
                isDark ? "text-white placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"
              }`}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isDark
                  ? "bg-cyan-600 hover:bg-cyan-500"
                  : "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600"
              }`}
              aria-label="Send question"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </motion.form>

        {!hasInteracted && (
          <section className="w-full max-w-5xl">
            <div className={`mb-4 flex items-center gap-2 text-sm font-semibold ${isDark ? "text-cyan-200" : "text-sky-700"}`}>
              <Lightbulb className="h-4 w-4" />
              Try asking about
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {websiteSuggestions.map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    updateQuestion(item.prompt);
                    handleSubmit(undefined, item.prompt);
                  }}
                  className={`group relative flex min-h-[74px] items-center gap-3 rounded-xl border px-4 py-4 text-left transition hover:-translate-y-0.5 ${
                    isDark
                      ? "border-cyan-300/15 bg-[#133244] text-white hover:border-cyan-300/50"
                      : "border-slate-200 bg-white text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.08)] hover:border-sky-200"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      isDark ? "bg-cyan-400/10 text-cyan-300" : "bg-sky-50 text-sky-600"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold">{item.title}</span>
                  <ArrowRight
                    className={`ml-auto h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 ${
                      isDark ? "text-cyan-200" : "text-sky-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {(loading || error || visibleBlocks.length > 0) && (
          <section ref={responseTopRef} className="w-full max-w-6xl space-y-4">
            {loading && (
              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                  isDark
                    ? "border-cyan-300/20 bg-[#102833] text-cyan-100"
                    : "border-sky-200 bg-sky-50 text-sky-700"
                }`}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Reviewing your Asset72 property data...
              </div>
            )}

            {!loading && error && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  isDark ? "border-rose-400/30 bg-rose-950/30 text-rose-100" : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {error}
              </div>
            )}

            {!loading && !error && visibleBlocks.length > 0 && (
              <>
                <BlocksRenderer blocks={visibleBlocks} isDark={isDark} />
                <div className="pt-2">
                  <div className={`mb-3 text-sm font-semibold ${isDark ? "text-cyan-200" : "text-sky-700"}`}>
                    Suggested questions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((suggested) => (
                      <button
                        key={suggested}
                        onClick={() => {
                          updateQuestion(suggested);
                          handleSubmit(undefined, suggested);
                        }}
                        className={`rounded-full border px-3 py-2 text-sm transition ${
                          isDark
                            ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:border-cyan-300/50"
                            : "border-sky-200 bg-white text-sky-700 hover:bg-sky-50"
                        }`}
                      >
                        {suggested}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      <div ref={scrollAnchorRef} />
    </div>
  );

  return (
    <>
      {!isPage && (
        <div className="fixed bottom-5 right-5 z-[9999]">
          <AnimatePresence>
            <motion.button
              key="asset72-assistant-fab"
              onClick={openAssistant}
              animate={{ scale: [1, 1.05, 0.98, 1] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
              whileTap={{ scale: 0.95 }}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/70 bg-[#0b2531] text-cyan-200 shadow-[0_14px_34px_rgba(8,145,178,0.34)]"
              aria-label="Open Asset72 AI assistant"
            >
              <Sparkles className="h-6 w-6" />
            </motion.button>
          </AnimatePresence>
        </div>
      )}

      {isPage && content}
    </>
  );
};

export default AssistantWidget;
