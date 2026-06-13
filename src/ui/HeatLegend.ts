import { ColorMapper } from "../core/ColorMapper";
import { BucketName } from "../core/types";
import { getStrings } from "../utils/strings";

export class HeatLegend {
  constructor(private container: HTMLElement, private customColors?: Partial<Record<BucketName, string>>) {}

  public render(): void {
    const existing = this.container.querySelector(".heat-legend-container");
    if (existing) existing.remove();

    const t = getStrings();
    const legendDiv = this.container.createEl("div", { cls: "heat-legend-container" });

    const header = legendDiv.createEl("div", { cls: "heat-legend-header" });
    header.createEl("span", { text: t.legendCold });
    header.createEl("span", { text: t.legendWarm });
    header.createEl("span", { text: t.legendHot });

    const colors = [
      ColorMapper.getColor("frozen", this.customColors).hex,
      ColorMapper.getColor("cold", this.customColors).hex,
      ColorMapper.getColor("warm", this.customColors).hex,
      ColorMapper.getColor("hot", this.customColors).hex,
      ColorMapper.getColor("burning", this.customColors).hex,
    ];

    const bar = legendDiv.createEl("div", { cls: "heat-legend-bar" });
    bar.style.background = `linear-gradient(to right, ${colors.join(", ")})`;

    const labels = legendDiv.createEl("div", { cls: "heat-legend-labels" });
    const bucketLabels = ["Frozen", "Cold", "Warm", "Hot", "Burning"];
    
    bucketLabels.forEach((label, idx) => {
      const span = labels.createEl("span", { text: label });
      span.style.color = colors[idx];
    });
  }
}
