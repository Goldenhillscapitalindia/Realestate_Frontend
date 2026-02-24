import { ScrollReveal } from "./ScrollReveal";
import { Database, Cpu, Zap } from "lucide-react";

const steps = [
  {
    icon: Database,
    number: "01",
    title: "Upload Your Financials",
    description:
      "Upload your T12 and Rent Roll files. We structure, normalize, and validate the data.",
  },
  {
    icon: Cpu,
    number: "02",
    title: "Analyze Risk & Opportunity",
    description:
      "AI quantifies lease rollover exposure, mark-to-market lift, expense alignment, and revenue gaps.",
  },
  {
    icon: Zap,
    number: "03",
    title: "Act with Confidence",
    description:
      "Get clear signals, underwriting summaries, and scenario insights to guide pricing, acquisitions, and portfolio strategy.",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-lg font-semibold text-indigo-500 uppercase tracking-widest mb-3">
              How Vertex Works
            </p>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground">
              Raw Property Data to Decision-Grade Intelligence
            </h2>
          </div>
        </ScrollReveal>

        {/* Auto-adjusting grid */}
        <div className="relative grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          
          {steps.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 120}>
              <div className="card-glass p-8 text-center relative h-full flex flex-col justify-start">
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-blue/10 border border-blue/20 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div>

                {/* Step Number */}
                <span className="text-xs font-bold text-blue-700 tracking-widest uppercase mb-2 block">
                  Step {step.number}
                </span>

                {/* Title */}
                <h3 className="font-display font-bold text-xl text-indigo-600 mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;