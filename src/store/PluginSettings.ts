import { Weights } from "../core/types";
import type { HeatSnapshot } from "./HistoryManager";

export interface CustomPreset {
  name: string;
  weights: Weights;
  activeCriteria: Record<string, boolean>;
  timeRange: string;
}

export interface KnowledgeHeatMapSettings {
  enabled: boolean;
  enableOnStartup: boolean;
  refreshInterval: number; 
  showNotifications: boolean;
  weights: Weights;
  activeCriteria: Record<string, boolean>;
  timeRange: string; 
  
  palette: "amber" | "ocean" | "forest" | "sunset" | "monochrome" | "neon" | "custom";
  customColors: {
    frozen: string;
    cold: string;
    warm: string;
    hot: string;
    burning: string;
  };

  cacheTimeoutMinutes: number; 
  excludeFolders: string[];
  excludeTags: string[];
  minNoteAgeDays: number;
  debugMode: boolean;

  // B5: Score history for trend tracking
  scoreHistory: Record<string, { score: number; timestamp: number }[]>;

  // C4: Weekly Digest
  weeklyDigestEnabled: boolean;
  lastDigestDate: string;

  // C6: Time Travel
  enableHistory: boolean;
  maxSnapshots: number;
  heatSnapshots: HeatSnapshot[];

  // F4: Custom presets
  customPresets: CustomPreset[];

  // F5: What's New modal
  lastSeenVersion: string;
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

  cacheTimeoutMinutes: 30,
  excludeFolders: [],
  excludeTags: [],
  minNoteAgeDays: 0,
  debugMode: false,

  // B5: Score history
  scoreHistory: {},

  // C4: Weekly Digest
  weeklyDigestEnabled: true,
  lastDigestDate: "",

  // C6: Time Travel
  enableHistory: true,
  maxSnapshots: 90,
  heatSnapshots: [],

  // F4: Custom presets
  customPresets: [],

  // F5: What's New modal
  lastSeenVersion: "",
};
