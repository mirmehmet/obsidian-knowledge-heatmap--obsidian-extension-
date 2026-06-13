import { App, TFile, Plugin } from "obsidian";

export class VisitTracker {
  private saveTimeout: any = null;
  private visits: Record<string, number> = {};

  constructor(private app: App, private plugin: Plugin) {}

  public async load(): Promise<Record<string, number>> {
    const data = await this.plugin.loadData();
    this.visits = (data && data.visits) || {};
    return this.visits;
  }

  public getVisits(): Record<string, number> {
    return this.visits;
  }

  public getVisitCount(path: string): number {
    return this.visits[path] ?? 0;
  }

  public register(): void {
    this.plugin.registerEvent(
      this.app.workspace.on("file-open", async (file: TFile | null) => {
        if (!file || file.extension !== "md") return;
        
        this.visits[file.path] = (this.visits[file.path] ?? 0) + 1;
        this.debouncedSave();
      })
    );
  }

  private debouncedSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(async () => {
      this.saveTimeout = null;
      try {
        const data = (await this.plugin.loadData()) || {};
        data.visits = this.visits;
        await this.plugin.saveData(data);
      } catch (err) {
        console.error("KnowledgeHeatMap: Failed to save visits data", err);
      }
    }, 100);
  }
}
