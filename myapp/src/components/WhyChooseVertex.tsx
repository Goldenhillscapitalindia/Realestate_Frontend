import { ScrollReveal } from "./ScrollReveal";

const WhyChooseVertex = () => {
  return (
    <section className="section-padding bg-card" id="solutions">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">
              Why Real Estate Leaders Choose Vertex
            </p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 leading-tight">
              Decisions Should Be Forward-Looking —{" "}
              <span className="gradient-text">Not Rear-View</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Real estate still relies on spreadsheets, fragmented systems, and manual workflows.
              Vertex changes that by surfacing predictive intelligence — not just reports.
            </p>
          </div>
        </ScrollReveal>

        {/* Logo Carousel Placeholder */}
        <ScrollReveal delay={100}>
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
        </ScrollReveal>
      </div>
    </section>
  );
};

export default WhyChooseVertex;