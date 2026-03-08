import { useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChartSuggestion } from "@/lib/chartSuggestions";

interface Props {
  suggestions: ChartSuggestion[];
  onApply: (s: ChartSuggestion) => void;
  onGenerate: () => void;
  loading?: boolean;
}

const CHART_EMOJI: Record<string, string> = {
  bar: "📊", line: "📈", pie: "🥧", scatter: "🔵",
  area: "🏔️", histogram: "📉", bubble: "🫧", heatmap: "🟥",
};

const AISuggestPanel = ({ suggestions, onApply, onGenerate, loading }: Props) => {
  const [applied, setApplied] = useState<number | null>(null);

  const handleApply = (s: ChartSuggestion, idx: number) => {
    setApplied(idx);
    onApply(s);
    setTimeout(() => setApplied(null), 1200);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Suggestions
        </h3>
      </div>

      <Button
        onClick={onGenerate}
        disabled={loading}
        size="sm"
        className="w-full gap-2 text-xs"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {loading ? "Analyzing…" : "AI Suggest Charts"}
      </Button>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleApply(s, i)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-all",
                applied === i
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
              )}
            >
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">{CHART_EMOJI[s.chartType] ?? "📊"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-foreground capitalize">{s.chartType} Chart</span>
                    {applied === i && (
                      <span className="flex items-center gap-0.5 text-[10px] font-medium text-primary">
                        <Zap className="h-3 w-3" /> Applied
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{s.reason}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISuggestPanel;
