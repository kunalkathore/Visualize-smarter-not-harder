import { useState, useCallback, useRef, createRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, GripVertical, Trash2, Maximize2, Minimize2, Share2, Download, FileText, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDashboard } from "@/contexts/DashboardContext";
import ChartPreview from "@/components/ChartPreview";
import ExportMenu from "@/components/ExportMenu";
import { exportDashboardAsPdf, exportDashboardAsPng, generateShareLink } from "@/lib/exportUtils";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";

const GRID_COLS = 12;
const ROW_H = 100;

const DashboardPage = () => {
  const { dashboard, setDashboardTitle, removePanel, updatePanel, reorderPanels } = useDashboard();
  const [previewMode, setPreviewMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const dashboardRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());

  // Ensure refs exist for each panel
  dashboard.panels.forEach((p) => {
    if (!panelRefs.current.has(p.id)) {
      panelRefs.current.set(p.id, createRef<HTMLDivElement>());
    }
  });

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const panels = [...dashboard.panels];
    const srcIdx = panels.findIndex((p) => p.id === dragId);
    const tgtIdx = panels.findIndex((p) => p.id === targetId);
    if (srcIdx === -1 || tgtIdx === -1) return;
    const srcPos = { x: panels[srcIdx].x, y: panels[srcIdx].y, w: panels[srcIdx].w, h: panels[srcIdx].h };
    const tgtPos = { x: panels[tgtIdx].x, y: panels[tgtIdx].y, w: panels[tgtIdx].w, h: panels[tgtIdx].h };
    panels[srcIdx] = { ...panels[srcIdx], ...tgtPos };
    panels[tgtIdx] = { ...panels[tgtIdx], ...srcPos };
    reorderPanels(panels);
    setDragId(null);
  };

  const togglePanelSize = useCallback(
    (id: string) => {
      const panel = dashboard.panels.find((p) => p.id === id);
      if (!panel) return;
      updatePanel(id, { w: panel.w === GRID_COLS ? 6 : GRID_COLS });
    },
    [dashboard.panels, updatePanel],
  );

  const handleShareLink = () => {
    const link = generateShareLink();
    setShareLink(link);
    setShareOpen(true);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Share link copied!");
  };

  if (dashboard.panels.length === 0) {
    return (
      <div className="min-h-screen bg-background font-body">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
            <Link to="/chart">
              <Button variant="ghost" size="sm" className="gap-2 font-display">
                <ArrowLeft className="h-4 w-4" /> Chart Builder
              </Button>
            </Link>
            <h1 className="font-display text-lg font-bold text-foreground">Dashboard</h1>
          </div>
        </header>
        <main className="flex flex-col items-center justify-center gap-4 py-32 px-4">
          <div className="text-6xl">📊</div>
          <h2 className="font-display text-xl font-bold text-foreground">No charts yet</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Go to the Chart Builder, create a chart, and click "Add to Dashboard" to start building your dashboard.
          </p>
          <Link to="/chart">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Go to Chart Builder
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3">
          <Link to="/chart">
            <Button variant="ghost" size="sm" className="gap-2 font-display">
              <ArrowLeft className="h-4 w-4" /> Builder
            </Button>
          </Link>

          {previewMode ? (
            <h1 className="font-display text-lg font-bold text-foreground flex-1 text-center">
              {dashboard.title}
            </h1>
          ) : (
            <Input
              value={dashboard.title}
              onChange={(e) => setDashboardTitle(e.target.value)}
              className="h-9 max-w-xs font-display font-bold text-foreground border-transparent hover:border-border focus:border-border bg-transparent"
              placeholder="Dashboard title…"
            />
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {dashboard.panels.length} chart{dashboard.panels.length !== 1 ? "s" : ""}
            </span>

            {/* Dashboard export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => dashboardRef.current && exportDashboardAsPng(dashboardRef.current, dashboard.title)}
                  className="gap-2 text-xs"
                >
                  <FileImage className="h-3.5 w-3.5" /> Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dashboardRef.current && exportDashboardAsPdf(dashboardRef.current, dashboard.title)}
                  className="gap-2 text-xs"
                >
                  <FileText className="h-3.5 w-3.5" /> Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Share link */}
            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleShareLink}>
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>

            <Button
              variant={previewMode ? "default" : "outline"}
              size="sm"
              className="gap-2 text-xs"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {previewMode ? "Edit Mode" : "Preview Mode"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6" onDragOver={handleDragOver}>
        <div
          ref={dashboardRef}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
        >
          {dashboard.panels.map((panel) => {
            const ref = panelRefs.current.get(panel.id)!;
            return (
              <div
                key={panel.id}
                className={cn(
                  "rounded-xl border bg-card transition-shadow relative group",
                  previewMode ? "border-transparent shadow-sm" : "border-border shadow-sm hover:shadow-md",
                  dragId === panel.id && "opacity-50",
                )}
                style={{ gridColumn: `span ${panel.w}`, minHeight: panel.h * ROW_H }}
                draggable={!previewMode}
                onDragStart={() => handleDragStart(panel.id)}
                onDrop={() => handleDrop(panel.id)}
                onDragOver={handleDragOver}
              >
                {/* Panel controls */}
                {!previewMode && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExportMenu chartRef={ref} chartTitle={panel.title} variant="compact" />
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => togglePanelSize(panel.id)}>
                      {panel.w === GRID_COLS ? (
                        <Minimize2 className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => removePanel(panel.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                <ChartPreview
                  ref={ref}
                  data={panel.data}
                  chartType={panel.chartType}
                  mapping={panel.mapping}
                  themeIndex={panel.themeIndex}
                  title={panel.title}
                  settings={panel.settings}
                  annotations={panel.annotations}
                />
              </div>
            );
          })}
        </div>
      </main>

      {/* Share dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Share Dashboard</DialogTitle>
            <DialogDescription>Anyone with this link can view a read-only version of your dashboard.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input value={shareLink} readOnly className="text-xs flex-1" />
            <Button onClick={handleCopyShareLink} size="sm" className="gap-2 text-xs shrink-0">
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
