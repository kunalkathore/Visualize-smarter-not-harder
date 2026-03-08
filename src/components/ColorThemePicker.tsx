import { cn } from "@/lib/utils";

export interface ColorTheme {
  name: string;
  colors: string[];
}

export const COLOR_THEMES: ColorTheme[] = [
  { name: "Indigo", colors: ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"] },
  { name: "Ocean", colors: ["#0ea5e9", "#38bdf8", "#06b6d4", "#2dd4bf", "#14b8a6"] },
  { name: "Sunset", colors: ["#f97316", "#fb923c", "#f59e0b", "#ef4444", "#ec4899"] },
  { name: "Forest", colors: ["#22c55e", "#16a34a", "#84cc16", "#65a30d", "#10b981"] },
  { name: "Berry", colors: ["#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#8b5cf6"] },
  { name: "Slate", colors: ["#475569", "#64748b", "#94a3b8", "#334155", "#1e293b"] },
];

interface Props {
  value: number;
  onChange: (idx: number) => void;
}

const ColorThemePicker = ({ value, onChange }: Props) => (
  <div className="space-y-2">
    <h3 className="font-display text-sm font-semibold text-foreground">Color Theme</h3>
    <div className="grid grid-cols-3 gap-2">
      {COLOR_THEMES.map((theme, i) => (
        <button
          key={theme.name}
          onClick={() => onChange(i)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all",
            value === i
              ? "border-primary bg-primary/10 shadow-sm"
              : "border-border bg-card hover:border-primary/40"
          )}
        >
          <div className="flex gap-0.5">
            {theme.colors.map((c, j) => (
              <div
                key={j}
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">{theme.name}</span>
        </button>
      ))}
    </div>
  </div>
);

export default ColorThemePicker;
