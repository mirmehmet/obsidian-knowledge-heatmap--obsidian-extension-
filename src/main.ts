import { Plugin, TFile, Notice, WorkspaceLeaf, Menu } from "obsidian";
import { NoteAnalyzer } from "./core/NoteAnalyzer";
import { ScoreCalculator } from "./core/ScoreCalculator";
import { BucketSorter } from "./core/BucketSorter";
import { ColorMapper } from "./core/ColorMapper";
import { HeatCache } from "./store/HeatCache";
import { VisitTracker } from "./store/VisitTracker";
import { GraphJsonManager } from "./graph/GraphJsonManager";
import { GraphReloader } from "./graph/GraphReloader";
import { HeatControlButton } from "./ui/HeatControlButton";
import { HeatSidePanel } from "./ui/HeatSidePanel";
import { SettingsTab } from "./ui/SettingsTab";
import { DEFAULT_SETTINGS, KnowledgeHeatMapSettings } from "./store/PluginSettings";
import { HeatMapView, VIEW_TYPE_KNOWLEDGE_HEAT_MAP } from "./ui/HeatMapView";
import { DigestService } from "./store/DigestService";
import { HistoryManager } from "./store/HistoryManager";
import { getStrings } from "./utils/strings";
import { Logger } from "./utils/logger";
import { WhatsNewModal } from "./ui/WhatsNewModal";

export default class KnowledgeHeatMapPlugin extends Plugin {
  public settings: KnowledgeHeatMapSettings;
  public cache: HeatCache;
  public visitTracker: VisitTracker;
  public graphJsonManager: GraphJsonManager;
  
  private controlButton: HeatControlButton;
  private sidePanel: HeatSidePanel | null = null;
  private statusBarEl: HTMLElement | null = null;
  private isApplying = false;
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;

