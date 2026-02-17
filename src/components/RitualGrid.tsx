import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import productMorning from "@/assets/product-morning.jpg";
import productFocus from "@/assets/product-focus.jpg";
import productEvening from "@/assets/product-evening.jpg";

const rituals = [
  {
    title: "The Morning Routine",
    tagline: "Organic Protein + Multi — Start sharp, stay sustained.",
    slug: "morning-routine",
    category: "morning",
    image: productMorning,
  },
  {
    title: "The Focus Window",
    tagline: "Nootropic Complex — Unlock deep, effortless concentration.",
    slug: "focus-window",
    category: "focus",
    image: productFocus,
  },
  {
    title: "The Evening Recovery",
    tagline: "Magnesium + Adaptogens — Rest, recover, rebuild.",
    slug: "evening-recovery",
    category: "evening",
    image: productEvening,
  },
];

const RitualGrid = () => {
  return (
    <section id="ritual" className="py-24 md:py-32 px-6">
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
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {rituals.map((ritual, i) => (
            <motion.div
              key={ritual.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link
                to={`/product/${ritual.slug}`}
                className="group block relative overflow-hidden bg-card border border-border rounded-xl h-full min-h-[420px] flex flex-col hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Product image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={ritual.image}
                    alt={ritual.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground px-3 py-1 rounded-full glass-light">
                    {ritual.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 justify-end">
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {ritual.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4">
                    {ritual.tagline}
                  </p>
                  <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                    Discover
                    <motion.span
                      className="inline-block"
                      whileHover={{ x: 4 }}
                    >
                      →
                    </motion.span>
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
