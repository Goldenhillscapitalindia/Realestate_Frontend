import { useState } from "react";
import AccessBlockedModal from "./AccessBlockedModal";
import RequestDemoForm from "./RequestDemoForm";
import { ScrollReveal } from "./ScrollReveal";
import { Button } from "../components/ui/button";
import { useLoginGuard } from "@/hooks/use-login-guard";


/* ── Particle dot positions for ambient motion ── */
const PARTICLES = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  top: `${5 + Math.random() * 90}%`,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 8,
  duration: 6 + Math.random() * 10,
  opacity: 0.15 + Math.random() * 0.35,
}));

const CTASection = () => {
  const [isRequestDemoOpen, setIsRequestDemoOpen] = useState(false);
  const { isModalOpen, setIsModalOpen, goToLogin } = useLoginGuard();

  return (
    <section
      className="section-padding relative overflow-hidden"
      id="demo"
      style={{
        background:
          "linear-gradient(rgb(218, 225, 233) 0%, rgb(233, 238, 247) 52%, rgb(217, 219, 225) 100%)",
      }}
    >
      {/* ── Particle Dots Layer ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.id % 3 === 0 ? "rgba(30,188,154,0.6)" : "rgba(255,255,255,0.4)",
              opacity: p.opacity,
              animation: `particleDrift ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
              boxShadow: p.id % 3 === 0
                ? `0 0 ${p.size * 2}px rgba(30,188,154,0.3)`
                : `0 0 ${p.size}px rgba(255,255,255,0.15)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <ScrollReveal variant="scale">
          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.15] text-center shadow-2xl">

            {/* Layered gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg,
                  rgba(7,14,28,0.96) 0%,
                  rgba(12,24,52,0.94) 20%,
                  rgba(14,42,78,0.90) 45%,
                  rgba(16,64,110,0.85) 65%,
                  rgba(22,120,130,0.78) 82%,
                  rgba(30,188,154,0.68) 100%
                )`,
              }}
            />

            {/* ── Visible Grid Overlay ── */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px),
                  linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)
                `,
                backgroundSize: "56px 56px",
              }}
            />

            {/* Grid intersection highlighted dots */}
            {[
              { x: "14%", y: "18%" }, { x: "50%", y: "14%" }, { x: "86%", y: "20%" },
              { x: "28%", y: "50%" }, { x: "50%", y: "50%" }, { x: "72%", y: "50%" },
              { x: "14%", y: "82%" }, { x: "50%", y: "86%" }, { x: "86%", y: "80%" },
              { x: "36%", y: "32%" }, { x: "64%", y: "68%" }, { x: "42%", y: "72%" },
              { x: "78%", y: "36%" },
            ].map((dot, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: dot.x, top: dot.y,
                  width: "4px", height: "4px",
                  background: i % 3 === 0 ? "rgba(30,188,154,0.7)" : "rgba(255,255,255,0.55)",
                  boxShadow: i % 3 === 0
                    ? "0 0 14px rgba(30,188,154,0.5), 0 0 28px rgba(30,188,154,0.2)"
                    : "0 0 12px rgba(255,255,255,0.3), 0 0 24px rgba(255,255,255,0.1)",
                  animation: `pulse-glow 3s ease-in-out ${i * 0.35}s infinite`,
                }}
              />
            ))}

            {/* Ambient orbs */}
            <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-white/[0.06] blur-3xl" />
            <div className="absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-emerald-light/15 blur-3xl" />

            {/* Visible dashboard background image */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src="/portfolio-dashboard.png"
                alt="Asset72 portfolio intelligence dashboard"
                className="absolute right-[-8%] top-1/2 -translate-y-1/2 w-[75%] h-auto object-contain"
                style={{ opacity: 0.12, filter: "brightness(1.4) contrast(0.9)" }}
              />
              {/* Gradient overlay from left for text readability */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(
                    to right,
                    rgba(7,14,28,0.99) 0%,
                    rgba(12,24,52,0.96) 25%,
                    rgba(14,42,78,0.65) 55%,
                    rgba(14,42,78,0.35) 80%,
                    rgba(14,42,78,0.15) 100%
                  )`,
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-5 px-10 py-20 text-white md:px-16 md:py-24">
              <h2 className="font-display text-[2rem] font-extrabold tracking-tight md:text-[2.4rem] lg:text-[2.8rem] leading-[1.1]">
                Ready to See Asset72 in Action?
              </h2>
              <p className="text-base text-white/75 max-w-lg mx-auto leading-relaxed">
                Personalized demo designed for your portfolio.
              </p>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="xl"
                  className="bg-[#1ebc9a] px-10 py-3.5 text-white text-[15px] font-semibold shadow-[0_4px_24px_rgba(30,188,154,0.35)] transition-all duration-300 hover:scale-[1.03] hover:bg-[#34c6a6] hover:shadow-[0_8px_32px_rgba(30,188,154,0.45)]"
                  onClick={() => setIsRequestDemoOpen(true)}
                >
                  Request a Demo
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <AccessBlockedModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onGoToLogin={goToLogin}
      />
      <RequestDemoForm open={isRequestDemoOpen} onOpenChange={setIsRequestDemoOpen} />
    </section>
  );
};

export default CTASection;
