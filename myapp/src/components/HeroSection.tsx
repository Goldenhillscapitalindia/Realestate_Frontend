import heroDashboard from "../assets/hero-dashboard.jpg";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 section-soft">
      {/* Subtle background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 left-[-5%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Predictive Intelligence for Real Estate
          </div>

          <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground mb-6 animate-fade-up-delay-1">
            Intelligence that Powers{" "}
            <span className="gradient-text">Real Estate Decisions</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4 animate-fade-up-delay-2">
            Vertex transforms data into predictive insights that protect revenue, reduce risk, and accelerate growth — all in a single platform.
          </p>

          <p className="text-sm text-muted-foreground mb-8 animate-fade-up-delay-2">
            📍 For asset owners, institutional investors, operators, and deal teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-3">
            <Button variant="hero" size="xl" asChild>
              <a href="#demo">
                Request a Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="#platform">
                <Play className="mr-2 w-4 h-4" />
                See How It Works
              </a>
            </Button>
          </div>
        </div>

        {/* Hero Dashboard Image */}
        <div className="relative max-w-5xl mx-auto animate-fade-up-delay-3">
          <div className="rounded-xl overflow-hidden hero-image-shadow border border-border">
            <img
              src={heroDashboard}
              alt="Vertex Intelligence Dashboard"
              className="w-full h-auto"
            />
          </div>
          {/* Floating accent elements */}
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-xl bg-accent/10 border border-accent/20 backdrop-blur-sm animate-float hidden lg:flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm animate-float-delayed hidden lg:flex items-center justify-center">
            <span className="text-xl">🛡️</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;