import {
  Cpu,
  FlaskConical,
  Target,
  BrainCircuit,
} from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";


/* ── 4 Unique Pillars with distinct icons ── */
const pillars = [
  {
    title: "Data-Driven",
    description:
      "Built on deep experience in analytics, financial modeling, and large-scale data analysis.",
    icon: Cpu,
    iconColor: "#3b82f6",
    accentGrad: "from-[#3b82f6]/20 to-[#1d4ed8]/5",
    borderAccent: "#3b82f6",
  },
  {
    title: "Research-Oriented",
    description:
      "Designed with an analytical approach that combines structured data, market research, and financial insights.",
    icon: FlaskConical,
    iconColor: "#06b6d4",
    accentGrad: "from-[#06b6d4]/20 to-[#0891b2]/5",
    borderAccent: "#06b6d4",
  },
  {
    title: "Investment-Focused",
    description:
      "Built for investment professionals who need clear signals across portfolios, markets, and deals.",
    icon: Target,
    iconColor: "#1ebc9a",
    accentGrad: "from-[#1ebc9a]/20 to-[#0d9488]/5",
    borderAccent: "#1ebc9a",
  },
  {
    title: "Built for Decision-Making",
    description:
      "Focused on turning complex real estate data into practical insights that support capital allocation decisions.",
    icon: BrainCircuit,
    iconColor: "#8b5cf6",
    accentGrad: "from-[#8b5cf6]/20 to-[#7c3aed]/5",
    borderAccent: "#8b5cf6",
  },
];

export default function AboutPlatform() {
  return (
    <section
      className="relative overflow-hidden py-32 px-6"
      id="about"
      style={{
        background: `linear-gradient(180deg,
          #fafbfe 0%,
          #f1f4f9 40%,
          #eef2f8 100%
        )`,
      }}
    >
      {/* ── Ambient radial overlays ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 left-1/4 w-[700px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(30,188,154,0.05) 0%, transparent 60%)",
          }}
        />
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <ScrollReveal>
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#e2e8f0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1ebc9a] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1ebc9a]" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748b]">
                About the Platform
              </span>
            </div>

            <h2 className="text-[2.8rem] md:text-[3.6rem] font-extrabold tracking-[-0.02em] text-[#0a1628] leading-[1.05] mb-7">
              Built by{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #0a2540 0%, #134e6f 40%, #1ebc9a 100%)",
                }}
              >
                Golden Hills
              </span>
            </h2>

            <p className="text-[#5a6a7f] max-w-2xl mx-auto text-[1.12rem] leading-[1.8]">
              Asset72{" "}
              is developed by Golden Hills, an analytics and research firm
              focused on building data-driven decision intelligence platforms.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Asymmetric Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-auto">
          {/* Card 1 — Spans 7 cols (featured) */}
          <ScrollReveal variant="left" className="md:col-span-7">
            <PillarCard card={pillars[0]} featured />
          </ScrollReveal>

          {/* Card 2 — Spans 5 cols */}
          <ScrollReveal variant="right" className="md:col-span-5">
            <PillarCard card={pillars[1]} />
          </ScrollReveal>

          {/* Card 3 — Spans 5 cols */}
          <ScrollReveal variant="left" delay={80} className="md:col-span-5">
            <PillarCard card={pillars[2]} />
          </ScrollReveal>

          {/* Card 4 — Spans 7 cols (featured) */}
          <ScrollReveal variant="right" delay={80} className="md:col-span-7">
            <PillarCard card={pillars[3]} featured />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ── Pillar Card Sub-component ── */
function PillarCard({
  card,
  featured = false,
}: {
  card: (typeof pillars)[number];
  featured?: boolean;
}) {
  const Icon = card.icon;

  return (
    <div
      className="group relative h-full overflow-hidden rounded-[24px] bg-white border border-[#e4e9f0] p-9 md:p-10 transition-all duration-500 hover:shadow-[0_24px_64px_rgba(10,22,40,0.08)] hover:border-[#c8d1dc] hover:-translate-y-1"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.02)",
      }}
    >
      {/* Top-left accent glow */}
      <div
        className={`absolute -top-12 -left-12 w-32 h-32 rounded-full bg-gradient-to-br ${card.accentGrad} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
      />

      {/* Accent line */}
      <div
        className="absolute top-0 left-8 right-8 h-[2px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, ${card.borderAccent}, transparent)` }}
      />

      {/* Icon container */}
      <div
        className="relative mb-7 inline-flex items-center justify-center w-[52px] h-[52px] rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
        style={{
          borderColor: `${card.iconColor}25`,
          background: `linear-gradient(135deg, ${card.iconColor}12, ${card.iconColor}06)`,
        }}
      >
        <Icon
          className="w-[22px] h-[22px] transition-colors duration-300"
          style={{ color: card.iconColor }}
          strokeWidth={1.6}
        />
      </div>

      {/* Text */}
      <h3 className="text-[1.2rem] font-bold text-[#0a1628] tracking-tight mb-3 leading-snug">
        {card.title}
      </h3>
      <p className="text-[#64748b] text-[15px] leading-[1.75] max-w-md">
        {card.description}
      </p>

      {/* Bottom decorative line on hover */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out"
        style={{ background: `linear-gradient(to right, ${card.borderAccent}60, transparent)` }}
      />
    </div>
  );
}
