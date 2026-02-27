import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, Circle, Sun, Brain, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const ritualSlots = [
  { id: "morning", label: "Morning Protocol", icon: Sun, color: "text-amber-400" },
  { id: "focus", label: "Focus Complex", icon: Brain, color: "text-primary" },
  { id: "evening", label: "Evening Recovery", icon: Moon, color: "text-violet-400" },
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
    // Fetch products for mapping
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

    // Refresh
    const { data } = await supabase
      .from("ritual_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_date", selectedDateStr);
    setLogs((prev) => [...prev.filter((l) => l.logged_date !== selectedDateStr), ...(data || [])]);
  };

  // Dates with all 3 rituals completed
  const completedDates = logs.reduce<Record<string, number>>((acc, l) => {
    if (l.completed) acc[l.logged_date] = (acc[l.logged_date] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-xl font-bold tracking-wide text-foreground mb-1">Ritual Calendar</h2>
      <p className="text-sm text-muted-foreground mb-8">Track your daily wellness rituals</p>

      <div className="grid md:grid-cols-[auto_1fr] gap-8">
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
            }}
            modifiersClassNames={{
              completed: "bg-primary/20 text-primary font-bold",
            }}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h3>
          <div className="space-y-3">
            {ritualSlots.map((slot) => {
              const product = products[slot.id];
              const log = dayLogs.find((l) => l.product_id === product?.id);
              const completed = log?.completed || false;
              const Icon = slot.icon;

              return (
                <button
                  key={slot.id}
                  onClick={() => toggleRitual(slot.id)}
                  className={`w-full glass rounded-xl p-4 flex items-center gap-4 text-left transition-all duration-300 hover:border-primary/30 ${
                    completed ? "border-primary/20" : ""
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 size={22} className="text-primary shrink-0" />
                  ) : (
                    <Circle size={22} className="text-muted-foreground shrink-0" />
                  )}
                  <Icon size={18} className={cn("shrink-0", slot.color)} />
                  <div>
                    <p className={cn("text-sm font-medium", completed ? "text-foreground" : "text-muted-foreground")}>
                      {slot.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {completed ? "Completed" : "Tap to mark as done"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTab;
