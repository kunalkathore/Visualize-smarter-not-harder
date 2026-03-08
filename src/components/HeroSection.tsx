import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-16 md:pt-32 md:pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-body text-sm text-muted-foreground animate-fade-up">
          <BarChart3 className="h-4 w-4 text-primary" />
          Visualize smarter, not harder
        </div>

        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
          DataViz — Turn Your Data Into{" "}
          <span className="text-primary">Beautiful Charts</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Upload your spreadsheet, pick a chart style, and export publication-ready visuals — all in your browser.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Link to="/upload">
            <Button size="lg" className="font-display text-base px-8">
              Get Started Free
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="font-display text-base px-8">
            View Gallery
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
