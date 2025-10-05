import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Trophy, Gamepad2, Users, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-slide-in-up">
          <Zap className="w-24 h-24 text-primary mx-auto mb-6 animate-glow-pulse" />
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
            SnsDt PlayHub
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The ultimate hackathon platform for interactive mentoring and competitive gaming
          </p>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan px-12 py-6 text-xl"
          >
            Get Started
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20">
          <div className="p-8 bg-gradient-card border-2 border-primary/30 rounded-xl hover:border-primary transition-all hover:scale-105 animate-slide-in-up">
            <Gamepad2 className="w-16 h-16 text-neon-cyan mb-4 animate-glow-pulse" />
            <h3 className="text-2xl font-bold text-foreground mb-3">Interactive Games</h3>
            <p className="text-muted-foreground">Quiz Blitz, Reaction Dash, Emoji Story, and more!</p>
          </div>

          <div className="p-8 bg-gradient-card border-2 border-secondary/30 rounded-xl hover:border-secondary transition-all hover:scale-105 animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
            <Trophy className="w-16 h-16 text-neon-purple mb-4 animate-glow-pulse" />
            <h3 className="text-2xl font-bold text-foreground mb-3">Live Leaderboard</h3>
            <p className="text-muted-foreground">Real-time rankings and competitive scoring</p>
          </div>

          <div className="p-8 bg-gradient-card border-2 border-accent/30 rounded-xl hover:border-accent transition-all hover:scale-105 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
            <Users className="w-16 h-16 text-neon-magenta mb-4 animate-glow-pulse" />
            <h3 className="text-2xl font-bold text-foreground mb-3">Role-Based Access</h3>
            <p className="text-muted-foreground">Admin, Floor Mentor, and Mentor dashboards</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
