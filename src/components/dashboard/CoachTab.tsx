import VoiceAgent from "@/components/VoiceAgent";
import { BotMessageSquare } from "lucide-react";

const CoachTab = () => {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-wide text-foreground mb-1">AI Wellness Coach</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Your personalized wellness advisor — powered by expert knowledge
      </p>

      <div className="glass rounded-xl p-8 md:p-12 text-center max-w-xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center">
          <BotMessageSquare size={32} className="text-accent-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Talk to your personal coach
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Get personalized recommendations, ask about your supplements, discuss your progress, 
          or get expert guidance on your wellness journey. Your AI coach knows your history 
          and can offer tailored advice.
        </p>
        <p className="text-xs text-muted-foreground">
          Click the <span className="text-primary font-semibold">chat bubble</span> in the bottom-right corner to start a voice conversation.
        </p>
      </div>

      {/* The VoiceAgent is already rendered globally, but we reference it here for context */}
      <VoiceAgent />
    </div>
  );
};

export default CoachTab;
