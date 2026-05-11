
import { useEffect } from "react";
import { useLocation } from "react-router";
import AILayer from "../components/AILayer";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import Navbar from "../components/Navbar";
import PlatformExperience from "../components/PlatformExperience";
import PlatformFeatures from "../components/PlatformFeatures";
import UseCases from "../components/UseCases";
import WhyChooseAsset72 from "../components/WhyChooseAsset72";
import WhyAsset72 from "../components/WhyAsset72";
import AboutUs from "@/components/AboutUs";
import { isUserLoggedIn } from "@/lib/auth";
const scrollToSection = (sectionId: string) => {
  if (!sectionId) return;
  const normalized = sectionId.startsWith("#") ? sectionId.substring(1) : sectionId;
  const target = document.getElementById(normalized);
  if (target) {
    target.scrollIntoView({ behavior: "smooth" });
  }
};

const Index = () => {
  const location = useLocation();
  const isLoggedIn = isUserLoggedIn();
  useEffect(() => {
  const isLoggedIn = isUserLoggedIn();

  if (location.hash) {
    const id = location.hash.replace("#", "");

    // Block all sections except "about" for guest users
    if (!isLoggedIn && id !== "about") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(id);

    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }
  }

  const scrollTarget = location.state?.scrollTo;

  if (typeof scrollTarget === "string") {
    const id = scrollTarget.replace("#", "");

    // Block here also
    if (!isLoggedIn && id !== "about") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setTimeout(() => {
      scrollToSection(scrollTarget);
    }, 100);
  }
}, [location]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div>
        <HeroSection />
        <WhyChooseAsset72 />
        <PlatformFeatures />
        <HowItWorks />
        <UseCases />
        <AILayer />
        <PlatformExperience />
        <WhyAsset72 />
      </div>

      <AboutUs />

      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
