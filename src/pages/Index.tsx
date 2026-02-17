import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RitualGrid from "@/components/RitualGrid";
import ScienceSection from "@/components/ScienceSection";
import CommunitySection from "@/components/CommunitySection";
import VoiceAgent from "@/components/VoiceAgent";
import logoMark from "@/assets/logo-mark.png";

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
          <div className="flex items-center gap-3">
            <img src={logoMark} alt="OmniaVital" className="w-7 h-7 rounded-md" />
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
