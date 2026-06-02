import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, LineChart, Brain, Radar } from "lucide-react";
import AccessBlockedModal from "./AccessBlockedModal";
import "./home.css";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { productRoutes } from "@/lib/product-routes";

const features = [
  {
    icon: Search, floorLabel: "N° 01", category: "Early-stage Acquisition Screening",
    title: "Deal", titleAccent: "Lens",
    desc: "Pre-underwriting intelligence designed to identify viable opportunities before full diligence begins.",
    bullets: ["Lease rollover exposure", "In-place vs market rents", "Occupancy volatility", "Revenue concentration", "Expense pressure", "Market positioning"],
    m1L: "OUTPUT", m1V: "Investment viability assessment", m2L: "INGESTED DATA", m2V: "T12 · Rent Roll · Offering Memo · Market Data", m3L: "DECISION SUPPORT", m3V: "Prioritize · Underwrite · Decline",
    route: productRoutes.dealLens,
  },
  {
    icon: LineChart, floorLabel: "N° 02", category: "Asset Level Operational Intelligence",
    title: "Property", titleAccent: "Intelligence",
    desc: "Transform fragmented property reporting into continuous operational visibility.",
    bullets: ["Leasing performance", "Revenue quality", "Expense drift", "Occupancy trends","Rent positioning","Asset risk indicators"],
    m1L: "DATA GRANULARITY", m1V: "Unit · Lease · Asset", m2L: "LIVE DATA STATUS", m2V: "Updated daily · Change from refresh ", m3L: "", m3V: "",
    route: productRoutes.propertyIntelligence,
  },
  {
    icon: Brain, floorLabel: "N° 03", category: "Cross Asset Portfolio Monitoring",
    title: "Portfolio", titleAccent: "Intelligence",
    desc: "Designed for portfolio managers overseeing asset performance, operational exposure, and forward-looking portfolio risk.",
    bullets: ["Concentration exposure", "Revenue deterioration", "Asset-level volatility", "Market underperformance", "Operational drift","Forward-looking risk "],
    m1L: "ANALYSIS HORIZON", m1V: "Near-Term → Long-Term", m2L: "OUTPUT", m2V: "Predictive Portfolio Signals", m3L: "", m3V: "",
    route: productRoutes.portfolioIntelligence,
  },
  {
    icon: Radar, floorLabel: "N° 04", category: "Committee Ready Investment Narratives",
    title: "IC", titleAccent: "Intelligence",
    desc: "Designed to structure institutional investment decisions through standardized, intelligence-backed committee workflows.",
    bullets: ["Investment rationale", "Risk attribution", "Performance synthesis", "Capital recommendations","Portfolio exposure context","Strategic action pathways"],
    m1L: "OUTPUT FORMAT", m1V: "Investment Memo · Committee Deck", m2L: "DECISION STANDARD", m2V: "Institutional-Grade · Built Around Institutional Investment Workflows", m3L: "", m3V: "",
    route: productRoutes.aiRentIntelligence,
  },
];

const TOTAL = features.length;
const NAV   = ["DEAL LENS", "PROPERTY INTELLIGENCE", "PORTFOLIO INTELLIGENCE", "IC INTELLIGENCE"];

const contentSide = (f: number) => (f % 2 === 0 ? "right" : "left");
const buildingX   = (f: number) => (f % 2 === 0 ? -120 : 120);

type LightColor = "warm" | "warm2" | "teal";
type Light = { l: string; t: string; c: LightColor };

const LIGHTS: Light[][] = [
  [{ l: "14%", t: "44%", c: "warm" }, { l: "38%", t: "60%", c: "warm2" }, { l: "60%", t: "50%", c: "teal" }, { l: "80%", t: "58%", c: "warm" }],
  [{ l: "14%", t: "42%", c: "warm" }, { l: "38%", t: "58%", c: "warm2" }, { l: "60%", t: "48%", c: "teal" }, { l: "80%", t: "56%", c: "warm" }],
  [{ l: "14%", t: "44%", c: "warm" }, { l: "38%", t: "60%", c: "warm2" }, { l: "60%", t: "50%", c: "teal" }, { l: "80%", t: "58%", c: "warm" }],
  [{ l: "14%", t: "42%", c: "warm" }, { l: "38%", t: "58%", c: "warm2" }, { l: "60%", t: "48%", c: "teal" }, { l: "80%", t: "56%", c: "warm" }],
];

