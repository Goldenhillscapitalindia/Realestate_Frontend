import { ScrollReveal } from "./ScrollReveal";

const WhyChooseVertex = () => {
  return (
    <section className="section-padding bg-card" id="solutions">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-lg font-semibold text-indigo-500 uppercase tracking-widest mb-3">
              Why Choose vertex AI?            </p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 leading-tight">
              Stop Explaining Last Month —{" "}
              <span className="gradient-text">Start Controlling Next Quarter</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
   From lease expirations to revenue lift projections, Vertex turns raw property data into forward-looking decisions.
            </p>
          </div>
        </ScrollReveal>

        {/* Logo Carousel Placeholder */}
        {/* <ScrollReveal delay={100}>
          <div className="border border-border rounded-xl bg-muted/50 py-8 px-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest text-center mb-6">
              Trusted by teams at leading firms
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-40">
              {["Blackstone", "Brookfield", "Starwood", "Prologis", "CBRE", "JLL"].map((name) => (
                <span key={name} className="font-display font-bold text-lg text-foreground">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal> */}
      </div>
    </section>
  );
};

export default WhyChooseVertex;