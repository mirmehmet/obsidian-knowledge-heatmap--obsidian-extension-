import { Weights } from "../core/types";

export interface KnowledgeHeatMapSettings {
  enabled: boolean;
  enableOnStartup: boolean;
  refreshInterval: number; 
  showNotifications: boolean;
  weights: Weights;
  activeCriteria: Record<string, boolean>;
  timeRange: string; 
  
  palette: "amber" | "custom";
  customColors: {
    frozen: string;
    cold: string;
    warm: string;
    hot: string;
    burning: string;
  };
  bucketCount: number; 

  cacheTimeoutMinutes: number; 
  excludeFolders: string[];
  excludeTags: string[];
  minNoteAgeDays: number;
  debugMode: boolean;
}

export const DEFAULT_SETTINGS: KnowledgeHeatMapSettings = {
  enabled: false,
  enableOnStartup: false,
  refreshInterval: 0,
  showNotifications: true,
  weights: {
    recency: 40,
    linkDensity: 30,
    visitFreq: 20,
    orphan: 10,
    contentLen: 0,
  },
  activeCriteria: {
    recency: true,
    linkDensity: true,
    visitFreq: true,
    orphan: true,
    contentLen: false,
  },
  timeRange: "all",
  
  palette: "amber",
  customColors: {
    frozen: "#0f2942",
    cold: "#1e5c8a",
    warm: "#d97706",
    hot: "#f59e0b",
    burning: "#ef4444",
  },
  bucketCount: 5,

  cacheTimeoutMinutes: 30,
  excludeFolders: [],
  excludeTags: [],
  minNoteAgeDays: 0,
  debugMode: false,
};