const LIGHT_CSS: Record<LightColor, { bg: string; glow: string }> = {
  warm:  { bg: "linear-gradient(180deg,#ffd9a3,#b58044)", glow: "0 0 14px rgba(255,200,120,0.85), 0 0 4px rgba(255,200,120,1)" },
  warm2: { bg: "linear-gradient(180deg,#f3c98d,#b58044)", glow: "0 0 8px rgba(255,200,120,0.6)" },
  teal:  { bg: "linear-gradient(180deg,#3fd6b5,#1EBC9A)", glow: "0 0 8px rgba(63,214,181,0.55)" },
};

const WALL_BASE_BG      = "linear-gradient(180deg,#0a1a28 0%,#0d2030 100%)";
const MULLION_BG        = "repeating-linear-gradient(90deg,rgba(30,188,154,0.22) 0,rgba(30,188,154,0.22) 6px,rgba(30,188,154,0.08) 6px,rgba(30,188,154,0.08) 13px,rgba(0,0,0,0.75) 13px,rgba(0,0,0,0.75) 14px)";
const WALL_ACTIVE_RADIALS = "radial-gradient(ellipse 50% 90% at 25% 50%,rgba(30,188,154,0.40),transparent 65%),radial-gradient(ellipse 40% 80% at 75% 55%,rgba(30,188,154,0.25),transparent 65%)";
const SLAB_ACTIVE       = "linear-gradient(180deg,#FAFAF7 0%,#d8d6cf 100%)";
const SLAB_INACTIVE     = "linear-gradient(180deg,rgba(255,255,255,0.25) 0%,rgba(200,210,230,0.15) 100%)";

// Measured height of one floor block in px
// slab-top 7 + balcony-top 9 + wall 80 + balcony-bot 9 + slab-bot 7 = 112
// lobby 18 only on fi=3
const FLOOR_H       = 112;
const LOBBY_H       = 18;
const BUILDING_H    = FLOOR_H * TOTAL + LOBBY_H; // 448 + 18 = 466

/* ease-in-out quad */
const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

/**
 * Compute per-floor intro transform for a given raw scroll progress p ∈ [0, 0.20].
 *
 * 4 phases, each covering 25% of the intro range (0.05 each):
 *
 *  Phase 1  [0.00–0.05]  Floors appear stacked at bottom, fading in
 *  Phase 2  [0.05–0.10]  All floors rise upward together
 *  Phase 3  [0.10–0.15]  Floors spread into diagonal zigzag staircase
 *  Phase 4  [0.15–0.20]  Floors converge back into one assembled building
 */
