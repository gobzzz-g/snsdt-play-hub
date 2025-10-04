import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Timer, Zap } from "lucide-react";

interface ReactionDashProps {
  userId: string;
  onClose: () => void;
}

const ReactionDash = ({ userId, onClose }: ReactionDashProps) => {
  const [gameState, setGameState] = useState<"idle" | "waiting" | "ready" | "clicked" | "finished">("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [scores, setScores] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (gameState === "waiting") {
      const delay = Math.random() * 3000 + 2000; // 2-5 seconds
      const timer = setTimeout(() => {
        setGameState("ready");
        setStartTime(Date.now());
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const handleStart = () => {
    setGameState("waiting");
    setReactionTime(null);
  };

  const handleClick = () => {
    if (gameState === "waiting") {
      toast({ title: "Too early!", description: "Wait for the color change!", variant: "destructive" });
      setGameState("idle");
    } else if (gameState === "ready") {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setScores([...scores, time]);
      setGameState("clicked");
      
      if (scores.length >= 4) {
        setGameState("finished");
        saveScore([...scores, time]);
      } else {
        toast({ title: `${time}ms!`, description: "Great reaction!", className: "bg-success text-success-foreground" });
      }
    }
  };

  const saveScore = async (allScores: number[]) => {
    const avgTime = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    const score = Math.max(0, 1000 - avgTime); // Higher score for faster reactions
    
    await supabase
      .from("leaderboard")
      .upsert({
        user_id: userId,
        game_id: null,
        score: score,
        time_taken: avgTime,
      });
  };

  const handleReset = () => {
    setScores([]);
    setGameState("idle");
    setReactionTime(null);
  };

  const avgReactionTime = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8 bg-gradient-card border-neon-purple shadow-glow-purple">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Timer className="w-10 h-10 text-neon-purple animate-glow-pulse" />
            <h2 className="text-3xl font-bold text-foreground">Reaction Dash</h2>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Round</div>
            <div className="text-3xl font-bold text-primary">{scores.length}/5</div>
          </div>
        </div>

        {gameState === "idle" && (
          <div className="text-center space-y-6">
            <p className="text-lg text-muted-foreground">
              Click the box as soon as it turns green!
            </p>
            {avgReactionTime && (
              <div className="p-6 bg-muted/20 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Average Reaction Time</p>
                <p className="text-4xl font-bold text-primary">{avgReactionTime}ms</p>
              </div>
            )}
            <Button
              onClick={handleStart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan px-12 py-6 text-xl"
            >
              Start Round
            </Button>
          </div>
        )}

        {gameState === "waiting" && (
          <div
            onClick={handleClick}
            className="h-96 bg-destructive/30 border-4 border-destructive rounded-lg flex items-center justify-center cursor-pointer hover:bg-destructive/40 transition-colors"
          >
            <p className="text-2xl font-bold text-foreground">Wait for green...</p>
          </div>
        )}

        {gameState === "ready" && (
          <div
            onClick={handleClick}
            className="h-96 bg-success/30 border-4 border-success rounded-lg flex items-center justify-center cursor-pointer hover:bg-success/40 transition-colors animate-glow-pulse"
          >
            <Zap className="w-24 h-24 text-success" />
          </div>
        )}

        {gameState === "clicked" && (
          <div className="text-center space-y-6">
            <div className="p-12 bg-gradient-card rounded-lg border-2 border-primary shadow-glow-cyan">
              <p className="text-lg text-muted-foreground mb-3">Your Reaction Time</p>
              <p className="text-6xl font-bold text-primary mb-6">{reactionTime}ms</p>
              <Button
                onClick={handleStart}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
              >
                Next Round
              </Button>
            </div>
            
            {scores.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {scores.map((score, i) => (
                  <div key={i} className="p-3 bg-muted/20 rounded border border-border text-center">
                    <p className="text-xs text-muted-foreground">R{i + 1}</p>
                    <p className="text-sm font-bold text-foreground">{score}ms</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center space-y-6">
            <div className="p-12 bg-gradient-card rounded-lg border-2 border-success shadow-glow-green">
              <p className="text-2xl font-bold text-foreground mb-6">Game Complete!</p>
              <p className="text-lg text-muted-foreground mb-3">Average Reaction Time</p>
              <p className="text-6xl font-bold text-success mb-8">{avgReactionTime}ms</p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleReset}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
                >
                  Play Again
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-border"
                >
                  Back to Games
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReactionDash;
