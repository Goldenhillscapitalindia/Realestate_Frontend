import { useState } from "react";

import AccessBlockedModal from "./AccessBlockedModal";
import RequestDemoForm from "./RequestDemoForm";
import { ScrollReveal } from "./ScrollReveal";
import { Button } from "../components/ui/button";
import { useLoginGuard } from "@/hooks/use-login-guard";
import properties from "../assets/properties.png";

const CTASection = () => {
  const [isRequestDemoOpen, setIsRequestDemoOpen] = useState(false);
  const { isModalOpen, setIsModalOpen, goToLogin } = useLoginGuard();

  return (
    <section className="section-padding section-dark section-dark-grid" id="demo">
      <div className="relative z-10 max-w-5xl mx-auto">
        <ScrollReveal variant="scale">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 text-center shadow-2xl">
            <img
              src={properties}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-[0.12] grayscale"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(9,18,36,0.92)_0%,rgba(15,28,88,0.88)_32%,rgba(15,75,138,0.82)_70%,rgba(30,188,154,0.72)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
            <div className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-emerald-light/20 blur-3xl" />
            <div className="relative z-10 space-y-4 px-10 py-14 text-white md:px-14 md:py-16">
              <h2 className="font-display text-[1.9rem] font-extrabold md:text-[2.2rem] lg:text-[2.55rem]">
                Ready to See Asset72 in Action?
              </h2>
              <p className="text-base text-white/80">Personalized demo designed for your portfolio.</p>
              <Button
                variant="secondary"
                size="xl"
                className="bg-[#1ebc9a] px-8 py-3 text-white shadow-xl transition-transform duration-300 hover:scale-[1.02] hover:bg-[#34c6a6]"
                onClick={() => setIsRequestDemoOpen(true)}
              >
                Request a Demo
              </Button>
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
