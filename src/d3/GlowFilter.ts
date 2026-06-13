import * as d3 from "d3";

export class GlowFilter {
  public static create(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");

    defs.selectAll("filter").remove();

    const glowConfigs = [
      { id: "heat-glow-warm", stdDev: "2" },
      { id: "heat-glow-hot", stdDev: "4.5" },
      { id: "heat-glow-burning", stdDev: "8" },
    ];

    glowConfigs.forEach((config) => {
      const filter = defs
        .append("filter")
        .attr("id", config.id)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

      filter
        .append("feGaussianBlur")
        .attr("stdDeviation", config.stdDev)
        .attr("result", "coloredBlur");

      const merge = filter.append("feMerge");
      merge.append("feMergeNode").attr("in", "coloredBlur");
      merge.append("feMergeNode").attr("in", "SourceGraphic");
    });
  }

  public static getFilterId(score: number): string | null {
    if (score >= 0.8) return "url(#heat-glow-burning)";
    if (score >= 0.6) return "url(#heat-glow-hot)";
    if (score >= 0.4) return "url(#heat-glow-warm)";
    return null;
  }
}
