import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, LayoutDashboard, Save, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ChartBuilderPage = () => {
  const navigate = useNavigate();
  const { addPanel, dashboard } = useDashboard();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const chartRef = useRef<HTMLDivElement>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ParsedData | null>(null);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [mapping, setMapping] = useState<AxisMapping>({ x: "", y: "", group: "__none__" });
  const [themeIndex, setThemeIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [settings, setSettings] = useState<ChartSettingsState>(DEFAULT_CHART_SETTINGS);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // Load project from URL param
  useEffect(() => {
    const pid = searchParams.get("project");
    if (!pid || !user) return;
    (async () => {
      const { data: proj, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", pid)
        .single();
      if (error || !proj) return;
      setProjectId(proj.id);
      const d = proj.data as any;
      if (d.parsedData) {
        setData(d.parsedData);
        if (d.chartType) setChartType(d.chartType);
        if (d.mapping) setMapping(d.mapping);
        if (d.themeIndex != null) setThemeIndex(d.themeIndex);
        if (d.title) setTitle(d.title);
        if (d.settings) setSettings(d.settings);
        if (d.annotations) setAnnotations(d.annotations);
      }
    })();
  }, [searchParams, user]);

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

  const handleSaveProject = useCallback(async () => {
    if (!data || !user) {
      if (!user) {
        toast.error("Sign in to save projects", {
          action: { label: "Sign In", onClick: () => navigate("/auth") },
        });
      }
      return;
    }
    setSaving(true);
    const projectData = {
      parsedData: data,
      chartType,
      mapping,
      themeIndex,
      title,
      settings,
      annotations,
    };

    if (projectId) {
      const { error } = await supabase
        .from("projects")
        .update({
          name: title || "Untitled Project",
          data: projectData as any,
          chart_count: dashboard.panels.length + 1,
        })
        .eq("id", projectId);
      if (error) toast.error("Failed to save");
      else toast.success("Project saved!");
    } else {
      const { data: newProj, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: title || "Untitled Project",
          data: projectData as any,
          chart_count: 1,
        })
        .select("id")
        .single();
      if (error) toast.error("Failed to save");
      else {
        setProjectId(newProj.id);
        toast.success("Project saved!");
      }
    }
    setSaving(false);
  }, [data, user, projectId, chartType, mapping, themeIndex, title, settings, annotations, dashboard.panels.length, navigate]);

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
            {user && (
              <Link to="/projects">
                <Button variant="ghost" size="sm" className="gap-2 text-xs font-display">
                  <FolderOpen className="h-3.5 w-3.5" />
                  My Projects
                </Button>
              </Link>
            )}
            {data && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={handleSaveProject}
                disabled={saving}
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving…" : "Save Project"}
              </Button>
            )}
            {dashboard.panels.length > 0 && (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 text-xs font-display">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard ({dashboard.panels.length})
                </Button>
              </Link>
            )}
            {!user && (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="text-xs">Sign In</Button>
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
                <div className="flex justify-end gap-2">
                  <ExportMenu chartRef={chartRef} chartTitle={title || "chart"} />
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
                  ref={chartRef}
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
