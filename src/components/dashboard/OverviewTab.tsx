import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, CheckCircle2, ShoppingBag, ArrowRight, Award, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { productImages } from "@/components/RitualGrid";

interface Props {
  streak: number;
  onNavigate: (tab: "profile" | "purchases" | "calendar" | "community" | "coach") => void;
}

const ringFor = (streak: number) => {
  if (streak >= 60) return { label: "Gold Ring", next: null, progress: 100 };
  if (streak >= 21) return { label: "Silver Ring", next: 60, progress: Math.round((streak / 60) * 100) };
  if (streak >= 7) return { label: "Bronze Ring", next: 21, progress: Math.round((streak / 21) * 100) };
  return { label: "No ring yet", next: 7, progress: Math.round((streak / 7) * 100) };
};

const OverviewTab = ({ streak, onNavigate }: Props) => {
  const { user } = useAuth();
  const [todayCount, setTodayCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<{ id: string; slug: string; name: string; tagline: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    supabase
      .from("ritual_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("logged_date", today)
      .eq("completed", true)
      .then(({ data }) => setTodayCount(data?.length || 0));

    supabase
      .from("purchases")
      .select("product_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setOrderCount(data?.length || 0);
        setOwned([...new Set((data || []).map((p) => p.product_id).filter(Boolean) as string[])]);
      });

    supabase
      .from("products")
      .select("id, slug, name, tagline")
      .then(({ data }) => setCatalog(data || []));
  }, [user]);

  const ring = ringFor(streak);
  const missing = catalog.filter((p) => !owned.includes(p.id));

  const stats = [
    { icon: Flame, value: streak, label: "Day streak", tone: "text-orange-400" },
    { icon: CheckCircle2, value: `${todayCount}/3`, label: "Today's ritual", tone: "text-primary" },
    { icon: ShoppingBag, value: orderCount, label: "Orders", tone: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-5"
          >
            <s.icon size={18} className={`${s.tone} mb-3`} />
            <p className="text-2xl font-black text-foreground leading-none">{s.value}</p>
            <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Ring progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Award size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{ring.label}</p>
              <p className="text-xs text-muted-foreground">
                {ring.next
                  ? `${ring.next - streak} more consistent days to the next ring`
                  : "You've reached the highest ring. Remarkable."}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-foreground">{ring.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(ring.progress, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          />
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => onNavigate("calendar")}
          className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all duration-300 hover:border-primary/30"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Log today's ritual</p>
            <p className="text-xs text-muted-foreground">
              {todayCount === 3 ? "All three logged. Nicely done." : `${3 - todayCount} left to complete today`}
            </p>
          </div>
          <ArrowRight size={16} className="shrink-0 text-primary transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => onNavigate("coach")}
          className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all duration-300 hover:border-primary/30"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Ask your coach</p>
            <p className="text-xs text-muted-foreground">Personalised guidance on your protocol</p>
          </div>
          <Sparkles size={16} className="shrink-0 text-accent" />
        </button>
      </div>

      {/* Complete your protocol */}
      {missing.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Complete your protocol
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {missing.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-300 hover:border-primary/30"
              >
                <img
                  src={productImages[p.slug]}
                  alt={p.name}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OverviewTab;
