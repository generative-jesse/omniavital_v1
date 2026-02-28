import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, Circle, Sun, Brain, Moon, Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ritualSlots = [
  { id: "morning", label: "Morning Protocol", desc: "Adaptogenic energy stack", icon: Sun, gradient: "from-amber-400/20 to-orange-500/20" },
  { id: "focus", label: "Focus Complex", desc: "Nootropic deep-work blend", icon: Brain, gradient: "from-primary/20 to-emerald-400/20" },
  { id: "evening", label: "Evening Recovery", desc: "Sleep & HRV optimizer", icon: Moon, gradient: "from-violet-400/20 to-indigo-500/20" },
];

interface RitualLog {
  id: string;
  logged_date: string;
  completed: boolean;
  product_id: string | null;
  notes: string | null;
}

const CalendarTab = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [logs, setLogs] = useState<RitualLog[]>([]);
  const [products, setProducts] = useState<Record<string, { id: string; category: string }>>({});

  useEffect(() => {
    supabase.from("products").select("id, category").then(({ data }) => {
      const map: Record<string, { id: string; category: string }> = {};
      data?.forEach((p) => { map[p.category] = { id: p.id, category: p.category }; });
      setProducts(map);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const month = date.toISOString().slice(0, 7);
    supabase
      .from("ritual_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_date", `${month}-01`)
      .lte("logged_date", `${month}-31`)
      .then(({ data }) => setLogs(data || []));
  }, [user, date]);

  const selectedDateStr = date.toISOString().slice(0, 10);
  const dayLogs = logs.filter((l) => l.logged_date === selectedDateStr);

  const toggleRitual = async (category: string) => {
    if (!user) return;
    const product = products[category];
    const existing = dayLogs.find((l) => l.product_id === product?.id);

    if (existing) {
      await supabase.from("ritual_logs").update({ completed: !existing.completed }).eq("id", existing.id);
    } else {
      await supabase.from("ritual_logs").insert({
        user_id: user.id,
        product_id: product?.id || null,
        logged_date: selectedDateStr,
        completed: true,
      });
    }

    const { data } = await supabase
      .from("ritual_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_date", selectedDateStr);
    setLogs((prev) => [...prev.filter((l) => l.logged_date !== selectedDateStr), ...(data || [])]);
  };

  // Stats
  const completedDates = logs.reduce<Record<string, number>>((acc, l) => {
    if (l.completed) acc[l.logged_date] = (acc[l.logged_date] || 0) + 1;
    return acc;
  }, {});

  const { streak, totalDays, completionRate } = useMemo(() => {
    const allCompletedDates = Object.entries(completedDates)
      .filter(([, c]) => c >= 3)
      .map(([d]) => d)
      .sort()
      .reverse();

    let streak = 0;
    for (let i = 0; i < allCompletedDates.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      if (allCompletedDates[i] === expected.toISOString().slice(0, 10)) {
        streak++;
      } else break;
    }

    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const totalDays = Object.keys(completedDates).length;
    const perfectDays = allCompletedDates.length;
    const completionRate = daysInMonth > 0 ? Math.round((perfectDays / daysInMonth) * 100) : 0;

    return { streak, totalDays, completionRate };
  }, [completedDates, date]);

  const ringLabel = streak >= 60 ? "🥇 Gold Ring" : streak >= 21 ? "🥈 Silver Ring" : streak >= 7 ? "🥉 Bronze Ring" : `${7 - streak} days to Bronze`;
  const todayCompleted = dayLogs.filter((l) => l.completed).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-foreground mb-1">Ritual Calendar</h2>
          <p className="text-sm text-muted-foreground">Track your daily wellness rituals</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 text-center"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Flame size={16} className="text-orange-400" />
            <span className="text-2xl font-black text-foreground">{streak}</span>
          </div>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground">Day Streak</p>
          <p className="text-[10px] text-primary font-medium mt-0.5">{ringLabel}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-xl p-4 text-center"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-2xl font-black text-foreground">{completionRate}%</span>
          </div>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground">This Month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 text-center"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <CheckCircle2 size={16} className="text-primary" />
            <span className="text-2xl font-black text-foreground">{todayCompleted}/3</span>
          </div>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground">Today</p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-6">
        <div className="glass rounded-xl p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setDate(d)}
            className={cn("p-3 pointer-events-auto")}
            modifiers={{
              completed: Object.entries(completedDates)
                .filter(([, c]) => c >= 3)
                .map(([d]) => new Date(d + "T12:00:00")),
              partial: Object.entries(completedDates)
                .filter(([, c]) => c > 0 && c < 3)
                .map(([d]) => new Date(d + "T12:00:00")),
            }}
            modifiersClassNames={{
              completed: "bg-primary/20 text-primary font-bold ring-1 ring-primary/30",
              partial: "bg-accent/10 text-accent font-medium",
            }}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h3>
          <div className="space-y-3">
            {ritualSlots.map((slot, idx) => {
              const product = products[slot.id];
              const log = dayLogs.find((l) => l.product_id === product?.id);
              const completed = log?.completed || false;
              const Icon = slot.icon;

              return (
                <motion.button
                  key={slot.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => toggleRitual(slot.id)}
                  className={`w-full rounded-xl p-4 flex items-center gap-4 text-left transition-all duration-300 ${
                    completed
                      ? "glass border-primary/20 shadow-lg shadow-primary/5"
                      : "glass hover:border-primary/20"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${slot.gradient} flex items-center justify-center`}>
                    <Icon size={18} className={completed ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", completed ? "text-foreground" : "text-muted-foreground")}>
                      {slot.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{slot.desc}</p>
                  </div>
                  {completed ? (
                    <CheckCircle2 size={22} className="text-primary shrink-0" />
                  ) : (
                    <Circle size={22} className="text-muted-foreground/30 shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {todayCompleted === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-4 text-center"
            >
              <p className="text-sm font-semibold text-foreground">🔥 Full Ritual Complete</p>
              <p className="text-xs text-muted-foreground mt-0.5">You're building something powerful. Keep going.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarTab;
