import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import { ArrowRight, Play, Building2, Radar, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import RequestDemoForm from "./RequestDemoForm";
import heroSkyline from "../assets/skyline-sky-replaced.jpg";

/* ── Slow stat counter ── */
const StatNum = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !go) setGo(true);
    }, { threshold: 0.5 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [go]);
  useEffect(() => {
    if (!go) return;
    let s = 0;
    const step = target / 300;
    const t = setInterval(() => {
      s += step;
      if (s >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(s));
    }, 16);
    return () => clearInterval(t);
  }, [go, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const stats = [
  { icon: Building2, value: 850, suffix: "+", label: "Assets Modeled" },
  { icon: Radar, value: 3, suffix: "K+", label: "Market Signals" },
  { icon: Briefcase, value: 132, suffix: "+", label: "Active Portfolios" },
];

const trustLogos = ["CBRE", "JLL", "CUSHMAN & WAKEFIELD", "NEWMARK", "TRANSWESTERN"];

/* ── Glass Card (entry animation) ── */
const GlassCard = ({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 40, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`rounded-2xl border border-white/50 bg-white/55 backdrop-blur-2xl shadow-[0_8px_40px_rgba(15,23,42,0.1)] ${className}`}
  >
    {children}
  </motion.div>
);

/* ── Orbit Card (no entry animation, same glass style) ── */
const OrbitCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/50 bg-white/55 backdrop-blur-2xl shadow-[0_8px_40px_rgba(15,23,42,0.1)] ${className}`}>
    {children}
  </div>
);

/* ── Orbit Wrapper: smooth circular motion via useAnimationFrame ── */
const OrbitWrapper = ({ children, radius, startAngle, duration = 22, fadeDelay = 0.7 }: {
  children: React.ReactNode;
  radius: number;
  startAngle: number;
  duration?: number;
  fadeDelay?: number;
}) => {
  const x = useMotionValue(radius * Math.sin(startAngle));
  const y = useMotionValue(-radius * Math.cos(startAngle));

  useAnimationFrame((t) => {
    const angle = startAngle + (t / (duration * 1000)) * 2 * Math.PI;
    x.set(radius * Math.sin(angle));
    y.set(-radius * Math.cos(angle));
  });

  return (
    <motion.div
      className="absolute overflow-visible z-10"
      style={{ left: "50%", top: "50%", width: 0, height: 0, x, y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: fadeDelay }}
    >
      <div className="absolute -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════ */
const HeroSection = () => {
  const [isRequestDemoOpen, setIsRequestDemoOpen] = useState(false);

  return (
    <section className="relative min-h-screen overflow-hidden">

      {/* ══ FULL BACKGROUND IMAGE ══ */}
      <div className="absolute inset-0">
        <img
          src={heroSkyline}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Left-to-right gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to right,
              rgba(244,248,252,0.55) 0%,
              rgba(244,248,252,0.38) 22%,
              rgba(244,248,252,0.18) 40%,
              rgba(244,248,252,0.06) 58%,
              transparent 100%
            )`,
          }}
        />
        {/* Top gradient for navbar area */}
        <div
          className="absolute inset-x-0 top-0 h-28"
          style={{ background: "linear-gradient(to bottom, rgba(244,248,252,0.35), transparent)" }}
        />
        {/* Bottom subtle fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-20"
          style={{ background: "linear-gradient(to top, rgba(244,248,252,0.20), transparent)" }}
        />
        {/* Subtle grid pattern over everything */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.012)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.012)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      {/* ══ CONTENT ══ */}
      <div className="relative z-10 mx-auto max-w-[1320px] px-6 pt-28 lg:pt-32 pb-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 w-full items-center">

          {/* ── LEFT: Text Content ── */}
          <div className="lg:pr-4">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-5"
            >
              <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-[#1a6b54]">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1a6b54]">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4.5L3.5 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Trusted by U.S. Real Estate Operators
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.6rem] leading-[1.08] tracking-[-0.025em] text-[#0f213d] mb-5"
            >
              Portfolio Intelligence<br />
              for{" "}
              <span style={{
                background: "linear-gradient(135deg, #c49d55 0%, #d4a853 40%, #b8883d 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Modern Real Estate</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="text-[0.95rem] md:text-base leading-relaxed text-slate-600 max-w-[420px] mb-7"
            >
              Analyze assets, surface risk, and present investment-grade
              property insights with clarity. Built for acquisitions,
              asset management, and portfolio strategy teams.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Button
                variant="hero" size="lg"
                onClick={() => setIsRequestDemoOpen(true)}
                className="rounded-xl bg-[#0f213d] px-7 py-3.5 text-white text-sm font-semibold hover:bg-[#162d50] shadow-[0_4px_20px_rgba(15,33,61,0.25)] transition-all duration-300 hover:shadow-[0_6px_28px_rgba(15,33,61,0.35)] hover:-translate-y-0.5"
              >
                Request Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="heroOutline" size="lg"
                onClick={() => document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-xl border-slate-200 bg-white/70 backdrop-blur-sm px-7 py-3.5 text-slate-700 text-sm font-semibold hover:bg-white hover:border-slate-300 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Play className="mr-2 h-4 w-4" /> Explore Platform
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 shadow-[0_2px_12px_rgba(15,23,42,0.05)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-9 h-9 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-[#0f213d] font-display leading-none">
                      <StatNum target={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Trust logos */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.95 }}
              className="w-fit max-w-full rounded-2xl border border-white bg-[#ffffff80] px-5 py-4 backdrop-blur-md shadow-[0_2px_12px_rgba(15,23,42,0.05)]"
            >
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-600 mb-3">
                Trusted by Leading Real Estate Teams
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {trustLogos.map((name) => (
                  <span key={name} className="text-[13px] font-extrabold text-slate-400 tracking-wide hover:text-slate-600 transition-colors duration-300 cursor-default">{name}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Orbital Card Display ── */}
          <div className="relative hidden lg:block h-[70vh] min-h-[500px]">
            <div className="absolute inset-0 flex items-center justify-center">

              {/* Outer dashed orbit ring */}
              <div className="absolute w-[316px] h-[316px] rounded-full border border-dashed border-slate-300/70 pointer-events-none" />
              {/* Inner solid ring */}
              <div className="absolute w-[316px] h-[316px] rounded-full border border-slate-200/60 pointer-events-none" />
              {/* Center dot */}
              <div className="absolute w-3 h-3 rounded-full bg-slate-200/80 border border-slate-300/60 pointer-events-none" />

              {/* ── Orbit Card 1: Portfolio Overview (starts at top, 0°) ── */}
              <OrbitWrapper radius={158} startAngle={0} duration={22} fadeDelay={0.7}>
                <OrbitCard className="w-[210px] p-3.5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-slate-700">Portfolio Overview</span>
                    <span className="text-[10px] text-slate-400">Q2 2024 ▾</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-[10px] text-slate-400 mb-0.5">Total Value</div>
                      <div className="text-xl font-extrabold text-[#0f213d] font-display">$2.48B</div>
                      <div className="text-[10px] text-emerald-600 font-medium mt-0.5">↑ 8.6% vs Q1 2024</div>
                    </div>
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#1e3a5f" strokeWidth="3.5" strokeDasharray="47.5 40.5" strokeLinecap="round" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#64748b" strokeWidth="3.5" strokeDasharray="21 67" strokeDashoffset="-47.5" strokeLinecap="round" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#94a3b8" strokeWidth="3.5" strokeDasharray="12 76" strokeDashoffset="-68.5" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs font-extrabold text-[#0f213d]">42</span>
                        <span className="text-[7px] text-slate-400">Assets</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2.5 text-[8px] text-slate-500">
                    <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1e3a5f] mr-0.5" />Office 54%</span>
                    <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#64748b] mr-0.5" />Ind. 24%</span>
                    <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#94a3b8] mr-0.5" />Retail 14%</span>
                  </div>
                </OrbitCard>
              </OrbitWrapper>

              {/* ── Orbit Card 2: Occupancy Trend (starts at bottom-right, 120°) ── */}
              <OrbitWrapper radius={158} startAngle={(2 * Math.PI) / 3} duration={22} fadeDelay={0.9}>
                <OrbitCard className="w-[195px] p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">Occupancy Trend</span>
                    <span className="text-[10px] text-slate-400">12 mo ▾</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-extrabold text-[#0f213d] font-display">93.7%</span>
                    <span className="text-xs font-semibold text-emerald-600">↑ 2.1%</span>
                  </div>
                  <svg viewBox="0 0 160 35" className="w-full h-7" fill="none">
                    <path d="M0,30 Q16,26 32,24 T64,18 T96,14 T128,10 T160,6" stroke="#1ebc9a" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M0,30 Q16,26 32,24 T64,18 T96,14 T128,10 T160,6 V35 H0 Z" fill="url(#sparkGrad2)" opacity="0.12" />
                    <defs>
                      <linearGradient id="sparkGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1ebc9a" />
                        <stop offset="100%" stopColor="#1ebc9a" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </OrbitCard>
              </OrbitWrapper>

              {/* ── Orbit Card 3: NOI Growth + Risk Score (starts at bottom-left, 240°) ── */}
              <OrbitWrapper radius={158} startAngle={(4 * Math.PI) / 3} duration={22} fadeDelay={1.1}>
                <OrbitCard className="w-[210px] p-3.5">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="text-[9px] text-slate-400 mb-1">NOI Growth <span className="text-[7px]">(LTM)</span></div>
                      <div className="text-lg font-extrabold text-[#0f213d] font-display">$184.2M</div>
                      <div className="text-[9px] text-emerald-600 font-medium">↑ 6.2%</div>
                      <div className="mt-1.5 h-1 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "72%" }} transition={{ duration: 1.5, delay: 1.8 }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                      </div>
                    </div>
                    <div className="w-px bg-slate-100" />
                    <div className="flex-1">
                      <div className="text-[9px] text-slate-400 mb-1">Risk Score</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-extrabold text-[#0f213d] font-display">24</span>
                        <span className="text-[9px] text-slate-400">/ 100</span>
                      </div>
                      <div className="text-[9px] text-emerald-600 font-semibold">Low Risk</div>
                      <div className="mt-1.5 w-7 h-7 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4.5L3.5 7L9 1" stroke="#1ebc9a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                </OrbitCard>
              </OrbitWrapper>

              {/* Market Heat — static at bottom */}
              <GlassCard className="absolute bottom-[3%] left-[3%] right-[3%] p-3.5" delay={1.6}>
                <div className="text-xs font-semibold text-slate-700 mb-2">Market Heat</div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
                  <span className="font-medium text-slate-600">Top Markets</span>
                  {[{ city: "Dallas", c: "#1ebc9a" }, { city: "Austin", c: "#1ebc9a" }, { city: "Nashville", c: "#60a5fa" }, { city: "Phoenix", c: "#60a5fa" }, { city: "Atlanta", c: "#fbbf24" }].map((m) => (
                    <span key={m.city} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.c }} />{m.city}
                    </span>
                  ))}
                </div>
              </GlassCard>

            </div>
          </div>
        </div>
      </div>

      <RequestDemoForm open={isRequestDemoOpen} onOpenChange={setIsRequestDemoOpen} />
    </section>
  );
};

export default HeroSection;
