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

/* ── Window positions for each floor: [left%, top%, width, height] ── */
const WINDOW_SETS = [
  [[12,32,14,7],[20,55,10,5],[34,38,14,7],[34,62,10,5],[50,45,8,5],[54,32,14,7],[68,55,10,5],[82,38,10,5]],
  [[10,35,12,6],[22,58,10,5],[32,35,14,7],[46,55,8,5],[56,38,14,7],[56,62,10,5],[72,35,10,5],[84,55,12,6]],
  [[14,38,12,6],[24,55,10,5],[36,32,14,7],[48,58,8,5],[52,38,14,7],[62,55,10,5],[76,38,12,6],[86,58,10,5]],
  [[10,38,14,7],[22,55,10,5],[38,35,14,7],[38,62,10,5],[54,38,8,5],[60,55,14,7],[74,38,10,5],[86,55,12,6]],
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
      {/* Glass floor panel */}
      <div
        className="relative overflow-hidden transition-all duration-700"
        style={{
          height: "110px",
          background: isCurrent
            ? "linear-gradient(180deg, #0d3040 0%, #0a2535 40%, #0b2838 100%)"
            : isLit
            ? "linear-gradient(180deg, #0b2a38 0%, #091e2c 40%, #0a2230 100%)"
            : "linear-gradient(180deg, #060d16 0%, #050b12 40%, #060d16 100%)",
          borderLeft: `1px solid ${isLit ? "rgba(30,188,154,0.08)" : "rgba(255,255,255,0.02)"}`,
          borderRight: `1px solid ${isLit ? "rgba(30,188,154,0.08)" : "rgba(255,255,255,0.02)"}`,
        }}
      >
        {/* Vertical grid lines on glass */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${isLit ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)"} 0px, ${isLit ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)"} 1px, transparent 1px, transparent 48px)`,
        }} />

        {/* Active floor shimmer */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.04, 0.12, 0.04] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "linear-gradient(90deg, transparent 5%, rgba(30,188,154,0.08) 50%, transparent 95%)" }}
          />
        )}

        {/* Floor label — italic serif */}
        <span
          className="absolute top-3 left-4 text-[13px] italic transition-colors duration-700"
          style={{
            color: isLit ? "rgba(30,188,154,0.85)" : "rgba(255,255,255,0.04)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            letterSpacing: "0.02em",
          }}
        >
          {feat.title} {feat.titleAccent}
        </span>
        <span
          className="absolute top-3 right-4 text-[11px] italic font-mono transition-colors duration-700"
          style={{ color: isLit ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.04)", letterSpacing: "0.12em" }}
        >
          {feat.floorLabel}
        </span>

        {/* Window LEDs — scattered glowing rectangles */}
        {wins.map((w, wi) => (
          <motion.div
            key={wi}
            className="absolute rounded-[1px] transition-all duration-700"
            animate={isCurrent ? { opacity: [0.55, 1, 0.55] } : {}}
            transition={{ duration: 2 + wi * 0.4, repeat: Infinity, repeatType: "mirror", delay: wi * 0.15 }}
            style={{
              left: `${w[0]}%`, top: `${w[1]}%`,
              width: `${w[2]}px`, height: `${w[3]}px`,
              background: isLit
                ? (wi % 3 === 0 ? "#d4a853" : "#1ebc9a")
                : "#060a10",
              boxShadow: isLit
                ? `0 0 ${wi % 3 === 0 ? "10px rgba(212,168,83,0.6)" : "10px rgba(30,188,154,0.5)"}`
                : "none",
              opacity: isLit ? (isCurrent ? 1 : 0.5) : 0.05,
            }}
          />
        ))}
      </div>

      {/* Ruler tick marks between floors */}
      <div
        className="flex justify-center items-end px-1"
        style={{
          height: "8px",
          background: isLit
            ? "rgba(8,14,24,0.7)"
            : "rgba(4,8,14,0.9)",
        }}
      >
        {Array.from({ length: 80 }).map((_, t) => (
          <div key={t} style={{
            width: "2.5px",
            height: t % 5 === 0 ? "7px" : "3px",
            marginRight: "2px",
            background: isLit ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)",
            transition: "all 0.5s",
          }} />
        ))}
      </div>

      {/* Concrete beam divider */}
      <div className="transition-all duration-700" style={{
        height: "10px",
        background: isLit
          ? "linear-gradient(180deg, rgba(200,215,230,0.40) 0%, rgba(160,178,195,0.25) 40%, rgba(190,205,220,0.35) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        boxShadow: isLit
          ? "0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "none",
      }} />
    </div>
  );
}

/* ───── Content panel ───── */
function ContentPanel({ feat, side }: { feat: typeof features[0]; side: "left" | "right" }) {
  const { guardNavigation } = useLoginGuard();
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "right" ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: side === "right" ? 30 : -30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[420px]"
    >
      {/* Module label */}
      <p className="text-[10px] font-mono tracking-[0.3em] uppercase mb-4" style={{ color: "#1ebc9a" }}>
        {feat.floorLabel} — {feat.category}
      </p>

      {/* Title */}
      <h3
        className="font-display font-bold leading-[1.05] mb-1"
        style={{ color: "#FAFAF7", fontSize: "clamp(2rem, 3.2vw, 2.8rem)" }}
      >
        {feat.title}
      </h3>
      <h3
        className="font-display font-bold italic leading-[1.05] mb-5"
        style={{ color: "#1ebc9a", fontSize: "clamp(2rem, 3.2vw, 2.8rem)" }}
      >
        {feat.titleAccent}
      </h3>

      {/* Description */}
      <p className="text-[14.5px] leading-[1.7] mb-6" style={{ color: "rgba(250,250,247,0.50)" }}>
        {feat.desc}
      </p>

      {/* Bullets — 2 column */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-7">
        {feat.bullets.map((b, i) => (
          <div key={i} className="flex items-center gap-2.5 text-[13px]" style={{ color: "rgba(250,250,247,0.48)" }}>
            <span className="flex-shrink-0 w-1 h-1 rounded-full" style={{ background: "#1ebc9a" }} />
            {b}
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="flex gap-12 pt-5 mb-6 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-[9px] tracking-[0.22em] uppercase mb-1 font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{feat.m1L}</p>
          <p className="text-[13px] font-mono italic" style={{ color: "#1ebc9a" }}>{feat.m1V}</p>
        </div>
        <div>
          <p className="text-[9px] tracking-[0.22em] uppercase mb-1 font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{feat.m2L}</p>
          <p className="text-[13px] font-mono italic" style={{ color: "#1ebc9a" }}>{feat.m2V}</p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => guardNavigation(feat.route)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, #1ebc9a, #15a382)",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(30,188,154,0.30)",
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
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(30,188,154,0.03) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="absolute top-10 left-0 right-0 text-center z-10 pointer-events-none">
          <p className="text-[10px] font-semibold tracking-[0.35em] uppercase mb-3" style={{ color: "#1ebc9a" }}>
            What Asset72 Does
          </p>
          <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-[2rem]" style={{ color: "#FAFAF7" }}>
            Built floor by floor for
          </h2>
          <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-[2rem] italic" style={{ color: "rgba(250,250,247,0.28)" }}>
            institutional real estate.
          </h2>
        </div>

        {/* 3-zone layout */}
        <div className="relative z-10 flex items-center gap-6 lg:gap-10 w-full max-w-[1400px] mx-auto px-6 mt-10">

          {/* LEFT content */}
          <div className="hidden lg:flex flex-1 justify-end pr-8">
            <AnimatePresence mode="wait">
              {side === "left" && <ContentPanel key={`l-${activeFloor}`} feat={activeFeat} side="left" />}
            </AnimatePresence>
          </div>

          {/* CENTER: Building */}
          <motion.div
            className="flex-shrink-0"
            animate={{ x: buildingX(activeFloor) }}
            transition={{ type: "spring", stiffness: 90, damping: 22 }}
            style={{ width: "clamp(340px, 32vw, 480px)" }}
          >
            <div
              className="rounded-sm overflow-hidden"
              style={{
                border: "1px solid rgba(250,250,247,0.10)",
                background: "#050a14",
                boxShadow: "0 30px 80px rgba(0,0,0,0.65), 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(30,188,154,0.03)",
              }}
            >
              {/* ── Roof / Antenna structure ── */}
              <div style={{ background: "#060c16" }}>
                {/* Top dark bar */}
                <div className="flex justify-center pt-3 pb-1">
                  <div style={{
                    width: "55%", height: "5px",
                    background: "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
                    borderRadius: "1px",
                  }} />
                </div>
                {/* Antenna signal line + dot */}
                <div className="flex justify-center items-center gap-2 pb-2.5">
                  <div className="w-20 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(30,188,154,0.30))" }} />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#1ebc9a", boxShadow: "0 0 10px rgba(30,188,154,0.9)" }}
                  />
                  <div className="w-20 h-px" style={{ background: "linear-gradient(90deg, rgba(30,188,154,0.30), transparent)" }} />
                </div>
                {/* Ruler ticks under antenna */}
                <div className="flex justify-center items-end px-1" style={{ height: "6px" }}>
                  {Array.from({ length: 80 }).map((_, t) => (
                    <div key={t} style={{
                      width: "2.5px", height: t % 5 === 0 ? "5px" : "2px",
                      marginRight: "2px",
                      background: "rgba(255,255,255,0.08)",
                    }} />
                  ))}
                </div>
                {/* Top concrete beam */}
                <div style={{
                  height: "8px",
                  background: "linear-gradient(180deg, rgba(180,195,210,0.25) 0%, rgba(140,158,175,0.15) 100%)",
                }} />
              </div>

              {/* ── Floors — rendered top-to-bottom ── */}
              {Array.from({ length: TOTAL }).map((_, fi) => (
                <Floor key={fi} fi={fi} activeFloor={activeFloor} />
              ))}

              {/* ── Ground / Foundation bar ── */}
              <div style={{
                height: "16px",
                background: "linear-gradient(180deg, #22d4a8 0%, #18b892 30%, #13a07e 100%)",
                boxShadow: "0 0 30px rgba(30,188,154,0.40), 0 4px 14px rgba(30,188,154,0.25)",
              }}>
                {/* Tiny blocks pattern on ground bar */}
                <div className="flex items-center justify-center h-full gap-[3px] px-2">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} style={{
                      width: "8px", height: "10px",
                      background: `rgba(255,255,255,${i % 3 === 0 ? "0.15" : "0.06"})`,
                      borderRadius: "1px",
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Counter below building */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <motion.p
                animate={{ opacity: [0.25, 0.55, 0.25] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-[9px] tracking-[0.3em] uppercase font-mono"
                style={{ color: "rgba(255,255,255,0.30)" }}
              >
                Scroll to Assemble
              </motion.p>
              <span style={{ color: "rgba(255,255,255,0.10)", fontSize: "9px" }}>·</span>
              <p className="text-[9px] font-mono" style={{ color: "rgba(30,188,154,0.50)" }}>
                N° {String(activeFloor + 1).padStart(2, "0")} / 0{TOTAL}
              </p>
            </div>
          </motion.div>

          {/* RIGHT content */}
          <div className="hidden lg:flex flex-1 justify-start pl-8">
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
