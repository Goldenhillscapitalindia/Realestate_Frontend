import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Upload, Search, BarChart3, TrendingUp, FileText } from "lucide-react";

/* ── Step data ── */
const steps = [
  { icon: Upload,    title: "Upload Property Financials",     desc: "Centralize T-12s, rent rolls, and operational data in one workflow.",                                                          color: "#1ebc9a" },
  { icon: Search,    title: "Detect Performance Drivers",     desc: "Identify revenue leakage, expense anomalies, and occupancy trends impacting NOI.",                                             color: "#6366f1" },
  { icon: BarChart3, title: "Generate Property Intelligence", desc: "Benchmark assets, uncover upside opportunities, and surface operational risks.",                                               color: "#0ea5e9" },
  { icon: TrendingUp,title: "Drive Portfolio Decisions",      desc: "Track portfolio performance and prioritize actions that improve asset efficiency and returns.",                                 color: "#f59e0b" },
  { icon: FileText,  title: "Create Actionable IC Memos",     desc: "Generate investment-ready memos with strategic recommendations, risk visibility, and next-step actions.",                      color: "#ec4899" },
];

/*
 * Card positions (% of container):  cards on far left / far right.
 * Number circles sit in the CENTER GAP (36–62%) — beside the curve, never overlapping cards.
 */
const layout = [
  { cardX: "2%",  cardY: "0%",  numX: "62%", numY: "7%"  },
  { cardX: "62%", cardY: "18%", numX: "36%", numY: "25%" },
  { cardX: "2%",  cardY: "38%", numX: "62%", numY: "44%" },
  { cardX: "62%", cardY: "58%", numX: "36%", numY: "64%" },
  { cardX: "2%",  cardY: "78%", numX: "62%", numY: "84%" },
];

/* Smooth S-curve threading through the centre gap */
const CURVE =
  "M 500,0 " +
  "C 650,80 650,180 500,260 " +
  "C 350,340 350,440 500,520 " +
  "C 650,600 650,700 500,780 " +
  "C 380,840 420,900 500,920";

