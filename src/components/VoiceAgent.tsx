import { useState, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, MessageCircle } from "lucide-react";

const AGENT_ID = "agent_5501kgzectw4ep69wjamch6xr2k7";

const VoiceAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const conversation = useConversation({
    onConnect: () => console.log("Connected to OmniaVital agent"),
    onDisconnect: () => console.log("Disconnected from agent"),
    onError: (error) => console.error("Agent error:", error),
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleToggle = () => {
    if (isOpen) {
      if (conversation.status === "connected") {
        stopConversation();
      }
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
        whileTap={{ scale: 0.95 }}
        animate={conversation.status === "connected" ? { boxShadow: ["0 0 20px -5px hsl(168, 76%, 42%, 0.4)", "0 0 40px -5px hsl(168, 76%, 42%, 0.7)", "0 0 20px -5px hsl(168, 76%, 42%, 0.4)"] } : {}}
        transition={conversation.status === "connected" ? { duration: 2, repeat: Infinity } : {}}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      {/* Agent panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl glass border border-border overflow-hidden shadow-2xl shadow-background/50"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-[10px] font-black text-accent-foreground">OV</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">OmniaVital Agent</p>
                <p className="text-[11px] text-muted-foreground">
                  {conversation.status === "connected"
                    ? conversation.isSpeaking ? "Speaking..." : "Listening..."
                    : "Voice assistant"}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-8 flex flex-col items-center gap-5">
              {conversation.status === "connected" ? (
                <>
                  {/* Active visualization */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/10"
                      animate={{
                        scale: conversation.isSpeaking ? [1, 1.3, 1] : [1, 1.1, 1],
                      }}
                      transition={{ duration: conversation.isSpeaking ? 0.6 : 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-3 rounded-full bg-primary/15"
                      animate={{
                        scale: conversation.isSpeaking ? [1, 1.2, 1] : [1, 1.05, 1],
                      }}
                      transition={{ duration: conversation.isSpeaking ? 0.5 : 2.5, repeat: Infinity, delay: 0.1 }}
                    />
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                      <Mic size={22} className="text-primary-foreground" />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    {conversation.isSpeaking
                      ? "Agent is responding..."
                      : "Speak naturally — I'm listening"}
                  </p>

                  <button
                    onClick={stopConversation}
                    className="px-6 py-2.5 bg-secondary text-foreground text-xs font-medium tracking-widest uppercase rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    End Session
                  </button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center">
                    <MicOff size={28} className="text-muted-foreground" />
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-foreground font-medium mb-1">
                      Talk to our wellness advisor
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ask about products, protocols, or personalized recommendations
                    </p>
                  </div>

                  <button
                    onClick={startConversation}
                    disabled={isConnecting}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground text-xs font-semibold tracking-widest uppercase rounded-lg hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                  >
                    {isConnecting ? "Connecting..." : "Start Conversation"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAgent;
