import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import logoMark from "@/assets/logo-mark.png";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <img src={logoMark} alt="OmniaVital logo" width={56} height={56} className="mx-auto mb-8 h-14 w-14 object-contain" />
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.4em] text-primary">Error 404</p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
          This page isn't part of the protocol.
        </h1>
        <p className="mb-10 text-sm font-light leading-relaxed text-muted-foreground">
          The page you're looking for has moved or never existed. Let's get you back to your ritual.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