  async onload() {
    const t = getStrings();
    Logger.setDebugMode(this.settings?.debugMode ?? false);
    Logger.info(t.pluginLoading);

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

    this.controlButton = new HeatControlButton(this.app, (leaf) => this.togglePanel(leaf));

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.controlButton.injectButtons(this.settings.enabled);
      })
    );

    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file instanceof TFile && file.extension === "md") {
          this.cache.invalidate(file.path);
          this.debouncedApplyAndRefresh();
        }
      })
    );

    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (file instanceof TFile) {
          this.cache.invalidate(file.path);
          // D7: Clean up history for deleted files
          delete this.settings.scoreHistory[file.path];
          this.debouncedApplyAndRefresh();
        }
      })
    );

    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof TFile) {
          this.cache.invalidate(oldPath);
          this.cache.invalidate(file.path);
          // D7: Migrate history on rename
          if (this.settings.scoreHistory[oldPath]) {
            this.settings.scoreHistory[file.path] = this.settings.scoreHistory[oldPath];
            delete this.settings.scoreHistory[oldPath];
          }
          this.debouncedApplyAndRefresh();
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

    // A7: Status bar score indicator
    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.setText("");
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.updateStatusBar();
      })
    );

    // A6: Context menu integration
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu: Menu, file) => {
        if (file instanceof TFile && file.extension === "md") {
          menu.addItem((item) => {
            item
              .setTitle(t.contextMenuShowScore)
              .setIcon("thermometer")
              .onClick(async () => {
                const score = await this.getScoreForFile(file);
                if (score !== null) {
                  const bucket = ColorMapper.getBucketName(score);
                  new Notice(`🌡 ${file.basename}: ${score.toFixed(2)} (${bucket.toUpperCase()})`, 5000);
                } else {
                  new Notice(`⚠️ ${file.basename}: ${t.scoreNotAvailable}`, 3000);
                }
              });
          });
          menu.addItem((item) => {
            item
              .setTitle(t.contextMenuShowInView)
              .setIcon("fire")
              .onClick(async () => {
                await this.activateView();
                // D5: Type-safe view access
                setTimeout(() => {
                  const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_KNOWLEDGE_HEAT_MAP);
                  for (const leaf of leaves) {
                    if (leaf.view instanceof HeatMapView) {
                      leaf.view.focusOnFile(file.path);
                    }
                  }
                }, 500);
              });
          });
        }
      })
    );

    this.setupRefreshInterval();

    // A2: Fixed — no longer calls restoreGraphView() when enableOnStartup is false
    this.app.workspace.onLayoutReady(async () => {
      Logger.setDebugMode(this.settings.debugMode);
      if (this.settings.enableOnStartup) {
        this.settings.enabled = true;
        await this.saveSettings();
        this.controlButton.injectButtons(true);
        await this.applyHeatMap();
      } else {
        this.controlButton.injectButtons(false);
      }
      this.updateStatusBar();

      // C4: Weekly Digest check
      DigestService.checkAndShow(this.settings, () => this.saveSettings());

      // F5: "What's New" modal check
      const currentVersion = this.manifest.version;
      if (this.settings.lastSeenVersion !== currentVersion) {
        new WhatsNewModal(this.app).open();
        this.settings.lastSeenVersion = currentVersion;
        await this.saveSettings();
      }
    });
  }

  async onunload() {
    const t = getStrings();
    Logger.info(t.pluginUnloading);

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

  // D8: Combined debounce for both graph apply and D3 view refresh
  private debouncedApplyAndRefresh(): void {
    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.debounceTimeout = null;
      if (this.settings.enabled) {
        this.applyHeatMap();
      }
      this.refreshD3View();
    }, 500);
  }

  public async applyHeatMap(): Promise<void> {
    const t = getStrings();
    if (this.isApplying) return;
    this.isApplying = true;

    try {
      Logger.debug("Starting vault analysis...");
      
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
        progressNotice = new Notice(`${t.calculatingLabel}... 0%`, 0);
      }

      const notesData = await noteAnalyzer.analyzeVaultChunked(
        files,
        visitCounts,
        this.settings.excludeFolders,
        this.settings.excludeTags,
        (progress) => {
          if (progressNotice) {
            progressNotice.setMessage(`${t.calculatingLabel}... ${progress}%`);
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

      const paletteColors = this.settings.palette === "custom"
        ? this.settings.customColors
        : ColorMapper.getPaletteColors(this.settings.palette);

      await this.graphJsonManager.applyHeatGroups(
        buckets,
        paletteColors
      );

      const reloaded = await GraphReloader.reload(this.app, this.settings.showNotifications);
      
      if (reloaded && this.settings.showNotifications) {
        new Notice(t.heatMapApplied);
      }

      // B5: Save score snapshot for trend tracking
      this.saveScoreHistory(scores);

      // C6: Save heat snapshot for time travel
      if (this.settings.enableHistory) {
        HistoryManager.saveSnapshot(
          this.settings.heatSnapshots,
          scores,
          buckets,
          this.settings.maxSnapshots
        );
      }

      this.updateStatusBar();
    } catch (err) {
      Logger.error("Error applying heat map", err);
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
      Logger.error("Error restoring graph view", err);
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

  // A3: Singleton side panel — prevents duplicate panel creation
  private togglePanel(leaf: WorkspaceLeaf): void {
    const container = leaf.view.containerEl;
    if (!container) return;

    // If panel already exists and is for this container, just toggle it
    if (this.sidePanel) {
      this.sidePanel.toggle();
      return;
    }

    this.sidePanel = new HeatSidePanel(
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
          this.updateStatusBar();
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
          this.updateStatusBar();
        },
        onOpenHeatView: () => {
          this.activateView();
        },
        onClose: () => {
          this.sidePanel = null;
        }
      }
    );
    this.sidePanel.toggle();
  }

  // A7: Status bar update logic
  private updateStatusBar(): void {
    if (!this.statusBarEl) return;
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile || activeFile.extension !== "md") {
      this.statusBarEl.setText("");
      return;
    }
    const score = this.cache.get(activeFile.path);
    if (score !== null) {
      const bucket = ColorMapper.getBucketName(score);
      const icons: Record<string, string> = {
        frozen: "❄️", cold: "🔵", warm: "🟡", hot: "🟠", burning: "🔴"
      };
      this.statusBarEl.setText(`${icons[bucket] || "🌡"} ${score.toFixed(2)} (${bucket})`);
    } else {
      this.statusBarEl.setText("🌡 --");
    }
  }

  // A6: Calculate score for a specific file
  private async getScoreForFile(file: TFile): Promise<number | null> {
    const cached = this.cache.get(file.path);
    if (cached !== null) return cached;

    try {
      const resolvedLinks = this.app.metadataCache?.resolvedLinks || {};
      const inlinkCounts = NoteAnalyzer.computeAllInlinks(resolvedLinks);
      const visitCounts = this.visitTracker.getVisits();
      const noteAnalyzer = new NoteAnalyzer(this.app);
      const noteData = noteAnalyzer.collectNoteData(file, inlinkCounts, visitCounts);
      const score = ScoreCalculator.calculate(
        noteData,
        this.settings.weights,
        this.settings.activeCriteria,
        this.settings.timeRange
      );
      this.cache.set(file.path, score);
      return score;
    } catch (err) {
      Logger.error("Error calculating score for file", file.path, err);
      return null;
    }
  }

  // B5+D7: Save current scores to history for trend tracking (capped)
  private async saveScoreHistory(scores: Record<string, number>): Promise<void> {
    const now = Date.now();
    const MAX_HISTORY_PER_NOTE = 30;
    const MAX_TRACKED_NOTES = 500;

    for (const [path, score] of Object.entries(scores)) {
      if (!this.settings.scoreHistory[path]) {
        this.settings.scoreHistory[path] = [];
      }
      this.settings.scoreHistory[path].push({ score, timestamp: now });

      // Cap history per note
      if (this.settings.scoreHistory[path].length > MAX_HISTORY_PER_NOTE) {
        this.settings.scoreHistory[path] = this.settings.scoreHistory[path].slice(-MAX_HISTORY_PER_NOTE);
      }
    }

    // D7: Cap total tracked notes — prune least recently updated
    const historyKeys = Object.keys(this.settings.scoreHistory);
    if (historyKeys.length > MAX_TRACKED_NOTES) {
      const sorted = historyKeys
        .map(k => ({ key: k, lastTs: this.settings.scoreHistory[k].at(-1)?.timestamp ?? 0 }))
        .sort((a, b) => b.lastTs - a.lastTs);
      const toKeep = new Set(sorted.slice(0, MAX_TRACKED_NOTES).map(e => e.key));
      for (const key of historyKeys) {
        if (!toKeep.has(key)) {
          delete this.settings.scoreHistory[key];
        }
      }
    }

    await this.saveSettings();
  }

  // B5: Calculate trend for a note based on score history
  public getTrend(path: string, currentScore: number): "up" | "down" | "stable" {
    const history = this.settings.scoreHistory[path];
    if (!history || history.length < 2) return "stable";

    const previousEntries = history.slice(0, -1);
    const avgPrevious = previousEntries.reduce((sum, e) => sum + e.score, 0) / previousEntries.length;
    const diff = currentScore - avgPrevious;

    if (diff > 0.05) return "up";
    if (diff < -0.05) return "down";
    return "stable";
  }
}
