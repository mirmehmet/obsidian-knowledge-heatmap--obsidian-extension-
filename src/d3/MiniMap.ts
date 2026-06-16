
/**
 * A small overview minimap displayed in the corner of the D3 heat view.
 * Shows all nodes at a reduced scale with a viewport rectangle indicating
 * the current view position. Clicking the minimap pans the main view.
 */
export class MiniMap {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private viewportRect = { x: 0, y: 0, width: 1, height: 1 };
  private nodes: { x: number; y: number; color: string }[] = [];
  private bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 };
  private onPan: ((x: number, y: number) => void) | null = null;

  private readonly WIDTH = 160;
  private readonly HEIGHT = 120;

  constructor(parent: HTMLElement) {
    this.container = parent.createEl("div", { cls: "heat-minimap-container" });
    this.canvas = this.container.createEl("canvas") as HTMLCanvasElement;
    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;
    this.canvas.style.width = `${this.WIDTH}px`;
    this.canvas.style.height = `${this.HEIGHT}px`;
    this.ctx = this.canvas.getContext("2d")!;

    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const worldX = this.bounds.minX + (clickX / this.WIDTH) * (this.bounds.maxX - this.bounds.minX);
      const worldY = this.bounds.minY + (clickY / this.HEIGHT) * (this.bounds.maxY - this.bounds.minY);
      
      this.onPan?.(worldX, worldY);
    });
  }

  /**
   * Sets the callback to invoke when user clicks the minimap to pan the main view.
   */
  public setOnPan(handler: (x: number, y: number) => void): void {
    this.onPan = handler;
  }

  /**
   * Updates the minimap with current node positions and viewport.
   */
  public update(
    nodes: { x: number; y: number; color: string }[],
    viewportRect: { x: number; y: number; width: number; height: number }
  ): void {
    this.nodes = nodes;
    this.viewportRect = viewportRect;
    this.calculateBounds();
    this.draw();
  }

  private calculateBounds(): void {
    if (this.nodes.length === 0) return;
    const padding = 50;
    this.bounds = {
      minX: Math.min(...this.nodes.map(n => n.x)) - padding,
      maxX: Math.max(...this.nodes.map(n => n.x)) + padding,
      minY: Math.min(...this.nodes.map(n => n.y)) - padding,
      maxY: Math.max(...this.nodes.map(n => n.y)) + padding,
    };
  }

  private draw(): void {
    const ctx = this.ctx;
    const w = this.WIDTH;
    const h = this.HEIGHT;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, w, h);

    const scaleX = w / (this.bounds.maxX - this.bounds.minX);
    const scaleY = h / (this.bounds.maxY - this.bounds.minY);

    // Draw nodes as dots
    for (const node of this.nodes) {
      const x = (node.x - this.bounds.minX) * scaleX;
      const y = (node.y - this.bounds.minY) * scaleY;
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw viewport rectangle
    const vx = (this.viewportRect.x - this.bounds.minX) * scaleX;
    const vy = (this.viewportRect.y - this.bounds.minY) * scaleY;
    const vw = this.viewportRect.width * scaleX;
    const vh = this.viewportRect.height * scaleY;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1;
    ctx.strokeRect(vx, vy, vw, vh);
  }

  public destroy(): void {
    this.container.remove();
  }
}
