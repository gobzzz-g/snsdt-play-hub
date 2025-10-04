import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Trash2, Shield, BarChart3 } from "lucide-react";

const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles (role)
      `);

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(profiles || []);
    }
    setLoading(false);
  };

  const handleResetScores = async () => {
    const { error } = await supabase.from("leaderboard").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    if (error) {
      toast({ title: "Error", description: "Failed to reset scores", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "All scores have been reset", className: "bg-success text-success-foreground" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8 animate-slide-in-up">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4 animate-float" />
        <h2 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
          Admin Control Panel
        </h2>
        <p className="text-muted-foreground">Manage users and system settings</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-card border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Users</p>
              <p className="text-3xl font-bold text-primary">{users.length}</p>
            </div>
            <Users className="w-12 h-12 text-primary/50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-secondary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mentors</p>
              <p className="text-3xl font-bold text-secondary">
                {users.filter((u) => u.user_roles?.[0]?.role === "mentor").length}
              </p>
            </div>
            <Shield className="w-12 h-12 text-secondary/50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Admins</p>
              <p className="text-3xl font-bold text-accent">
                {users.filter((u) => u.user_roles?.[0]?.role === "admin").length}
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-accent/50" />
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="p-6 bg-card border-border mb-8">
        <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <Button
            onClick={handleResetScores}
            variant="destructive"
            className="shadow-glow-magenta"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Reset All Scores
          </Button>
        </div>
      </Card>

      {/* User List */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold text-foreground mb-6">User Management</h3>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-4 bg-muted/10 rounded-lg border border-border flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <div>
                <p className="font-semibold text-foreground">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.user_roles?.[0]?.role === "admin"
                    ? "bg-accent/20 text-accent"
                    : user.user_roles?.[0]?.role === "floor_mentor"
                    ? "bg-secondary/20 text-secondary"
                    : "bg-primary/20 text-primary"
                }`}>
                  {user.user_roles?.[0]?.role?.replace("_", " ").toUpperCase() || "USER"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminPanel;
