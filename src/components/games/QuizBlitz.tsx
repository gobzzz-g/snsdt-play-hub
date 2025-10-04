import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Clock, CheckCircle, XCircle } from "lucide-react";

interface QuizBlitzProps {
  userId: string;
  onClose: () => void;
}

const QuizBlitz = ({ userId, onClose }: QuizBlitzProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const { toast } = useToast();

  // Sample questions (in production, fetch from database)
  const questions = [
    {
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
      correct: 0,
    },
    {
      question: "Which programming language is known as the 'language of the web'?",
      options: ["Python", "Java", "JavaScript", "C++"],
      correct: 2,
    },
    {
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correct: 1,
    },
  ];

  useEffect(() => {
    if (timeLeft > 0 && !answered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered) {
      handleTimeout();
    }
  }, [timeLeft, answered]);

  const handleTimeout = () => {
    setAnswered(true);
    toast({ title: "Time's up!", variant: "destructive" });
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    
    setSelectedAnswer(index);
    setAnswered(true);
    
    const isCorrect = index === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 10);
      toast({ title: "Correct! +10 points", className: "bg-success text-success-foreground" });
    } else {
      toast({ title: "Incorrect!", variant: "destructive" });
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      // Game complete, save score
      await saveScore();
      toast({ title: "Quiz Complete!", description: `Your score: ${score}` });
      onClose();
    }
  };

  const saveScore = async () => {
    const { error } = await supabase
      .from("leaderboard")
      .upsert({
        user_id: userId,
        game_id: null, // We'll create a proper game record later
        score: score,
        time_taken: (questions.length * 30) - timeLeft,
      });

    if (error) console.error("Error saving score:", error);
  };

  const question = questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8 bg-gradient-card border-neon-cyan shadow-glow-cyan">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-10 h-10 text-neon-cyan animate-glow-pulse" />
            <h2 className="text-3xl font-bold text-foreground">Quiz Blitz</h2>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary">{score}</div>
            <p className="text-xs text-muted-foreground">SCORE</p>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Time Remaining</span>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${timeLeft < 10 ? "text-destructive animate-pulse" : "text-primary"}`} />
              <span className={`text-2xl font-bold ${timeLeft < 10 ? "text-destructive" : "text-primary"}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${timeLeft < 10 ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <h3 className="text-2xl font-bold text-foreground">{question.question}</h3>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-8">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correct;
            const isSelected = index === selectedAnswer;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:scale-102 ${
                  answered
                    ? isCorrect
                      ? "border-success bg-success/20 text-foreground"
                      : isSelected
                      ? "border-destructive bg-destructive/20 text-foreground"
                      : "border-border bg-muted/20 text-muted-foreground"
                    : "border-border bg-card hover:border-primary text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {answered && (
                    <>
                      {isCorrect && <CheckCircle className="w-5 h-5 text-success" />}
                      {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {answered && (
          <Button
            onClick={handleNext}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
          >
            {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default QuizBlitz;
