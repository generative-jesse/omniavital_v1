import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const CommunitySection = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from("email_signups").insert({ email });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <section id="community" className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(168,76%,42%,0.08)_0%,_transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="container mx-auto max-w-2xl text-center relative z-10"
      >
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-accent font-medium mb-4 px-4 py-2 rounded-full border border-accent/20 bg-accent/5">
          <Sparkles size={14} />
          The Collective
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Join the Collective.
        </h2>
        <p className="text-muted-foreground font-light mb-10 text-lg">
          Get 20% off your first yearly subscription. Early access. Exclusive protocols.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-primary text-lg font-medium flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            Welcome to the Collective.
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm tracking-wide focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-sm rounded-lg hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "..." : "Apply"}
            </button>
          </form>
        )}
      </motion.div>
    </section>
  );
};

export default CommunitySection;