/* ══════════════════════════════════════════════════════ */
const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef    = useRef<SVGPathElement>(null);
  const [iconPos,    setIconPos]    = useState({ x: 50, y: 0 });
  const [activeStep, setActiveStep] = useState(-1);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 75%", "end 25%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const path = pathRef.current;
    if (!path) return;

    const len = path.getTotalLength();
    const pt  = path.getPointAtLength(Math.min(Math.max(v, 0), 1) * len);
    // viewBox is 1000 × 920 → convert to %
    setIconPos({ x: pt.x / 10, y: (pt.y / 920) * 100 });
    setActiveStep(Math.min(Math.floor(v * 5.5), 4));
  });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-16 lg:py-20"
      id="workflow"
      style={{ background: "linear-gradient(180deg, #0a0f1f 0%, #0e1628 50%, #0a0f1f 100%)" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      {/* Corner ticks */}
      <div className="absolute top-6 left-6 w-5 h-5 border-t border-l border-white/[0.06] hidden lg:block" />
      <div className="absolute top-6 right-6 w-5 h-5 border-t border-r border-white/[0.06] hidden lg:block" />
      <div className="absolute bottom-6 left-6 w-5 h-5 border-b border-l border-white/[0.06] hidden lg:block" />
      <div className="absolute bottom-6 right-6 w-5 h-5 border-b border-r border-white/[0.06] hidden lg:block" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1ebc9a]/20 bg-[#1ebc9a]/[0.08] text-[11px] font-semibold tracking-[0.2em] uppercase text-[#5de0c4] mb-4">
            How Asset72 Works
          </span>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl lg:text-[2.2rem] text-white mb-2">
            Turn property financials into
          </h2>
          <p className="text-base md:text-lg text-slate-400">
            actionable portfolio intelligence.
          </p>
        </div>

        {/* ══ DESKTOP TIMELINE ══ */}
        <div className="relative hidden lg:block" style={{ height: "850px" }}>

          {/* ── Curved SVG line ── */}
          <svg
            viewBox="0 0 1000 920"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
            fill="none"
          >
            <defs>
              <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#1ebc9a" stopOpacity="0.7" />
                <stop offset="25%"  stopColor="#6366f1" stopOpacity="0.6" />
                <stop offset="50%"  stopColor="#0ea5e9" stopOpacity="0.6" />
                <stop offset="75%"  stopColor="#f59e0b" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Glow behind the line */}
            <path
              d={CURVE}
              stroke="url(#curveGrad)"
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.15"
              style={{ filter: "blur(6px)" }}
            />
            {/* Dashed curve */}
            <path
              ref={pathRef}
              d={CURVE}
              stroke="url(#curveGrad)"
              strokeWidth="4"
              strokeDasharray="10 12"
              strokeLinecap="round"
            />
          </svg>

          {/* ── Building icon that moves ON the curve ── */}
          <motion.div
            className="absolute z-30 pointer-events-none"
            style={{
              left: `${iconPos.x}%`,
              top:  `${iconPos.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-[#1ebc9a]/25 blur-lg" />
              <div className="absolute -inset-2 rounded-full bg-[#1ebc9a]/15 blur-sm" />
              <div
                className="relative w-11 h-11 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  border: "2px solid rgba(30,188,154,0.35)",
                  boxShadow: "0 0 18px rgba(30,188,154,0.50)",
                }}
              >
                <img
                  src="/image1.jpg"
                  alt="Building"
                  className="w-9 h-9 object-contain"
                />
              </div>
            </div>
          </motion.div>

          {/* ── Step cards + number circles ── */}
          {steps.map((step, i) => {
            const pos       = layout[i];
            const isActive  = i <= activeStep;
            const isCurrent = i === activeStep;

            return (
              <div key={i}>

                {/* Number circle — sits in centre gap, beside the line */}
                <div
                  className="absolute z-20 transition-all duration-500"
                  style={{ left: pos.numX, top: pos.numY, transform: "translate(-50%, -50%)" }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-display font-extrabold text-sm transition-all duration-500"
                    style={{
                      background: isCurrent
                        ? `linear-gradient(135deg, ${step.color}, ${step.color}bb)`
                        : isActive
                        ? `${step.color}55`
                        : "rgba(255,255,255,0.04)",
                      color:  isActive ? "#fff" : "rgba(255,255,255,0.18)",
                      boxShadow: isCurrent
                        ? `0 0 32px ${step.color}50, 0 0 12px ${step.color}30`
                        : "none",
                      border: isActive
                        ? `2px solid ${step.color}50`
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {i + 1}
                  </div>
                </div>

                {/* Step card */}
                <div
                  className="absolute z-10 transition-all duration-700"
                  style={{
                    left:    pos.cardX,
                    top:     pos.cardY,
                    width:   "36%",
                    opacity: isActive ? 1 : 0.2,
                    transform: isActive ? "scale(1)" : "scale(0.97)",
                  }}
                >
                  <div
                    className="relative p-5 rounded-2xl border backdrop-blur-sm transition-all duration-500"
                    style={{
                      background:  isCurrent ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.02)",
                      borderColor: isCurrent ? `${step.color}30` : "rgba(255,255,255,0.05)",
                      boxShadow:   isCurrent ? `0 0 50px ${step.color}08` : "none",
                    }}
                  >
                    {/* Top accent bar */}
                    <div
                      className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`,
                        opacity: isCurrent ? 0.9 : 0.15,
                      }}
                    />

                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-400"
                      style={{
                        background: `${step.color}${isActive ? "18" : "06"}`,
                        border:     `1px solid ${step.color}${isActive ? "30" : "08"}`,
                      }}
                    >
                      <step.icon
                        className="w-[18px] h-[18px]"
                        style={{ color: isActive ? step.color : "rgba(255,255,255,0.15)" }}
                      />
                    </div>

                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-1 transition-colors duration-500"
                      style={{ color: isActive ? step.color : "rgba(255,255,255,0.1)" }}
                    >
                      Step {i + 1}
                    </span>

                    <h3
                      className="font-display font-bold text-[15px] leading-snug mb-1.5 transition-colors duration-500"
                      style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.15)" }}
                    >
                      {step.title}
                    </h3>

                    <p
                      className="text-[13px] leading-relaxed transition-colors duration-500"
                      style={{ color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.08)" }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* ══ MOBILE: vertical list ══ */}
        <div className="lg:hidden space-y-5">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs text-white"
                  style={{ background: step.color }}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="w-px mt-2"
                    style={{
                      minHeight: "50px",
                      backgroundImage: `repeating-linear-gradient(to bottom, ${step.color}50 0px, ${step.color}50 4px, transparent 4px, transparent 10px)`,
                    }}
                  />
                )}
              </div>
              <div className="pb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: `${step.color}15`, border: `1px solid ${step.color}25` }}
                >
                  <step.icon className="w-4 h-4" style={{ color: step.color }} />
                </div>
                <h3 className="font-display font-bold text-base text-white mb-1">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
