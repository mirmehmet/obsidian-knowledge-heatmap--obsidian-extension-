import { App, ButtonComponent, ExtraButtonComponent, SliderComponent, ToggleComponent } from "obsidian";
import { Weights } from "../core/types";
import { getStrings } from "../utils/strings";

export class HeatSidePanel {
  private panelEl: HTMLElement | null = null;
  private overlayEl: HTMLElement | null = null;
  private isOpen = false;

  constructor(
    private app: App,
    private container: HTMLElement,
    private settings: {
      enabled: boolean;
      weights: Weights;
      timeRange: string;
      activeCriteria: Record<string, boolean>;
    },
    private callbacks: {
      onToggle: (enabled: boolean) => void;
      onSettingsChange: () => void;
      onRestore: () => void;
      onOpenHeatView: () => void;
    }
  ) {}

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.render();
    
    setTimeout(() => {
      if (this.panelEl) this.panelEl.classList.add("is-open");
      if (this.overlayEl) this.overlayEl.classList.add("is-open");
    }, 10);
  }

  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.panelEl) this.panelEl.classList.remove("is-open");
    if (this.overlayEl) this.overlayEl.classList.remove("is-open");

    setTimeout(() => {
      if (this.panelEl) {
        this.panelEl.remove();
        this.panelEl = null;
      }
      if (this.overlayEl) {
        this.overlayEl.remove();
        this.overlayEl = null;
      }
    }, 300);
  }

  private render(): void {
    const t = getStrings();
    this.overlayEl = document.createElement("div");
    this.overlayEl.classList.add("heat-panel-overlay");
    this.overlayEl.addEventListener("click", () => this.close());
    this.container.appendChild(this.overlayEl);

    this.panelEl = document.createElement("div");
    this.panelEl.classList.add("heat-side-panel");

    const header = this.panelEl.createEl("div", { cls: "heat-panel-header" });
    header.createEl("h3", { text: t.panelTitle });
    
    new ExtraButtonComponent(header)
      .setIcon("cross")
      .setTooltip(t.legendCold === "❄️ Soğuk" ? "Kapat" : "Close")
      .onClick(() => this.close());

    const content = this.panelEl.createEl("div", { cls: "heat-panel-content" });

    const toggleContainer = content.createEl("div", { cls: "heat-toggle-container" });
    toggleContainer.createEl("span", { text: t.panelToggleLabel });
    new ToggleComponent(toggleContainer)
      .setValue(this.settings.enabled)
      .onChange((val) => {
        this.settings.enabled = val;
        this.callbacks.onToggle(val);
        this.renderContent(content);
      });

    this.renderContent(content);

    this.container.appendChild(this.panelEl);
  }

  private renderContent(contentEl: HTMLElement): void {
    const t = getStrings();
    const existingSection = contentEl.querySelector(".heat-panel-dynamic-section");
    if (existingSection) existingSection.remove();

    const dynamicSection = contentEl.createEl("div", { cls: "heat-panel-dynamic-section" });
    
    if (!this.settings.enabled) {
      dynamicSection.createEl("div", { 
        cls: "heat-panel-info-message", 
        text: t.panelToggleOffInfo
      });
      return;
    }

    dynamicSection.createEl("h4", { text: t.panelPresetsHeader });
    const presetsDiv = dynamicSection.createEl("div", { cls: "heat-presets-row" });
    
    new ButtonComponent(presetsDiv)
      .setButtonText(t.panelPresetBalanced)
      .setTooltip(t.panelPresetBalancedTooltip)
      .onClick(() => {
        this.applyPreset({ recency: 40, linkDensity: 30, visitFreq: 20, orphan: 10, contentLen: 0 });
      });

    new ButtonComponent(presetsDiv)
      .setButtonText(t.panelPresetRecency)
      .setTooltip(t.panelPresetRecencyTooltip)
      .onClick(() => {
        this.applyPreset({ recency: 80, linkDensity: 10, visitFreq: 10, orphan: 0, contentLen: 0 });
      });

    new ButtonComponent(presetsDiv)
      .setButtonText(t.panelPresetNetwork)
      .setTooltip(t.panelPresetNetworkTooltip)
      .onClick(() => {
        this.applyPreset({ recency: 10, linkDensity: 50, visitFreq: 10, orphan: 30, contentLen: 0 });
      });

    dynamicSection.createEl("h4", { text: t.panelCriteriaHeader });
    
    const criteriaList = [
      { id: "recency", name: t.criterionRecency },
      { id: "linkDensity", name: t.criterionLinkDensity },
      { id: "visitFreq", name: t.criterionVisitFreq },
      { id: "orphan", name: t.criterionOrphan },
      { id: "contentLen", name: t.criterionContentLen },
    ];

    criteriaList.forEach((c) => {
      const key = c.id as keyof Weights;
      const row = dynamicSection.createEl("div", { cls: "heat-criteria-row" });
      
      const headerRow = row.createEl("div", { cls: "heat-criteria-header-row" });
      const label = headerRow.createEl("label");
      
      const checkbox = label.createEl("input", { type: "checkbox" }) as HTMLInputElement;
      checkbox.checked = this.settings.activeCriteria[c.id] ?? true;
      label.appendChild(document.createTextNode(" " + c.name));

      const weightSpan = headerRow.createEl("span", { 
        cls: "heat-weight-percentage", 
        text: checkbox.checked ? `[${this.settings.weights[key]}%]` : t.panelWeightDisabled 
      });

      const sliderContainer = row.createEl("div", { cls: "heat-slider-container" });
      const slider = new SliderComponent(sliderContainer)
        .setLimits(0, 100, 5)
        .setValue(this.settings.weights[key])
        .setDisabled(!checkbox.checked)
        .onChange((val) => {
          this.settings.weights[key] = val;
          weightSpan.setText(`[${val}%]`);
          this.callbacks.onSettingsChange();
        });

      checkbox.addEventListener("change", () => {
        const isChecked = checkbox.checked;
        this.settings.activeCriteria[c.id] = isChecked;
        slider.setDisabled(!isChecked);
        
        if (!isChecked) {
          weightSpan.setText(t.panelWeightDisabled);
        } else {
          weightSpan.setText(`[${this.settings.weights[key]}%]`);
        }
        this.callbacks.onSettingsChange();
      });
    });

    dynamicSection.createEl("h4", { text: t.panelTimeRangeHeader });
    const timeRangeDiv = dynamicSection.createEl("div", { cls: "heat-time-range-row" });
    const ranges = [
      { id: "all", name: t.timeRangeAll },
      { id: "90d", name: t.timeRange90d },
      { id: "30d", name: t.timeRange30d },
      { id: "7d", name: t.timeRange7d },
    ];
    
    ranges.forEach((r) => {
      const label = timeRangeDiv.createEl("label", { cls: "heat-radio-label" });
      const radio = label.createEl("input", { 
        type: "radio", 
        name: "heat-time-range", 
        value: r.id 
      }) as HTMLInputElement;
      radio.checked = this.settings.timeRange === r.id;
      label.appendChild(document.createTextNode(" " + r.name));

      radio.addEventListener("change", () => {
        if (radio.checked) {
          this.settings.timeRange = r.id;
          this.callbacks.onSettingsChange();
        }
      });
    });

    const footerDiv = dynamicSection.createEl("div", { cls: "heat-panel-footer-actions" });
    
    new ButtonComponent(footerDiv)
      .setButtonText(t.panelRestoreButton)
      .onClick(() => {
        this.callbacks.onRestore();
        this.close();
      });

    const openViewBtn = new ButtonComponent(footerDiv)
      .setButtonText(t.panelOpenViewButton)
      .setCta();
    openViewBtn.buttonEl.addEventListener("click", () => {
      this.callbacks.onOpenHeatView();
      this.close();
    });
  }

  private applyPreset(newWeights: Weights): void {
    Object.assign(this.settings.weights, newWeights);
    Object.keys(newWeights).forEach((key) => {
      const wKey = key as keyof Weights;
      this.settings.activeCriteria[key] = newWeights[wKey] > 0;
    });

    this.callbacks.onSettingsChange();
    
    if (this.panelEl) {
      const content = this.panelEl.querySelector(".heat-panel-content") as HTMLElement;
      if (content) this.renderContent(content);
    }
  }
}
