import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Utensils, HeartPulse, NotebookPen, Plus, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DietLog {
  id: string;
  meal: string;
  raw_text: string | null;
  items: unknown;
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
  tags: string[];
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

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const DayLogPanel = ({ dateStr, onChanged }: { dateStr: string; onChanged?: () => void }) => {
  const { user } = useAuth();
  const [diet, setDiet] = useState<DietLog[]>([]);
  const [mood, setMood] = useState<MoodLog[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [open, setOpen] = useState<"diet" | "mood" | "journal" | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const [d, m, j] = await Promise.all([
      supabase.from("diet_logs").select("*").eq("user_id", user.id).eq("logged_date", dateStr).order("logged_at"),
      supabase.from("mood_logs").select("*").eq("user_id", user.id).eq("logged_date", dateStr).order("logged_at"),
      supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("logged_date", dateStr).order("logged_at"),
    ]);
    setDiet((d.data as DietLog[]) || []);
    setMood((m.data as MoodLog[]) || []);
    setJournal((j.data as JournalEntry[]) || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateStr]);

  const save = async () => {
    if (!user || !draft.trim() || !open) return;
    setSaving(true);
    if (open === "diet") {
      await supabase.from("diet_logs").insert({ user_id: user.id, logged_date: dateStr, raw_text: draft.trim(), meal: "other" });
    } else if (open === "mood") {
      await supabase.from("mood_logs").insert({ user_id: user.id, logged_date: dateStr, mood: draft.trim().slice(0, 40), raw_text: draft.trim() });
    } else {
      await supabase.from("journal_entries").insert({ user_id: user.id, logged_date: dateStr, body: draft.trim() });
    }
    setDraft("");
    setOpen(null);
    setSaving(false);
    await load();
    onChanged?.();
  };

  const remove = async (table: "diet_logs" | "mood_logs" | "journal_entries", id: string) => {
    await supabase.from(table).delete().eq("id", id);
    await load();
    onChanged?.();
  };

  const totals = diet.reduce(
    (a, d) => ({
      cal: a.cal + (d.calories ?? 0),
      p: a.p + Number(d.protein_g ?? 0),
      c: a.c + Number(d.carbs_g ?? 0),
      f: a.f + Number(d.fat_g ?? 0),
    }),
    { cal: 0, p: 0, c: 0, f: 0 },
  );

  const Section = ({
    id,
    icon: Icon,
    label,
    accent,
    children,
    placeholder,
  }: {
    id: "diet" | "mood" | "journal";
    icon: typeof Utensils;
    label: string;
    accent: string;
    children: React.ReactNode;
    placeholder: string;
  }) => (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
            <Icon size={15} />
          </div>
          <h4 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-foreground truncate">{label}</h4>
        </div>
        <button
          onClick={() => { setOpen(open === id ? null : id); setDraft(""); }}
          className="shrink-0 w-7 h-7 rounded-lg bg-secondary hover:bg-secondary/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Add ${label}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {open === id && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-3 overflow-hidden">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full rounded-xl bg-secondary/60 border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <button
            onClick={save}
            disabled={saving || !draft.trim()}
            className="mt-2 w-full rounded-xl bg-primary text-primary-foreground text-xs font-semibold tracking-widest uppercase py-2.5 disabled:opacity-40 transition-opacity"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </motion.div>
      )}

      {children}
    </div>
  );

  const empty = (text: string) => (
    <p className="text-xs text-muted-foreground/70 leading-relaxed">{text}</p>
  );

  return (
    <div className="space-y-4">
      <Section
        id="diet"
        icon={Utensils}
        label="Diet"
        accent="bg-amber-400/15 text-amber-400"
        placeholder="Eggs, sourdough toast, black coffee…"
      >
        {diet.length === 0 ? (
          empty("Nothing logged. Tell your agent what you ate and it lands here with calories and macros.")
        ) : (
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground pb-2 border-b border-border">
              <span className="text-foreground font-semibold">{totals.cal || "—"} kcal</span>
              <span>P {Math.round(totals.p)}g</span>
              <span>C {Math.round(totals.c)}g</span>
              <span>F {Math.round(totals.f)}g</span>
            </div>
            {diet.map((d) => (
              <div key={d.id} className="group flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-widest uppercase text-primary font-medium">{d.meal}</span>
                    <span className="text-[10px] text-muted-foreground">{time(d.logged_at)}</span>
                    {d.source === "agent" && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-accent">
                        <Sparkles size={9} /> agent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90 leading-snug mt-0.5 break-words">{d.raw_text}</p>
                  {d.calories ? (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      ~{d.calories} kcal · P {Math.round(Number(d.protein_g ?? 0))}g · C {Math.round(Number(d.carbs_g ?? 0))}g · F {Math.round(Number(d.fat_g ?? 0))}g
                    </p>
                  ) : null}
                </div>
                <button onClick={() => remove("diet_logs", d.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0" aria-label="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        id="mood"
        icon={HeartPulse}
        label="Mood"
        accent="bg-violet-400/15 text-violet-400"
        placeholder="Sharp this morning, a bit wired after lunch…"
      >
        {mood.length === 0 ? (
          empty("No mood captured. Message your agent how you're feeling and it's timestamped here.")
        ) : (
          <div className="space-y-2.5">
            {mood.map((m) => (
              <div key={m.id} className="group flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground capitalize">{m.mood}</span>
                    {m.score != null && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-400/15 text-violet-300">{m.score}/10</span>
                    )}
                    {m.energy != null && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">energy {m.energy}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{time(m.logged_at)}</span>
                  </div>
                  {m.raw_text && <p className="text-xs text-muted-foreground leading-snug mt-1 break-words">{m.raw_text}</p>}
                </div>
                <button onClick={() => remove("mood_logs", m.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0" aria-label="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        id="journal"
        icon={NotebookPen}
        label="Journal"
        accent="bg-primary/15 text-primary"
        placeholder="What's on your mind today?"
      >
        {journal.length === 0 ? (
          empty("No entry yet for this day.")
        ) : (
          <div className="space-y-3">
            {journal.map((j) => (
              <div key={j.id} className="group flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {j.title && <span className="text-sm font-medium text-foreground">{j.title}</span>}
                    <span className="text-[10px] text-muted-foreground">{time(j.logged_at)}</span>
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed mt-0.5 whitespace-pre-wrap break-words">{j.body}</p>
                </div>
                <button onClick={() => remove("journal_entries", j.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0" aria-label="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default DayLogPanel;
