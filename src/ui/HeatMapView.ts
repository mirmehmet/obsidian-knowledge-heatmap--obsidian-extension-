import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import { D3Renderer } from "../d3/D3Renderer";
import { StatsPanel } from "./StatsPanel";
import { HeatLegend } from "./HeatLegend";
import { NoteAnalyzer } from "../core/NoteAnalyzer";
import { ScoreCalculator } from "../core/ScoreCalculator";
import { BucketSorter } from "../core/BucketSorter";
import { getStrings } from "../utils/strings";

export const VIEW_TYPE_KNOWLEDGE_HEAT_MAP = "knowledge-heat-map";

export class HeatMapView extends ItemView {
  private d3Renderer: D3Renderer | null = null;
  private statsPanel: StatsPanel | null = null;
  private legend: HeatLegend | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private graphContainerEl: HTMLElement;

  constructor(leaf: WorkspaceLeaf, private plugin: any) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_KNOWLEDGE_HEAT_MAP;
  }

  getDisplayText(): string {
    return getStrings().d3ViewTitle;
  }

  getIcon(): string {
    return "fire";
  }

  async onOpen() {
    const t = getStrings();
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.classList.add("heat-map-view-container");

    const mainArea = container.createEl("div", { cls: "heat-view-main" });
    this.graphContainerEl = mainArea.createEl("div", { cls: "heat-view-graph-container" });
    
    const sidebar = mainArea.createEl("div", { cls: "heat-view-sidebar" });
    
    const actionsRow = sidebar.createEl("div", { cls: "heat-sidebar-actions" });
    
    const refreshBtn = actionsRow.createEl("button", { text: t.d3RefreshButton, cls: "mod-cta" });
    refreshBtn.setAttribute("aria-label", t.d3RefreshButton);
    refreshBtn.addEventListener("click", () => this.refresh());

    const settingsBtn = actionsRow.createEl("button", { text: t.d3SettingsButton });
    settingsBtn.setAttribute("aria-label", t.d3SettingsButton);
    settingsBtn.addEventListener("click", () => {
      (this.app as any).setting?.open();
      (this.app as any).setting?.openTabById(this.plugin.manifest.id);
    });

    const statsContainer = sidebar.createEl("div", { cls: "heat-view-stats-container" });
    const legendContainer = container.createEl("div", { cls: "heat-view-legend-container" });

    this.d3Renderer = new D3Renderer(this.graphContainerEl, (path) => {
      this.app.workspace.openLinkText(path, "", false);
    });

    this.statsPanel = new StatsPanel(statsContainer, this.plugin.settings.customColors);
    this.legend = new HeatLegend(legendContainer, this.plugin.settings.customColors);

    await this.refresh();

    this.resizeObserver = new ResizeObserver(() => {
      if (this.d3Renderer) {
        const rect = this.graphContainerEl.getBoundingClientRect();
        this.d3Renderer.resize(rect.width, rect.height);
      }
    });
    this.resizeObserver.observe(this.graphContainerEl);
  }

  async onClose() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.d3Renderer) {
      this.d3Renderer.destroy();
      this.d3Renderer = null;
    }
  }

  public async refresh(): Promise<void> {
    const t = getStrings();
    try {
      const files = this.app.vault.getMarkdownFiles();
      if (files.length === 0) {
        new Notice(t.noMarkdownNotes);
        return;
      }
      const visitCounts = this.plugin.visitTracker.getVisits();
      
      const noteAnalyzer = new NoteAnalyzer(this.app);
      
      // Create loading indicator overlay
      const loadingEl = this.graphContainerEl.createEl("div", { cls: "heat-loading-container" });
      loadingEl.createEl("div", { cls: "heat-loading-spinner" });
      const progressText = loadingEl.createEl("div", { 
        text: `${t.legendCold === "❄️ Soğuk" ? "Hesaplanıyor" : "Calculating"}... 0%`, 
        cls: "heat-loading-text" 
      });

      const notesData = await noteAnalyzer.analyzeVaultChunked(
        files,
        visitCounts,
        this.plugin.settings.excludeFolders,
        this.plugin.settings.excludeTags,
        (progress) => {
          progressText.setText(`${t.legendCold === "❄️ Soğuk" ? "Hesaplanıyor" : "Calculating"}... ${progress}%`);
        }
      );

      // Remove loading indicator overlay
      loadingEl.remove();

      let filteredNotes = notesData;
      if (this.plugin.settings.minNoteAgeDays > 0) {
        filteredNotes = notesData.filter(note => note.daysSinceModified >= this.plugin.settings.minNoteAgeDays);
      }

      if (filteredNotes.length === 0) {
        new Notice(t.noNotesAfterFilter);
        if (this.d3Renderer) {
          this.d3Renderer.render([], {}, {});
        }
        if (this.statsPanel) {
          this.statsPanel.render([], {}, { frozen: [], cold: [], warm: [], hot: [], burning: [] });
        }
        return;
      }

      const scores: Record<string, number> = {};
      filteredNotes.forEach(note => {
        let score = this.plugin.cache.get(note.path);
        if (score === null) {
          score = ScoreCalculator.calculate(note, this.plugin.settings.weights, this.plugin.settings.activeCriteria, this.plugin.settings.timeRange);
          this.plugin.cache.set(note.path, score);
        }
        scores[note.path] = score;
      });

      const buckets = BucketSorter.sort(scores);
      const resolvedLinks = this.app.metadataCache.resolvedLinks;

      if (this.d3Renderer) {
        this.d3Renderer.render(
          filteredNotes,
          scores,
          resolvedLinks,
          this.plugin.settings.palette === "custom" ? this.plugin.settings.customColors : undefined
        );
      }

      if (this.statsPanel) {
        this.statsPanel.render(filteredNotes, scores, buckets);
      }

      if (this.legend) {
        this.legend.render();
      }
    } catch (err) {
      console.error("KnowledgeHeatMap: Error rendering D3 custom view", err);
      new Notice(t.heatMapFailed);
    }
  }
}
