import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    <section id="community" className="py-24 md:py-32 px-6 bg-foreground">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="container mx-auto max-w-2xl text-center"
      >
        <p className="text-sm tracking-[0.3em] uppercase text-primary font-medium mb-3">
          The Collective
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-background mb-4">
          Join the Collective.
        </h2>
        <p className="text-background/60 font-light mb-10">
          Get 20% off your first yearly subscription. Early access. Exclusive protocols.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-primary text-lg font-medium"
          >
            Welcome to the Collective. ✦
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 bg-transparent border border-background/20 text-background placeholder:text-background/30 text-sm tracking-wide focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
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
