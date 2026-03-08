import { BarChart3, LineChart, PieChart, ScatterChart, AreaChart, BarChart, Circle, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChartType = "bar" | "line" | "pie" | "scatter" | "area" | "histogram" | "bubble" | "heatmap";

const chartTypes: { type: ChartType; label: string; icon: React.ElementType }[] = [
  { type: "bar", label: "Bar", icon: BarChart3 },
  { type: "line", label: "Line", icon: LineChart },
  { type: "pie", label: "Pie", icon: PieChart },
  { type: "scatter", label: "Scatter", icon: ScatterChart },
  { type: "area", label: "Area", icon: AreaChart },
  { type: "histogram", label: "Histogram", icon: BarChart },
  { type: "bubble", label: "Bubble", icon: Circle },
  { type: "heatmap", label: "Heatmap", icon: Grid3X3 },
];

interface Props {
  value: ChartType;
  onChange: (t: ChartType) => void;
}

const ChartTypeSelector = ({ value, onChange }: Props) => (
  <div className="space-y-2">
    <h3 className="font-display text-sm font-semibold text-foreground">Chart Type</h3>
    <div className="grid grid-cols-4 gap-2">
      {chartTypes.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition-all",
            value === type
              ? "border-primary bg-primary/10 text-primary shadow-sm"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default ChartTypeSelector;
