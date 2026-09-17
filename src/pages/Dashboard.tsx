import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BotMessageSquare,
  CalendarDays,
  Flame,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logoMark from "@/assets/logo-mark.png";

import OverviewTab from "@/components/dashboard/OverviewTab";
import ProfileTab from "@/components/dashboard/ProfileTab";
import PurchasesTab from "@/components/dashboard/PurchasesTab";
import CalendarTab from "@/components/dashboard/CalendarTab";
import CommunityTab from "@/components/dashboard/CommunityTab";
import CoachTab from "@/components/dashboard/CoachTab";

const tabs = [
  { id: "overview", label: "Today", icon: LayoutDashboard },
  { id: "calendar", label: "Logbook", icon: CalendarDays },
  { id: "purchases", label: "Supply", icon: Package },
  { id: "coach", label: "Coach", icon: BotMessageSquare },
  { id: "community", label: "Collective", icon: MessageSquare },
  { id: "profile", label: "Settings", icon: Settings },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("calendar");
  const { user, signOut } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setFirstName(data?.first_name || null));

    void supabase
      .from("ritual_logs")
      .select("logged_date, completed")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("logged_date", { ascending: false })
      .limit(1000)
      .then(({ data }) => {
        const dates = new Set((data ?? []).map((entry) => entry.logged_date));
        const toLocalKey = (value: Date) =>
          `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
        const cursor = new Date();
        if (!dates.has(toLocalKey(cursor))) cursor.setDate(cursor.getDate() - 1);
        let count = 0;
        while (dates.has(toLocalKey(cursor))) {
          count += 1;
          cursor.setDate(cursor.getDate() - 1);
        }
        setStreak(count);
      });
  }, [user]);

  const renderTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab streak={streak} onNavigate={setActiveTab} />;
      case "profile": return <ProfileTab />;
      case "purchases": return <PurchasesTab />;
      case "calendar": return <CalendarTab />;
      case "community": return <CommunityTab />;
      case "coach": return <CoachTab />;
    }
  };

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col border-r border-border bg-sidebar md:flex">
        <Link to="/" className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6" aria-label="OmniaVital home">
          <img src={logoMark} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-sidebar-foreground">OmniaVital</span>
        </Link>

        <div className="px-4 pb-3 pt-6">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Member space</p>
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Dashboard">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                aria-current={active ? "page" : undefined}
                className={`h-11 w-full justify-start px-3 text-sm ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon className={active ? "text-sidebar-primary" : ""} />
                {tab.label}
                {tab.id === "calendar" && streak > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-sidebar-primary"><Flame className="h-3.5 w-3.5" />{streak}</span>
                )}
              </Button>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Button asChild variant="ghost" className="mb-1 h-10 w-full justify-start px-3 text-muted-foreground">
            <Link to="/#ritual"><ShoppingBag /> Shop products</Link>
          </Button>
          <Button variant="ghost" onClick={signOut} className="h-10 w-full justify-start px-3 text-muted-foreground">
            <LogOut /> Sign out
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl md:hidden">
        <Link to="/" className="flex items-center gap-2.5" aria-label="OmniaVital home">
          <img src={logoMark} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">OmniaVital</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut /></Button>
      </header>

      <main className="min-w-0 md:col-start-2">
        <div className="mx-auto w-full max-w-[1240px] px-4 pb-28 pt-7 sm:px-6 md:px-8 md:pb-12 md:pt-9">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {greeting}{firstName ? `, ${firstName}` : ""}
              </p>
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
                {activeTab === "calendar" ? "Your daily record" : tabs.find((tab) => tab.id === activeTab)?.label}
              </h1>
            </div>
            {activeTab !== "calendar" && streak > 0 && (
              <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                <Flame className="h-4 w-4 text-primary" />
                <strong className="font-semibold text-foreground">{streak}</strong> day streak
              </div>
            )}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Dashboard">
        {tabs.filter((tab) => tab.id !== "community").map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              aria-current={active ? "page" : undefined}
              className={`h-16 flex-col gap-1 rounded-none px-1 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default Dashboard;