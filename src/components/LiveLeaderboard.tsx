import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  score: number;
  time_taken: number;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const LiveLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("score", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
        return;
      }

      // Fetch profiles separately
      const userIds = data?.map((entry) => entry.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      // Merge data
      const mergedData = data?.map((entry) => ({
        ...entry,
        profiles: profiles?.find((p) => p.id === entry.user_id) || { full_name: "Unknown", email: "" },
      }));

      setEntries(mergedData || []);
      setLoading(false);
    };

    fetchLeaderboard();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard",
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-8 h-8 text-neon-cyan animate-glow-pulse" />;
      case 1:
        return <Medal className="w-7 h-7 text-neon-purple" />;
      case 2:
        return <Award className="w-6 h-6 text-neon-magenta" />;
      default:
        return <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8 animate-slide-in-up">
        <Trophy className="w-16 h-16 text-primary mx-auto mb-4 animate-float" />
        <h2 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
          Live Leaderboard
        </h2>
        <p className="text-muted-foreground">Top performers across all games</p>
      </div>

      {entries.length === 0 ? (
        <Card className="p-12 text-center bg-card border-border">
          <p className="text-muted-foreground text-lg">No scores yet. Be the first to play!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <Card
              key={entry.id}
              className={`p-6 border-2 transition-all hover:scale-105 animate-slide-in-up ${
                index === 0
                  ? "border-primary shadow-glow-cyan bg-gradient-card"
                  : index === 1
                  ? "border-secondary shadow-glow-purple bg-card"
                  : index === 2
                  ? "border-accent shadow-glow-magenta bg-card"
                  : "border-border bg-card"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">{getRankIcon(index)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {entry.profiles?.full_name || "Unknown Player"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{entry.profiles?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{entry.score}</div>
                  <p className="text-xs text-muted-foreground">points</p>
                  {entry.time_taken && (
                    <p className="text-xs text-muted-foreground mt-1">{entry.time_taken}s</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveLeaderboard;
