import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ChartType } from "@/components/ChartTypeSelector";
import type { AxisMapping } from "@/components/AxisMapper";
import type { ChartSettingsState } from "@/components/ChartSettings";
import { DEFAULT_CHART_SETTINGS } from "@/components/ChartSettings";
import type { Annotation } from "@/components/ChartPreview";
import type { ParsedData } from "@/lib/dataUtils";

export interface DashboardPanel {
  id: string;
  title: string;
  chartType: ChartType;
  mapping: AxisMapping;
  themeIndex: number;
  settings: ChartSettingsState;
  annotations: Annotation[];
  data: ParsedData;
  // Grid position
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DashboardState {
  title: string;
  panels: DashboardPanel[];
}

interface DashboardContextValue {
  dashboard: DashboardState;
  setDashboardTitle: (t: string) => void;
  addPanel: (panel: Omit<DashboardPanel, "id" | "x" | "y" | "w" | "h">) => void;
  removePanel: (id: string) => void;
  updatePanel: (id: string, updates: Partial<DashboardPanel>) => void;
  reorderPanels: (panels: DashboardPanel[]) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
};

let panelCounter = 0;

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [dashboard, setDashboard] = useState<DashboardState>({
    title: "My Dashboard",
    panels: [],
  });

  const setDashboardTitle = useCallback((title: string) => {
    setDashboard((prev) => ({ ...prev, title }));
  }, []);

  const addPanel = useCallback(
    (panel: Omit<DashboardPanel, "id" | "x" | "y" | "w" | "h">) => {
      panelCounter++;
      const id = `panel-${panelCounter}-${Date.now()}`;
      const count = dashboard.panels.length;
      // Place in a 2-col grid pattern
      const col = count % 2;
      const row = Math.floor(count / 2);
      setDashboard((prev) => ({
        ...prev,
        panels: [
          ...prev.panels,
          { ...panel, id, x: col * 6, y: row * 4, w: 6, h: 4 },
        ],
      }));
    },
    [dashboard.panels.length],
  );

  const removePanel = useCallback((id: string) => {
    setDashboard((prev) => ({
      ...prev,
      panels: prev.panels.filter((p) => p.id !== id),
    }));
  }, []);

  const updatePanel = useCallback((id: string, updates: Partial<DashboardPanel>) => {
    setDashboard((prev) => ({
      ...prev,
      panels: prev.panels.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const reorderPanels = useCallback((panels: DashboardPanel[]) => {
    setDashboard((prev) => ({ ...prev, panels }));
  }, []);

  return (
    <DashboardContext.Provider
      value={{ dashboard, setDashboardTitle, addPanel, removePanel, updatePanel, reorderPanels }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
