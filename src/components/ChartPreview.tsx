import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { ChartType } from "@/components/ChartTypeSelector";
import type { AxisMapping } from "@/components/AxisMapper";
import type { ParsedData } from "@/lib/dataUtils";
import { COLOR_THEMES } from "@/components/ColorThemePicker";

interface Props {
  data: ParsedData;
  chartType: ChartType;
  mapping: AxisMapping;
  themeIndex: number;
  title: string;
}

const ChartPreview = ({ data, chartType, mapping, themeIndex, title }: Props) => {
  const colors = COLOR_THEMES[themeIndex].colors;

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

  // For grouped data, get unique groups
  const groups = useMemo(() => {
    if (!mapping.group || mapping.group === "__none__") return null;
    const set = new Set<string>();
    chartData.forEach((d) => d.group && set.add(d.group));
    return [...set];
  }, [chartData, mapping.group]);

  // For grouped bar/line/area, pivot data
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

  // Histogram: bin numeric x values
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

  // Heatmap: aggregate x vs group
  const heatmapData = useMemo(() => {
    if (chartType !== "heatmap" || !groups) return [];
    return pivotedData.map((d) => {
      const entry: Record<string, unknown> = { name: d.name };
      groups.forEach((g) => (entry[g] = d[g] ?? 0));
      return entry;
    });
  }, [chartType, groups, pivotedData]);

  if (!mapping.x || !mapping.y) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">Select X and Y axes to see a preview</p>
      </div>
    );
  }

  const commonProps = { width: "100%", height: 400 };

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={groups ? pivotedData : chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {groups
                ? groups.map((g, i) => <Bar key={g} dataKey={g} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />)
                : <Bar dataKey="y" fill={colors[0]} radius={[4, 4, 0, 0]} name={mapping.y} />
              }
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={groups ? pivotedData : chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {groups
                ? groups.map((g, i) => <Line key={g} type="monotone" dataKey={g} stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />)
                : <Line type="monotone" dataKey="y" stroke={colors[0]} strokeWidth={2} dot={false} name={mapping.y} />
              }
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie data={chartData.slice(0, 20)} dataKey="y" nameKey="name" cx="50%" cy="50%" outerRadius={140} label={(e) => e.name}>
                {chartData.slice(0, 20).map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="x" type="number" name={mapping.x} tick={{ fontSize: 11 }} />
              <YAxis dataKey="y" type="number" name={mapping.y} tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={chartData} fill={colors[0]} name={mapping.y} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={groups ? pivotedData : chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {groups
                ? groups.map((g, i) => <Area key={g} type="monotone" dataKey={g} fill={colors[i % colors.length]} stroke={colors[i % colors.length]} fillOpacity={0.3} />)
                : <Area type="monotone" dataKey="y" fill={colors[0]} stroke={colors[0]} fillOpacity={0.3} name={mapping.y} />
              }
            </AreaChart>
          </ResponsiveContainer>
        );

      case "histogram":
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill={colors[0]} radius={[4, 4, 0, 0]} name="Frequency" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "bubble":
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="x" type="number" name={mapping.x} tick={{ fontSize: 11 }} />
              <YAxis dataKey="y" type="number" name={mapping.y} tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={chartData.map((d, i) => ({ ...d, z: Math.abs(d.y) * 10 }))} fill={colors[0]} name={mapping.y}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "heatmap":
        if (!groups || groups.length === 0) {
          return (
            <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">Heatmap requires a Group/Color column</p>
            </div>
          );
        }
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={heatmapData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Legend />
              {groups.map((g, i) => (
                <Bar key={g} dataKey={g} stackId="stack" fill={colors[i % colors.length]} />
              ))}
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
    </div>
  );
};

export default ChartPreview;
