import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import logoMark from "@/assets/logo-mark.png";

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await (supabase.auth as any).oauth.getAuthorizationDetails(
        authorizationId
      );
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const api = (supabase.auth as any).oauth;
    const { data, error } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "this app";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass border border-border rounded-2xl p-8 text-center"
      >
        <img src={logoMark} alt="OmniaVital" className="w-14 h-14 rounded-xl mx-auto mb-5" />

        {error ? (
          <>
            <h1 className="text-lg font-bold tracking-wide text-foreground mb-2">
              Connection request failed
            </h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : !details ? (
          <p className="text-sm text-muted-foreground">Loading request…</p>
        ) : (
          <>
            <h1 className="text-xl font-bold tracking-[0.08em] uppercase text-foreground mb-2">
              Connect {clientName}
            </h1>
            <p className="text-sm text-muted-foreground mb-7">
              {clientName} will be able to read your OmniaVital profile, orders, rituals and
              community posts, and act as you — until you disconnect it.
            </p>
            <div className="flex gap-3">
              <button
                disabled={busy}
                onClick={() => decide(false)}
                className="flex-1 py-3 bg-secondary text-foreground text-xs font-semibold tracking-widest uppercase rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                Deny
              </button>
              <button
                disabled={busy}
                onClick={() => decide(true)}
                className="flex-1 py-3 bg-primary text-primary-foreground text-xs font-semibold tracking-widest uppercase rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
              >
                {busy ? "Please wait…" : "Approve"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
