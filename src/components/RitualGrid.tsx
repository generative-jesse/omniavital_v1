import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import productMorning from "@/assets/product-morning.jpg";
import productFocus from "@/assets/product-focus.jpg";
import productEvening from "@/assets/product-evening.jpg";

export const productImages: Record<string, string> = {
  "morning-routine": productMorning,
  "focus-window": productFocus,
  "evening-recovery": productEvening,
};

const order = ["morning-routine", "focus-window", "evening-recovery"];

const RitualGrid = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("slug, name, tagline, category, price");
      if (error) throw error;
      return [...data].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
    },
  });

  return (
    <section id="ritual" className="py-24 md:py-32 px-6 scroll-mt-20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary font-medium mb-4">
            The Ritual
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Your Daily Protocol
          </h2>
          <p className="mt-4 text-muted-foreground font-light max-w-xl mx-auto">
            Three formulas, timed to the rhythm of your day. Built to be taken together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {isLoading &&
            order.map((slug) => (
              <div key={slug} className="rounded-xl border border-border bg-card min-h-[440px] animate-pulse" />
            ))}

          {products?.map((product, i) => (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <Link
                to={`/product/${product.slug}`}
                className="group relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={productImages[product.slug]}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 glass-light rounded-full px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    {product.category}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-end p-6">
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <h3 className="text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                      {product.name}
                    </h3>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      ${Number(product.price).toFixed(0)}
                    </span>
                  </div>
                  <p className="mb-5 text-sm font-light leading-relaxed text-muted-foreground">
                    {product.tagline}
                  </p>
                  <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                    Discover
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RitualGrid;
