import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Smile, Sparkles, RefreshCw } from "lucide-react";

interface EmojiStoryProps {
  userId: string;
  onClose: () => void;
}

const EmojiStory = ({ userId, onClose }: EmojiStoryProps) => {
  const [emojis, setEmojis] = useState<string[]>([]);
  const [story, setStory] = useState("");
  const { toast } = useToast();

  const emojiPool = [
    "🚀", "🌟", "🎮", "🏆", "💻", "🔥", "⚡", "🌈", "🎯", "💡",
    "🎨", "🎭", "🎪", "🎢", "🎡", "🎬", "🎸", "🎹", "🎺", "🎻",
    "🏰", "🌍", "🌙", "⭐", "☄️", "🌊", "🏔️", "🌲", "🌺", "🦋",
    "🐉", "🦄", "🦅", "🐬", "🦈", "🐙", "🦖", "🦕", "👑", "💎",
  ];

  const generateEmojis = () => {
    const selected = [];
    const poolCopy = [...emojiPool];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * poolCopy.length);
      selected.push(poolCopy[randomIndex]);
      poolCopy.splice(randomIndex, 1);
    }
    setEmojis(selected);
    setStory("");
  };

  const handleSubmit = () => {
    if (story.trim().length < 20) {
      toast({ title: "Story too short!", description: "Write at least 20 characters", variant: "destructive" });
      return;
    }
    
    toast({
      title: "Story submitted!",
      description: "Your creative story has been recorded!",
      className: "bg-success text-success-foreground",
    });
    
    // In production, save the story to database
    generateEmojis();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 bg-gradient-card border-neon-magenta shadow-glow-magenta">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Smile className="w-10 h-10 text-neon-magenta animate-glow-pulse" />
            <h2 className="text-3xl font-bold text-foreground">Emoji Story</h2>
          </div>
          <Button
            onClick={generateEmojis}
            variant="outline"
            className="border-primary/50 hover:border-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Emojis
          </Button>
        </div>

        {emojis.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-20 h-20 text-primary mx-auto mb-6 animate-float" />
            <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Create?</h3>
            <p className="text-muted-foreground mb-8">
              Get random emojis and craft a creative story using them!
            </p>
            <Button
              onClick={generateEmojis}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan px-12 py-6 text-xl"
            >
              Generate Emojis
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Emoji Display */}
            <div className="p-8 bg-muted/20 rounded-lg border-2 border-primary/30">
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Create a story using these emojis:
              </p>
              <div className="flex justify-center gap-6">
                {emojis.map((emoji, index) => (
                  <div
                    key={index}
                    className="text-6xl animate-slide-in-up hover:scale-110 transition-transform"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Story Input */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-foreground block">
                Your Story
              </label>
              <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Write your creative story here using the emojis above..."
                className="min-h-[200px] bg-input border-border focus:border-primary text-foreground resize-none"
              />
              <p className="text-sm text-muted-foreground">
                {story.length} characters (minimum 20)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                disabled={story.trim().length < 20}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
              >
                Submit Story
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-border"
              >
                Back to Games
              </Button>
            </div>

            {/* Example Stories (for inspiration) */}
            <div className="p-6 bg-muted/10 rounded-lg border border-border">
              <p className="text-sm font-semibold text-foreground mb-3">💡 Tip:</p>
              <p className="text-sm text-muted-foreground">
                Try to incorporate all emojis into your story naturally. Be creative and have fun!
                Your story can be funny, dramatic, or adventurous - let your imagination run wild!
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmojiStory;
