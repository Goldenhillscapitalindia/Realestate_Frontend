import { ScrollReveal } from "./ScrollReveal";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Vertex gave us visibility into lease risk we didn't know existed. We prevented $2.4M in revenue loss in Q1 alone.",
    author: "Sarah Chen",
    role: "VP of Asset Management",
    firm: "Meridian Capital Partners",
  },
  {
    quote: "The market radar signals helped us time our acquisitions perfectly. It's like having a crystal ball for CRE markets.",
    author: "James Rodriguez",
    role: "Managing Director",
    firm: "Apex Real Estate Fund",
  },
  {
    quote: "Deal underwriting that used to take weeks now takes days. The risk-adjusted forecasting is incredibly accurate.",
    author: "Emily Thornton",
    role: "Head of Investments",
    firm: "Sterling Properties",
  },
];

const SocialProof = () => {
  return (
    <section className="section-padding section-soft-alt">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">
              Social Proof
            </p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground">
              Trusted by teams managing billions in real estate capital
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.author} delay={i * 100}>
              <div className="card-glass p-8 flex flex-col h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="text-foreground font-medium leading-relaxed mb-6 flex-1">
                  "{t.quote}"
                </blockquote>
                <div>
                  <p className="font-display font-bold text-sm text-foreground">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}, {t.firm}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;