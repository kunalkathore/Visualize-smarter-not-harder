import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnInfo } from "@/lib/dataUtils";

export interface AxisMapping {
  x: string;
  y: string;
  group: string;
}

interface Props {
  columns: ColumnInfo[];
  mapping: AxisMapping;
  onChange: (m: AxisMapping) => void;
}

const AxisMapper = ({ columns, mapping, onChange }: Props) => {
  const set = (key: keyof AxisMapping, val: string) =>
    onChange({ ...mapping, [key]: val });

  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-semibold text-foreground">Axis Mapping</h3>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">X-Axis</label>
        <Select value={mapping.x} onValueChange={(v) => set("x", v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c.name} value={c.name}>
                {c.name} <span className="ml-1 text-muted-foreground">({c.type})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Y-Axis</label>
        <Select value={mapping.y} onValueChange={(v) => set("y", v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c.name} value={c.name}>
                {c.name} <span className="ml-1 text-muted-foreground">({c.type})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Group / Color (optional)</label>
        <Select value={mapping.group} onValueChange={(v) => set("group", v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {columns.map((c) => (
              <SelectItem key={c.name} value={c.name}>
                {c.name} <span className="ml-1 text-muted-foreground">({c.type})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AxisMapper;
