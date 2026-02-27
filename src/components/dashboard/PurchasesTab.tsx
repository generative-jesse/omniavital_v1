import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Package } from "lucide-react";

interface Purchase {
  id: string;
  quantity: number;
  total: number;
  status: string;
  purchased_at: string;
  products: { name: string; slug: string; category: string } | null;
}

const PurchasesTab = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("purchases")
      .select("*, products(name, slug, category)")
      .eq("user_id", user.id)
      .order("purchased_at", { ascending: false })
      .then(({ data }) => {
        setPurchases((data as any) || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="text-muted-foreground text-sm">Loading purchases...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold tracking-wide text-foreground mb-1">Purchase History</h2>
      <p className="text-sm text-muted-foreground mb-8">Your OmniaVital orders</p>

      {purchases.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <ShoppingBag size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">No purchases yet</p>
          <p className="text-sm text-muted-foreground">
            Your order history will appear here once you make your first purchase.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Package size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{p.products?.name || "Product"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.purchased_at).toLocaleDateString()} · Qty {p.quantity}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">${Number(p.total).toFixed(2)}</p>
                <span className="text-[10px] tracking-widest uppercase text-primary font-medium">{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchasesTab;
