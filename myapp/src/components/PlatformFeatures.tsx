import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, LineChart, Brain, Radar, ArrowRight } from "lucide-react";
import AccessBlockedModal from "./AccessBlockedModal";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { productRoutes } from "@/lib/product-routes";

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
const NAV   = ["DEAL LENS", "PROPERTY ANALYTICS", "PORTFOLIO INTELLIGENCE", "IC MEMO"];
const contentSide = (f: number) => (f % 2 === 0 ? "right" : "left");
const buildingX   = (f: number) => (f % 2 === 0 ? -40 : 40);

/* Window lights — single horizontal row at 52%, same rhythm every floor */
type LightColor = "warm" | "warm2" | "teal";
type Light = { l: string; t: string; c: LightColor };
const LIGHTS: Light[][] = [
  // fi=0 — IC Memo
  [
    { l: "10%", t: "52%", c: "warm"  },
    { l: "30%", t: "52%", c: "warm2" },
    { l: "48%", t: "52%", c: "teal"  },
    { l: "66%", t: "52%", c: "warm"  },
    { l: "85%", t: "52%", c: "warm2" },
  ],
  // fi=1 — Portfolio Intelligence
  [
    { l: "12%", t: "52%", c: "warm2" },
    { l: "30%", t: "52%", c: "warm"  },
    { l: "48%", t: "52%", c: "warm2" },
    { l: "68%", t: "52%", c: "teal"  },
    { l: "84%", t: "52%", c: "warm"  },
  ],
  // fi=2 — Property Analytics
  [
    { l: "11%", t: "52%", c: "warm"  },
    { l: "30%", t: "52%", c: "warm2" },
    { l: "48%", t: "52%", c: "warm"  },
    { l: "67%", t: "52%", c: "warm2" },
    { l: "85%", t: "52%", c: "warm"  },
  ],
  // fi=3 — Deal Lens
  [
    { l: "10%", t: "52%", c: "warm2" },
    { l: "30%", t: "52%", c: "warm"  },
    { l: "48%", t: "52%", c: "teal"  },
    { l: "68%", t: "52%", c: "warm2" },
    { l: "85%", t: "52%", c: "warm"  },
  ],
];

const LIGHT_CSS: Record<LightColor, { bg: string; glow: string }> = {
  warm:  { bg: "linear-gradient(180deg, #f3c98d, #b58044)", glow: "0 0 10px rgba(255,200,120,0.70)" },
  warm2: { bg: "linear-gradient(180deg, #ffd9a3, #c48a4a)", glow: "0 0 10px rgba(255,200,120,0.70)" },
  teal:  { bg: "linear-gradient(180deg, #3fd6b5, #1EBC9A)",  glow: "0 0 10px rgba(63,214,181,0.60)"  },
};

/* Mullion grid shared across all floors — strong dark dividers so they survive filter dimming */
const MULLION_BG = [
  "repeating-linear-gradient(90deg, transparent 0, transparent 13px, rgba(0,0,0,0.95) 13px, rgba(0,0,0,0.95) 14px)",
  "repeating-linear-gradient(90deg, rgba(30,188,154,0.25) 0, rgba(30,188,154,0.25) 7px, rgba(30,188,154,0.05) 7px, rgba(30,188,154,0.05) 14px)",
].join(", ");

/* Base navy-green wall color (diagonal mix as reference specifies) */
const WALL_BASE = "linear-gradient(135deg, #0a1530 0%, #0c2336 35%, #0a2a2f 65%, #0a1530 100%)";

const SLAB_ACTIVE   = "linear-gradient(180deg, #FAFAF7 0%, #d8d6cf 55%, #b8b6af 100%)";
const SLAB_INACTIVE = "linear-gradient(180deg, #7a8ca4 0%, #63768e 55%, #526070 100%)";

