import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ShieldCheck, Leaf, FlaskConical, Zap, Clock, Droplets } from "lucide-react";
import Navbar from "@/components/Navbar";
import VoiceAgent from "@/components/VoiceAgent";
import productMorning from "@/assets/product-morning.jpg";
import productFocus from "@/assets/product-focus.jpg";
import productEvening from "@/assets/product-evening.jpg";

const productImages: Record<string, string> = {
  "morning-routine": productMorning,
  "focus-window": productFocus,
  "evening-recovery": productEvening,
};

const categoryColors: Record<string, string> = {
  morning: "from-amber-500/20 to-orange-500/10",
  focus: "from-primary/20 to-cyan-500/10",
  evening: "from-violet-500/20 to-indigo-500/10",
};

const categoryAccents: Record<string, string> = {
  morning: "text-amber-400",
  focus: "text-primary",
  evening: "text-violet-400",
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/" className="text-primary text-sm hover:underline">← Back to home</Link>
      </div>
    );
  }

  const localImage = productImages[product.slug];
  const gradientBg = categoryColors[product.category] || "from-primary/20 to-accent/10";
  const accent = categoryAccents[product.category] || "text-primary";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 pb-24">
        {/* Hero image band — full-bleed on mobile */}
        <div className={`relative w-full bg-gradient-to-br ${gradientBg}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Back link overlay */}
            <div className="absolute top-4 left-4 z-10">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground transition-colors glass-light px-3 py-2 rounded-lg"
              >
                <ArrowLeft size={14} />
                Back
              </Link>
            </div>

            {/* Category badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className={`text-[10px] tracking-[0.25em] uppercase font-medium ${accent} glass-light px-3 py-1.5 rounded-full`}>
                {product.category}
              </span>
            </div>

            {localImage ? (
              <img
                src={localImage}
                alt={product.name}
                className="w-full aspect-[4/3] md:aspect-[16/7] object-cover"
              />
            ) : product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full aspect-[4/3] md:aspect-[16/7] object-cover"
              />
            ) : (
              <div className="w-full aspect-[4/3] md:aspect-[16/7] flex items-center justify-center">
                <span className="text-8xl font-bold text-muted-foreground/10">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </motion.div>
        </div>

        {/* Product info */}
        <div className="container mx-auto px-5 max-w-3xl -mt-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Title block */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight mb-2">
                {product.name}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed">
                {product.tagline}
              </p>
            </div>

            {/* Price + CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <span className="text-3xl font-bold text-foreground">
                ${Number(product.price).toFixed(2)}
              </span>
              <button className="w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground font-semibold tracking-[0.15em] uppercase text-sm rounded-lg hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                Add to Ritual
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-border">
              {[
                { icon: FlaskConical, label: "Clinically Dosed" },
                { icon: ShieldCheck, label: "3rd-Party Tested" },
                { icon: Leaf, label: "Clean Sourced" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-xs text-muted-foreground glass-light px-3 py-2 rounded-lg"
                >
                  <badge.icon size={14} className="text-primary/80" />
                  {badge.label}
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-10">
              {product.description}
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {[
                { icon: Zap, label: "Fast Acting", sub: "30 min onset" },
                { icon: Clock, label: "Sustained", sub: "8+ hours" },
                { icon: Droplets, label: "Bioavailable", sub: "3x absorption" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border">
                  <stat.icon size={18} className={`${accent} mb-2`} />
                  <span className="text-xs font-semibold text-foreground tracking-wide">{stat.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="bio" className="w-full">
              <TabsList className="w-full bg-card border border-border rounded-xl p-1 h-auto">
                <TabsTrigger
                  value="bio"
                  className="flex-1 rounded-lg text-[11px] tracking-[0.1em] uppercase py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all"
                >
                  Bio-Availability
                </TabsTrigger>
                <TabsTrigger
                  value="sourcing"
                  className="flex-1 rounded-lg text-[11px] tracking-[0.1em] uppercase py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all"
                >
                  Sourcing
                </TabsTrigger>
                <TabsTrigger
                  value="ritual"
                  className="flex-1 rounded-lg text-[11px] tracking-[0.1em] uppercase py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all"
                >
                  Daily Ritual
                </TabsTrigger>
              </TabsList>
              <TabsContent value="bio" className="pt-6 text-sm text-muted-foreground leading-relaxed">
                {product.bio_availability_text || "Clinical-grade bioavailability engineered for maximum absorption."}
              </TabsContent>
              <TabsContent value="sourcing" className="pt-6 text-sm text-muted-foreground leading-relaxed">
                {product.sourcing_text || "Ethically sourced, third-party tested, traceable from origin to capsule."}
              </TabsContent>
              <TabsContent value="ritual" className="pt-6 text-sm text-muted-foreground leading-relaxed">
                {product.daily_ritual_text || "Integrate seamlessly into your daily protocol for sustained results."}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <VoiceAgent />
    </div>
  );
};

export default ProductDetail;
