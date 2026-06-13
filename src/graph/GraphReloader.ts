import { App, Notice } from "obsidian";

export class GraphReloader {
  public static async reload(app: App, showNotifications = true): Promise<boolean> {
    const leaves = app.workspace.getLeavesOfType("graph");
    if (leaves.length === 0) {
      if (showNotifications) {
        new Notice("🔥 Knowledge Heat Map: Lütfen önce Graph View (İlişki Grafiği) görünümünü açın!");
      }
      return false;
    }

    for (const leaf of leaves) {
      await leaf.setViewState(leaf.getViewState());
    }

    return true;
  }
}