/* ───────────────────────────────────────────── Floor ── */
function Floor({ fi, activeFloor }: { fi: number; activeFloor: number }) {
  const feat       = features[TOTAL - 1 - fi];
  const fromBottom = TOTAL - 1 - fi;
  const isOverview = activeFloor === -1;
  const isCurrent  = !isOverview && activeFloor === fromBottom;
  /* isLit = any non-active floor while scrolling → dimmed via filter, NOT color change */
  const isLit      = !isOverview && !isCurrent;

  /* Active floor: add teal radial blobs on top of the shared mullion grid */
  const wallBg = isCurrent
    ? [
        MULLION_BG,
        "radial-gradient(ellipse 60% 80% at 18% 60%, rgba(30,188,154,0.28), transparent 65%)",
        "radial-gradient(ellipse 50% 70% at 75% 55%, rgba(63,214,181,0.18), transparent 65%)",
        WALL_BASE,
      ].join(", ")
    : [MULLION_BG, WALL_BASE].join(", ");

  /* §07 — dim with CSS filter, not opacity — keeps wall dark, not pale */
  const floorFilter = isLit ? "brightness(0.42) saturate(0.65)" : "none";

  const slabBg     = isCurrent ? SLAB_ACTIVE : SLAB_INACTIVE;
  const slabShadow = isCurrent
    ? "0 3px 0 rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -1px 0 rgba(0,0,0,0.30)"
    : "0 2px 0 rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.18)";

  /* LEDs: overview = 55% opacity; active = 1 (animated); isLit = 1 but filter dims them */
  const ledOpacity = isOverview ? 0.55 : 1.0;
  const showGlow   = isCurrent || isOverview;

  const labelColor = isCurrent ? "#1ebc9a" : "rgba(200,225,255,0.55)";
  const numColor   = isCurrent ? "rgba(255,255,255,0.68)" : "rgba(200,225,255,0.38)";

  return (
    /* §07 — filter applied to entire floor block (slab + balusters + wall) */
    <div style={{ filter: floorFilter, transition: "filter 0.5s" }}>

      {/* §02 SLAB — full container width, cantilevering 22px over the inset wall */}
      <div
        style={{
          height: "16px",
          transition: "background 0.55s, box-shadow 0.55s",
          background: slabBg,
          boxShadow: slabShadow,
        }}
      />

      {/* §06 Balcony balusters — vertical hash marks just below slab, 18px wider than wall */}
      <div
        style={{
          height: "6px",
          margin: "0 4px",
          backgroundImage: "repeating-linear-gradient(90deg, rgba(250,250,247,0.65) 0, rgba(250,250,247,0.65) 1px, transparent 1px, transparent 5px)",
          opacity: 0.85,
        }}
      />

      {/* §01 WALL — inset 22px each side; §01 height 78px (shorter floor) */}
      <div style={{ margin: "0 22px" }}>
        <div
          className="relative overflow-hidden"
          style={{ height: "78px", background: wallBg, transition: "background 0.65s" }}
        >
          {/* Transom architectural line at 30% from top */}
          <div
            style={{
              position: "absolute", left: 0, right: 0, top: "30%", height: "1px",
              background: "rgba(255,255,255,0.10)",
            }}
          />

          {/* §08 Window lights — single horizontal row */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
            {LIGHTS[fi].map((w, j) => {
              const lc = LIGHT_CSS[w.c];
              return (
                <motion.div
                  key={j}
                  animate={isCurrent ? { opacity: [0.70, 1, 0.70] } : {}}
                  transition={{ duration: 2 + j * 0.28, repeat: Infinity, repeatType: "mirror", delay: j * 0.14 }}
                  style={{
                    position: "absolute",
                    left: w.l, top: w.t,
                    width: "14px", height: "8px",
                    borderRadius: "1px",
                    opacity: ledOpacity,
                    background: lc.bg,
                    boxShadow: showGlow ? lc.glow : "none",
                    transition: "opacity 0.5s, box-shadow 0.5s",
                  }}
                />
              );
            })}
          </div>

          {/* Floor label — italic serif, top-left */}
          <span
            style={{
              position: "absolute", top: "7px", left: "10px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "12px", fontStyle: "italic", letterSpacing: "0.025em",
              color: labelColor,
              textShadow: isCurrent ? "0 0 20px rgba(30,188,154,0.65)" : "none",
              transition: "color 0.5s, text-shadow 0.5s",
              pointerEvents: "none",
            }}
          >
            {feat.title} {feat.titleAccent}
          </span>

          {/* Floor number — mono, top-right */}
          <span
            style={{
              position: "absolute", top: "7px", right: "10px",
              fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.16em",
              color: numColor, transition: "color 0.5s",
              pointerEvents: "none",
            }}
          >
            {feat.floorLabel}
          </span>

          {/* Active: teal rim border (inset, not clipped by overflow:hidden) */}
          {isCurrent && (
            <div
              style={{
                position: "absolute", inset: 0,
                border: "1px solid rgba(63,214,181,0.55)",
                pointerEvents: "none", zIndex: 10,
              }}
            />
          )}

          {/* Active: teal breath pulse */}
          {isCurrent && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0, 0.18, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "linear-gradient(90deg, transparent 5%, rgba(30,188,154,0.18) 50%, transparent 95%)",
                zIndex: 2,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── ContentPanel ── */
function ContentPanel({ feat, side }: { feat: typeof features[0]; side: "left" | "right" }) {
  const { guardNavigation } = useLoginGuard();
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "right" ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: side === "right" ? 30 : -30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[380px]"
    >
      <p className="text-[10px] font-mono tracking-[0.3em] uppercase mb-4" style={{ color: "#1ebc9a" }}>
        {feat.floorLabel} — {feat.category}
      </p>
      <h3
        className="font-display font-bold leading-[1.05] mb-1"
        style={{ color: "#FAFAF7", fontSize: "clamp(1.8rem, 2.8vw, 2.6rem)" }}
      >
        {feat.title}
      </h3>
      <h3
        className="font-display font-bold italic leading-[1.05] mb-5"
        style={{ color: "#1ebc9a", fontSize: "clamp(1.8rem, 2.8vw, 2.6rem)" }}
      >
        {feat.titleAccent}
      </h3>
      <p className="text-[14px] leading-[1.7] mb-6" style={{ color: "rgba(250,250,247,0.55)" }}>
        {feat.desc}
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-7">
        {feat.bullets.map((b, i) => (
          <div key={i} className="flex items-center gap-2.5 text-[13px]" style={{ color: "rgba(250,250,247,0.50)" }}>
            <span style={{ display: "inline-block", width: "8px", height: "1.5px", background: "#1ebc9a", flexShrink: 0 }} />
            {b}
          </div>
        ))}
      </div>
      <div className="flex gap-10 pt-5 mb-6 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-[9px] tracking-[0.22em] uppercase mb-1 font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{feat.m1L}</p>
          <p className="text-[13px] font-mono italic" style={{ color: "#1ebc9a" }}>{feat.m1V}</p>
        </div>
        <div>
          <p className="text-[9px] tracking-[0.22em] uppercase mb-1 font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{feat.m2L}</p>
          <p className="text-[13px] font-mono italic" style={{ color: "#1ebc9a" }}>{feat.m2V}</p>
        </div>
      </div>
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

/* ══════════════════════════════════════ PlatformFeatures ══ */
const PlatformFeatures = () => {
  const { isModalOpen, setIsModalOpen, goToLogin } = useLoginGuard();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFloor, setActiveFloor] = useState(-1);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if      (v < 0.20) setActiveFloor(-1);
    else if (v < 0.40) setActiveFloor(0);
    else if (v < 0.60) setActiveFloor(1);
    else if (v < 0.80) setActiveFloor(2);
    else               setActiveFloor(3);
  });

  const activeFeat = activeFloor >= 0 ? features[activeFloor] : null;
  const side       = activeFloor >= 0 ? contentSide(activeFloor) : null;
  const bX         = activeFloor >= 0 ? buildingX(activeFloor) : 0;

  return (
    <section
      ref={sectionRef}
      className="relative"
      id="platform"
      style={{ height: "420vh", background: "#090F1E" }}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden flex items-center justify-center"
        style={{ background: "#090F1E" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(30,188,154,0.03) 0%, transparent 70%)" }}
        />

        {/* Header */}
        <div className="absolute top-10 left-0 right-0 text-center z-10 pointer-events-none">
          <p className="text-[10px] font-semibold tracking-[0.35em] uppercase mb-3" style={{ color: "#1ebc9a" }}>
            What Asset72 Does
          </p>
          <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-[2rem]" style={{ color: "#FAFAF7" }}>
            Built floor by floor for
          </h2>
          <h2
            className="font-display font-bold text-2xl md:text-3xl lg:text-[2rem] italic"
            style={{ color: "rgba(250,250,247,0.28)" }}
          >
            institutional real estate.
          </h2>
        </div>

        <div
          className="relative z-10 flex items-center gap-6 lg:gap-10 w-full max-w-[1400px] mx-auto mt-10"
          style={{ paddingLeft: "196px", paddingRight: "196px" }}
        >
          {/* LEFT panel */}
          <div className="hidden lg:flex flex-1 justify-end pr-8">
            <AnimatePresence mode="wait">
              {side === "left" && activeFeat && (
                <ContentPanel key={`l-${activeFloor}`} feat={activeFeat} side="left" />
              )}
            </AnimatePresence>
          </div>

          {/* CENTER — building */}
          <motion.div
            className="flex-shrink-0"
            animate={{ x: bX }}
            transition={{ type: "spring", stiffness: 90, damping: 22 }}
            style={{ width: "clamp(320px, 30vw, 460px)" }}
          >
            {/* §05 — no border, no outer rectangle */}
            <div
              className="rounded-sm overflow-hidden"
              style={{
                background: "#03070e",
                boxShadow: "0 32px 80px rgba(0,0,0,0.90), 0 8px 32px rgba(0,0,0,0.55)",
              }}
            >
              {/* §04 ROOF — narrow centered parapet cap, not full-width */}
              <div style={{ background: "#040911" }}>
                <div style={{ display: "flex", justifyContent: "center", paddingTop: "8px" }}>
                  <div
                    style={{
                      width: "24%",
                      height: "10px",
                      background: "linear-gradient(180deg, #FAFAF7, #c9c7c0)",
                      boxShadow: "0 1px 0 rgba(0,0,0,0.4)",
                    }}
                  />
                </div>
                {/* Pulsing antenna dot in roof deck area */}
                <div className="flex items-center justify-center gap-3" style={{ height: "22px" }}>
                  <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(30,188,154,0.40))" }} />
                  <motion.div
                    animate={{ opacity: [0.28, 1, 0.28], scale: [0.88, 1.12, 0.88] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
                      background: "#1ebc9a",
                      boxShadow: "0 0 12px rgba(30,188,154,1), 0 0 24px rgba(30,188,154,0.55)",
                    }}
                  />
                  <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, rgba(30,188,154,0.40), transparent)" }} />
                </div>
              </div>

              {/* ── Floors: IC Memo (top) → Deal Lens (bottom) ── */}
              {Array.from({ length: TOTAL }).map((_, fi) => (
                <Floor key={fi} fi={fi} activeFloor={activeFloor} />
              ))}

              {/* Ground slab — closes off the last floor */}
              <div
                style={{
                  height: "16px",
                  background: SLAB_INACTIVE,
                  boxShadow: "0 3px 0 rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.18)",
                }}
              />

              {/* Lobby / Foundation bar */}
              <div
                style={{
                  height: "16px",
                  background: "linear-gradient(180deg, #1de0b0 0%, #16c49a 30%, #10a880 70%, #0d9070 100%)",
                  boxShadow: "0 0 36px rgba(30,188,154,0.55), 0 4px 18px rgba(30,188,154,0.30)",
                }}
              >
                <div className="flex items-center justify-center h-full gap-[3px] px-2">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: "8px", height: "10px", borderRadius: "1px",
                        background: `rgba(255,255,255,${i % 3 === 0 ? "0.18" : "0.07"})`,
                      }}
                    />
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
                {activeFloor === -1 ? "Scroll to Explore" : "Scroll to Assemble"}
              </motion.p>
              <span style={{ color: "rgba(255,255,255,0.10)", fontSize: "9px" }}>·</span>
              <p className="text-[9px] font-mono" style={{ color: "rgba(30,188,154,0.50)" }}>
                {activeFloor >= 0 ? `N° ${String(activeFloor + 1).padStart(2, "0")} / 0${TOTAL}` : `— / 0${TOTAL}`}
              </p>
            </div>
          </motion.div>

          {/* RIGHT panel */}
          <div className="hidden lg:flex flex-1 justify-start pl-8">
            <AnimatePresence mode="wait">
              {side === "right" && activeFeat && (
                <ContentPanel key={`r-${activeFloor}`} feat={activeFeat} side="right" />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav dots — absolutely positioned, never overlaps content panels */}
        <div
          className="absolute z-20 hidden xl:flex flex-col gap-5"
          style={{ right: "32px", top: "50%", transform: "translateY(-50%)" }}
        >
          {NAV.map((label, i) => {
            const isAct  = i === activeFloor;
            const isPast = activeFloor > 0 && i < activeFloor;
            return (
              <div key={label} className="flex items-center gap-2.5">
                <div
                  style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    transition: "background 0.4s, box-shadow 0.4s, border 0.4s",
                    background: isAct ? "#1ebc9a" : isPast ? "rgba(30,188,154,0.30)" : "transparent",
                    border: isAct ? "none" : isPast ? "1px solid rgba(30,188,154,0.28)" : "1px solid rgba(255,255,255,0.15)",
                    boxShadow: isAct ? "0 0 8px rgba(30,188,154,0.70)" : "none",
                  }}
                />
                <span
                  className="text-[8px] font-mono tracking-[0.15em] whitespace-nowrap"
                  style={{
                    transition: "color 0.3s",
                    color: isAct ? "#1ebc9a" : isPast ? "rgba(30,188,154,0.45)" : "rgba(255,255,255,0.18)",
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile content */}
        <div className="lg:hidden absolute bottom-6 left-0 right-0 px-6">
          <AnimatePresence mode="wait">
            {activeFeat && (
              <motion.div
                key={activeFloor}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-[10px] font-mono tracking-widest mb-1" style={{ color: "#1ebc9a" }}>
                  {activeFeat.floorLabel}
                </p>
                <h4 className="font-display font-bold text-xl" style={{ color: "#FAFAF7" }}>
                  {activeFeat.title}{" "}
                  <span className="italic" style={{ color: "#1ebc9a" }}>{activeFeat.titleAccent}</span>
                </h4>
                <p className="text-sm mt-1" style={{ color: "rgba(250,250,247,0.45)" }}>{activeFeat.desc}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AccessBlockedModal open={isModalOpen} onOpenChange={setIsModalOpen} onGoToLogin={goToLogin} />
    </section>
  );
};

export default PlatformFeatures;
