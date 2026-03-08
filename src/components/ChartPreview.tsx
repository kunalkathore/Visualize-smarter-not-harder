import { useMemo, useState, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, LabelList,
  ReferenceDot,
} from "recharts";
import type { ChartType } from "@/components/ChartTypeSelector";
import type { AxisMapping } from "@/components/AxisMapper";
import type { ParsedData } from "@/lib/dataUtils";
import { COLOR_THEMES } from "@/components/ColorThemePicker";
import type { ChartSettingsState } from "@/components/ChartSettings";
import { DEFAULT_CHART_SETTINGS } from "@/components/ChartSettings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface Annotation {
  x: string | number;
  y: number;
  text: string;
}

interface Props {
  data: ParsedData;
  chartType: ChartType;
  mapping: AxisMapping;
  themeIndex: number;
  title: string;
  settings?: ChartSettingsState;
  annotations?: Annotation[];
  onAnnotationsChange?: (a: Annotation[]) => void;
}

const SIZE_HEIGHTS = [280, 400, 540, 700];

const ChartPreview = ({
  data, chartType, mapping, themeIndex, title,
  settings = DEFAULT_CHART_SETTINGS,
  annotations = [],
  onAnnotationsChange,
}: Props) => {
  const colors = COLOR_THEMES[themeIndex].colors;
  const [pendingAnnotation, setPendingAnnotation] = useState<{ x: string | number; y: number } | null>(null);
  const [annotationText, setAnnotationText] = useState("");

  const chartHeight = SIZE_HEIGHTS[settings.chartSize];

  const chartData = useMemo(() => {
    const { x, y } = mapping;
    if (!x || !y) return [];
    return data.rows.slice(0, 500).map((row) => ({
      x: row[x],
      y: Number(row[y]) || 0,
      group: mapping.group && mapping.group !== "__none__" ? String(row[mapping.group] ?? "") : undefined,
      name: String(row[x] ?? ""),
    }));
  }, [data, mapping]);

  const groups = useMemo(() => {
    if (!mapping.group || mapping.group === "__none__") return null;
    const set = new Set<string>();
    chartData.forEach((d) => d.group && set.add(d.group));
    return [...set];
  }, [chartData, mapping.group]);

  const pivotedData = useMemo(() => {
    if (!groups) return chartData;
    const map = new Map<string, Record<string, unknown>>();
    chartData.forEach((d) => {
      const key = String(d.x);
      if (!map.has(key)) map.set(key, { name: key });
      const entry = map.get(key)!;
      entry[d.group!] = d.y;
    });
    return [...map.values()];
  }, [chartData, groups]);

  const histogramData = useMemo(() => {
    if (chartType !== "histogram") return [];
    const vals = data.rows.map((r) => Number(r[mapping.x]) || 0).filter((v) => !isNaN(v));
    if (vals.length === 0) return [];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const binCount = 15;
    const binWidth = (max - min) / binCount || 1;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      name: `${(min + i * binWidth).toFixed(1)}`,
      count: 0,
    }));
    vals.forEach((v) => {
      const idx = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
      bins[idx].count++;
    });
    return bins;
  }, [data, mapping.x, chartType]);

  const heatmapData = useMemo(() => {
    if (chartType !== "heatmap" || !groups) return [];
    return pivotedData.map((d) => {
      const entry: Record<string, unknown> = { name: d.name };
      groups.forEach((g) => (entry[g] = d[g] ?? 0));
      return entry;
    });
  }, [chartType, groups, pivotedData]);

  const handleChartClick = useCallback((data: any) => {
    if (!data || !data.activePayload || !onAnnotationsChange) return;
    const payload = data.activePayload[0]?.payload;
    if (!payload) return;
    setPendingAnnotation({ x: payload.name ?? payload.x, y: payload.y ?? payload.count ?? 0 });
    setAnnotationText("");
  }, [onAnnotationsChange]);

  const confirmAnnotation = () => {
    if (!pendingAnnotation || !annotationText.trim() || !onAnnotationsChange) return;
    onAnnotationsChange([...annotations, { ...pendingAnnotation, text: annotationText.trim() }]);
    setPendingAnnotation(null);
    setAnnotationText("");
  };

  const removeAnnotation = (idx: number) => {
    onAnnotationsChange?.(annotations.filter((_, i) => i !== idx));
  };

  if (!mapping.x || !mapping.y) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30" style={{ height: chartHeight }}>
        <p className="text-sm text-muted-foreground">Select X and Y axes to see a preview</p>
      </div>
    );
  }

  const legendProps = settings.showLegend
    ? {
        verticalAlign: (settings.legendPosition === "top" || settings.legendPosition === "bottom") ? settings.legendPosition as "top" | "bottom" : undefined,
        align: (settings.legendPosition === "left" || settings.legendPosition === "right") ? settings.legendPosition as "left" | "right" : undefined,
        layout: (settings.legendPosition === "left" || settings.legendPosition === "right") ? "vertical" as const : "horizontal" as const,
      }
    : null;

  const xAxisLabel = settings.xAxisLabel || undefined;
  const yAxisLabel = settings.yAxisLabel || undefined;

  const renderXAxis = (props?: Record<string, any>) =>
    settings.showXAxis ? (
      <XAxis tick={{ fontSize: 11 }} {...props}>
        {xAxisLabel && <Label value={xAxisLabel} position="insideBottom" offset={-5} className="text-xs fill-muted-foreground" />}
      </XAxis>
    ) : <XAxis hide />;

  const renderYAxis = (props?: Record<string, any>) =>
    settings.showYAxis ? (
      <YAxis tick={{ fontSize: 11 }} {...props}>
        {yAxisLabel && <Label value={yAxisLabel} angle={-90} position="insideLeft" className="text-xs fill-muted-foreground" />}
      </YAxis>
    ) : <YAxis hide />;

  const renderGrid = () =>
    settings.showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /> : null;

  const renderLegend = () =>
    legendProps ? <Legend {...legendProps} /> : null;

  const renderAnnotations = () =>
    annotations.map((a, i) => (
      <ReferenceDot
        key={i}
        x={a.x as any}
        y={a.y}
        r={6}
        fill="hsl(var(--accent))"
        stroke="hsl(var(--accent-foreground))"
        strokeWidth={2}
        label={{ value: a.text, position: "top", fontSize: 10, fill: "hsl(var(--foreground))" }}
      />
    ));

  const labelListProps = settings.showDataLabels ? { fontSize: 10, position: "top" as const, fill: "hsl(var(--foreground))" } : null;

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={groups ? pivotedData : chartData} onClick={handleChartClick}>
              {renderGrid()}
              {renderXAxis({ dataKey: "name" })}
              {renderYAxis()}
              <Tooltip />
              {renderLegend()}
              {groups
                ? groups.map((g, i) => (
                    <Bar key={g} dataKey={g} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]}>
                      {labelListProps && <LabelList dataKey={g} {...labelListProps} />}
                    </Bar>
                  ))
                : (
                    <Bar dataKey="y" fill={colors[0]} radius={[4, 4, 0, 0]} name={mapping.y}>
                      {labelListProps && <LabelList dataKey="y" {...labelListProps} />}
                    </Bar>
                  )
              }
              {renderAnnotations()}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={groups ? pivotedData : chartData} onClick={handleChartClick}>
              {renderGrid()}
              {renderXAxis({ dataKey: "name" })}
              {renderYAxis()}
              <Tooltip />
              {renderLegend()}
              {groups
                ? groups.map((g, i) => (
                    <Line key={g} type="monotone" dataKey={g} stroke={colors[i % colors.length]} strokeWidth={2} dot={false}>
                      {labelListProps && <LabelList dataKey={g} {...labelListProps} />}
                    </Line>
                  ))
                : (
                    <Line type="monotone" dataKey="y" stroke={colors[0]} strokeWidth={2} dot={false} name={mapping.y}>
                      {labelListProps && <LabelList dataKey="y" {...labelListProps} />}
                    </Line>
                  )
              }
              {renderAnnotations()}
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={chartData.slice(0, 20)}
                dataKey="y"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={Math.min(chartHeight * 0.35, 160)}
                label={settings.showDataLabels ? (e: any) => `${e.name}: ${e.y}` : (e: any) => e.name}
              >
                {chartData.slice(0, 20).map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              {renderLegend()}
            </PieChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart onClick={handleChartClick}>
              {renderGrid()}
              {renderXAxis({ dataKey: "x", type: "number", name: mapping.x })}
              {renderYAxis({ dataKey: "y", type: "number", name: mapping.y })}
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              {renderLegend()}
              <Scatter data={chartData} fill={colors[0]} name={mapping.y} />
              {renderAnnotations()}
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={groups ? pivotedData : chartData} onClick={handleChartClick}>
              {renderGrid()}
              {renderXAxis({ dataKey: "name" })}
              {renderYAxis()}
              <Tooltip />
              {renderLegend()}
              {groups
                ? groups.map((g, i) => (
                    <Area key={g} type="monotone" dataKey={g} fill={colors[i % colors.length]} stroke={colors[i % colors.length]} fillOpacity={0.3}>
                      {labelListProps && <LabelList dataKey={g} {...labelListProps} />}
                    </Area>
                  ))
                : (
                    <Area type="monotone" dataKey="y" fill={colors[0]} stroke={colors[0]} fillOpacity={0.3} name={mapping.y}>
                      {labelListProps && <LabelList dataKey="y" {...labelListProps} />}
                    </Area>
                  )
              }
              {renderAnnotations()}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "histogram":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={histogramData} onClick={handleChartClick}>
              {renderGrid()}
              {renderXAxis({ dataKey: "name" })}
              {renderYAxis()}
              <Tooltip />
              <Bar dataKey="count" fill={colors[0]} radius={[4, 4, 0, 0]} name="Frequency">
                {labelListProps && <LabelList dataKey="count" {...labelListProps} />}
              </Bar>
              {renderAnnotations()}
            </BarChart>
          </ResponsiveContainer>
        );

      case "bubble":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart onClick={handleChartClick}>
              {renderGrid()}
              {renderXAxis({ dataKey: "x", type: "number", name: mapping.x })}
              {renderYAxis({ dataKey: "y", type: "number", name: mapping.y })}
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              {renderLegend()}
              <Scatter data={chartData.map((d) => ({ ...d, z: Math.abs(d.y) * 10 }))} fill={colors[0]} name={mapping.y}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Scatter>
              {renderAnnotations()}
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "heatmap":
        if (!groups || groups.length === 0) {
          return (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30" style={{ height: chartHeight }}>
              <p className="text-sm text-muted-foreground">Heatmap requires a Group/Color column</p>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={heatmapData} layout="vertical" onClick={handleChartClick}>
              {renderGrid()}
              <XAxis type="number" tick={{ fontSize: 11 }}>
                {xAxisLabel && <Label value={xAxisLabel} position="insideBottom" offset={-5} className="text-xs fill-muted-foreground" />}
              </XAxis>
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80}>
                {yAxisLabel && <Label value={yAxisLabel} angle={-90} position="insideLeft" className="text-xs fill-muted-foreground" />}
              </YAxis>
              <Tooltip />
              {renderLegend()}
              {groups.map((g, i) => (
                <Bar key={g} dataKey={g} stackId="stack" fill={colors[i % colors.length]}>
                  {labelListProps && <LabelList dataKey={g} {...labelListProps} />}
                </Bar>
              ))}
              {renderAnnotations()}
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {title && (
        <h2 className="mb-4 text-center font-display text-lg font-bold text-foreground">{title}</h2>
      )}
      {renderChart()}

      {/* Annotation input */}
      {pendingAnnotation && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <span className="text-xs text-muted-foreground shrink-0">Annotate point:</span>
          <Input
            className="h-8 text-xs flex-1"
            placeholder="Type annotation…"
            value={annotationText}
            onChange={(e) => setAnnotationText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmAnnotation()}
            autoFocus
          />
          <Button size="sm" className="h-8 text-xs" onClick={confirmAnnotation}>Add</Button>
          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setPendingAnnotation(null)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Annotation list */}
      {annotations.length > 0 && (
        <div className="mt-3 space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Annotations</span>
          {annotations.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-foreground">
              <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
              <span className="flex-1 truncate">
                ({String(a.x)}, {a.y}): {a.text}
              </span>
              <button onClick={() => removeAnnotation(i)} className="text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartPreview;
