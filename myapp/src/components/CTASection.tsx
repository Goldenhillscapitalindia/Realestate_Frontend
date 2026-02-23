import { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";
import { Button } from "../components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const CTASection = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    role: "",
    portfolioSize: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="section-padding bg-card" id="demo">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="relative rounded-2xl overflow-hidden p-10 md:p-16 text-center"
            style={{ background: "var(--gradient-hero)" }}
          >
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-3xl rounded-full" />
            </div>

            <div className="relative z-10">
              <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-primary-foreground mb-4">
                Ready to See Vertex in Action?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                Personalized demo designed for your portfolio.
              </p>

              {!formOpen ? (
                <Button
                  variant="accent"
                  size="xl"
                  onClick={() => setFormOpen(true)}
                >
                  Request a Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : !submitted ? (
                <form
                  onSubmit={handleSubmit}
                  className="max-w-md mx-auto space-y-4 text-left"
                >
                  {[
                    { key: "name", label: "Full Name", type: "text" },
                    { key: "company", label: "Company", type: "text" },
                    { key: "role", label: "Role", type: "text" },
                    { key: "portfolioSize", label: "Portfolio Size", type: "text" },
                    { key: "email", label: "Email", type: "email" },
                  ].map((field) => (
                    <input
                      key={field.key}
                      type={field.type}
                      placeholder={field.label}
                      required
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    />
                  ))}
                  <textarea
                    placeholder="Message (optional)"
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none"
                  />
                  <Button variant="accent" size="lg" type="submit" className="w-full">
                    Book My Demo
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle className="w-12 h-12 text-accent" />
                  <p className="text-primary-foreground font-display font-bold text-xl">
                    Thank you! We'll be in touch soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;
