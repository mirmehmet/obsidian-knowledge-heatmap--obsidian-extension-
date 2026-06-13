import { App, Plugin } from "obsidian";

export class HeatControlButton {
  private buttons: Map<string, HTMLElement> = new Map();

  constructor(
    private app: App,
    private plugin: Plugin,
    private onToggle: () => void
  ) {}

  public injectButtons(isActive: boolean): void {
    const leaves = this.app.workspace.getLeavesOfType("graph");
    
    leaves.forEach((leaf: any) => {
      const container = leaf.view?.containerEl;
      if (!container) return;

      // Unique identifier for the leaf
      const leafId = leaf.id || container.id || String(leaves.indexOf(leaf));
      
      if (this.buttons.has(leafId)) {
        this.updateButtonState(leafId, isActive);
        return;
      }

      const controlsContainer = container.querySelector(".graph-controls");

      if (controlsContainer) {
        const btn = document.createElement("div");
        btn.classList.add("clickable-icon", "graph-control-button", "heat-map-control-btn");
        btn.setAttribute("aria-label", "Knowledge Heat Map");
        btn.innerHTML = isActive ? "🔥" : "❄️";
        
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.onToggle();
        });

        controlsContainer.appendChild(btn);
        this.buttons.set(leafId, btn);
      }
    });
  }

  public updateButtonState(leafId: string, isActive: boolean): void {
    const btn = this.buttons.get(leafId);
    if (btn) {
      btn.innerHTML = isActive ? "🔥" : "❄️";
      btn.classList.toggle("is-active", isActive);
    }
  }

  public updateAllButtonsState(isActive: boolean): void {
    for (const leafId of this.buttons.keys()) {
      this.updateButtonState(leafId, isActive);
    }
  }

  public removeButtons(): void {
    this.buttons.forEach((btn) => {
      btn.remove();
    });
    this.buttons.clear();
  }
}
