import { App, WorkspaceLeaf } from "obsidian";

export class HeatControlButton {
  private buttons: Map<string, HTMLElement> = new Map();

  constructor(
    private app: App,
    private onToggle: (leaf: WorkspaceLeaf) => void
  ) {}

  public injectButtons(isActive: boolean): void {
    const leaves = this.app.workspace.getLeavesOfType("graph");
    
    // Create a set of current active leaf IDs and assign stable runtime IDs
    const activeLeafIds = new Set<string>();
    leaves.forEach((leaf: any) => {
      if (!leaf.id) {
        leaf.id = "heat-leaf-" + Math.random().toString(36).substring(2, 9);
      }
      activeLeafIds.add(leaf.id);
    });

    // Remove buttons for leaves that are no longer active (closed tabs)
    for (const [leafId, btn] of this.buttons.entries()) {
      if (!activeLeafIds.has(leafId)) {
        btn.remove();
        this.buttons.delete(leafId);
      }
    }

    leaves.forEach((leaf: any) => {
      const container = leaf.view?.containerEl;
      if (!container) return;

      const leafId = leaf.id;
      const existingBtn = this.buttons.get(leafId);
      
      if (existingBtn && document.body.contains(existingBtn)) {
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
          this.onToggle(leaf);
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
