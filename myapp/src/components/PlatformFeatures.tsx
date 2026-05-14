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
const buildingX = (f: number) => (f % 2 === 0 ? -40 : 40);

/* ── Seeded window positions for each floor ── */
const WINDOW_SETS = [
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
          height: "115px",
          background: isCurrent
            ? "linear-gradient(180deg, #0e2a3a 0%, #0a1e2c 100%)"
            : isLit
            ? "linear-gradient(180deg, #0c2230 0%, #091a26 100%)"
            : "linear-gradient(180deg, #080e18 0%, #060c16 100%)",
          boxShadow: isCurrent ? "inset 0 0 60px rgba(30,188,154,0.07)" : "none",
        }}
      >
        {isCurrent && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.06, 0.18, 0.06] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "linear-gradient(90deg, transparent 5%, rgba(30,188,154,0.06) 50%, transparent 95%)" }}
          />
        )}

        {/* Floor label — italic serif, matches reference */}
        <span
          className="absolute top-3 left-4 text-[13px] italic transition-colors duration-700"
          style={{ color: isLit ? "rgba(30,188,154,0.80)" : "rgba(255,255,255,0.03)", fontFamily: "Georgia, serif" }}
        >
          {feat.title} {feat.titleAccent}
        </span>
        <span
          className="absolute top-3 right-4 text-[11px] italic font-mono transition-colors duration-700"
          style={{ color: isLit ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.03)" }}
        >
          {feat.floorLabel}
        </span>

        {/* Windows — small scattered LED rectangles */}
        {wins.map((w, wi) => (
          <motion.div
            key={wi}
            className="absolute rounded-[1px] transition-all duration-700"
            animate={isCurrent ? { opacity: [0.5, 1, 0.55] } : {}}
            transition={{ duration: 2.5 + wi * 0.3, repeat: Infinity, repeatType: "mirror", delay: wi * 0.12 }}
            style={{
              left: `${w[0]}%`, top: `${w[1]}%`,
              width: `${w[2]}px`, height: `${w[3]}px`,
              background: isLit ? "#1ebc9a" : "#04080f",
              boxShadow: isLit ? "0 0 8px rgba(30,188,154,0.5)" : "none",
              opacity: isLit ? (isCurrent ? 1 : 0.55) : 0.06,
            }}
          />
        ))}
      </div>

      {/* Ruler ticks — matches reference density */}
      <div className="flex justify-center gap-[1.5px] px-1 py-[1px]" style={{ background: "rgba(0,0,0,0.4)" }}>
        {Array.from({ length: 80 }).map((_, t) => (
          <div key={t} style={{
            width: "3px", height: t % 5 === 0 ? "6px" : "3px",
            background: isLit ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.03)",
            transition: "all 0.5s",
          }} />
        ))}
      </div>
      {/* Concrete beam */}
      <div className="transition-all duration-700" style={{
        height: "8px",
        background: isLit
          ? "linear-gradient(180deg, rgba(180,200,220,0.35) 0%, rgba(140,160,180,0.2) 50%, rgba(180,200,220,0.3) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)",
        boxShadow: isLit ? "0 2px 8px rgba(0,0,0,0.35)" : "none",
      }} />
    </div>
  );
}

