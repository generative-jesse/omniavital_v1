import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-24 px-6">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Product image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="aspect-square bg-muted rounded-lg flex items-center justify-center"
          >
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="text-6xl font-bold text-muted-foreground/20 tracking-tight">
                {product.name.charAt(0)}
              </div>
            )}
          </motion.div>

          {/* Product info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs tracking-[0.3em] uppercase text-primary font-medium mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
              {product.name}
            </h1>
            <p className="text-muted-foreground font-light mb-2">{product.tagline}</p>
            <p className="text-2xl font-semibold text-foreground mb-6">
              ${Number(product.price).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            <button className="w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors mb-10">
              Add to Ritual
            </button>

            <Tabs defaultValue="bio" className="w-full">
              <TabsList className="w-full bg-muted rounded-none border-b border-border">
                <TabsTrigger value="bio" className="flex-1 rounded-none text-xs tracking-widest uppercase">
                  Bio-Availability
                </TabsTrigger>
                <TabsTrigger value="sourcing" className="flex-1 rounded-none text-xs tracking-widest uppercase">
                  Sourcing
                </TabsTrigger>
                <TabsTrigger value="ritual" className="flex-1 rounded-none text-xs tracking-widest uppercase">
                  Daily Ritual
                </TabsTrigger>
              </TabsList>
              <TabsContent value="bio" className="pt-4 text-sm text-muted-foreground leading-relaxed">
                {product.bio_availability_text || "Clinical-grade bioavailability engineered for maximum absorption."}
              </TabsContent>
              <TabsContent value="sourcing" className="pt-4 text-sm text-muted-foreground leading-relaxed">
                {product.sourcing_text || "Ethically sourced, third-party tested, traceable from origin to capsule."}
              </TabsContent>
              <TabsContent value="ritual" className="pt-4 text-sm text-muted-foreground leading-relaxed">
                {product.daily_ritual_text || "Integrate seamlessly into your daily protocol for sustained results."}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
