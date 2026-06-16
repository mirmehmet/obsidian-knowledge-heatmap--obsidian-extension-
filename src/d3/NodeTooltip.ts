import { HeatNode } from "./D3Types";
import { ColorMapper } from "../core/ColorMapper";
import { getStrings } from "../utils/strings";

export class NodeTooltip {
  private tooltipEl: HTMLElement;

  constructor(private container: HTMLElement, private onTitleClick?: (path: string) => void) {
    const existing = this.container.querySelector(".heat-node-tooltip");
    if (existing) {
      this.tooltipEl = existing as HTMLElement;
    } else {
      this.tooltipEl = this.container.createEl("div", { cls: "heat-node-tooltip" });
      this.tooltipEl.style.position = "absolute";
      this.tooltipEl.style.display = "none";
      this.tooltipEl.style.zIndex = "1010";
      this.tooltipEl.style.pointerEvents = "none";
    }

    this.tooltipEl.addEventListener("click", (e) => {
      const titleEl = (e.target as HTMLElement).closest(".tooltip-title");
      if (titleEl) {
        const path = titleEl.getAttribute("data-path");
        if (path && this.onTitleClick) {
          this.onTitleClick(path);
        }
      }
    });
  }

  public show(event: MouseEvent, node: HeatNode): void {
    const t = getStrings();
    const bucketName = ColorMapper.getBucketName(node.score);
    const bucketLabel = bucketName.toUpperCase();

    const trendLabel = node.trend === "up" ? t.trendUp
      : node.trend === "down" ? t.trendDown
      : t.trendStable;
    const trendColor = node.trend === "up" ? "#22c55e"
      : node.trend === "down" ? "#ef4444"
      : "var(--text-muted)";

    const content = `
      <div class="tooltip-title" data-path="${node.id}" style="cursor:pointer;text-decoration:underline dotted;"><a>${node.name}</a></div>
      <div class="tooltip-divider"></div>
      <div class="tooltip-row">
        <span>🌡 Heat Score:</span>
        <span class="tooltip-score-${bucketName}" style="font-weight:bold;">${node.score.toFixed(2)} (${bucketLabel})</span>
      </div>
      <div class="tooltip-row">
        <span>${t.tooltipTrend}</span>
        <span style="color:${trendColor};font-weight:bold;">${trendLabel}</span>
      </div>
      <div class="tooltip-divider"></div>
      <div class="tooltip-row">
        <span>${t.tooltipLastModified}</span>
        <span>${node.daysSinceModified.toFixed(1)} ${t.tooltipDaysAgo}</span>
      </div>
      <div class="tooltip-row">
        <span>${t.tooltipLinks}</span>
        <span>${node.inlinks} in / ${node.outlinks} out</span>
      </div>
      <div class="tooltip-row">
        <span>${t.tooltipVisitCount}</span>
        <span>${node.visitCount}</span>
      </div>
      <div class="tooltip-row">
        <span>${t.tooltipSize}</span>
        <span>${(node.charCount / 1024).toFixed(2)} KB</span>
      </div>
    `;

    this.tooltipEl.innerHTML = content;
    this.tooltipEl.style.display = "block";
    // F3: Enable pointer events for clickable title
    this.tooltipEl.style.pointerEvents = "auto";

    this.updatePosition(event);
  }

  public updatePosition(event: MouseEvent): void {
    const rect = this.container.getBoundingClientRect();
    const x = event.clientX - rect.left + 15;
    const y = event.clientY - rect.top + 15;

    this.tooltipEl.style.left = `${x}px`;
    this.tooltipEl.style.top = `${y}px`;
  }

  public hide(): void {
    this.tooltipEl.style.display = "none";
  }

  public destroy(): void {
    this.tooltipEl.remove();
  }
}
