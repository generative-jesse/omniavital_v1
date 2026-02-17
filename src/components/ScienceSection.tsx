import { motion } from "framer-motion";
import { FlaskConical, ShieldCheck, Leaf } from "lucide-react";

const pillars = [
  {
    icon: FlaskConical,
    title: "Clinically Dosed",
    description: "Every ingredient at its research-backed therapeutic dose. No fairy-dusting, no proprietary blends.",
  },
  {
    icon: ShieldCheck,
    title: "Third-Party Tested",
    description: "Independent lab verification for purity, potency, and heavy metals. Every batch, every time.",
  },
  {
    icon: Leaf,
    title: "Clean Sourced",
    description: "Traceable from origin to capsule. Ethically harvested, sustainably processed, zero fillers.",
  },
];

const ScienceSection = () => {
  return (
    <section id="science" className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-primary font-medium mb-4">
            The Science
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Precision Nutrition
          </h2>
          <p className="text-muted-foreground font-light leading-relaxed text-lg">
            Every formula is engineered for maximum bioavailability.
            No compromises. Just results you can feel.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group glass-light rounded-xl p-8 hover:border-primary/20 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                <pillar.icon size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {pillar.title}
              </h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScienceSection;
