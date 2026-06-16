import { Plugin, TFile, Notice, WorkspaceLeaf } from "obsidian";
import { NoteAnalyzer } from "./core/NoteAnalyzer";
import { ScoreCalculator } from "./core/ScoreCalculator";
import { BucketSorter } from "./core/BucketSorter";
import { HeatCache } from "./store/HeatCache";
import { VisitTracker } from "./store/VisitTracker";
import { GraphJsonManager } from "./graph/GraphJsonManager";
import { GraphReloader } from "./graph/GraphReloader";
import { HeatControlButton } from "./ui/HeatControlButton";
import { HeatSidePanel } from "./ui/HeatSidePanel";
import { SettingsTab } from "./ui/SettingsTab";
import { DEFAULT_SETTINGS, KnowledgeHeatMapSettings } from "./store/PluginSettings";
import { HeatMapView, VIEW_TYPE_KNOWLEDGE_HEAT_MAP } from "./ui/HeatMapView";
import { getStrings } from "./utils/strings";

export default class KnowledgeHeatMapPlugin extends Plugin {
  public settings: KnowledgeHeatMapSettings;
  public cache: HeatCache;
  public visitTracker: VisitTracker;
  public graphJsonManager: GraphJsonManager;
  
  private controlButton: HeatControlButton;
  private isApplying = false;
  private debounceTimeout: any = null;
  private refreshIntervalId: any = null;

