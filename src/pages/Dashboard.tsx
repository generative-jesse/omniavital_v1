import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, ShoppingBag, CalendarDays, MessageSquare, BotMessageSquare, LogOut, Flame } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logoMark from "@/assets/logo-mark.png";

import ProfileTab from "@/components/dashboard/ProfileTab";
import PurchasesTab from "@/components/dashboard/PurchasesTab";
import CalendarTab from "@/components/dashboard/CalendarTab";
import CommunityTab from "@/components/dashboard/CommunityTab";
import CoachTab from "@/components/dashboard/CoachTab";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "purchases", label: "Purchases", icon: ShoppingBag },
  { id: "calendar", label: "Ritual Calendar", icon: CalendarDays },
  { id: "community", label: "Community", icon: MessageSquare },
  { id: "coach", label: "AI Coach", icon: BotMessageSquare },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const { user, signOut } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    // Fetch profile name
    supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setFirstName(data?.first_name || null));

    // Calculate streak
    supabase
      .from("ritual_logs")
      .select("logged_date, completed")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("logged_date", { ascending: false })
      .limit(90)
      .then(({ data }) => {
        if (!data) return;
        const uniqueDates = [...new Set(data.map(l => l.logged_date))].sort().reverse();
        let s = 0;
        for (let i = 0; i < uniqueDates.length; i++) {
          const expected = new Date();
          expected.setDate(expected.getDate() - i);
          if (uniqueDates[i] === expected.toISOString().slice(0, 10)) s++;
          else break;
        }
        setStreak(s);
      });
  }, [user]);

  const renderTab = () => {
    switch (activeTab) {
      case "profile": return <ProfileTab />;
      case "purchases": return <PurchasesTab />;
      case "calendar": return <CalendarTab />;
      case "community": return <CommunityTab />;
      case "coach": return <CoachTab />;
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoMark} alt="OmniaVital" className="w-8 h-8 rounded-lg" />
            <span className="text-sm font-bold tracking-[0.15em] uppercase text-foreground">OmniaVital</span>
          </Link>

          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Flame size={14} className="text-orange-400" />
                <span className="font-semibold text-foreground">{streak}</span>
                <span>day streak</span>
              </div>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors tracking-widest uppercase"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-8">
        {/* Welcome banner */}
        <div className="container mx-auto px-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-foreground"
          >
            <h1 className="text-2xl font-bold tracking-wide">
              {greeting()}{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {streak > 0
                ? `You're on a ${streak}-day streak. Keep building.`
                : "Start your ritual today to build momentum."
              }
            </p>
          </motion.div>
        </div>

        {/* Tab nav */}
        <div className="container mx-auto px-4 mb-8">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="container mx-auto px-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {renderTab()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