/* ───── Content panel — dark theme ───── */
function ContentPanel({ feat, side }: { feat: typeof features[0]; side: "left" | "right" }) {
  const { guardNavigation } = useLoginGuard();
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "right" ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: side === "right" ? 30 : -30 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[400px]"
    >
      {/* Module label */}
      <p className="text-[10px] font-mono tracking-[0.28em] uppercase mb-3" style={{ color: "#1ebc9a" }}>
        {feat.floorLabel} — {feat.category}
      </p>

      {/* Title — large serif feel, white */}
      <h3 className="font-display font-bold text-[2.2rem] md:text-[2.6rem] leading-[1.05]" style={{ color: "#FAFAF7" }}>
        {feat.title}
      </h3>
      <h3 className="font-display font-bold text-[2.2rem] md:text-[2.6rem] italic leading-[1.05] mb-4" style={{ color: "#1ebc9a" }}>
        {feat.titleAccent}
      </h3>

      {/* Description */}
      <p className="text-[14px] leading-relaxed mb-5" style={{ color: "rgba(250,250,247,0.52)" }}>
        {feat.desc}
      </p>

      {/* Bullets — 2 col */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 mb-6">
        {feat.bullets.map((b, i) => (
          <div key={i} className="flex items-center gap-2 text-[13px]" style={{ color: "rgba(250,250,247,0.50)" }}>
            <span style={{ color: "#1ebc9a" }}>—</span> {b}
          </div>
        ))}
      </div>

      {/* Metadata separator + rows */}
      <div className="flex gap-10 pt-4 mb-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase mb-0.5 font-mono" style={{ color: "rgba(255,255,255,0.28)" }}>{feat.m1L}</p>
          <p className="text-[13px] font-mono italic" style={{ color: "#1ebc9a" }}>{feat.m1V}</p>
        </div>
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase mb-0.5 font-mono" style={{ color: "rgba(255,255,255,0.28)" }}>{feat.m2L}</p>
          <p className="text-[13px] font-mono italic" style={{ color: "#1ebc9a" }}>{feat.m2V}</p>
        </div>
      </div>

      {/* CTA — teal filled on dark bg */}
      <button
        type="button"
        onClick={() => guardNavigation(feat.route)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
        style={{
          background: "linear-gradient(135deg, #1ebc9a, #15a382)",
          color: "#fff",
          boxShadow: "0 4px 18px rgba(30,188,154,0.28)",
        }}
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
    <section
      ref={sectionRef}
      className="relative"
      id="platform"
      style={{ height: "420vh", background: "#090F1E" }}
    >
      {/* Sticky viewport */}
      <div
        className="sticky top-0 h-screen overflow-hidden flex items-center justify-center"
        style={{ background: "#090F1E" }}
      >
        {/* Subtle ambient radial */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(30,188,154,0.04) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="absolute top-10 left-0 right-0 text-center z-10 pointer-events-none">
          <p className="text-[10px] font-semibold tracking-[0.35em] uppercase mb-2" style={{ color: "#1ebc9a" }}>
            What Asset72 Does
          </p>
          <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-[2rem]" style={{ color: "#FAFAF7" }}>
            Built floor by floor for
          </h2>
          <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-[2rem] italic" style={{ color: "rgba(250,250,247,0.30)" }}>
            institutional real estate.
          </h2>
        </div>

        {/* 3-zone layout */}
        <div className="relative z-10 flex items-center gap-6 lg:gap-10 w-full max-w-[1400px] mx-auto px-6 mt-10">

          {/* LEFT content */}
          <div className="hidden lg:flex flex-1 justify-end pr-6">
            <AnimatePresence mode="wait">
              {side === "left" && <ContentPanel key={`l-${activeFloor}`} feat={activeFeat} side="left" />}
            </AnimatePresence>
          </div>

          {/* CENTER: Building */}
          <motion.div
            className="flex-shrink-0"
            animate={{ x: buildingX(activeFloor) }}
            transition={{ type: "spring", stiffness: 90, damping: 22 }}
            style={{ width: "clamp(360px, 34vw, 500px)" }}
          >
            <div
              className="rounded-sm overflow-hidden"
              style={{
                border: "1px solid rgba(250,250,247,0.10)",
                background: "#060c16",
                boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 6px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(30,188,154,0.04)",
              }}
            >
              {/* Antenna bar */}
              <div className="flex justify-center py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(30,188,154,0.25))" }} />
                  <motion.div
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#1ebc9a", boxShadow: "0 0 10px rgba(30,188,154,0.9)" }}
                  />
                  <div className="w-16 h-px" style={{ background: "linear-gradient(90deg, rgba(30,188,154,0.25), transparent)" }} />
                </div>
              </div>

              {/* Floors — rendered top-to-bottom (fi=0 is top = N°04, fi=3 is bottom = N°01) */}
              {Array.from({ length: TOTAL }).map((_, fi) => (
                <Floor key={fi} fi={fi} activeFloor={activeFloor} />
              ))}

              {/* Ground bar — bright teal accent */}
              <div style={{
                height: "14px",
                background: "linear-gradient(180deg, #1ebc9a 0%, #0f9a7a 100%)",
                boxShadow: "0 0 24px rgba(30,188,154,0.4), 0 4px 14px rgba(30,188,154,0.2)",
              }} />
            </div>

            {/* Counter below building */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <motion.p
                animate={{ opacity: [0.25, 0.6, 0.25] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-[9px] tracking-[0.3em] uppercase font-mono"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Scroll to Assemble
              </motion.p>
              <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "9px" }}>·</span>
              <p className="text-[9px] font-mono" style={{ color: "rgba(30,188,154,0.55)" }}>
                N° {String(activeFloor + 1).padStart(2, "0")} / 0{TOTAL}
              </p>
            </div>
          </motion.div>

          {/* RIGHT content */}
          <div className="hidden lg:flex flex-1 justify-start pl-6">
            <AnimatePresence mode="wait">
              {side === "right" && <ContentPanel key={`r-${activeFloor}`} feat={activeFeat} side="right" />}
            </AnimatePresence>
          </div>

          {/* Nav dots — far right */}
          <div className="hidden xl:flex flex-col gap-5 flex-shrink-0 ml-2">
            {NAV.map((label, i) => {
              const isAct = i === activeFloor;
              const isPast = i < activeFloor;
              return (
                <div key={label} className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-2 rounded-full transition-all duration-400"
                    style={{
                      background: isAct ? "#1ebc9a" : isPast ? "rgba(30,188,154,0.3)" : "transparent",
                      border: isAct ? "none" : isPast ? "1px solid rgba(30,188,154,0.28)" : "1px solid rgba(255,255,255,0.15)",
                      boxShadow: isAct ? "0 0 8px rgba(30,188,154,0.7)" : "none",
                    }}
                  />
                  <span
                    className="text-[8px] font-mono tracking-[0.15em] whitespace-nowrap transition-colors duration-300"
                    style={{
                      color: isAct ? "#1ebc9a" : isPast ? "rgba(30,188,154,0.45)" : "rgba(255,255,255,0.18)",
                    }}
                  >
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
            <motion.div
              key={activeFloor}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-[10px] font-mono tracking-widest mb-1" style={{ color: "#1ebc9a" }}>{activeFeat.floorLabel}</p>
              <h4 className="font-display font-bold text-xl" style={{ color: "#FAFAF7" }}>
                {activeFeat.title}{" "}
                <span className="italic" style={{ color: "#1ebc9a" }}>{activeFeat.titleAccent}</span>
              </h4>
              <p className="text-sm mt-1" style={{ color: "rgba(250,250,247,0.45)" }}>{activeFeat.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AccessBlockedModal open={isModalOpen} onOpenChange={setIsModalOpen} onGoToLogin={goToLogin} />
    </section>
  );
};

export default PlatformFeatures;
