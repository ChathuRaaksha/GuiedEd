import { CheckCircle } from "lucide-react";

interface ReasonChipsProps {
  reasons: string[];
}

export function ReasonChips({ reasons }: ReasonChipsProps) {
  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">Why this match?</p>
      <div className="flex flex-wrap gap-2">
        {reasons.map((reason, idx) => (
          <div 
            key={idx} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          >
            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-700 dark:text-green-300">{reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