  async onload() {
    const t = getStrings();
    console.log(t.pluginLoading);

    await this.loadSettings();

    this.cache = new HeatCache(this.settings.cacheTimeoutMinutes);
    this.visitTracker = new VisitTracker(this.app, this);
    this.graphJsonManager = new GraphJsonManager(this.app);

    await this.visitTracker.load();
    this.visitTracker.register();

    this.registerView(
      VIEW_TYPE_KNOWLEDGE_HEAT_MAP,
      (leaf) => new HeatMapView(leaf, this)
    );

    this.addRibbonIcon("fire", t.d3ViewTitle, () => {
      this.activateView();
    });

    this.controlButton = new HeatControlButton(this.app, this, (leaf) => this.togglePanel(leaf));

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.controlButton.injectButtons(this.settings.enabled);
      })
    );

    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file instanceof TFile && file.extension === "md") {
          this.cache.invalidate(file.path);
          if (this.settings.enabled) {
            this.debouncedApply();
          }
          this.refreshD3View();
        }
      })
    );

    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (file instanceof TFile) {
          this.cache.invalidate(file.path);
          if (this.settings.enabled) {
            this.debouncedApply();
          }
          this.refreshD3View();
        }
      })
    );

    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof TFile) {
          this.cache.invalidate(oldPath);
          this.cache.invalidate(file.path);
          if (this.settings.enabled) {
            this.debouncedApply();
          }
          this.refreshD3View();
        }
      })
    );

    this.addCommand({
      id: "apply-heat-map",
      name: "Apply Heat Map to Graph View",
      callback: async () => {
        this.settings.enabled = true;
        await this.saveSettings();
        this.controlButton.updateAllButtonsState(true);
        await this.applyHeatMap();
      },
    });

    this.addCommand({
      id: "restore-graph-view",
      name: "Restore Graph View",
      callback: async () => {
        this.settings.enabled = false;
        await this.saveSettings();
        this.controlButton.updateAllButtonsState(false);
        await this.restoreGraphView();
      },
    });

    this.addCommand({
      id: "refresh-heat-map",
      name: "Refresh Heat Map",
      callback: async () => {
        this.cache.invalidateAll();
        if (this.settings.enabled) {
          await this.applyHeatMap();
        } else {
          new Notice(t.heatMapNotActive);
        }
        this.refreshD3View();
      },
    });

    this.addCommand({
      id: "open-heat-map-view",
      name: "Open Heat Map View",
      callback: () => this.activateView(),
    });

    this.addSettingTab(new SettingsTab(this.app, this));

    this.setupRefreshInterval();

    this.app.workspace.onLayoutReady(async () => {
      if (this.settings.enableOnStartup) {
        this.settings.enabled = true;
        await this.saveSettings();
        this.controlButton.injectButtons(true);
        await this.applyHeatMap();
      } else {
        this.settings.enabled = false;
        await this.saveSettings();
        this.controlButton.injectButtons(false);
        await this.restoreGraphView();
      }
    });
  }

  async onunload() {
    const t = getStrings();
    console.log(t.pluginUnloading);

    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    if (this.refreshIntervalId) clearInterval(this.refreshIntervalId);

    this.controlButton.removeButtons();

    await this.graphJsonManager.restore();
    await GraphReloader.reload(this.app, false);

    this.app.workspace.getLeavesOfType(VIEW_TYPE_KNOWLEDGE_HEAT_MAP).forEach((leaf) => {
      leaf.detach();
    });
  }

  async loadSettings() {
    const loadedData = await this.loadData();
    if (loadedData) {
      delete loadedData.visits;
    }
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
  }

  async saveSettings() {
    const currentData = await this.loadData();
    const dataToSave = Object.assign({}, currentData, this.settings);
    await this.saveData(dataToSave);
  }

  public setupRefreshInterval(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }

    if (this.settings.refreshInterval > 0) {
      this.refreshIntervalId = setInterval(async () => {
        if (this.settings.enabled) {
          await this.applyHeatMap();
        }
        this.refreshD3View();
      }, this.settings.refreshInterval * 60 * 1000);
    }
  }

  public debouncedApply(): void {
    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.debounceTimeout = null;
      if (this.settings.enabled) {
        this.applyHeatMap();
      }
    }, 500);
  }

  public async applyHeatMap(): Promise<void> {
    const t = getStrings();
    if (this.isApplying) return;
    this.isApplying = true;

    try {
      if (this.settings.debugMode) console.log("KnowledgeHeatMap: Starting vault analysis...");
      
      const files = this.app.vault.getMarkdownFiles();
      if (files.length === 0) {
        if (this.settings.showNotifications) {
          new Notice(t.noMarkdownNotes);
        }
        return;
      }
      const visitCounts = this.visitTracker.getVisits();
      
      const noteAnalyzer = new NoteAnalyzer(this.app);
      
      let progressNotice: Notice | null = null;
      if (this.settings.showNotifications) {
        progressNotice = new Notice(`${t.legendCold === "❄️ Soğuk" ? "Isı haritası hesaplanıyor" : "Calculating heat map"}... 0%`, 0);
      }

      const notesData = await noteAnalyzer.analyzeVaultChunked(
        files,
        visitCounts,
        this.settings.excludeFolders,
        this.settings.excludeTags,
        (progress) => {
          if (progressNotice) {
            progressNotice.setMessage(`${t.legendCold === "❄️ Soğuk" ? "Isı haritası hesaplanıyor" : "Calculating heat map"}... ${progress}%`);
          }
        }
      );

      if (progressNotice) {
        progressNotice.hide();
      }

      let filteredNotes = notesData;
      if (this.settings.minNoteAgeDays > 0) {
        filteredNotes = notesData.filter(note => note.daysSinceModified >= this.settings.minNoteAgeDays);
      }

      if (filteredNotes.length === 0) {
        if (this.settings.showNotifications) {
          new Notice(t.noNotesAfterFilter);
        }
        await this.restoreGraphView();
        return;
      }

      const scores: Record<string, number> = {};
      filteredNotes.forEach(note => {
        let score = this.cache.get(note.path);
        if (score === null) {
          score = ScoreCalculator.calculate(note, this.settings.weights, this.settings.activeCriteria, this.settings.timeRange);
          this.cache.set(note.path, score);
        }
        scores[note.path] = score;
      });

      const buckets = BucketSorter.sort(scores);

      await this.graphJsonManager.applyHeatGroups(
        buckets,
        this.settings.palette === "custom" ? this.settings.customColors : undefined
      );

      const reloaded = await GraphReloader.reload(this.app, this.settings.showNotifications);
      
      if (reloaded && this.settings.showNotifications) {
        new Notice(t.heatMapApplied);
      }
    } catch (err) {
      console.error("KnowledgeHeatMap: Error applying heat map", err);
      new Notice(t.heatMapFailed);
      await this.graphJsonManager.restore();
    } finally {
      this.isApplying = false;
    }
  }

  public async restoreGraphView(): Promise<void> {
    const t = getStrings();
    try {
      await this.graphJsonManager.restore();
      await GraphReloader.reload(this.app, false);
      if (this.settings.showNotifications) {
        new Notice(t.restoreSuccess);
      }
    } catch (err) {
      console.error("KnowledgeHeatMap: Error restoring graph view", err);
      new Notice(t.restoreFailed);
    }
  }

  public async activateView(): Promise<void> {
    const { workspace } = this.app;
    
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_KNOWLEDGE_HEAT_MAP)[0];
    
    if (!leaf) {
      leaf = workspace.getLeaf(true);
      await leaf.setViewState({
        type: VIEW_TYPE_KNOWLEDGE_HEAT_MAP,
        active: true,
      });
    }
    
    workspace.revealLeaf(leaf);
  }

  public refreshD3View(): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_KNOWLEDGE_HEAT_MAP);
    leaves.forEach((leaf) => {
      if (leaf.view instanceof HeatMapView) {
        leaf.view.refresh();
      }
    });
  }

  private togglePanel(leaf: WorkspaceLeaf): void {
    const container = leaf.view.containerEl;
    if (!container) return;

    const panel = new HeatSidePanel(
      this.app,
      container,
      this.settings,
      {
        onToggle: async (enabled) => {
          this.settings.enabled = enabled;
          await this.saveSettings();
          this.controlButton.updateAllButtonsState(enabled);
          if (enabled) {
            await this.applyHeatMap();
          } else {
            await this.restoreGraphView();
          }
        },
        onSettingsChange: async () => {
          this.cache.invalidateAll();
          await this.saveSettings();
          if (this.settings.enabled) {
            this.debouncedApply();
          }
          this.refreshD3View();
        },
        onRestore: async () => {
          this.settings.enabled = false;
          await this.saveSettings();
          this.controlButton.updateAllButtonsState(false);
          await this.restoreGraphView();
          this.refreshD3View();
        },
        onOpenHeatView: () => {
          this.activateView();
        }
      }
    );
    panel.toggle();
  }
}
