import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, LineChart, Brain, Radar, ArrowRight } from "lucide-react";
import AccessBlockedModal from "./AccessBlockedModal";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { productRoutes } from "@/lib/product-routes";

/* ───── Feature data (bottom → top in building) ───── */
const features = [
  {
    icon: Search, floorLabel: "N° 01", category: "Acquisition",
    title: "Deal", titleAccent: "Lens.",
    desc: "A pre-underwriting decision tool. Quickly assess whether a property is worth pursuing — before you build a full model.",
    bullets: ["Rent vs market", "Occupancy indicators", "Lease visibility", "Risk identification"],
    m1L: "DECISION", m1V: "Pursue or pass", m2L: "INPUTS", m2V: "T12 · RR · OM",
    route: productRoutes.dealLens,
  },
  {
    icon: LineChart, floorLabel: "N° 02", category: "Asset Level",
    title: "Property", titleAccent: "Analytics.",
    desc: "Clear visibility into how each asset is actually performing — occupancy, NOI, and where rent is leaking against the market.",
    bullets: ["Occupancy & NOI tracking", "Rent vs market", "Risk alerts", "Cost control signals"],
    m1L: "COVERAGE", m1V: "Unit · Plan · Asset", m2L: "REFRESH", m2V: "Daily",
    route: productRoutes.portfolioIntelligence,
  },
  {
    icon: Brain, floorLabel: "N° 03", category: "Portfolio Level",
    title: "Portfolio", titleAccent: "Intelligence.",
    desc: "Aggregated visibility across the book. Identify underperformance, prioritize the right actions, and improve NOI with conviction.",
    bullets: ["Aggregated portfolio view", "Underperformance signals", "Action prioritization", "Forward-looking risk"],
    m1L: "HORIZON", m1V: "T+90 / T+360", m2L: "SIGNAL", m2V: "Forward",
    route: productRoutes.portfolioIntelligence,
  },
  {
    icon: Radar, floorLabel: "N° 04", category: "Capital Decision",
    title: "IC", titleAccent: "Memo.",
    desc: "Turns insights into decision-ready IC reports. Performance, risks, opportunities, and recommended actions — structured, sourced, and ready to sign.",
    bullets: ["Auto-generated summaries", "Standardized structure", "Performance & risk", "Recommended actions"],
    m1L: "OUTPUT", m1V: "Memo · Deck", m2L: "CONFIDENCE", m2V: "IC-grade",
    route: productRoutes.aiRentIntelligence,
  },
];

const TOTAL = features.length;
const NAV = ["DEAL LENS", "PROPERTY ANALYTICS", "PORTFOLIO INTELLIGENCE", "IC MEMO"];
const contentSide = (f: number) => (f % 2 === 0 ? "right" : "left");
const buildingX = (f: number) => (f % 2 === 0 ? -30 : 30);

/* ── Seeded window positions for each floor (matching reference: small scattered dots) ── */
const WINDOW_SETS = [
  // Each entry: [left%, top%, width, height] — small random rectangles
  [[8,38,10,6],[16,42,8,5],[28,35,12,7],[38,44,8,4],[52,36,10,6],[62,42,8,5],[74,38,12,6],[86,44,8,4]],
  [[6,36,8,5],[18,44,10,6],[30,38,8,4],[42,42,12,7],[54,36,8,5],[66,44,10,6],[78,38,8,4],[88,42,10,5]],
  [[10,40,8,5],[22,36,10,6],[34,44,8,4],[44,38,12,7],[56,42,8,5],[68,36,10,6],[80,44,8,4],[90,38,8,5]],
  [[8,42,10,6],[20,36,8,5],[32,44,12,7],[46,38,8,4],[58,42,10,6],[70,36,8,5],[82,44,12,6],[92,38,6,4]],
];

