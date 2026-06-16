import * as d3 from "d3";
import { HeatNode, HeatLink } from "./D3Types";
import { GlowFilter } from "./GlowFilter";
import { NodeTooltip } from "./NodeTooltip";
import { MiniMap } from "./MiniMap";
import { ColorMapper } from "../core/ColorMapper";
import { NoteData, BucketName } from "../core/types";

export type NodeSizeMode = "links" | "score" | "content" | "visits";

export class D3Renderer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private simulation: d3.Simulation<HeatNode, HeatLink>;
  private tooltip: NodeTooltip;
  private nodeSelection: d3.Selection<SVGGElement, HeatNode, SVGGElement, unknown>;
  private linkSelection: d3.Selection<SVGLineElement, HeatLink, SVGGElement, unknown>;
  private activeSearchQuery = "";
  private focusedNodeId: string | null = null;
  private allNodes: HeatNode[] = [];
  private allLinks: HeatLink[] = [];
  private currentNodeSizeMode: NodeSizeMode = "links";
  private onFocusModeChange: ((active: boolean) => void) | null = null;
  private miniMap: MiniMap | null = null;

  constructor(
    private container: HTMLElement,
    private onNodeClick: (path: string) => void
  ) {
    this.tooltip = new NodeTooltip(this.container, this.onNodeClick);
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

    // F1: Escape key to exit focus mode
    this.svg.on("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape" && this.isFocusModeActive()) {
        this.exitFocusMode();
      }
    });
    // Make SVG focusable for keyboard events
    this.svg.attr("tabindex", "0").style("outline", "none");
  }

  public render(
    notes: NoteData[],
    scores: Record<string, number>,
    resolvedLinks: Record<string, Record<string, number>>,
    customColors?: Partial<Record<BucketName, string>>,
    nodeSizeMode: NodeSizeMode = "links"
  ): void {
    if (this.simulation) this.simulation.stop();
    this.currentNodeSizeMode = nodeSizeMode;
    this.focusedNodeId = null;

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
        folder: note.path.contains("/") ? note.path.split("/").slice(0, -1).join("/") : "/",
        tags: note.tags || [],
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

    this.linkSelection = link;

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

    this.nodeSelection = node;

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
      .attr("r", (d) => this.calcNodeRadius(d))
      .attr("fill", (d) => d.color)
      .attr("filter", (d) => GlowFilter.getFilterId(d.score))
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        this.tooltip.show(event, d);
        this.handleNodeHover(d);
      })
      .on("mousemove", (event) => {
        this.tooltip.updatePosition(event);
      })
      .on("mouseout", () => {
        this.tooltip.hide();
        this.handleNodeHoverEnd();
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        this.onNodeClick(d.id);
      })
      .on("contextmenu", (event, d) => {
        event.preventDefault();
        event.stopPropagation();
        this.enterFocusMode(d.id);
      });

    node
      .append("text")
      .attr("dy", (d) => 12 + this.calcNodeRadius(d))
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-normal)")
      .style("font-size", "10px")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .text((d) => d.name);

    // E2: Staggered entrance animation
    node
      .style("opacity", 0)
      .transition()
      .delay((d) => {
        const bucketOrder = ["burning", "hot", "warm", "cold", "frozen"];
        const bucket = ColorMapper.getBucketName(d.score);
        const idx = bucketOrder.indexOf(bucket);
        return idx * 80;
      })
      .duration(400)
      .style("opacity", 1);

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
      .force("collide", d3.forceCollide().radius((d) => 12 + this.calcNodeRadius(d as HeatNode)))
      .force("center", d3.forceCenter(width / 2, height / 2));

    this.simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as HeatNode).x!)
        .attr("y1", (d) => (d.source as HeatNode).y!)
        .attr("x2", (d) => (d.target as HeatNode).x!)
        .attr("y2", (d) => (d.target as HeatNode).y!);

      node.attr("transform", (d) => `translate(${d.x!}, ${d.y!})`);

      // E3: Update MiniMap on each tick
      if (this.miniMap && nodes.length > 0) {
        const miniNodes = nodes.map(n => ({ x: n.x ?? 0, y: n.y ?? 0, color: n.color }));
        const rect = this.container.getBoundingClientRect();
        const transform = d3.zoomTransform(this.svg.node()!);
        this.miniMap.update(miniNodes, {
          x: -transform.x / transform.k,
          y: -transform.y / transform.k,
          width: rect.width / transform.k,
          height: rect.height / transform.k,
        });
      }
    });

    if (this.activeSearchQuery) {
      this.highlightNodes(this.activeSearchQuery);
    }
  }

  private handleNodeHover(targetNode: HeatNode): void {
    if (!this.linkSelection || !this.nodeSelection) return;

    const connectedNodeIds = new Set<string>();
    connectedNodeIds.add(targetNode.id);

    this.linkSelection.each((l) => {
      const sourceId = typeof l.source === "object" ? l.source.id : l.source;
      const targetId = typeof l.target === "object" ? l.target.id : l.target;
      if (sourceId === targetNode.id) {
        connectedNodeIds.add(targetId);
      } else if (targetId === targetNode.id) {
        connectedNodeIds.add(sourceId);
      }
    });

    this.linkSelection
      .transition()
      .duration(150)
      .attr("stroke", (l) => {
        const sourceId = typeof l.source === "object" ? l.source.id : l.source;
        const targetId = typeof l.target === "object" ? l.target.id : l.target;
        return (sourceId === targetNode.id || targetId === targetNode.id)
          ? "var(--interactive-accent)"
          : "var(--border-color)";
      })
      .attr("stroke-opacity", (l) => {
        const sourceId = typeof l.source === "object" ? l.source.id : l.source;
        const targetId = typeof l.target === "object" ? l.target.id : l.target;
        return (sourceId === targetNode.id || targetId === targetNode.id) ? 0.9 : 0.05;
      });

    this.nodeSelection
      .transition()
      .duration(150)
      .style("opacity", (n) => connectedNodeIds.has(n.id) ? 1.0 : 0.15);
  }

  private handleNodeHoverEnd(): void {
    if (!this.linkSelection || !this.nodeSelection) return;

    this.linkSelection
      .transition()
      .duration(150)
      .attr("stroke", "var(--border-color)")
      .attr("stroke-opacity", 0.35);

    if (this.activeSearchQuery) {
      this.highlightNodes(this.activeSearchQuery);
    } else {
      this.nodeSelection
        .transition()
        .duration(150)
        .style("opacity", 1.0);
    }
  }

  public highlightNodes(searchQuery: string): void {
    this.activeSearchQuery = searchQuery.trim().toLowerCase();
    if (!this.nodeSelection) return;

    if (!this.activeSearchQuery) {
      this.nodeSelection
        .transition()
        .duration(150)
        .style("opacity", 1.0);
      return;
    }

    this.nodeSelection
      .transition()
      .duration(150)
      .style("opacity", (n) => 
        n.name.toLowerCase().includes(this.activeSearchQuery) ? 1.0 : 0.15
      );
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

  // B3: Node radius calculation based on selected mode
  private calcNodeRadius(d: HeatNode): number {
    switch (this.currentNodeSizeMode) {
      case "score":
        return 6 + d.score * 12;
      case "content":
        return 6 + Math.min(12, (d.charCount / 5000) * 12);
      case "visits":
        return 6 + Math.min(12, (d.visitCount / 50) * 12);
      case "links":
      default:
        return 6 + Math.min(12, (d.inlinks + d.outlinks) / 2);
    }
  }

  // B4: Focus mode — show only a node and its neighbors
  public enterFocusMode(nodeId: string): void {
    this.focusedNodeId = nodeId;
    if (!this.nodeSelection || !this.linkSelection) return;

    const neighborIds = new Set<string>();
    neighborIds.add(nodeId);

    this.linkSelection.each((l) => {
      const sourceId = typeof l.source === "object" ? l.source.id : l.source;
      const targetId = typeof l.target === "object" ? l.target.id : l.target;
      if (sourceId === nodeId) neighborIds.add(targetId);
      if (targetId === nodeId) neighborIds.add(sourceId);
    });

    // 2nd degree neighbors
    const secondDegree = new Set<string>(neighborIds);
    this.linkSelection.each((l) => {
      const sourceId = typeof l.source === "object" ? l.source.id : l.source;
      const targetId = typeof l.target === "object" ? l.target.id : l.target;
      if (neighborIds.has(sourceId)) secondDegree.add(targetId);
      if (neighborIds.has(targetId)) secondDegree.add(sourceId);
    });

    this.nodeSelection
      .transition().duration(300)
      .style("opacity", (n) => secondDegree.has(n.id) ? 1.0 : 0.05);

    this.linkSelection
      .transition().duration(300)
      .attr("stroke-opacity", (l) => {
        const sourceId = typeof l.source === "object" ? l.source.id : l.source;
        const targetId = typeof l.target === "object" ? l.target.id : l.target;
        return (secondDegree.has(sourceId) && secondDegree.has(targetId)) ? 0.5 : 0.02;
      });

    this.onFocusModeChange?.(true);
  }

  public exitFocusMode(): void {
    this.focusedNodeId = null;
    if (!this.nodeSelection || !this.linkSelection) return;

    this.nodeSelection
      .transition().duration(300)
      .style("opacity", 1.0);

    this.linkSelection
      .transition().duration(300)
      .attr("stroke-opacity", 0.35);

    this.onFocusModeChange?.(false);
  }

  public isFocusModeActive(): boolean {
    return this.focusedNodeId !== null;
  }

  public setFocusModeChangeHandler(handler: (active: boolean) => void): void {
    this.onFocusModeChange = handler;
  }

  // A6: Focus on a specific node by path (used by context menu)
  public focusOnNode(path: string): void {
    if (!this.nodeSelection) return;
    
    const targetNode = this.nodeSelection.data().find((n) => n.id === path);
    if (!targetNode || targetNode.x === undefined || targetNode.y === undefined) return;

    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const transform = d3.zoomIdentity
      .translate(centerX - targetNode.x * 1.5, centerY - targetNode.y * 1.5)
      .scale(1.5);

    this.svg
      .transition()
      .duration(750)
      .call(d3.zoom<SVGSVGElement, unknown>().transform as any, transform);

    this.enterFocusMode(path);
  }

  // E3: MiniMap setter
  public setMiniMap(miniMap: MiniMap): void {
    this.miniMap = miniMap;
  }

  // E3: Public accessor for current nodes
  public getNodes(): HeatNode[] {
    return this.allNodes;
  }
}
