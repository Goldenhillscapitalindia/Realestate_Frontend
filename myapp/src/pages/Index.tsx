import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyChooseVertex from "@/components/WhyChooseVertex";
import PlatformFeatures from "@/components/PlatformFeatures";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import AILayer from "@/components/AILayer";
import PlatformExperience from "@/components/PlatformExperience";
import WhyVertex from "@/components/WhyVertex";
import SocialProof from "@/components/SocialProof";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <WhyChooseVertex />
      <PlatformFeatures />
      <HowItWorks />
      <UseCases />
      <AILayer />
      <PlatformExperience />
      <WhyVertex />
      <SocialProof />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
