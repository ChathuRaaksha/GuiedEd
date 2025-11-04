import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, TrendingUp, CheckCircle } from "lucide-react";
import edIcon from "@/assets/ed-icon.png";

export const EdAIBanner = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-purple-500/10 border-primary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10 flex items-start gap-6">
        <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center flex-shrink-0 border border-primary/20">
          <img src={edIcon} alt="Ed AI" className="w-12 h-12" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold">Meet Ed, Your AI Matching Assistant</h3>
            <Badge className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </Badge>
          </div>

          <p className="text-muted-foreground text-lg">
            Ed uses advanced AI algorithms to analyze over <strong>20+ factors</strong> including interests, 
            skills, languages, education level, meeting preferences, and availability to find your perfect mentor-mentee matches.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10">
              <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Intelligent Analysis</p>
                <p className="text-xs text-muted-foreground">
                  Multi-factor compatibility scoring
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10">
              <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">High Accuracy</p>
                <p className="text-xs text-muted-foreground">
                  Up to 95% match success rate
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Real-Time Updates</p>
                <p className="text-xs text-muted-foreground">
                  Matches refresh automatically
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>
              Ed evaluates compatibility based on interests, skills, languages, education level, 
              meeting preferences, and availability to ensure meaningful connections.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};