import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, ShoppingBag, CalendarDays, MessageSquare, BotMessageSquare, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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
  const { signOut } = useAuth();

  const renderTab = () => {
    switch (activeTab) {
      case "profile": return <ProfileTab />;
      case "purchases": return <PurchasesTab />;
      case "calendar": return <CalendarTab />;
      case "community": return <CommunityTab />;
      case "coach": return <CoachTab />;
    }
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
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors tracking-widest uppercase"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      <div className="pt-20 pb-8">
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
