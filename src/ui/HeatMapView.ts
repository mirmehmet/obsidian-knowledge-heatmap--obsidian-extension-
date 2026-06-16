import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import { D3Renderer, NodeSizeMode } from "../d3/D3Renderer";
import { StatsPanel } from "./StatsPanel";
import { HeatLegend } from "./HeatLegend";
import { NoteAnalyzer } from "../core/NoteAnalyzer";
import { ScoreCalculator } from "../core/ScoreCalculator";
import { BucketSorter } from "../core/BucketSorter";
import { ColorMapper } from "../core/ColorMapper";
import { getStrings } from "../utils/strings";
import { Logger } from "../utils/logger";
import { ExportUtils } from "../utils/ExportUtils";
import type KnowledgeHeatMapPlugin from "../main";

export const VIEW_TYPE_KNOWLEDGE_HEAT_MAP = "knowledge-heat-map";

export class HeatMapView extends ItemView {
  private d3Renderer: D3Renderer | null = null;
  private statsPanel: StatsPanel | null = null;
  private legend: HeatLegend | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private graphContainerEl: HTMLElement;
  private searchQuery = "";
  private filterType = "all";
  private nodeSizeMode: NodeSizeMode = "links";
  private showAllBtn: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, private plugin: KnowledgeHeatMapPlugin) {
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

    // Search Box
    const searchWrapper = sidebar.createEl("div", { cls: "heat-sidebar-search-wrapper" });
    const searchInput = searchWrapper.createEl("input", {
      type: "text",
      placeholder: t.d3SearchPlaceholder,
      cls: "heat-sidebar-search-input"
    }) as HTMLInputElement;
    searchInput.value = this.searchQuery;
    searchInput.addEventListener("input", () => {
      this.searchQuery = searchInput.value;
      if (this.d3Renderer) {
        this.d3Renderer.highlightNodes(this.searchQuery);
      }
    });

    // Filter Dropdown
    const filterWrapper = sidebar.createEl("div", { cls: "heat-sidebar-filter-wrapper" });
    filterWrapper.createEl("label", { text: t.d3FilterLabel, cls: "heat-sidebar-filter-label" });
    const filterSelect = filterWrapper.createEl("select", { cls: "heat-sidebar-filter-select" }) as HTMLSelectElement;
    filterSelect.createEl("option", { value: "all", text: t.d3FilterAll });
    filterSelect.createEl("option", { value: "orphans", text: t.d3FilterOrphans });
    filterSelect.createEl("option", { value: "burning", text: t.d3FilterBurning });
    filterSelect.createEl("option", { value: "cold", text: t.d3FilterCold });
    filterSelect.value = this.filterType;
    filterSelect.addEventListener("change", () => {
      this.filterType = filterSelect.value;
      this.refresh();
    });

    // B3: Node Size Dropdown
    const nodeSizeWrapper = sidebar.createEl("div", { cls: "heat-sidebar-filter-wrapper" });
    nodeSizeWrapper.createEl("label", { text: t.d3NodeSizeLabel, cls: "heat-sidebar-filter-label" });
    const nodeSizeSelect = nodeSizeWrapper.createEl("select", { cls: "heat-sidebar-filter-select" }) as HTMLSelectElement;
    nodeSizeSelect.createEl("option", { value: "links", text: t.d3NodeSizeLinks });
    nodeSizeSelect.createEl("option", { value: "score", text: t.d3NodeSizeScore });
    nodeSizeSelect.createEl("option", { value: "content", text: t.d3NodeSizeContent });
    nodeSizeSelect.createEl("option", { value: "visits", text: t.d3NodeSizeVisits });
    nodeSizeSelect.value = this.nodeSizeMode;
    nodeSizeSelect.addEventListener("change", () => {
      this.nodeSizeMode = nodeSizeSelect.value as NodeSizeMode;
      this.refresh();
    });

    // B4: Show All button (visible when focus mode is active)
    this.showAllBtn = sidebar.createEl("button", {
      text: t.d3ShowAllButton,
      cls: "heat-show-all-btn",
    });
    this.showAllBtn.style.display = "none";
    this.showAllBtn.addEventListener("click", () => {
      if (this.d3Renderer) {
        this.d3Renderer.exitFocusMode();
      }
    });

    // B6: Export buttons
    const exportRow = sidebar.createEl("div", { cls: "heat-sidebar-actions heat-export-row" });
    const exportPngBtn = exportRow.createEl("button", { text: t.d3ExportPng });
    exportPngBtn.addEventListener("click", () => {
      const svg = this.graphContainerEl.querySelector("svg") as SVGSVGElement | null;
      if (svg) ExportUtils.exportAsPng(svg, "knowledge-heat-map.png");
    });
    const exportSvgBtn = exportRow.createEl("button", { text: t.d3ExportSvg });
    exportSvgBtn.addEventListener("click", () => {
      const svg = this.graphContainerEl.querySelector("svg") as SVGSVGElement | null;
      if (svg) ExportUtils.exportAsSvg(svg, "knowledge-heat-map.svg");
    });

    const statsContainer = sidebar.createEl("div", { cls: "heat-view-stats-container" });
    const legendContainer = container.createEl("div", { cls: "heat-view-legend-container" });

    this.d3Renderer = new D3Renderer(this.graphContainerEl, (path) => {
      this.app.workspace.openLinkText(path, "", false);
    });

    // B4: Hook focus mode change to toggle Show All button
    this.d3Renderer.setFocusModeChangeHandler((active) => {
      if (this.showAllBtn) {
        this.showAllBtn.style.display = active ? "block" : "none";
      }
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
        text: `${t.calculatingLabel}... 0%`, 
        cls: "heat-loading-text" 
      });

      const notesData = await noteAnalyzer.analyzeVaultChunked(
        files,
        visitCounts,
        this.plugin.settings.excludeFolders,
        this.plugin.settings.excludeTags,
        (progress) => {
          progressText.setText(`${t.calculatingLabel}... ${progress}%`);
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

      // Apply sidebar quick filters
      if (this.filterType === "orphans") {
        filteredNotes = filteredNotes.filter(note => note.inlinks + note.outlinks === 0);
      } else if (this.filterType === "burning") {
        filteredNotes = filteredNotes.filter(note => (scores[note.path] ?? 0) >= 0.8);
      } else if (this.filterType === "cold") {
        filteredNotes = filteredNotes.filter(note => (scores[note.path] ?? 0) < 0.4);
      }

      const filteredScores: Record<string, number> = {};
      filteredNotes.forEach(note => {
        filteredScores[note.path] = scores[note.path];
      });

      const buckets = BucketSorter.sort(filteredScores);
      const resolvedLinks = this.app.metadataCache.resolvedLinks;

      const paletteColors = this.plugin.settings.palette === "custom"
        ? this.plugin.settings.customColors
        : ColorMapper.getPaletteColors(this.plugin.settings.palette);

      if (this.d3Renderer) {
        this.d3Renderer.render(
          filteredNotes,
          scores,
          resolvedLinks,
          paletteColors,
          this.nodeSizeMode
        );
        this.d3Renderer.highlightNodes(this.searchQuery);
      }

      if (this.statsPanel) {
        this.statsPanel.render(filteredNotes, scores, buckets);
      }

      if (this.legend) {
        this.legend.render();
      }
    } catch (err) {
      Logger.error("Error rendering D3 custom view", err);
      new Notice(t.heatMapFailed);
    }
  }

  // A6+B4: Focus on a specific file (called from context menu)
  public focusOnFile(path: string): void {
    if (this.d3Renderer) {
      this.d3Renderer.focusOnNode(path);
    }
  }
}
