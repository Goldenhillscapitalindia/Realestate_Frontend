import { AlertTriangle, Heart, RefreshCw, TrendingDown, Wind } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { useState, useEffect } from "react";
import { motion, px } from "framer-motion";

const capabilities = [
  { icon: RefreshCw,     label: "Rollover risk visibility",       detail: "Track lease expirations before they impact NOI" },
  { icon: AlertTriangle, label: "Revenue variance detection",     detail: "Spot deviations between forecast and actuals" },
  { icon: TrendingDown,  label: "Expense outlier identification", detail: "Flag above-market operating costs instantly" },
  { icon: Wind,          label: "Competitive rent positioning",   detail: "Benchmark rents against real-time market data" },
  { icon: Heart,         label: "AI Guided Recommendations",      detail: "Actionable insights delivered to your workflow" },
];

const CARD_W  = 360;
const CARD_H  = 300;
const STEP    = 400;
const CARD_BG = "#0B1A3A";

const AILayer = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused,    setIsPaused]    = useState(false);
  const n = capabilities.length;

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(() => {
      setActiveIndex(p => (p + 1) % capabilities.length);
    }, 2000);
    return () => clearInterval(t);
  }, [isPaused]);

  /* Shortest-path offset so wrap-around feels circular */
  const getOffset = (index: number) => {
    let off = index - activeIndex;
    if (off >  n / 2) off -= n;
    if (off < -n / 2) off += n;
    return off;
  };

  return (
    <section
      className="relative overflow-hidden"
      id="ai"
      style={{
        padding: "5rem 1.5rem",
        background: "linear-gradient(180deg, #f2f6ff 0%, #eef2fb 40%, #f7f9ff 100%)",
      }}
    >
      {/* Faint dot pattern */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ opacity: 0.035 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #0f1d2f 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Diagonal accent lines */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: 0.02 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute bg-[#0f4b8a]"
            style={{ width: "1px", height: "200%", left: `${20 + i * 20}%`, top: "-50%", transform: "rotate(25deg)" }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Header ── */}
        <ScrollReveal variant="up">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-indigo-400/40" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-500">
                AI Layer — Beyond Dashboards
              </p>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-indigo-400/40" />
            </div>

            <h2 className="mb-5 font-display text-[2rem] font-extrabold text-[#0f1d2f] tracking-tight md:text-[2.35rem] lg:text-[2.8rem]">
              Real Estate–Specific Intelligence
            </h2>

            <p className="text-[15px] leading-7 text-slate-500 max-w-2xl mx-auto">
              Asset72 analyzes structured financial data to surface patterns in lease exposure,
              revenue alignment, and operating efficiency — Insights that manual spreadsheets simply miss
            </p>
          </div>
        </ScrollReveal>

        {/* ── Carousel ── */}
        <div
          className="relative"
          style={{ height: `${CARD_H + 40}px` }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Cards track */}
          <div className="absolute inset-0 flex items-center justify-center">
            {capabilities.map((capability, index) => {
              const off    = getOffset(index);
              const absOff = Math.abs(off);
              if (absOff > 2) return null;

              const xPos   = off * STEP;
              const scale  = off === 0 ? 1 : 0.84;
              const opac   = absOff === 0 ? 1 : absOff === 1 ? 0.6 : 0;
              const zIdx   = off === 0 ? 10 : absOff === 1 ? 5 : 0;
              const isCtr  = off === 0;

              return (
                <motion.div
                  key={capability.label}
                  onClick={() => setActiveIndex(index)}
                  animate={{ x: xPos, scale, opacity: opac, zIndex: zIdx }}
                  transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                  style={{
                    position: "absolute",
                    width: `${CARD_W}px`,
                    height: `${CARD_H}px`,
                    cursor: isCtr ? "default" : "pointer",
                  }}
                >
                  <div
                    className="group relative flex h-full flex-col items-center justify-center overflow-hidden text-center rounded-2xl transition-shadow duration-500"
                    style={{
                      background: CARD_BG,
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      boxShadow: isCtr
                        ? "0 32px 80px -24px rgba(11,20,38,0.28), 0 0 0 1px rgba(15,28,62,0.06)"
                        : "0 20px 54px -36px rgba(11,20,38,0.22)",
                      padding: "2rem 1.25rem 1.5rem",
                    }}
                  >
                    {/* Top accent bar */}
                    <div
                      className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
                      style={{
                        background: "linear-gradient(90deg, transparent 10%, #1ebc9a 50%, transparent 90%)",
                        opacity: isCtr ? 0.85 : 0.4,
                        transition: "opacity 0.4s",
                      }}
                    />

                    {/* Icon */}
                    <div
                      className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <capability.icon
                        className="h-6 w-6"
                        style={{ color: isCtr ? "#1ebc9a" : "rgba(255,255,255,0.65)", transition: "color 0.4s" }}
                      />
                    </div>

                    {/* Label */}
                    <p className="text-lg font-semibold leading-snug text-white mb-2">
                      {capability.label}
                    </p>

                    {/* Detail */}
                    <p className="text-[12px] leading-relaxed text-white/70">
                      {capability.detail}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {capabilities.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              style={{
                width:  i === activeIndex ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: i === activeIndex ? "#1ebc9a" : "rgba(15,75,138,0.2)",
                transition: "all 0.35s ease",
                border: "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default AILayer;
