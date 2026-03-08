import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import SampleGallery from "@/components/SampleGallery";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <HeroSection />
      <FeatureCards />
      <SampleGallery />
      <footer className="border-t border-border py-8 text-center font-body text-sm text-muted-foreground">
        © 2026 DataViz. Built for data lovers.
      </footer>
    </div>
  );
};

export default Index;
