import { ScrollReveal } from "./ScrollReveal";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="section-padding" id="demo">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="relative rounded-[28px] overflow-hidden text-center shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f1c58] via-[#0f4b8a] to-[#1ebc9a]" />
            <div className="relative z-10 px-10 py-16 md:px-14 md:py-20 text-white space-y-4">
              <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl">
                Ready to See Vertex in Action?
              </h2>
              <p className="text-lg text-white/80">
                Personalized demo designed for your portfolio.
              </p>
              <Button
                variant="secondary"
                size="xl"
                className="bg-[#1ebc9a] text-white shadow-xl px-8 py-3"
                onClick={() => navigate("/portfolio_intelligence")}
              >
               Demo
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;
