import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Brain, Image, Timer, Lock } from "lucide-react";
import { useState } from "react";
import QuizBlitz from "./games/QuizBlitz";
import ReactionDash from "./games/ReactionDash";
import EmojiStory from "./games/EmojiStory";

interface GameZoneProps {
  role: string | null;
  userId: string;
}

const GameZone = ({ role, userId }: GameZoneProps) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    {
      id: "quiz_blitz",
      name: "Quiz Blitz",
      description: "Fast-paced quiz with live leaderboard",
      icon: Brain,
      color: "cyan",
      component: QuizBlitz,
    },
    {
      id: "reaction_dash",
      name: "Reaction Dash",
      description: "Test your reaction time",
      icon: Timer,
      color: "purple",
      component: ReactionDash,
    },
    {
      id: "emoji_story",
      name: "Emoji Story",
      description: "Create stories from random emojis",
      icon: Image,
      color: "magenta",
      component: EmojiStory,
    },
  ];

  const canCreateGames = role === "admin" || role === "floor_mentor" || role === "mentor";

  if (activeGame) {
    const game = games.find((g) => g.id === activeGame);
    if (game) {
      const GameComponent = game.component;
      return (
        <div>
          <Button
            onClick={() => setActiveGame(null)}
            variant="outline"
            className="mb-6 border-primary/50"
          >
            ← Back to Games
          </Button>
          <GameComponent userId={userId} onClose={() => setActiveGame(null)} />
        </div>
      );
    }
  }

  return (
    <div>
      <div className="text-center mb-8 animate-slide-in-up">
        <Zap className="w-16 h-16 text-primary mx-auto mb-4 animate-float" />
        <h2 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
          Game Zone
        </h2>
        <p className="text-muted-foreground">Choose your challenge and compete!</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => {
          const Icon = game.icon;
          return (
            <Card
              key={game.id}
              className={`p-6 border-2 border-${game.color} hover:shadow-glow-${game.color} transition-all hover:scale-105 bg-gradient-card cursor-pointer animate-slide-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setActiveGame(game.id)}
            >
              <div className="text-center">
                <Icon className={`w-16 h-16 text-neon-${game.color} mx-auto mb-4 animate-glow-pulse`} />
                <h3 className="text-2xl font-bold text-foreground mb-2">{game.name}</h3>
                <p className="text-muted-foreground mb-6">{game.description}</p>
                <Button
                  className={`w-full bg-neon-${game.color} hover:bg-neon-${game.color}/90 text-background shadow-glow-${game.color}`}
                >
                  Play Now
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {!canCreateGames && (
        <div className="mt-8 p-6 bg-muted/20 border border-border rounded-lg text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Only mentors and admins can create new games
          </p>
        </div>
      )}
    </div>
  );
};

export default GameZone;
