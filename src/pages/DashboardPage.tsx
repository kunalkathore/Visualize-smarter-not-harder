import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, GripVertical, Trash2, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard, type DashboardPanel } from "@/contexts/DashboardContext";
import ChartPreview from "@/components/ChartPreview";
import { cn } from "@/lib/utils";

const GRID_COLS = 12;
const COL_PX = 1; // will use percentage
const ROW_H = 100; // px per grid row unit

const DashboardPage = () => {
  const { dashboard, setDashboardTitle, removePanel, updatePanel, reorderPanels } = useDashboard();
  const [previewMode, setPreviewMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxRow = dashboard.panels.reduce((m, p) => Math.max(m, p.y + p.h), 0);

  // Simple drag reorder (swap positions)
  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const panels = [...dashboard.panels];
    const srcIdx = panels.findIndex((p) => p.id === dragId);
    const tgtIdx = panels.findIndex((p) => p.id === targetId);
    if (srcIdx === -1 || tgtIdx === -1) return;
    // Swap positions
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
      if (panel.w === GRID_COLS) {
        // Shrink back to half
        updatePanel(id, { w: 6 });
      } else {
        // Expand to full width
        updatePanel(id, { w: GRID_COLS });
      }
    },
    [dashboard.panels, updatePanel],
  );

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

      <main
        ref={containerRef}
        className="mx-auto max-w-[1600px] px-4 py-6"
        onDragOver={handleDragOver}
      >
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          }}
        >
          {dashboard.panels.map((panel) => (
            <div
              key={panel.id}
              className={cn(
                "rounded-xl border bg-card transition-shadow relative group",
                previewMode ? "border-transparent shadow-sm" : "border-border shadow-sm hover:shadow-md",
                dragId === panel.id && "opacity-50",
              )}
              style={{
                gridColumn: `span ${panel.w}`,
                minHeight: panel.h * ROW_H,
              }}
              draggable={!previewMode}
              onDragStart={() => handleDragStart(panel.id)}
              onDrop={() => handleDrop(panel.id)}
              onDragOver={handleDragOver}
            >
              {/* Panel controls */}
              {!previewMode && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => togglePanelSize(panel.id)}
                  >
                    {panel.w === GRID_COLS ? (
                      <Minimize2 className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:text-destructive"
                    onClick={() => removePanel(panel.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <ChartPreview
                data={panel.data}
                chartType={panel.chartType}
                mapping={panel.mapping}
                themeIndex={panel.themeIndex}
                title={panel.title}
                settings={panel.settings}
                annotations={panel.annotations}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
