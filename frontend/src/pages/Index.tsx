
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import QuiltsSection from "@/components/QuiltsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen font-body text-xl">
      <Header />
      <HeroSection />
      <AboutSection />
      <QuiltsSection />
      <Footer />
    </div>
  );
};

export default Index;