function getIntroTransform(
  fi: number,
  p: number,
): { x: number; y: number; opacity: number; scale: number } {
  // fi=0 → IC Memo (top floor), fi=3 → Deal Lens (bottom floor)
  // floorIdx: 0 = bottom, 3 = top (used for stagger direction)
  const floorIdx = TOTAL - 1 - fi; // fi=0→3, fi=3→0

  const e1 = ease(Math.min(1, Math.max(0, (p - 0.00) / 0.05)));
  const e2 = ease(Math.min(1, Math.max(0, (p - 0.05) / 0.05)));
  const e3 = ease(Math.min(1, Math.max(0, (p - 0.10) / 0.05)));
  const e4 = ease(Math.min(1, Math.max(0, (p - 0.15) / 0.05)));

  // ── Y axis ──────────────────────────────────────────────────────────────
  // Phase 1: start far below (+280px) → fade in but stay near bottom (+220px)
  const yStart   = 280;
  const yP1end   = 220; // still below center after phase 1
  const yAfterP1 = yStart + (yP1end - yStart) * e1;

  // Phase 2: all floors rise together from yP1end → 0 (center)
  const yAfterP2 = yAfterP1 * (1 - e2);

  // Phase 3: diagonal spread — top floors go up, bottom floors go down
  // floorIdx 3 (top) → -70px, floorIdx 0 (bottom) → +70px
  const spreadY  = (1.5 - floorIdx) * 60; // bottom floor: +90, top floor: -90
  const yAfterP3 = yAfterP2 + spreadY * e3;

  // Phase 4: converge everything back to assembled (0)
  const yFinal   = yAfterP3 * (1 - e4);

  // ── X axis ──────────────────────────────────────────────────────────────
  // Phase 3: zigzag — alternate left/right, bigger offset for bottom floors
  const zigzagSign = fi % 2 === 0 ? 1 : -1;
  const spreadX    = zigzagSign * (20 + floorIdx * 22);
  const xAfterP3   = spreadX * e3;
  const xFinal     = xAfterP3 * (1 - e4);

  // ── Opacity: 0 → 1 during phase 1 ──────────────────────────────────────
  const opacity = e1;

  // ── Scale: very slight shrink at max spread ──────────────────────────────
  const scale = 1 - 0.03 * e3 * (1 - e4);

  return { x: xFinal, y: yFinal, opacity, scale };
}

