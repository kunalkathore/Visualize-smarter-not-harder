import { FileSpreadsheet, Rows3, Columns3, HardDrive } from "lucide-react";
import type { ParsedData } from "@/lib/dataUtils";
import { formatFileSize } from "@/lib/dataUtils";

const DatasetSummaryBar = ({ data }: { data: ParsedData }) => {
  const stats = [
    { icon: FileSpreadsheet, label: "File", value: data.fileName },
    { icon: Rows3, label: "Rows", value: data.rows.length.toLocaleString() },
    { icon: Columns3, label: "Columns", value: data.headers.length.toString() },
    { icon: HardDrive, label: "Size", value: formatFileSize(data.fileSize) },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-body text-xs text-muted-foreground">{s.label}</p>
              <p className="truncate font-display text-sm font-semibold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatasetSummaryBar;
