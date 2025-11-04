import { Sparkles } from "lucide-react";

interface ScoreBarProps {
  score: number;
  size?: "sm" | "lg";
}

export function ScoreBar({ score, size = "lg" }: ScoreBarProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  const barColor = getScoreColor(score);
  
  if (size === "sm") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${barColor} transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-foreground">{score}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Match Score</span>
        </div>
        <span className="text-2xl font-bold text-primary">{score}%</span>
      </div>
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
