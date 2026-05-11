import { ScrollReveal } from "./ScrollReveal";

const WhyChooseAsset72 = () => {
  return (
    <section className="section-padding section-dark section-dark-grid" id="solutions">
      <div className="absolute left-[8%] top-24 h-44 w-44 rounded-full bg-emerald/10 blur-3xl" />
      <div className="absolute right-[10%] bottom-20 h-52 w-52 rounded-full bg-gold-warm/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <ScrollReveal variant="up">
          <div className="mx-auto mb-14 max-w-4xl premium-panel-dark px-7 py-10 text-center md:px-10">
            <p className="mb-3 text-base font-semibold uppercase tracking-widest text-emerald-light">
              Why Choose Asset72?
            </p>
            <h2 className="mb-5 font-display text-[1.9rem] font-extrabold leading-[1.12] text-white md:text-[2.2rem] lg:text-[2.55rem]">
              Stop Explaining Last Month -
              <br />
              <span className="text-[#7eb8ff]">Start Controlling Next Quarter</span>
            </h2>
            <p className="text-base leading-7 text-white/72">
              From lease expirations to revenue lift projections, Asset72 turns raw property data into
              forward-looking decisions.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default WhyChooseAsset72;
