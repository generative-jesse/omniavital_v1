import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RitualGrid from "@/components/RitualGrid";
import ScienceSection from "@/components/ScienceSection";
import CommunitySection from "@/components/CommunitySection";
import VoiceAgent from "@/components/VoiceAgent";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <RitualGrid />
        <ScienceSection />
        <CommunitySection />
      </main>

      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-[8px] font-black text-accent-foreground">OV</span>
            </div>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
              © 2026 OmniaVital
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Premium Performance Wellness
          </p>
        </div>
      </footer>

      <VoiceAgent />
    </div>
  );
};

export default Index;
