import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, Circle, Sun, Brain, Moon, Flame, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import DayLogPanel from "./DayLogPanel";

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
}

/** Local (not UTC) YYYY-MM-DD — toISOString shifts the day for negative offsets. */
const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const fromKey = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const CalendarTab = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [logs, setLogs] = useState<RitualLog[]>([]);
  const [otherActivity, setOtherActivity] = useState<Set<string>>(new Set());
  const [allRitualDates, setAllRitualDates] = useState<string[]>([]);
  const [products, setProducts] = useState<Record<string, { id: string; category: string }>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("products").select("id, category").then(({ data }) => {
      const map: Record<string, { id: string; category: string }> = {};
      data?.forEach((p) => { map[p.category] = { id: p.id, category: p.category }; });
      setProducts(map);
    });
  }, []);

  const monthStart = toKey(new Date(month.getFullYear(), month.getMonth(), 1));
  const monthEnd = toKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  const loadMonth = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const range = <T,>(q: T) => q as T;
    const [r, d, m, j] = await Promise.all([
      supabase.from("ritual_logs").select("id, logged_date, completed, product_id").eq("user_id", user.id).gte("logged_date", monthStart).lte("logged_date", monthEnd),
      supabase.from("diet_logs").select("logged_date").eq("user_id", user.id).gte("logged_date", monthStart).lte("logged_date", monthEnd),
      supabase.from("mood_logs").select("logged_date").eq("user_id", user.id).gte("logged_date", monthStart).lte("logged_date", monthEnd),
      supabase.from("journal_entries").select("logged_date").eq("user_id", user.id).gte("logged_date", monthStart).lte("logged_date", monthEnd),
    ]);
    void range;
    setLogs((r.data as RitualLog[]) || []);
    setOtherActivity(
      new Set([...(d.data || []), ...(m.data || []), ...(j.data || [])].map((x) => (x as { logged_date: string }).logged_date)),
    );
    setLoading(false);
  }, [user, monthStart, monthEnd]);

  const loadStreak = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ritual_logs")
      .select("logged_date")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("logged_date", { ascending: false })
      .limit(400);
    setAllRitualDates([...new Set((data || []).map((l) => l.logged_date))]);
  }, [user]);

  useEffect(() => { loadMonth(); }, [loadMonth]);
  useEffect(() => { loadStreak(); }, [loadStreak]);

  const selectedDateStr = toKey(date);
  const dayLogs = logs.filter((l) => l.logged_date === selectedDateStr);

  const toggleRitual = async (category: string) => {
    if (!user) return;
    const product = products[category];
    if (!product) return;
    setBusy(category);
    const existing = dayLogs.find((l) => l.product_id === product.id);

    if (existing) {
      await supabase.from("ritual_logs").update({ completed: !existing.completed }).eq("id", existing.id);
    } else {
      await supabase.from("ritual_logs").upsert(
        { user_id: user.id, product_id: product.id, logged_date: selectedDateStr, completed: true },
        { onConflict: "user_id,product_id,logged_date" },
      );
    }
    await Promise.all([loadMonth(), loadStreak()]);
    setBusy(null);
  };

  const completedCounts = useMemo(
    () =>
      logs.reduce<Record<string, number>>((acc, l) => {
        if (l.completed) acc[l.logged_date] = (acc[l.logged_date] || 0) + 1;
        return acc;
      }, {}),
    [logs],
  );

  const streak = useMemo(() => {
    const set = new Set(allRitualDates);
    let s = 0;
    const cursor = new Date();
    // allow today to be un-logged without breaking yesterday's streak
    if (!set.has(toKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (set.has(toKey(cursor))) {
      s++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return s;
  }, [allRitualDates]);

  const completionRate = useMemo(() => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const perfect = Object.values(completedCounts).filter((c) => c >= 3).length;
    return Math.round((perfect / daysInMonth) * 100);
  }, [completedCounts, month]);

  const ringLabel =
    streak >= 60 ? "Gold ring" : streak >= 21 ? "Silver ring" : streak >= 7 ? "Bronze ring" : `${Math.max(7 - streak, 0)} days to bronze`;
  const todayCompleted = dayLogs.filter((l) => l.completed).length;

  const fullDays = Object.entries(completedCounts).filter(([, c]) => c >= 3).map(([d]) => fromKey(d));
  const partialDays = Object.entries(completedCounts).filter(([, c]) => c > 0 && c < 3).map(([d]) => fromKey(d));
  const loggedOnly = [...otherActivity]
    .filter((d) => !completedCounts[d])
    .map(fromKey);

  const stats = [
    { icon: Flame, tone: "text-orange-400", value: streak, label: "Day streak", sub: ringLabel },
    { icon: TrendingUp, tone: "text-primary", value: `${completionRate}%`, label: "This month", sub: "Full ritual days" },
    { icon: CheckCircle2, tone: "text-primary", value: `${todayCompleted}/3`, label: "Selected day", sub: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-wide text-foreground mb-1">Ritual Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Rituals, diet, mood and journal — logged by you or your agent.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-3 sm:p-4 text-center"
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <s.icon size={15} className={s.tone} />
              <span className="text-xl sm:text-2xl font-black text-foreground leading-none">{s.value}</span>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-primary font-medium mt-0.5 truncate">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <div className="space-y-4">
          <div className="glass rounded-2xl p-2 sm:p-3 relative">
            {loading && (
              <Loader2 size={14} className="absolute right-4 top-4 animate-spin text-muted-foreground" />
            )}
            <Calendar
              mode="single"
              selected={date}
              month={month}
              onMonthChange={setMonth}
              onSelect={(d) => d && setDate(d)}
              className={cn("p-2 pointer-events-auto")}
              modifiers={{ full: fullDays, partial: partialDays, logged: loggedOnly }}
              modifiersClassNames={{
                full: "relative font-bold text-primary bg-primary/15 ring-1 ring-primary/30 after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary",
                partial: "relative text-foreground after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary/50",
                logged: "relative text-foreground after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-accent",
              }}
            />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 pb-2 pt-1 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Full ritual</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary/50" />Partial</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Diet / mood / journal</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
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
                    disabled={busy === slot.id || !products[slot.id]}
                    aria-pressed={completed}
                    className={cn(
                      "w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all duration-300 glass disabled:opacity-60",
                      completed ? "border-primary/25 shadow-lg shadow-primary/5" : "hover:border-primary/20",
                    )}
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${slot.gradient} flex items-center justify-center`}>
                      <Icon size={18} className={completed ? "text-primary" : "text-muted-foreground"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", completed ? "text-foreground" : "text-muted-foreground")}>
                        {slot.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{slot.desc}</p>
                    </div>
                    {busy === slot.id ? (
                      <Loader2 size={20} className="animate-spin text-muted-foreground shrink-0" />
                    ) : completed ? (
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
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-4 text-center"
              >
                <p className="text-sm font-semibold text-foreground">Full ritual complete</p>
                <p className="text-xs text-muted-foreground mt-0.5">You're building something powerful. Keep going.</p>
              </motion.div>
            )}
          </div>

          <DayLogPanel dateStr={selectedDateStr} onChanged={loadMonth} />
        </div>
      </div>
    </div>
  );
};

export default CalendarTab;
