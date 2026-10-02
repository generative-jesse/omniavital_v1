import { useState } from "react";
import { Check, Copy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ProfileTab from "./ProfileTab";
import PurchasesTab from "./PurchasesTab";

const MCP_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/mcp`;

const MeTab = () => {
  const { signOut } = useAuth();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-2">
      <section className="min-w-0 rounded-xl border border-border bg-card p-5"><ProfileTab /></section>

      <section className="min-w-0 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Connect your AI assistant</h2>
        <p className="mt-1 text-sm text-muted-foreground">Let Claude, ChatGPT or any MCP-capable assistant log supplements, meals and mood for you, see what you have left, and remind you to reorder.</p>
        <div className="mt-4 flex min-w-0 items-center gap-2 rounded-md border border-border bg-secondary/40 p-2">
          <code className="min-w-0 flex-1 truncate text-xs text-foreground">{MCP_URL}</code>
          <Button size="sm" variant="outline" onClick={() => void copy()}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy"}</Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild><a href="https://claude.ai/settings/connectors" target="_blank" rel="noreferrer">Connect Claude</a></Button>
          <Button asChild variant="outline"><a href="https://chatgpt.com/#settings/Connectors" target="_blank" rel="noreferrer">Connect ChatGPT</a></Button>
        </div>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Copy the address above.</li>
          <li>In your assistant, add a custom connector and paste it.</li>
          <li>Sign in with your OmniaVital account and approve access.</li>
        </ol>
      </section>

      <section className="min-w-0 rounded-xl border border-border bg-card p-5 lg:col-span-2"><PurchasesTab /></section>

      <Button variant="outline" onClick={signOut} className="w-full sm:w-auto lg:col-span-2 lg:justify-self-start"><LogOut /> Sign out</Button>
    </div>
  );
};

export default MeTab;
