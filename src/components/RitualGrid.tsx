import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const rituals = [
  {
    title: "The Morning Routine",
    tagline: "Organic Protein + Multi — Start sharp, stay sustained.",
    slug: "morning-routine",
    category: "morning",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    title: "The Focus Window",
    tagline: "Nootropic Complex — Unlock deep, effortless concentration.",
    slug: "focus-window",
    category: "focus",
    gradient: "from-primary/15 to-primary/5",
  },
  {
    title: "The Evening Recovery",
    tagline: "Magnesium + Adaptogens — Rest, recover, rebuild.",
    slug: "evening-recovery",
    category: "evening",
    gradient: "from-primary/10 to-primary/5",
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
          <p className="text-sm tracking-[0.3em] uppercase text-primary font-medium mb-3">
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
                className={`group block relative overflow-hidden bg-gradient-to-br ${ritual.gradient} border border-border rounded-lg p-8 md:p-10 h-full min-h-[320px] flex flex-col justify-end hover:border-primary/40 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5`}
              >
                <div className="absolute top-6 right-6 text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  {ritual.category}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {ritual.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed mb-6">
                    {ritual.tagline}
                  </p>
                  <span className="text-sm font-medium tracking-widest uppercase text-primary">
                    Discover →
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
