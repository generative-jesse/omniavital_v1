import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, reduce ? 1.08 : 1.18]);
  const veil = useTransform(scrollYProgress, [0, 1], [0.25, 0.85]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Parallax background with soft focus */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        style={{ y: bgY, scale: bgScale, backgroundImage: `url(${heroBg})` }}
        className="absolute inset-[-10%] bg-cover bg-center will-change-transform"
      />
      {/* Smoke / glass diffusion */}
      <div className="absolute inset-0 backdrop-blur-[6px] backdrop-saturate-[0.85]" />
      <motion.div style={{ opacity: veil }} className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/45 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
      {/* Drifting smoke plumes */}
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { x: ["-6%", "6%", "-6%"], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-1/4 top-1/4 h-[60vh] w-[80vw] rounded-full bg-primary/10 blur-[120px]"
      />
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { x: ["5%", "-5%", "5%"], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[55vh] w-[70vw] rounded-full bg-accent/10 blur-[140px]"
      />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          <span className="text-xs tracking-[0.4em] uppercase text-primary font-medium px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            Bio-Optimized Performance
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[0.95]"
        >
          Optimal Life,
          <br />
          <span className="text-gradient">Seamlessly</span> Integrated.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-6 text-lg md:text-xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto"
        >
          Bio-optimized nutrition for the modern vanguard.
        </motion.p>

        <motion.a
          href="#ritual"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="inline-block mt-10 px-10 py-4 bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-sm rounded-lg hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300"
        >
          Explore The Ritual
        </motion.a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  );
};

export default HeroSection;
