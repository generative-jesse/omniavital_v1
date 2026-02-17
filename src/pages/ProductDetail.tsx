import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ShieldCheck, Leaf, FlaskConical } from "lucide-react";
import Navbar from "@/components/Navbar";
import productMorning from "@/assets/product-morning.jpg";
import productFocus from "@/assets/product-focus.jpg";
import productEvening from "@/assets/product-evening.jpg";

const productImages: Record<string, string> = {
  "morning-routine": productMorning,
  "focus-window": productFocus,
  "evening-recovery": productEvening,
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const localImage = productImages[product.slug];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        {/* Back link */}
        <div className="container mx-auto px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Rituals
          </Link>
        </div>

        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Product image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border"
            >
              {localImage ? (
                <img
                  src={localImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-7xl font-bold text-muted-foreground/10">
                    {product.name.charAt(0)}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Product info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col justify-center py-4"
            >
              <p className="text-xs tracking-[0.4em] uppercase text-primary font-medium mb-3">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-2">
                {product.name}
              </h1>
              <p className="text-muted-foreground font-light text-base md:text-lg mb-4">
                {product.tagline}
              </p>
              <p className="text-3xl font-bold text-foreground mb-6">
                ${Number(product.price).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-lg">
                {product.description}
              </p>

              <button className="w-full px-10 py-4 bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-sm rounded-lg hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.01] transition-all duration-300 mb-6">
                Add to Ritual
              </button>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 mb-8">
                {[
                  { icon: FlaskConical, label: "Clinically Dosed" },
                  { icon: ShieldCheck, label: "3rd-Party Tested" },
                  { icon: Leaf, label: "Clean Sourced" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <badge.icon size={14} className="text-primary/70" />
                    {badge.label}
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="bio" className="w-full">
                <TabsList className="w-full bg-secondary rounded-lg p-1 h-auto">
                  <TabsTrigger
                    value="bio"
                    className="flex-1 rounded-md text-[11px] tracking-[0.12em] uppercase py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    Bio-Availability
                  </TabsTrigger>
                  <TabsTrigger
                    value="sourcing"
                    className="flex-1 rounded-md text-[11px] tracking-[0.12em] uppercase py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    Sourcing
                  </TabsTrigger>
                  <TabsTrigger
                    value="ritual"
                    className="flex-1 rounded-md text-[11px] tracking-[0.12em] uppercase py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    Daily Ritual
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="bio" className="pt-5 text-sm text-muted-foreground leading-relaxed">
                  {product.bio_availability_text || "Clinical-grade bioavailability engineered for maximum absorption."}
                </TabsContent>
                <TabsContent value="sourcing" className="pt-5 text-sm text-muted-foreground leading-relaxed">
                  {product.sourcing_text || "Ethically sourced, third-party tested, traceable from origin to capsule."}
                </TabsContent>
                <TabsContent value="ritual" className="pt-5 text-sm text-muted-foreground leading-relaxed">
                  {product.daily_ritual_text || "Integrate seamlessly into your daily protocol for sustained results."}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
