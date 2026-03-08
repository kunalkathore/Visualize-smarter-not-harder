import { Hash, Type, Calendar, Shuffle, AlertTriangle } from "lucide-react";
import type { ParsedData, ColumnInfo } from "@/lib/dataUtils";
import { getColumnInfos } from "@/lib/dataUtils";

const typeConfig: Record<ColumnInfo["type"], { icon: typeof Hash; label: string; colorClass: string }> = {
  number: { icon: Hash, label: "Number", colorClass: "bg-primary/10 text-primary" },
  text: { icon: Type, label: "Text", colorClass: "bg-secondary/10 text-secondary" },
  date: { icon: Calendar, label: "Date", colorClass: "bg-accent/10 text-accent" },
  mixed: { icon: Shuffle, label: "Mixed", colorClass: "bg-muted text-muted-foreground" },
};

const ColumnInspector = ({ data }: { data: ParsedData }) => {
  const columns = getColumnInfos(data);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <h3 className="font-display text-base font-semibold text-foreground">Column Inspector</h3>
      </div>
      <div className="divide-y divide-border">
        {columns.map((col) => {
          const cfg = typeConfig[col.type];
          const Icon = cfg.icon;
          return (
            <div key={col.name} className="flex items-center gap-4 px-5 py-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${cfg.colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-medium text-foreground">{col.name}</p>
                <p className="font-body text-xs text-muted-foreground">{cfg.label}</p>
              </div>
              {col.missingCount > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="font-body text-xs font-medium">{col.missingCount} missing</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColumnInspector;
