import type { ColumnInfo } from "@/lib/dataUtils";
import type { ParsedData } from "@/lib/dataUtils";
import type { ChartType } from "@/components/ChartTypeSelector";
import type { AxisMapping } from "@/components/AxisMapper";

export interface ChartSuggestion {
  chartType: ChartType;
  mapping: AxisMapping;
  reason: string;
}

export function suggestCharts(data: ParsedData, columns: ColumnInfo[]): ChartSuggestion[] {
  const suggestions: ChartSuggestion[] = [];

  const numCols = columns.filter((c) => c.type === "number");
  const textCols = columns.filter((c) => c.type === "text");
  const dateCols = columns.filter((c) => c.type === "date");
  const categoryCols = textCols.filter((c) => {
    const unique = new Set(data.rows.map((r) => r[c.name]));
    return unique.size <= 20;
  });

  // 1. Date + number → Line chart (trend)
  if (dateCols.length > 0 && numCols.length > 0) {
    suggestions.push({
      chartType: "line",
      mapping: { x: dateCols[0].name, y: numCols[0].name, group: "__none__" },
      reason: `Use a Line Chart — your "${dateCols[0].name}" column shows a trend over time against "${numCols[0].name}".`,
    });
  }

  // 2. Category + number → Bar chart (comparison)
  if (categoryCols.length > 0 && numCols.length > 0) {
    const cat = categoryCols[0];
    const num = numCols[0];
    suggestions.push({
      chartType: "bar",
      mapping: { x: cat.name, y: num.name, group: "__none__" },
      reason: `Use a Bar Chart — compare "${num.name}" across different "${cat.name}" categories.`,
    });
  }

  // 3. Few categories → Pie chart (proportions)
  if (categoryCols.length > 0 && numCols.length > 0) {
    const cat = categoryCols.find((c) => {
      const unique = new Set(data.rows.map((r) => r[c.name]));
      return unique.size <= 8;
    });
    if (cat) {
      suggestions.push({
        chartType: "pie",
        mapping: { x: cat.name, y: numCols[0].name, group: "__none__" },
        reason: `Use a Pie Chart — "${cat.name}" has few categories, perfect for showing proportions of "${numCols[0].name}".`,
      });
    }
  }

  // 4. Two numeric columns → Scatter (correlation)
  if (numCols.length >= 2) {
    suggestions.push({
      chartType: "scatter",
      mapping: { x: numCols[0].name, y: numCols[1].name, group: "__none__" },
      reason: `Use a Scatter Chart — explore the correlation between "${numCols[0].name}" and "${numCols[1].name}".`,
    });
  }

  // 5. Date + number + category → Area with grouping
  if (dateCols.length > 0 && numCols.length > 0 && categoryCols.length > 0) {
    suggestions.push({
      chartType: "area",
      mapping: { x: dateCols[0].name, y: numCols[0].name, group: categoryCols[0].name },
      reason: `Use an Area Chart — visualize "${numCols[0].name}" over "${dateCols[0].name}", grouped by "${categoryCols[0].name}".`,
    });
  }

  // 6. Single numeric → Histogram (distribution)
  if (numCols.length > 0 && suggestions.length < 3) {
    suggestions.push({
      chartType: "histogram",
      mapping: { x: numCols[0].name, y: numCols[0].name, group: "__none__" },
      reason: `Use a Histogram — see the distribution of "${numCols[0].name}" values.`,
    });
  }

  // Deduplicate by chartType, return top 3
  const seen = new Set<ChartType>();
  return suggestions.filter((s) => {
    if (seen.has(s.chartType)) return false;
    seen.add(s.chartType);
    return true;
  }).slice(0, 3);
}