/* ───── Single building floor ───── */
function Floor({ fi, activeFloor }: { fi: number; activeFloor: number }) {
  const feat = features[TOTAL - 1 - fi];
  const fromBottom = TOTAL - 1 - fi;
  const isLit = activeFloor >= fromBottom;
  const isCurrent = activeFloor === fromBottom;
  const wins = WINDOW_SETS[TOTAL - 1 - fi] || WINDOW_SETS[0];

  return (
    <div className="relative">
      {/* Floor area */}
      <div
        className="relative transition-all duration-700 overflow-hidden"
        style={{
          height: "105px",
          background: isCurrent
            ? "linear-gradient(180deg, #0e2a3a 0%, #0a1e2c 100%)"
            : isLit
            ? "linear-gradient(180deg, #0c2230 0%, #091a26 100%)"
            : "linear-gradient(180deg, #0a1820 0%, #081420 100%)",
          boxShadow: isCurrent ? "inset 0 0 50px rgba(30,188,154,0.06)" : "none",
        }}
      >
        {isCurrent && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.08, 0.2, 0.08] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "linear-gradient(90deg, transparent 5%, rgba(30,188,154,0.05) 50%, transparent 95%)" }}
          />
        )}

        {/* Floor label — italic serif */}
        <span
          className="absolute top-2.5 left-4 text-[14px] italic transition-colors duration-700"
          style={{ color: isLit ? "rgba(30,188,154,0.75)" : "rgba(255,255,255,0.04)", fontFamily: "Georgia, serif" }}
        >
          {feat.title} {feat.titleAccent}
        </span>
        <span
          className="absolute top-3 right-4 text-[11px] italic font-mono transition-colors duration-700"
          style={{ color: isLit ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.03)" }}
        >
          {feat.floorLabel}
        </span>

        {/* Windows — small scattered rectangles like reference */}
        {wins.map((w, wi) => (
          <motion.div
            key={wi}
            className="absolute rounded-[1px] transition-all duration-700"
            animate={isCurrent ? { opacity: [0.5, 1, 0.6] } : {}}
            transition={{ duration: 2.5 + wi * 0.3, repeat: Infinity, repeatType: "mirror", delay: wi * 0.12 }}
            style={{
              left: `${w[0]}%`, top: `${w[1]}%`,
              width: `${w[2]}px`, height: `${w[3]}px`,
              background: isLit ? "#1ebc9a" : "#0b1520",
              boxShadow: isLit ? "0 0 6px rgba(30,188,154,0.4)" : "none",
              opacity: isLit ? (isCurrent ? 1 : 0.6) : 0.08,
            }}
          />
        ))}
      </div>

      {/* Ruler ticks */}
      <div className="flex justify-center gap-[1.5px] px-1 py-[1px]" style={{ background: "rgba(0,0,0,0.3)" }}>
        {Array.from({ length: 70 }).map((_, t) => (
          <div key={t} style={{
            width: "3.5px", height: t % 5 === 0 ? "5px" : "2.5px",
            background: isLit ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.04)",
            transition: "all 0.5s",
          }} />
        ))}
      </div>
      {/* Concrete beam */}
      <div className="transition-all duration-700" style={{
        height: "7px",
        background: isLit
          ? "linear-gradient(180deg, rgba(180,195,210,0.4) 0%, rgba(140,155,170,0.25) 50%, rgba(180,195,210,0.35) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        boxShadow: isLit ? "0 2px 6px rgba(0,0,0,0.25)" : "none",
      }} />
    </div>
  );
}

