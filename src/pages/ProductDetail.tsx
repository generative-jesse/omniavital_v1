import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ShieldCheck, Leaf, FlaskConical, Zap, Clock, Droplets, Minus, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import VoiceAgent from "@/components/VoiceAgent";
import { useAuth } from "@/hooks/useAuth";
import { productImages } from "@/components/RitualGrid";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: others } = useQuery({
    queryKey: ["other-products", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("slug, name, tagline, price")
        .neq("slug", slug!);
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const handleAdd = async () => {
    if (!product) return;
    if (!user) {
      toast("Sign in to add this to your ritual");
      navigate("/auth");
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("purchases").insert({
      user_id: user.id,
      product_id: product.id,
      quantity,
      total: Number(product.price) * quantity,
      status: "active",
    });
    setAdding(false);
    if (error) {
      toast.error("Couldn't add to your ritual. Please try again.");
      return;
    }
    toast.success(`${product.name} added to your ritual`, {
      action: { label: "View", onClick: () => navigate("/dashboard") },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-muted-foreground">We couldn't find that product.</p>
        <Link to="/#ritual" className="text-primary text-sm hover:underline">← Browse the ritual</Link>
      </div>
    );
  }

  const localImage = productImages[product.slug] || product.image_url;
  const gradientBg = categoryColors[product.category] || "from-primary/20 to-accent/10";
  const accent = categoryAccents[product.category] || "text-primary";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 pb-24">
        {/* Hero image band */}
        <div className={`relative w-full bg-gradient-to-br ${gradientBg}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="absolute top-4 left-4 z-10">
              <Link
                to="/#ritual"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground transition-colors glass-light px-3 py-2 rounded-lg"
              >
                <ArrowLeft size={14} />
                Back
              </Link>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <span className={`text-[10px] tracking-[0.25em] uppercase font-medium ${accent} glass-light px-3 py-1.5 rounded-full`}>
                {product.category}
              </span>
            </div>

            {localImage ? (
              <img
                src={localImage}
                alt={`${product.name} supplement`}
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
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight mb-2">
                {product.name}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed">
                {product.tagline}
              </p>
            </div>

            {/* Price + quantity + CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
              <span className="text-3xl font-bold text-foreground">
                ${(Number(product.price) * quantity).toFixed(2)}
              </span>

              <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(9, q + 1))}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
                  disabled={quantity >= 9}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={adding}
                className="w-full sm:w-auto sm:ml-auto px-10 py-4 bg-primary text-primary-foreground font-semibold tracking-[0.15em] uppercase text-sm rounded-lg hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add to Ritual"}
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
                {[
                  { v: "bio", l: "Bio-Availability" },
                  { v: "sourcing", l: "Sourcing" },
                  { v: "ritual", l: "Daily Ritual" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.v}
                    value={t.v}
                    className="flex-1 rounded-lg text-[11px] tracking-[0.1em] uppercase py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all"
                  >
                    {t.l}
                  </TabsTrigger>
                ))}
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

            {/* Complete the protocol */}
            {others && others.length > 0 && (
              <section className="mt-16 pt-10 border-t border-border">
                <h2 className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
                  <Check size={14} /> Complete the protocol
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {others.map((o) => (
                    <Link
                      key={o.slug}
                      to={`/product/${o.slug}`}
                      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-all duration-300 hover:border-primary/30"
                    >
                      <img
                        src={productImages[o.slug]}
                        alt={o.name}
                        loading="lazy"
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                          {o.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{o.tagline}</p>
                        <p className="mt-1 text-xs font-semibold text-foreground">
                          ${Number(o.price).toFixed(0)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </div>
      </main>

      <VoiceAgent />
    </div>
  );
};

export default ProductDetail;
