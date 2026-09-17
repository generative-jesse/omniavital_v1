import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeartPulse, NotebookPen, Plus, Sparkles, Trash2, Utensils, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DietLog {
  id: string;
  meal: string;
  raw_text: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  logged_at: string;
  source: string;
}

interface MoodLog {
  id: string;
  mood: string;
  score: number | null;
  energy: number | null;
  raw_text: string | null;
  logged_at: string;
  source: string;
}

interface JournalEntry {
  id: string;
  title: string | null;
  body: string;
  logged_at: string;
  source: string;
}

type EntryType = "diet" | "mood" | "journal";

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const DayLogPanel = ({ dateStr, onChanged }: { dateStr: string; onChanged?: () => void }) => {
  const { user } = useAuth();
  const [diet, setDiet] = useState<DietLog[]>([]);
  const [mood, setMood] = useState<MoodLog[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [open, setOpen] = useState<EntryType | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const [dietResult, moodResult, journalResult] = await Promise.all([
      supabase.from("diet_logs").select("*").eq("user_id", user.id).eq("logged_date", dateStr).order("logged_at"),
      supabase.from("mood_logs").select("*").eq("user_id", user.id).eq("logged_date", dateStr).order("logged_at"),
      supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("logged_date", dateStr).order("logged_at"),
    ]);
    const failed = [dietResult, moodResult, journalResult].some((result) => result.error);
    setError(failed ? "Some entries could not be loaded." : null);
    setDiet((dietResult.data as DietLog[]) ?? []);
    setMood((moodResult.data as MoodLog[]) ?? []);
    setJournal((journalResult.data as JournalEntry[]) ?? []);
  };

  useEffect(() => {
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateStr]);

  const save = async () => {
    if (!user || !draft.trim() || !open) return;
    setSaving(true);
    setError(null);
    const value = draft.trim();
    const result = open === "diet"
      ? await supabase.from("diet_logs").insert({ user_id: user.id, logged_date: dateStr, raw_text: value, meal: "other" })
      : open === "mood"
        ? await supabase.from("mood_logs").insert({ user_id: user.id, logged_date: dateStr, mood: value.slice(0, 40), raw_text: value })
        : await supabase.from("journal_entries").insert({ user_id: user.id, logged_date: dateStr, body: value });
    setSaving(false);
    if (result.error) {
      setError("That entry was not saved. Please try again.");
      return;
    }
    setDraft("");
    setOpen(null);
    await load();
    onChanged?.();
  };

  const remove = async (table: "diet_logs" | "mood_logs" | "journal_entries", id: string) => {
    if (!window.confirm("Delete this entry?")) return;
    const { error: removeError } = await supabase.from(table).delete().eq("id", id);
    if (removeError) {
      setError("That entry could not be deleted.");
      return;
    }
    await load();
    onChanged?.();
  };

  const totals = diet.reduce(
    (sum, entry) => ({
      calories: sum.calories + (entry.calories ?? 0),
      protein: sum.protein + Number(entry.protein_g ?? 0),
      carbs: sum.carbs + Number(entry.carbs_g ?? 0),
      fat: sum.fat + Number(entry.fat_g ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const entryCount = diet.length + mood.length + journal.length;
  const controls: { id: EntryType; label: string; icon: typeof Utensils; placeholder: string }[] = [
    { id: "diet", label: "Meal", icon: Utensils, placeholder: "What did you eat?" },
    { id: "mood", label: "Mood", icon: HeartPulse, placeholder: "How are you feeling?" },
    { id: "journal", label: "Note", icon: NotebookPen, placeholder: "What is on your mind?" },
  ];

  const Meta = ({ source, loggedAt }: { source: string; loggedAt: string }) => (
    <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
      {source === "agent" && <Sparkles className="h-3 w-3 text-primary" />}
      {time(loggedAt)}
    </span>
  );

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card" aria-labelledby="details-heading">
      <header className="flex flex-col gap-3 border-b border-border bg-secondary/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 id="details-heading" className="text-sm font-semibold text-foreground">Daily details</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{entryCount === 0 ? "No nutrition, mood, or journal entries yet" : `${entryCount} ${entryCount === 1 ? "entry" : "entries"} saved`}</p>
        </div>
        <div className="flex gap-2">
          {controls.map(({ id, label, icon: Icon }) => (
            <Button key={id} variant={open === id ? "secondary" : "outline"} size="sm" onClick={() => { setOpen(open === id ? null : id); setDraft(""); }}>
              <Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">{label}</span><Icon className="sm:hidden" />
            </Button>
          ))}
        </div>
      </header>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-b border-border">
            <div className="p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Add {controls.find((control) => control.id === open)?.label.toLowerCase()}</p>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(null)} aria-label="Close entry form"><X /></Button>
              </div>
              <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={controls.find((control) => control.id === open)?.placeholder} className="min-h-24 resize-none bg-background" />
              <div className="mt-3 flex justify-end">
                <Button onClick={() => void save()} disabled={saving || !draft.trim()}>{saving ? "Saving…" : "Save entry"}</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p role="alert" className="border-b border-destructive/30 bg-destructive/10 px-5 py-3 text-xs text-destructive">{error}</p>}

      {entryCount === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">Choose Meal, Mood, or Note to start this day’s record.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {diet.length > 0 && (
            <div className="grid gap-3 px-4 py-5 sm:grid-cols-[112px_minmax(0,1fr)] sm:px-5">
              <div className="flex items-center gap-2 self-start text-xs font-semibold text-muted-foreground"><Utensils className="h-4 w-4 text-primary" /> Nutrition</div>
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <strong className="font-semibold text-foreground">{totals.calories || "—"} kcal</strong>
                  <span>P {Math.round(totals.protein)}g</span><span>C {Math.round(totals.carbs)}g</span><span>F {Math.round(totals.fat)}g</span>
                </div>
                {diet.map((entry) => (
                  <div key={entry.id} className="group flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium capitalize text-foreground">{entry.meal}</p><Meta source={entry.source} loggedAt={entry.logged_at} /></div>
                      <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground">{entry.raw_text}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => void remove("diet_logs", entry.id)} aria-label="Delete meal"><Trash2 /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mood.length > 0 && (
            <div className="grid gap-3 px-4 py-5 sm:grid-cols-[112px_minmax(0,1fr)] sm:px-5">
              <div className="flex items-center gap-2 self-start text-xs font-semibold text-muted-foreground"><HeartPulse className="h-4 w-4 text-primary" /> Mood</div>
              <div className="min-w-0 space-y-4">
                {mood.map((entry) => (
                  <div key={entry.id} className="group flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium capitalize text-foreground">{entry.mood}</p>{entry.score != null && <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">{entry.score}/10</span>}{entry.energy != null && <span className="text-[11px] text-muted-foreground">Energy {entry.energy}/10</span>}<Meta source={entry.source} loggedAt={entry.logged_at} /></div>
                      {entry.raw_text && entry.raw_text !== entry.mood && <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground">{entry.raw_text}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => void remove("mood_logs", entry.id)} aria-label="Delete mood"><Trash2 /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {journal.length > 0 && (
            <div className="grid gap-3 px-4 py-5 sm:grid-cols-[112px_minmax(0,1fr)] sm:px-5">
              <div className="flex items-center gap-2 self-start text-xs font-semibold text-muted-foreground"><NotebookPen className="h-4 w-4 text-primary" /> Journal</div>
              <div className="min-w-0 space-y-4">
                {journal.map((entry) => (
                  <div key={entry.id} className="group flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">{entry.title ? <p className="text-sm font-medium text-foreground">{entry.title}</p> : <span />}<Meta source={entry.source} loggedAt={entry.logged_at} /></div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{entry.body}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => void remove("journal_entries", entry.id)} aria-label="Delete note"><Trash2 /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default DayLogPanel;