import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Circle, Flame, Loader2, Package, Sparkles } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { calculateInventory, type InventoryItem } from "@/lib/inventory";
import { cn } from "@/lib/utils";
import DayLogPanel from "./DayLogPanel";

const ritualSlots = [
  { id: "morning", label: "Morning Protocol", description: "Daily energy and resilience" },
  { id: "focus", label: "Focus Complex", description: "Clarity for focused work" },
  { id: "evening", label: "Evening Recovery", description: "Recovery and restorative sleep" },
] as const;

interface RitualLog {
  id: string;
  logged_date: string;
  logged_at?: string;
  completed: boolean;
  product_id: string | null;
  notes?: string | null;
}

interface Product {
  id: string;
  category: string;
  name: string;
  slug: string;
}

const toKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const fromKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const CalendarTab = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [monthLogs, setMonthLogs] = useState<RitualLog[]>([]);
  const [allLogs, setAllLogs] = useState<RitualLog[]>([]);
  const [otherActivity, setOtherActivity] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthStart = toKey(new Date(month.getFullYear(), month.getMonth(), 1));
  const monthEnd = toKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const [productResult, ritualResult, dietResult, moodResult, journalResult, purchaseResult] = await Promise.all([
      supabase.from("products").select("id, category, name, slug"),
      supabase.from("ritual_logs").select("id, logged_date, logged_at, completed, product_id, notes").eq("user_id", user.id).order("logged_date", { ascending: false }).limit(1000),
      supabase.from("diet_logs").select("logged_date").eq("user_id", user.id).gte("logged_date", monthStart).lte("logged_date", monthEnd),
      supabase.from("mood_logs").select("logged_date").eq("user_id", user.id).gte("logged_date", monthStart).lte("logged_date", monthEnd),
      supabase.from("journal_entries").select("logged_date").eq("user_id", user.id).gte("logged_date", monthStart).lte("logged_date", monthEnd),
      supabase.from("purchases").select("product_id, quantity").eq("user_id", user.id).eq("status", "active"),
    ]);

    const firstError = [productResult, ritualResult, dietResult, moodResult, journalResult, purchaseResult].find((result) => result.error)?.error;
    if (firstError) {
      setError("Your activity could not be loaded. Please try again.");
      setLoading(false);
      return;
    }

    const productMap: Record<string, Product> = {};
    (productResult.data ?? []).forEach((product) => { productMap[product.category] = product; });
    const rituals = (ritualResult.data as RitualLog[]) ?? [];
    const activity: Record<string, number> = {};
    [...(dietResult.data ?? []), ...(moodResult.data ?? []), ...(journalResult.data ?? [])].forEach(({ logged_date }) => {
      activity[logged_date] = (activity[logged_date] ?? 0) + 1;
    });

    setProducts(productMap);
    setAllLogs(rituals);
    setMonthLogs(rituals.filter((log) => log.logged_date >= monthStart && log.logged_date <= monthEnd));
    setOtherActivity(activity);
    setInventory(calculateInventory(purchaseResult.data ?? [], rituals));
    setLoading(false);
  }, [monthEnd, monthStart, user]);

  useEffect(() => { void loadData(); }, [loadData]);

  const selectedDate = toKey(date);
  const dayLogs = monthLogs.filter((log) => log.logged_date === selectedDate);
  const completedToday = dayLogs.filter((log) => log.completed).length;

  const countsByDay = useMemo(() => {
    const counts: Record<string, number> = {};
    monthLogs.forEach((log) => {
      if (log.completed) counts[log.logged_date] = (counts[log.logged_date] ?? 0) + 1;
    });
    return counts;
  }, [monthLogs]);

  const activityDates = useMemo(() => {
    const allDates = new Set([...Object.keys(countsByDay), ...Object.keys(otherActivity)]);
    return [...allDates].map(fromKey);
  }, [countsByDay, otherActivity]);

  const streak = useMemo(() => {
    const loggedDates = new Set(allLogs.filter((log) => log.completed).map((log) => log.logged_date));
    let value = 0;
    const cursor = new Date();
    if (!loggedDates.has(toKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (loggedDates.has(toKey(cursor))) {
      value += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return value;
  }, [allLogs]);

  const toggleRitual = async (category: string) => {
    if (!user) return;
    const product = products[category];
    if (!product) return;
    const existing = dayLogs.find((log) => log.product_id === product.id);
    const nextCompleted = !existing?.completed;
    const remaining = inventory[product.id]?.remaining ?? 0;
    if (nextCompleted && remaining <= 0) return;

    setBusy(category);
    const result = existing
      ? await supabase.from("ritual_logs").update({ completed: nextCompleted }).eq("id", existing.id)
      : await supabase.from("ritual_logs").upsert(
          { user_id: user.id, product_id: product.id, logged_date: selectedDate, completed: true },
          { onConflict: "user_id,product_id,logged_date" },
        );
    setBusy(null);
    if (result.error) {
      setError("That intake was not saved. Please try again.");
      return;
    }
    await loadData();
  };

  return (
    <section aria-labelledby="calendar-heading">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="calendar-heading" className="text-xl font-semibold text-foreground">Logbook</h2>
          <p className="mt-1 text-sm text-muted-foreground">Rituals, nutrition, mood, and journal entries by day.</p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-md bg-secondary px-3 py-2">
          <Flame className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{streak} day streak</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void loadData()}>Retry</Button>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="relative rounded-md border border-border bg-card p-3 sm:p-4">
            {loading && <Loader2 className="absolute right-16 top-7 h-4 w-4 animate-spin text-muted-foreground" />}
            <Calendar
              mode="single"
              selected={date}
              month={month}
              onMonthChange={setMonth}
              onSelect={(nextDate) => nextDate && setDate(nextDate)}
              className="w-full p-0"
              modifiers={{ activity: activityDates }}
              modifiersClassNames={{
                activity: "relative font-medium after:absolute after:bottom-0.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
              }}
              classNames={{
                day_selected: "bg-accent text-accent-foreground ring-1 ring-primary hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground after:bg-primary",
              }}
            />
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Activity logged</span>
              <span>{activityDates.length} active days</span>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Inventory</span>
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-3">
              {ritualSlots.map((slot) => {
                const product = products[slot.id];
                const remaining = product ? inventory[product.id]?.remaining ?? 0 : 0;
                return (
                  <div key={slot.id} className="flex items-center justify-between gap-4">
                    <span className="truncate text-sm text-foreground">{product?.name ?? slot.label}</span>
                    <span className={cn("shrink-0 text-xs font-semibold", remaining <= 5 ? "text-destructive" : "text-muted-foreground")}>{remaining} doses</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex flex-col gap-2 border-b border-border bg-secondary/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <p className="text-lg font-semibold text-foreground">{date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{completedToday} of {ritualSlots.length} rituals taken · {otherActivity[selectedDate] ?? 0} other entries</p>
              </div>
              {completedToday === ritualSlots.length && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> Day complete</span>
              )}
            </div>

            <div className="divide-y divide-border">
              {ritualSlots.map((slot) => {
                const product = products[slot.id];
                const log = dayLogs.find((item) => item.product_id === product?.id);
                const completed = log?.completed ?? false;
                const remaining = product ? inventory[product.id]?.remaining ?? 0 : 0;
                const canLog = completed || remaining > 0;
                return (
                  <div key={slot.id} className="flex items-center gap-3 px-4 py-4 sm:px-5">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => void toggleRitual(slot.id)}
                      disabled={busy === slot.id || !product || !canLog}
                      aria-pressed={completed}
                      aria-label={`${completed ? "Undo" : "Log"} ${slot.label}`}
                       className={cn("h-10 w-10 shrink-0 rounded-md", completed && "border-primary bg-primary text-primary-foreground hover:bg-primary/90")}
                    >
                      {busy === slot.id ? <Loader2 className="animate-spin" /> : completed ? <Check /> : <Circle />}
                    </Button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{product?.name ?? slot.label}</p>
                       <p className="truncate text-xs text-muted-foreground">{completed ? `Taken${log?.logged_at ? ` at ${new Date(log.logged_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}` : remaining > 0 ? slot.description : "No inventory — add a bottle to continue"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={cn("text-sm font-semibold", remaining <= 5 ? "text-destructive" : "text-foreground")}>{remaining}</p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">servings left</p>
                    </div>
                    {!canLog && product && (
                      <Button asChild variant="ghost" size="icon" aria-label={`Buy ${product.name}`}>
                        <Link to={`/product/${product.slug}`}><ChevronRight /></Link>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <DayLogPanel dateStr={selectedDate} onChanged={loadData} />
        </div>
      </div>
    </section>
  );
};

export default CalendarTab;