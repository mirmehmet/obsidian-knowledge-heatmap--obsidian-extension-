import * as d3 from "d3";
import { HeatNode, HeatLink } from "./D3Types";
import { GlowFilter } from "./GlowFilter";
import { NodeTooltip } from "./NodeTooltip";
import { ColorMapper } from "../core/ColorMapper";
import { NoteData, BucketName } from "../core/types";

export class D3Renderer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private simulation: d3.Simulation<HeatNode, HeatLink>;
  private tooltip: NodeTooltip;

  constructor(
    private container: HTMLElement,
    private onNodeClick: (path: string) => void
  ) {
    this.tooltip = new NodeTooltip(this.container);
    this.initSvg();
  }

  private initSvg(): void {
    const existingSvg = this.container.querySelector("svg");
    if (existingSvg) existingSvg.remove();

    this.svg = d3
      .select(this.container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("display", "block");

    this.g = this.svg.append("g").attr("class", "heat-zoom-group");

    GlowFilter.create(this.svg);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        this.g.attr("transform", event.transform);
      });

    this.svg.call(zoom);
  }

  public render(
    notes: NoteData[],
    scores: Record<string, number>,
    resolvedLinks: Record<string, Record<string, number>>,
    customColors?: Partial<Record<BucketName, string>>
  ): void {
    if (this.simulation) this.simulation.stop();

    const rect = this.container.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

    const nodeMap = new Map<string, HeatNode>();
    notes.forEach((note) => {
      const bucket = ColorMapper.getBucketName(scores[note.path] ?? 0);
      const colorInfo = ColorMapper.getColor(bucket, customColors);

      nodeMap.set(note.path, {
        id: note.path,
        name: note.name,
        score: scores[note.path] ?? 0,
        color: colorInfo.hex,
        inlinks: note.inlinks,
        outlinks: note.outlinks,
        visitCount: note.visitCount,
        charCount: note.charCount,
        daysSinceModified: note.daysSinceModified,
      });
    });

    const nodes = Array.from(nodeMap.values());
    const links: HeatLink[] = [];

    for (const [sourcePath, targets] of Object.entries(resolvedLinks)) {
      if (!nodeMap.has(sourcePath)) continue;
      for (const targetPath of Object.keys(targets)) {
        if (!nodeMap.has(targetPath)) continue;
        links.push({
          source: sourcePath,
          target: targetPath,
          value: targets[targetPath] || 1,
        });
      }
    }

    this.g.selectAll(".heat-links").remove();
    this.g.selectAll(".heat-nodes").remove();

    const link = this.g
      .append("g")
      .attr("class", "heat-links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "var(--border-color)")
      .attr("stroke-opacity", 0.35)
      .attr("stroke-width", (d) => Math.min(5, 1 + d.value));

    const dragstarted = (event: d3.D3DragEvent<any, HeatNode, HeatNode>, d: HeatNode) => {
      if (!event.active) this.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event: d3.D3DragEvent<any, HeatNode, HeatNode>, d: HeatNode) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (event: d3.D3DragEvent<any, HeatNode, HeatNode>, d: HeatNode) => {
      if (!event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    const node = this.g
      .append("g")
      .attr("class", "heat-nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("tabindex", "0")
      .style("outline", "none")
      .call(
        d3
          .drag<any, HeatNode>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    node
      .on("focus", function() {
        d3.select(this)
          .select("circle")
          .attr("stroke", "var(--interactive-accent)")
          .attr("stroke-width", "2px");
      })
      .on("blur", function() {
        d3.select(this)
          .select("circle")
          .attr("stroke", null)
          .attr("stroke-width", null);
      })
      .on("keydown", (event: KeyboardEvent, d) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.onNodeClick(d.id);
        }
      });

    node
      .append("circle")
      .attr("r", (d) => 6 + Math.min(12, (d.inlinks + d.outlinks) / 2))
      .attr("fill", (d) => d.color)
      .attr("filter", (d) => GlowFilter.getFilterId(d.score))
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        this.tooltip.show(event, d);
      })
      .on("mousemove", (event) => {
        this.tooltip.updatePosition(event);
      })
      .on("mouseout", () => {
        this.tooltip.hide();
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        this.onNodeClick(d.id);
      });

    node
      .append("text")
      .attr("dy", (d) => 12 + (6 + Math.min(12, (d.inlinks + d.outlinks) / 2)))
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-normal)")
      .style("font-size", "10px")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .text((d) => d.name);

    this.simulation = d3
      .forceSimulation<HeatNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<HeatNode, HeatLink>(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("collide", d3.forceCollide().radius((d) => 12 + (6 + Math.min(12, (d.inlinks + d.outlinks) / 2))))
      .force("center", d3.forceCenter(width / 2, height / 2));

    this.simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as HeatNode).x!)
        .attr("y1", (d) => (d.source as HeatNode).y!)
        .attr("x2", (d) => (d.target as HeatNode).x!)
        .attr("y2", (d) => (d.target as HeatNode).y!);

      node.attr("transform", (d) => `translate(${d.x!}, ${d.y!})`);
    });
  }

  public resize(width: number, height: number): void {
    if (this.svg) {
      this.svg.attr("width", width).attr("height", height);
    }
    if (this.simulation) {
      this.simulation.force("center", d3.forceCenter(width / 2, height / 2));
      this.simulation.alpha(0.3).restart();
    }
  }

  public destroy(): void {
    if (this.simulation) this.simulation.stop();
    this.tooltip.destroy();
    if (this.svg) this.svg.remove();
  }
}