/* ───── Content panel ───── */
function ContentPanel({ feat, side }: { feat: typeof features[0]; side: "left" | "right" }) {
  const { guardNavigation } = useLoginGuard();
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "right" ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: side === "right" ? 30 : -30 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-md"
    >
      <p className="text-[11px] font-mono tracking-[0.25em] uppercase mb-2 text-[#1ebc9a]">
        {feat.floorLabel} — {feat.category}
      </p>
      <h3 className="font-display font-bold text-3xl md:text-4xl lg:text-[2.6rem] text-[#0f1d2f] leading-tight">
        {feat.title}
      </h3>
      <h3 className="font-display font-bold text-3xl md:text-4xl lg:text-[2.6rem] italic text-[#1ebc9a] leading-tight mb-4">
        {feat.titleAccent}
      </h3>
      <p className="text-slate-500 text-[15px] leading-relaxed mb-5">{feat.desc}</p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-6">
        {feat.bullets.map((b, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-[#1ebc9a]">—</span> {b}
          </div>
        ))}
      </div>

      <div className="flex gap-10 pt-4 mb-5 border-t border-slate-100">
        <div>
          <p className="text-[9px] tracking-[0.18em] uppercase text-slate-400 mb-0.5 font-mono">{feat.m1L}</p>
          <p className="text-sm font-mono italic text-[#0f1d2f]">{feat.m1V}</p>
        </div>
        <div>
          <p className="text-[9px] tracking-[0.18em] uppercase text-slate-400 mb-0.5 font-mono">{feat.m2L}</p>
          <p className="text-sm font-mono italic text-[#0f1d2f]">{feat.m2V}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => guardNavigation(feat.route)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 bg-[#0f1d2f] hover:bg-[#162840]"
        style={{ boxShadow: "0 4px 16px rgba(15,29,47,0.2)" }}
      >
        Open Product <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════ */
const PlatformFeatures = () => {
  const { isModalOpen, setIsModalOpen, guardNavigation, goToLogin } = useLoginGuard();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFloor, setActiveFloor] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v < 0.25) setActiveFloor(0);
    else if (v < 0.5) setActiveFloor(1);
    else if (v < 0.75) setActiveFloor(2);
    else setActiveFloor(3);
  });

  const activeFeat = features[activeFloor];
  const side = contentSide(activeFloor);

  return (
    <section ref={sectionRef} className="relative" id="platform" style={{ height: "420vh" }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center bg-white">

        {/* Header */}
        <div className="absolute top-10 left-0 right-0 text-center z-10 pointer-events-none">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#1ebc9a] mb-2">
            What Asset72 Does
          </p>
          <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-[#0f1d2f]">
            Built floor by floor for
          </h2>
          <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl italic text-slate-400">
            institutional real estate.
          </h2>
        </div>

        {/* 3-zone layout */}
        <div className="relative z-10 flex items-center gap-8 lg:gap-12 w-full max-w-7xl mx-auto px-8 mt-10">

          {/* LEFT content */}
          <div className="hidden lg:flex flex-1 justify-end pr-4">
            <AnimatePresence mode="wait">
              {side === "left" && <ContentPanel key={`l-${activeFloor}`} feat={activeFeat} side="left" />}
            </AnimatePresence>
          </div>

          {/* CENTER: Building */}
          <motion.div
            className="flex-shrink-0"
            animate={{ x: buildingX(activeFloor) }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{ width: "440px" }}
          >
            <div className="rounded-sm overflow-hidden"
              style={{
                border: "1px solid rgba(15,29,47,0.15)",
                background: "#091420",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              {/* Antenna */}
              <div className="flex justify-center py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(30,188,154,0.3))" }} />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-[#1ebc9a]"
                    style={{ boxShadow: "0 0 8px rgba(30,188,154,0.8)" }}
                  />
                  <div className="w-14 h-px" style={{ background: "linear-gradient(90deg, rgba(30,188,154,0.3), transparent)" }} />
                </div>
              </div>

              {/* Floors */}
              {Array.from({ length: TOTAL }).map((_, fi) => (
                <Floor key={fi} fi={fi} activeFloor={activeFloor} />
              ))}

              {/* Ground bar — bright teal */}
              <div className="transition-all duration-700" style={{
                height: "12px",
                background: "linear-gradient(180deg, #1ebc9a 0%, #0f9a7a 100%)",
                boxShadow: "0 0 20px rgba(30,188,154,0.3), 0 4px 12px rgba(30,188,154,0.15)",
              }} />
            </div>

            {/* Scroll hint */}
            <motion.p animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
              className="text-center text-[10px] tracking-[0.25em] uppercase mt-4 font-mono text-slate-400">
              Scroll to Assemble
            </motion.p>
            <p className="text-center text-[10px] font-mono text-slate-300 mt-1">
              N° {String(activeFloor + 1).padStart(2, "0")} / 0{TOTAL}
            </p>
          </motion.div>

          {/* RIGHT content */}
          <div className="hidden lg:flex flex-1 justify-start pl-4">
            <AnimatePresence mode="wait">
              {side === "right" && <ContentPanel key={`r-${activeFloor}`} feat={activeFeat} side="right" />}
            </AnimatePresence>
          </div>

          {/* Nav dots */}
          <div className="hidden xl:flex flex-col gap-4 flex-shrink-0">
            {NAV.map((label, i) => {
              const isAct = i === activeFloor;
              const isPast = i < activeFloor;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full transition-all duration-300" style={{
                    background: isAct ? "#1ebc9a" : isPast ? "rgba(30,188,154,0.35)" : "transparent",
                    border: isAct ? "none" : isPast ? "1px solid rgba(30,188,154,0.3)" : "1px solid rgba(15,29,47,0.15)",
                    boxShadow: isAct ? "0 0 6px rgba(30,188,154,0.5)" : "none",
                  }} />
                  <span className="text-[9px] font-mono tracking-[0.12em] whitespace-nowrap transition-colors duration-300"
                    style={{ color: isAct ? "#1ebc9a" : isPast ? "rgba(30,188,154,0.5)" : "rgba(15,29,47,0.3)" }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile content */}
        <div className="lg:hidden absolute bottom-6 left-0 right-0 px-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeFloor} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <p className="text-[10px] font-mono tracking-widest text-[#1ebc9a] mb-1">{activeFeat.floorLabel}</p>
              <h4 className="font-display font-bold text-xl text-[#0f1d2f]">
                {activeFeat.title} <span className="italic text-[#1ebc9a]">{activeFeat.titleAccent}</span>
              </h4>
              <p className="text-sm text-slate-500 mt-1">{activeFeat.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AccessBlockedModal open={isModalOpen} onOpenChange={setIsModalOpen} onGoToLogin={goToLogin} />
    </section>
  );
};

export default PlatformFeatures;
