import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RitualGrid from "@/components/RitualGrid";
import CommunitySection from "@/components/CommunitySection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <RitualGrid />
        <section id="science" className="py-24 md:py-32 px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <p className="text-sm tracking-[0.3em] uppercase text-primary font-medium mb-3">
              The Science
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
              Precision Nutrition
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed text-lg">
              Every formula is third-party tested, clinically dosed, and engineered for maximum 
              bioavailability. No fillers. No compromises. Just results you can feel.
            </p>
          </div>
        </section>
        <CommunitySection />
      </main>

      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
            © 2026 OmniaVital
          </p>
          <p className="text-xs text-muted-foreground">
            Premium Performance Wellness
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
