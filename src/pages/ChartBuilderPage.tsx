import { useState, useMemo, useCallback, useRef } from "react";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FileUploadZone from "@/components/FileUploadZone";
import DatasetSummaryBar from "@/components/DatasetSummaryBar";
import ChartTypeSelector, { type ChartType } from "@/components/ChartTypeSelector";
import AxisMapper, { type AxisMapping } from "@/components/AxisMapper";
import ColorThemePicker from "@/components/ColorThemePicker";
import ChartPreview, { type Annotation } from "@/components/ChartPreview";
import ChartSettings, { DEFAULT_CHART_SETTINGS, type ChartSettingsState } from "@/components/ChartSettings";
import AISuggestPanel from "@/components/AISuggestPanel";
import ExportMenu from "@/components/ExportMenu";
import { getColumnInfos, type ParsedData } from "@/lib/dataUtils";
import { suggestCharts, type ChartSuggestion } from "@/lib/chartSuggestions";
import { useDashboard } from "@/contexts/DashboardContext";

const ChartBuilderPage = () => {
  const navigate = useNavigate();
  const { addPanel, dashboard } = useDashboard();
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ParsedData | null>(null);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [mapping, setMapping] = useState<AxisMapping>({ x: "", y: "", group: "__none__" });
  const [themeIndex, setThemeIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [settings, setSettings] = useState<ChartSettingsState>(DEFAULT_CHART_SETTINGS);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const columns = useMemo(() => (data ? getColumnInfos(data) : []), [data]);

  const handleDataParsed = (parsed: ParsedData) => {
    setData(parsed);
    setAnnotations([]);
    setSuggestions([]);
    const infos = getColumnInfos(parsed);
    const textCol = infos.find((c) => c.type === "text" || c.type === "date");
    const numCol = infos.find((c) => c.type === "number");
    setMapping({
      x: textCol?.name ?? infos[0]?.name ?? "",
      y: numCol?.name ?? infos[1]?.name ?? "",
      group: "__none__",
    });
  };

  const handleGenerateSuggestions = useCallback(() => {
    if (!data) return;
    setSuggestLoading(true);
    // Simulate brief delay for UX feel
    setTimeout(() => {
      const result = suggestCharts(data, columns);
      setSuggestions(result);
      setSuggestLoading(false);
    }, 600);
  }, [data, columns]);

  const handleApplySuggestion = useCallback((s: ChartSuggestion) => {
    setChartType(s.chartType);
    setMapping(s.mapping);
  }, []);

  const handleAddToDashboard = useCallback(() => {
    if (!data) return;
    addPanel({
      title: title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      chartType,
      mapping,
      themeIndex,
      settings,
      annotations,
      data,
    });
    toast.success("Chart added to dashboard!", {
      action: {
        label: "View Dashboard",
        onClick: () => navigate("/dashboard"),
      },
    });
  }, [data, title, chartType, mapping, themeIndex, settings, annotations, addPanel, navigate]);

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 font-display">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
          </Link>
          <h1 className="font-display text-lg font-bold text-foreground">Chart Builder</h1>
          <div className="ml-auto flex items-center gap-2">
            {dashboard.panels.length > 0 && (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 text-xs font-display">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard ({dashboard.panels.length})
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {!data && <FileUploadZone onDataParsed={handleDataParsed} />}

        {data && (
          <>
            <DatasetSummaryBar data={data} />

            <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
              {/* Sidebar controls */}
              <aside className="space-y-6 max-h-[calc(100vh-160px)] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => { setData(null); setAnnotations([]); }}
                  >
                    Upload different file
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-sm font-semibold text-foreground">Chart Title</h3>
                  <Input
                    placeholder="Enter chart title…"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <ChartTypeSelector value={chartType} onChange={setChartType} />
                <AxisMapper columns={columns} mapping={mapping} onChange={setMapping} />
                <ColorThemePicker value={themeIndex} onChange={setThemeIndex} />
                <AISuggestPanel
                  suggestions={suggestions}
                  onApply={handleApplySuggestion}
                  onGenerate={handleGenerateSuggestions}
                  loading={suggestLoading}
                />
                <ChartSettings settings={settings} onChange={setSettings} />
              </aside>

              {/* Chart preview */}
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddToDashboard}
                    size="sm"
                    className="gap-2 text-xs"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Add to Dashboard
                  </Button>
                </div>
                <ChartPreview
                  data={data}
                  chartType={chartType}
                  mapping={mapping}
                  themeIndex={themeIndex}
                  title={title}
                  settings={settings}
                  annotations={annotations}
                  onAnnotationsChange={setAnnotations}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ChartBuilderPage;
