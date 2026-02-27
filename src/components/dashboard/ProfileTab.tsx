import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, AtSign } from "lucide-react";

const ProfileTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [ovTag, setOvTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFirstName(data.first_name || "");
          setOvTag(data.ov_tag || "");
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, ov_tag: ovTag || null })
      .eq("user_id", user.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Profile updated" });
    }
    setSaving(false);
  };

  if (loading) return <div className="text-muted-foreground text-sm">Loading profile...</div>;

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold tracking-wide text-foreground mb-1">Your Profile</h2>
      <p className="text-sm text-muted-foreground mb-8">Manage your OmniaVital identity</p>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1.5 block">
            Email
          </label>
          <Input value={user?.email || ""} disabled className="bg-secondary/50 border-border opacity-60" />
        </div>

        <div>
          <label className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1.5 block">
            First Name
          </label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Your first name"
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <label className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1.5 block">
            <span className="flex items-center gap-1.5"><AtSign size={12} /> OV Tag</span>
          </label>
          <Input
            value={ovTag}
            onChange={(e) => setOvTag(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="your_handle"
            className="bg-secondary border-border"
            maxLength={20}
          />
          <p className="text-[11px] text-muted-foreground mt-1">Your public community handle</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-semibold tracking-widest uppercase rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
