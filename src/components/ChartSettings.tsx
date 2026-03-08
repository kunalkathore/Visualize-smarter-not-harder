import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ChartSettingsState {
  showLegend: boolean;
  legendPosition: "top" | "bottom" | "left" | "right";
  showGrid: boolean;
  showDataLabels: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  xAxisLabel: string;
  yAxisLabel: string;
  chartSize: number; // 0=small, 1=medium, 2=large, 3=fullscreen
}

export const DEFAULT_CHART_SETTINGS: ChartSettingsState = {
  showLegend: true,
  legendPosition: "bottom",
  showGrid: true,
  showDataLabels: false,
  showXAxis: true,
  showYAxis: true,
  xAxisLabel: "",
  yAxisLabel: "",
  chartSize: 1,
};

const SIZE_LABELS = ["Small", "Medium", "Large", "Full"];

interface Props {
  settings: ChartSettingsState;
  onChange: (s: ChartSettingsState) => void;
}

const ChartSettings = ({ settings, onChange }: Props) => {
  const set = <K extends keyof ChartSettingsState>(key: K, val: ChartSettingsState[K]) =>
    onChange({ ...settings, [key]: val });

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-semibold text-foreground">Chart Settings</h3>

      {/* Legend */}
      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Show Legend</Label>
          <Switch checked={settings.showLegend} onCheckedChange={(v) => set("showLegend", v)} />
        </div>
        {settings.showLegend && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Position</Label>
            <Select value={settings.legendPosition} onValueChange={(v) => set("legendPosition", v as ChartSettingsState["legendPosition"])}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["top", "bottom", "left", "right"] as const).map((p) => (
                  <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
        <Label className="text-xs font-medium">Grid Lines</Label>
        <Switch checked={settings.showGrid} onCheckedChange={(v) => set("showGrid", v)} />
      </div>

      {/* Data Labels */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
        <Label className="text-xs font-medium">Data Labels</Label>
        <Switch checked={settings.showDataLabels} onCheckedChange={(v) => set("showDataLabels", v)} />
      </div>

      {/* Axis Settings */}
      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
        <span className="text-xs font-medium text-foreground">Axis Settings</span>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Show X-Axis</Label>
          <Switch checked={settings.showXAxis} onCheckedChange={(v) => set("showXAxis", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Show Y-Axis</Label>
          <Switch checked={settings.showYAxis} onCheckedChange={(v) => set("showYAxis", v)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">X-Axis Label</Label>
          <Input className="h-8 text-xs" placeholder="Auto" value={settings.xAxisLabel} onChange={(e) => set("xAxisLabel", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Y-Axis Label</Label>
          <Input className="h-8 text-xs" placeholder="Auto" value={settings.yAxisLabel} onChange={(e) => set("yAxisLabel", e.target.value)} />
        </div>
      </div>

      {/* Chart Size */}
      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Chart Size</Label>
          <span className="text-xs font-semibold text-primary">{SIZE_LABELS[settings.chartSize]}</span>
        </div>
        <Slider
          min={0}
          max={3}
          step={1}
          value={[settings.chartSize]}
          onValueChange={([v]) => set("chartSize", v)}
        />
      </div>
    </div>
  );
};

export default ChartSettings;
