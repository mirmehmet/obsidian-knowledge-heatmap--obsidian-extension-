import { App, Notice } from "obsidian";
import { Logger } from "../utils/logger";

/**
 * Handles hot-reloading and syncing graph configurations into active Obsidian Graph View panels.
 */
export class GraphReloader {
  /**
   * Forces Obsidian to redraw and reload all active native Graph Views.
   * Direct synchronization is attempted first. If direct sync fails or is not supported by the view instance, 
   * a hard view-state reload fallback is performed.
   * 
   * @param app - The active Obsidian App instance.
   * @param showNotifications - Whether to display notice popups on failures.
   * @returns Promise resolving to true if reload succeeded, or false if no graph views are open.
   */
  public static async reload(app: App, showNotifications = true): Promise<boolean> {
    const leaves = app.workspace.getLeavesOfType("graph");
    if (leaves.length === 0) {
      if (showNotifications) {
        new Notice("🔥 Knowledge Heat Map: Lütfen önce Graph View (İlişki Grafiği) görünümünü açın!");
      }
      return false;
    }

    // 1. Read the updated settings from graph.json directly from disk
    const adapter = app.vault.adapter;
    const graphJsonPath = ".obsidian/graph.json";
    let diskData: any = null;
    
    try {
      if (await adapter.exists(graphJsonPath)) {
        const content = await adapter.read(graphJsonPath);
        diskData = JSON.parse(content);
      }

      // Sync settings into global graph plugin instance if available
      const graphPlugin = (app as any).internalPlugins?.plugins?.graph;
      if (diskData && graphPlugin && graphPlugin.instance) {
        if (graphPlugin.instance.options) graphPlugin.instance.options = diskData;
        if (graphPlugin.instance.data) graphPlugin.instance.data = diskData;
      }
    } catch (err) {
      Logger.error("Error loading graph plugin data from disk", err);
    }

    // 2. Sync and trigger redraw on each open graph view
    for (const leaf of leaves) {
      const view = leaf.view as any;
      
      try {
        let updated = false;
        const viewData = view.data || view.settings;

        if (diskData && viewData) {
          viewData.colorGroups = diskData.colorGroups;
          if (diskData.searchQuery !== undefined) viewData.searchQuery = diskData.searchQuery;
          if (diskData.showTags !== undefined) viewData.showTags = diskData.showTags;
          if (diskData.showAttachments !== undefined) viewData.showAttachments = diskData.showAttachments;
          if (diskData.showOrphans !== undefined) viewData.showOrphans = diskData.showOrphans;

          if (typeof viewData.onChanged === "function") {
            viewData.onChanged();
            updated = true;
          } else if (typeof viewData.save === "function") {
            viewData.save();
            updated = true;
          }
        }

        const renderer = view.renderer || view.engine;
        if (view && renderer) {
          if (typeof renderer.onSettingsChanged === "function") {
            renderer.onSettingsChanged();
            updated = true;
          } else if (typeof renderer.updateColors === "function") {
            renderer.updateColors();
            updated = true;
          } else if (typeof renderer.update === "function") {
            renderer.update();
            updated = true;
          }
        }

        if (!updated) {
          const state = leaf.getViewState();
          await leaf.setViewState({ type: "empty" });
          await leaf.setViewState(state);
        }
      } catch (err) {
        Logger.error("Error reloading graph leaf view", err);
        try {
          const state = leaf.getViewState();
          await leaf.setViewState({ type: "empty" });
          await leaf.setViewState(state);
        } catch (e) {
          // Ignore secondary fallback errors
        }
      }
    }

    return true;
  }
}