/* ─── Floor Component (unchanged from original) ─── */
function Floor({ fi, activeFloor }: { fi: number; activeFloor: number }) {
  const feat       = features[TOTAL - 1 - fi];
  const fromBottom = TOTAL - 1 - fi;
  const isOverview = activeFloor === -1;
  const isCurrent  = !isOverview && activeFloor === fromBottom;
  const isLit      = !isOverview && !isCurrent;

  const floorFilter = isLit ? "brightness(0.5) saturate(0.8)" : "none";
  const wallBg      = isCurrent ? `${WALL_ACTIVE_RADIALS}, ${WALL_BASE_BG}` : WALL_BASE_BG;
  const slabBg      = isCurrent ? SLAB_ACTIVE : SLAB_INACTIVE;
  const slabShadow  = isCurrent ? "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.25)" : "none";
  const wallShadow  = isCurrent ? "inset 0 0 0 1px rgba(63,214,181,0.6), 0 0 50px -8px rgba(30,188,154,0.5)" : "inset 0 0 0 1px rgba(0,0,0,0.5)";
  const labelOpacity = isCurrent ? 1 : 0.65;
  const labelColor   = isCurrent ? "#3fd6b5" : "rgba(250,250,247,0.65)";
  const numColor     = isCurrent ? "#1EBC9A"  : "rgba(250,250,247,0.65)";

  return (
    <div style={{ filter: floorFilter, transition: "filter 0.4s" }}>
      <div style={{ height: "7px", background: slabBg, boxShadow: slabShadow, transition: "background 0.4s, box-shadow 0.4s" }} />
      <div style={{ height: "9px", backgroundImage: "repeating-linear-gradient(90deg,rgba(250,250,247,0.85) 0 1px,transparent 1px 5px)", opacity: 0.85 }} />
      <div className="relative overflow-hidden" style={{ background: wallBg, boxShadow: wallShadow, transition: "background 0.5s, box-shadow 0.5s", minHeight: "80px" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: MULLION_BG, pointerEvents: "none", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
          {LIGHTS[fi].map((w, j) => {
            const lc = LIGHT_CSS[w.c];
            return (
              <motion.div key={j}
                animate={isCurrent ? { opacity: [0.7, 1, 0.7] } : {}}
                transition={{ duration: 2 + j * 0.28, repeat: Infinity, repeatType: "mirror", delay: j * 0.14 }}
                style={{ position: "absolute", left: w.l, top: w.t, width: w.c === "warm" && j === 0 ? "6px" : "14px", height: w.c === "warm" && j === 0 ? "14px" : "5px", borderRadius: "1px", background: lc.bg, boxShadow: (isCurrent || isOverview) ? lc.glow : "none", transition: "box-shadow 0.4s" }}
              />
            );
          })}
        </div>
        <div style={{ position: "absolute", left: "14px", top: "8px", zIndex: 6, color: labelColor, fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "14px", textShadow: "0 1px 8px rgba(0,0,0,0.9)", opacity: labelOpacity, transition: "opacity 0.5s, color 0.5s", pointerEvents: "none" }}>
          {feat.title} {feat.titleAccent}
        </div>
        <div style={{ position: "absolute", right: "14px", top: "10px", zIndex: 6, color: numColor, fontFamily: "'Fraunces', Georgia, serif", fontSize: "11px", letterSpacing: "0.22em", opacity: labelOpacity, transition: "opacity 0.5s, color 0.5s", pointerEvents: "none" }}>
          {feat.floorLabel}
        </div>
        {isCurrent && (
          <motion.div className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0, 0.18, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "linear-gradient(90deg,transparent 5%,rgba(30,188,154,0.18) 50%,transparent 95%)", zIndex: 3 }}
          />
        )}
      </div>
      <div style={{ height: "9px", backgroundImage: "repeating-linear-gradient(90deg,rgba(250,250,247,0.85) 0 1px,transparent 1px 5px)", opacity: 0.85 }} />
      <div style={{ height: "7px", background: slabBg, boxShadow: slabShadow, transition: "background 0.4s, box-shadow 0.4s" }} />
      {fi === 3 && (
        <div style={{ height: `${LOBBY_H}px`, background: "linear-gradient(180deg,#2bb893 0%,#1d8770 100%)", overflow: "hidden", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)", opacity: isOverview || isCurrent ? 1 : 0.4, transition: "opacity 0.6s" }}>
          <div style={{ position: "absolute", inset: "2px 4px", backgroundImage: "repeating-linear-gradient(90deg,rgba(0,0,0,0.5) 0 1px,transparent 1px 8px)" }} />
        </div>
      )}
    </div>
  );
}

/* ─── ContentPanel (unchanged) ─── */
function ContentPanel({ feat, side }: { feat: typeof features[0]; side: "left" | "right" }) {
  const isDealLens = feat.title === "Deal";
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "right" ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: side === "right" ? 30 : -30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`max-w-[520px] platform-content-panel ${isDealLens ? "platform-content-panel--deal-lens" : ""}`}
    >
      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", color: "#3fd6b5", fontSize: "13px", letterSpacing: "0.18em", marginBottom: "16px", whiteSpace: "nowrap" }}>
        {feat.floorLabel} — {feat.category}
      </p>
      {isDealLens ? (
        <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "16px" }}>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(34px, 3.8vw, 56px)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "#FAFAF7", margin: 0 }}>
            {feat.title}
          </h2>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(34px, 3.8vw, 56px)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "#3fd6b5", margin: 0 }}>
            {feat.titleAccent}
          </h2>
        </div>
      ) : (
        <>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "clamp(34px, 3.8vw, 56px)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "#FAFAF7", marginBottom: "0px" }}>
            {feat.title}
          </h2>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(34px, 3.8vw, 56px)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "#3fd6b5", marginBottom: "16px" }}>
            {feat.titleAccent}
          </h2>
        </>
      )}
      <p style={{ color: "rgba(250,250,247,0.72)", fontSize: "16px", lineHeight: 1.65, maxWidth: isDealLens ? "100%" : "500px", marginBottom: isDealLens ? "16px" : "22px", whiteSpace: "pre-line" }}>
        {feat.desc}
      </p>
      <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: isDealLens ? "8px 20px" : "10px 22px", marginBottom: isDealLens ? "16px" : "22px", padding: 0 }}>
        {feat.bullets.map((b, i) => (
          <li key={i} style={{ color: "#FAFAF7", fontSize: "15px", letterSpacing: "0.01em", paddingLeft: "16px", position: "relative", lineHeight: 1.4 }}>
            <span style={{ position: "absolute", left: 0, top: "8px", width: "8px", height: "1px", background: "#1EBC9A", display: "block" }} />
            {b}
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: isDealLens ? "22px" : "28px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: isDealLens ? "12px" : "16px", marginTop: isDealLens ? "12px" : "18px" }}>
        {[{ l: feat.m1L, v: feat.m1V }, { l: feat.m2L, v: feat.m2V }, ...(feat.m3L ? [{ l: feat.m3L, v: feat.m3V }] : [])].map(({ l, v }) => (
          <div key={l} style={{ flexShrink: 0 }}>
            <div style={{ color: "rgba(250,250,247,0.42)", fontSize: "12px", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "4px" }}>{l}</div>
            <div style={{ color: "#3fd6b5", fontFamily: "'Fraunces', Georgia, serif", fontSize: "14px", fontWeight: 300, fontStyle: "italic", lineHeight: 1.6 }}>
              {v.includes(" · ") ? v.split(" · ").map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "baseline", gap: "3px", whiteSpace: "nowrap" }}>
                  <span style={{ flexShrink: 0 }}>·</span>
                  <span>{item}</span>
                </div>
              )) : v}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MobileContentPanel({ feat }: { feat: typeof features[0] }) {
  const metrics = [
    { l: feat.m1L, v: feat.m1V },
    { l: feat.m2L, v: feat.m2V },
    ...(feat.m3L ? [{ l: feat.m3L, v: feat.m3V }] : []),
  ];

  return (
    <motion.div
      key={feat.floorLabel}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="platform-mobile-card"
    >
      <p className="platform-mobile-eyebrow">{feat.floorLabel}</p>
      <h4 className="platform-mobile-title">
        {feat.title} <em>{feat.titleAccent}</em>
      </h4>
      <p className="platform-mobile-desc">{feat.desc}</p>

      <ul className="platform-mobile-bullets">
        {feat.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>

      <div className="platform-mobile-metrics">
        {metrics.map(({ l, v }) => (
          <div key={l}>
            <span>{l}</span>
            <p>{v}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════ PlatformFeatures ══ */
const PlatformFeatures = () => {
  const { isModalOpen, setIsModalOpen, goToLogin } = useLoginGuard();
  const sectionRef = useRef<HTMLElement>(null);

  const [activeFloor, setActiveFloor] = useState(0);
  const [rawProgress, setRawProgress] = useState(0);
  const [headTopVis,  setHeadTopVis]  = useState(1);
  const [headBotVis,  setHeadBotVis]  = useState(1);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobileView(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setRawProgress(v);

    if      (v < 0.25) setActiveFloor(0);
    else if (v < 0.50) setActiveFloor(1);
    else if (v < 0.75) setActiveFloor(2);
    else               setActiveFloor(3);

    setHeadTopVis(1);
    setHeadBotVis(Math.max(0, Math.min(1, 1 - v / 0.06)));
  });

  const activeFeat = activeFloor >= 0 ? features[activeFloor] : null;
  const side       = activeFloor >= 0 ? contentSide(activeFloor) : null;
  const bX         = activeFloor >= 0 ? buildingX(activeFloor) : 0;
  const stampText  = `N° 0${activeFloor + 1} / 04`;

  const introComplete = true;

  return (
    <section
      ref={sectionRef}
      className="platform-features-section"
      id="platform"
      style={{ height: "420vh", background: "#1a2535", position: "relative" }}
    >
      <div className="platform-features-sticky sticky top-0 h-screen overflow-hidden"
        style={{ background: "#0F213D" }}
      >
        {/* ── STAMP TL ── */}
        <div className="platform-stamp absolute z-20 pointer-events-none" style={{ top: "120px", left: "40px" }}>
          <div style={{ color: "rgba(250,250,247,0.42)", fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase" }}>Est. MMXXVI · Golden Hills</div>
          <span style={{ color: "#3fd6b5", fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: "15px", letterSpacing: "0.02em", display: "block", marginTop: "4px", fontWeight: 400 }}>The Operating System</span>
        </div>

        {/* ── STAMP BR ── */}
        <div className="platform-stamp absolute z-20 pointer-events-none text-right" style={{ bottom: "36px", right: "40px" }}>
          <div style={{ color: "rgba(250,250,247,0.42)", fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase" }}>Navigate the Stack</div>
          <span style={{ color: "#3fd6b5", fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontSize: "15px", letterSpacing: "0.02em", display: "block", marginTop: "4px", fontWeight: 400 }}>{stampText}</span>
        </div>

        {/* ── HEAD TOP ── */}
        <div className="platform-heading absolute left-0 right-0 z-10 text-center pointer-events-none"
          style={{ top: "120px", padding: "0 40px", opacity: headTopVis, transform: `translateY(${-(1 - headTopVis) * 16}px)`, transition: "opacity 0.1s, transform 0.1s" }}
        >
          <div className="platform-heading-kicker" style={{ display: "inline-flex", alignItems: "center", gap: "14px", color: "#1EBC9A", fontSize: "11px", letterSpacing: "0.32em", textTransform: "uppercase", marginBottom: "18px" }}>
            <span style={{ width: "32px", height: "1px", background: "#1EBC9A", opacity: 0.6, display: "block" }} />
            What Asset72 Does
            <span style={{ width: "32px", height: "1px", background: "#1EBC9A", opacity: 0.6, display: "block" }} />
          </div>
          <h2 className="platform-heading-title" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "44px", lineHeight: 1.04, letterSpacing: "-0.025em", color: "#FAFAF7" }}>
            From acquisition to portfolio strategy — unified in one system<br />
            <em style={{ display: "inline-block", marginTop: "24px", fontStyle: "italic", color: "#3fd6b5", fontWeight: 300 }}>Intelligence Layers</em>{" "}
          </h2>
        </div>

        {/* ── HEAD BOT ── */}
        <div className="platform-bottom-prompt absolute left-0 right-0 z-10 text-center pointer-events-none"
          style={{ bottom: "70px", padding: "0 40px", opacity: headBotVis, transform: `translateY(${(1 - headBotVis) * 16}px)`, transition: "opacity 0.1s, transform 0.1s" }}
        >
          {/* <p style={{ color: "rgba(250,250,247,0.72)", fontSize: "14px", lineHeight: 1.65, maxWidth: "540px", margin: "0 auto 18px" }}>
            From acquisition underwriting to active asset management — four disciplines, one operating system. Scroll to assemble the platform.
          </p> */}
          <div style={{ color: "rgba(250,250,247,0.5)", fontSize: "10px", letterSpacing: "0.32em", textTransform: "uppercase", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <span>Scroll</span>
            <motion.span
              animate={{ scaleY: [0.3, 1, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: "block", width: "1px", height: "34px", background: "linear-gradient(to bottom, #1EBC9A, transparent)", transformOrigin: "top" }}
            />
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="platform-main absolute left-0 right-0 bottom-0 flex items-center justify-center" style={{ top: "clamp(240px, 30vh, 340px)", zIndex: 5 }}>
          <div className="platform-main-inner relative flex items-center w-full"
            style={{ maxWidth: "1400px", margin: "0 auto", paddingLeft: "196px", paddingRight: "260px", gap: "0" }}
          >
            {/* LEFT PANEL */}
            <div className="hidden lg:flex flex-1 justify-end" style={{ paddingRight: "32px" }}>
              <AnimatePresence mode="wait">
                {side === "left" && activeFeat && (
                  <ContentPanel key={`l-${activeFloor}`} feat={activeFeat} side="left" />
                )}
              </AnimatePresence>
            </div>

            {/* ── BUILDING ── */}
            <motion.div
              className="platform-building flex-shrink-0"
              animate={{ x: isMobileView ? 0 : bX }}
              transition={{ type: "spring", stiffness: 90, damping: 22 }}
              style={{ width: "clamp(320px, 30vw, 560px)" }}
            >
              <div className="platform-building-stage" style={{ perspective: "1800px", perspectiveOrigin: "50% 45%" }}>
                {introComplete ? (
                  /*
                   * ── ASSEMBLED STATE (p >= 0.20) ──
                   * Plain stacked block layout — identical to original code.
                   * No transforms, floors stack naturally top-to-bottom.
                   */
                  <div>
                    {Array.from({ length: TOTAL }).map((_, fi) => (
                      <Floor key={fi} fi={fi} activeFloor={activeFloor} />
                    ))}
                  </div>
                ) : (
                  /*
                   * ── INTRO STATE (p < 0.20) ──
                   * Absolute-positioned floors, each driven by getIntroTransform().
                   * Container height = BUILDING_H so it occupies the right space.
                   * Each floor sits at its natural stacked Y via `top: fi * FLOOR_H`,
                   * then getIntroTransform() applies relative translate on top of that.
                   */
                  <div style={{ position: "relative", height: `${BUILDING_H}px` }}>
                    {Array.from({ length: TOTAL }).map((_, fi) => {
                      const { x, y, opacity, scale } = getIntroTransform(fi, rawProgress);
                      return (
                        <div
                          key={fi}
                          style={{
                            position: "absolute",
                            top:   fi * FLOOR_H,
                            left:  0,
                            right: 0,
                            // scroll-driven — no CSS transition so it tracks scroll exactly
                            transform: `translate(${x}px, ${y}px) scale(${scale})`,
                            opacity,
                          }}
                        >
                          <Floor fi={fi} activeFloor={-1} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Counter */}
              <div className="platform-building-counter flex items-center justify-center gap-3 mt-5">
                <motion.p
                  animate={{ opacity: [0.25, 0.55, 0.25] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "monospace", color: "rgba(255,255,255,0.30)" }}
                >
                  {"Navigate the Stack"}
                </motion.p>
                <span style={{ color: "rgba(255,255,255,0.10)", fontSize: "9px" }}>·</span>
                <p style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(30,188,154,0.50)" }}>
                  {`N° ${String(activeFloor + 1).padStart(2, "0")} / 0${TOTAL}`}
                </p>
              </div>
            </motion.div>

            {/* RIGHT PANEL */}
            <div className="hidden lg:flex flex-1 justify-start" style={{ paddingLeft: "32px" }}>
              <AnimatePresence mode="wait">
                {side === "right" && activeFeat && (
                  <ContentPanel key={`r-${activeFloor}`} feat={activeFeat} side="right" />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── PROGRESS RAIL ── */}
        <div className="absolute z-30 hidden xl:flex flex-col"
          style={{ right: "24px", top: "50%", transform: "translateY(-50%)", gap: "18px", padding: "18px 14px 18px 18px", background: "linear-gradient(to left, rgba(9,15,30,0.85) 40%, rgba(9,15,30,0))", borderLeft: "1px solid rgba(30,188,154,0.15)" }}
        >
          {NAV.map((label, i) => {
            const isAct  = i === activeFloor;
            const isPast = activeFloor > i;
            return (
              <div key={label} className="flex items-center" style={{ gap: "14px" }}>
                <span style={{ width: "6px", height: "6px", border: isAct ? "1px solid #1EBC9A" : isPast ? "1px solid rgba(30,188,154,0.40)" : "1px solid rgba(250,250,247,0.42)", borderRadius: "50%", background: isAct ? "#1EBC9A" : isPast ? "rgba(30,188,154,0.30)" : "transparent", boxShadow: isAct ? "0 0 0 4px rgba(30,188,154,0.18)" : "none", display: "inline-block", flexShrink: 0, transition: "all 0.4s" }} />
                <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: isAct ? "#3fd6b5" : isPast ? "rgba(30,188,154,0.45)" : "rgba(250,250,247,0.42)", transition: "color 0.4s", whiteSpace: "nowrap" }}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* ── MOBILE CONTENT ── */}
        <div className="platform-mobile-content lg:hidden absolute bottom-6 left-0 right-0 px-6 z-10">
          <AnimatePresence mode="wait">
            {activeFeat && (
              <MobileContentPanel feat={activeFeat} />
            )}
          </AnimatePresence>
        </div>
      </div>

      <AccessBlockedModal open={isModalOpen} onOpenChange={setIsModalOpen} onGoToLogin={goToLogin} />
    </section>
  );
};

export default PlatformFeatures;
