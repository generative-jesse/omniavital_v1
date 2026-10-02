import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Flame, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { productImages } from "@/components/RitualGrid";
import { calculateInventory, SERVINGS_PER_BOTTLE } from "@/lib/inventory";

interface Props {
  streak: number;
  onNavigate: (tab: "calendar" | "coach" | "me") => void;
  onLogged?: () => void;
}

interface Product { id: string; slug: string; name: string; tagline: string; category: string }

const accent: Record<string, string> = {
  morning: "from-amber-500/25",
  focus: "from-teal-500/25",
  evening: "from-violet-500/25",
};
const slotLabel: Record<string, string> = { morning: "Morning", focus: "Midday", evening: "Evening" };

const todayKey = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

const OverviewTab = ({ streak, onNavigate, onLogged }: Props) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [inventory, setInventory] = useState<ReturnType<typeof calculateInventory>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [p, logs, buys] = await Promise.all([
      supabase.from("products").select("id, slug, name, tagline, category").order("sort_order"),
      supabase.from("ritual_logs").select("product_id, completed, logged_date").eq("user_id", user.id),
      supabase.from("purchases").select("product_id, quantity").eq("user_id", user.id),
    ]);
    setProducts((p.data as Product[]) ?? []);
    const all = logs.data ?? [];
    setTaken(new Set(all.filter((l) => l.completed && l.logged_date === todayKey()).map((l) => l.product_id as string)));
    setInventory(calculateInventory(buys.data ?? [], all));
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const toggle = async (product: Product) => {
    if (!user) return;
    setBusy(product.id);
    setError(null);
    const isTaken = taken.has(product.id);
    const { error: e } = await supabase.from("ritual_logs").upsert(
      { user_id: user.id, product_id: product.id, logged_date: todayKey(), completed: !isTaken },
      { onConflict: "user_id,product_id,logged_date" },
    );
    setBusy(null);
    if (e) { setError("That didn't save. Please try again."); return; }
    await load();
    onLogged?.();
  };

  const owned = products.filter((p) => (inventory[p.id]?.purchased ?? 0) > 0);
  const notOwned = products.filter((p) => !owned.includes(p));
  const doneCount = owned.filter((p) => taken.has(p.id)).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span><strong className="text-foreground">{doneCount}/{owned.length || 0}</strong> taken today</span>
        <span className="flex items-center gap-1.5"><Flame className="h-4 w-4 text-primary" /><strong className="text-foreground">{streak}</strong> day streak</span>
        <button onClick={() => onNavigate("calendar")} className="text-primary underline-offset-4 hover:underline">View today in Logbook</button>
      </div>

      {error && <p role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      {owned.length === 0 && products.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-foreground">Your ritual is empty.</p>
          <p className="mt-1 text-sm text-muted-foreground">Add a bottle and it will appear here, ready to track — {SERVINGS_PER_BOTTLE} servings each.</p>
          <Button asChild className="mt-4"><Link to="/#ritual"><ShoppingBag /> Browse the ritual</Link></Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {owned.map((p) => {
          const inv = inventory[p.id];
          const done = taken.has(p.id);
          const out = (inv?.remaining ?? 0) <= 0 && !done;
          const pct = inv ? Math.round((inv.remaining / Math.max(inv.purchased, 1)) * 100) : 0;
          return (
            <article key={p.id} className={`relative min-w-0 overflow-hidden rounded-xl border bg-card ${done ? "border-primary/40" : "border-border"}`}>
              <div className={`flex items-center gap-4 bg-gradient-to-br ${accent[p.category] ?? "from-primary/20"} to-transparent p-4`}>
                <img src={productImages[p.slug]} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{slotLabel[p.category] ?? p.category}</p>
                  <h3 className="truncate text-base font-semibold text-foreground">{p.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">{p.tagline}</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className={(inv?.remaining ?? 0) <= 5 ? "font-semibold text-destructive" : "font-semibold text-foreground"}>{inv?.remaining ?? 0} of {inv?.purchased ?? 0}</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
                </div>
                {out ? (
                  <Button asChild variant="outline" className="h-12 w-full"><Link to={`/product/${p.slug}`}>Out — reorder</Link></Button>
                ) : (
                  <Button onClick={() => void toggle(p)} disabled={busy === p.id} variant={done ? "secondary" : "default"} className="h-12 w-full text-sm active:scale-[0.96]">
                    {done ? <><Check /> Taken · tap to undo</> : busy === p.id ? "Saving…" : "Take"}
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {notOwned.length > 0 && owned.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Complete your ritual</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {notOwned.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/40">
                <img src={productImages[p.slug]} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                <div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{p.name}</p><p className="truncate text-xs text-muted-foreground">{p.tagline}</p></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default OverviewTab;
