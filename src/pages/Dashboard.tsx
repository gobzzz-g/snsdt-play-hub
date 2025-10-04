import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Users, Trophy, Gamepad2, Settings } from "lucide-react";
import LiveLeaderboard from "@/components/LiveLeaderboard";
import GameZone from "@/components/GameZone";
import AdminPanel from "@/components/AdminPanel";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"games" | "leaderboard" | "admin">("games");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      setRole(roleData?.role || null);
      setLoading(false);
    };

    fetchUserAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "See you next time!" });
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary animate-glow-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              DTM Mentor Forge
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <p className="text-foreground font-semibold">{user?.email}</p>
              <p className="text-xs text-primary capitalize">{role?.replace("_", " ")}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("games")}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "games"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Gamepad2 className="w-4 h-4 inline mr-2" />
              Game Zone
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "leaderboard"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Leaderboard
            </button>
            {role === "admin" && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === "admin"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === "games" && <GameZone role={role} userId={user?.id} />}
        {activeTab === "leaderboard" && <LiveLeaderboard />}
        {activeTab === "admin" && role === "admin" && <AdminPanel />}
      </main>
    </div>
  );
};

export default Dashboard;
