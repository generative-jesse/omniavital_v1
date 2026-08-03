import { Link } from "react-router-dom";
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

      <footer className="border-t border-border px-6 py-14">
        <div className="container mx-auto grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img src={logoMark} alt="OmniaVital logo" width={28} height={28} loading="lazy" className="h-7 w-7 object-contain" />
              <span className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">OmniaVital</span>
            </div>
            <p className="max-w-xs text-sm font-light leading-relaxed text-muted-foreground">
              Clinically dosed, third-party tested formulas built around the rhythm of your day.
            </p>
          </div>

          <nav aria-label="Shop">
            <h2 className="mb-4 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Shop</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { to: "/product/morning-routine", label: "The Morning Routine" },
                { to: "/product/focus-window", label: "The Focus Window" },
                { to: "/product/evening-recovery", label: "The Evening Recovery" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-foreground">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="mb-4 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Company</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/#science" className="transition-colors hover:text-foreground">The Science</Link></li>
              <li><Link to="/#community" className="transition-colors hover:text-foreground">The Collective</Link></li>
              <li><Link to="/auth" className="transition-colors hover:text-foreground">Member Sign In</Link></li>
            </ul>
          </nav>
        </div>

        <div className="container mx-auto mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 md:flex-row">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">© 2026 OmniaVital</p>
          <p className="text-xs text-muted-foreground">Premium Performance Wellness</p>
        </div>
      </footer>

      <VoiceAgent />
    </div>
  );
};

export default Index;
