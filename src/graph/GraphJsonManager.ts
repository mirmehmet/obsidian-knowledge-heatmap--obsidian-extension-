import { App } from "obsidian";
import { BucketMap, BucketName } from "../core/types";
import { ColorMapper } from "../core/ColorMapper";

export class GraphJsonManager {
  private readonly GRAPH_JSON_PATH = ".obsidian/graph.json";
  private backup: string | null = null;

  constructor(private app: App) {}

  public getBackup(): string | null {
    return this.backup;
  }

  public setBackup(backup: string | null): void {
    this.backup = backup;
  }

  public async readGraphJson(): Promise<any> {
    const adapter = this.app.vault.adapter;
    if (await adapter.exists(this.GRAPH_JSON_PATH)) {
      try {
        const content = await adapter.read(this.GRAPH_JSON_PATH);
        return JSON.parse(content);
      } catch (err) {
        throw new Error("graph.json dosya formatı bozuk veya geçersiz.");
      }
    }
    return {};
  }

  public async applyHeatGroups(
    buckets: BucketMap,
    customColors?: Partial<Record<BucketName, string>>
  ): Promise<void> {
    const adapter = this.app.vault.adapter;

    if (!this.backup) {
      if (await adapter.exists(this.GRAPH_JSON_PATH)) {
        this.backup = await adapter.read(this.GRAPH_JSON_PATH);
      } else {
        this.backup = JSON.stringify({});
      }
    }

    const currentGraph = await this.readGraphJson();

    const colorGroups: any[] = [];
    const CHUNK_SIZE = 200; 

    const bucketNames: BucketName[] = ["frozen", "cold", "warm", "hot", "burning"];

    for (const bucketName of bucketNames) {
      const paths = buckets[bucketName] || [];
      if (paths.length === 0) continue;

      const colorInfo = ColorMapper.getColor(bucketName, customColors);

      for (let i = 0; i < paths.length; i += CHUNK_SIZE) {
        const chunk = paths.slice(i, i + CHUNK_SIZE);
        const query = chunk.map(p => `path:"${p}"`).join(" OR ");
        
        colorGroups.push({
          query,
          color: {
            a: 1,
            rgb: colorInfo.rgb,
          },
        });
      }
    }

    const existingGroups = currentGraph.colorGroups ?? [];
    const userGroups = existingGroups.filter((g: any) => {
      return !g.query || !g.query.includes('path:"');
    });

    currentGraph.colorGroups = [...userGroups, ...colorGroups];

    await adapter.write(this.GRAPH_JSON_PATH, JSON.stringify(currentGraph, null, 2));
  }

  public async restore(): Promise<void> {
    if (!this.backup) return;
    const adapter = this.app.vault.adapter;
    await adapter.write(this.GRAPH_JSON_PATH, this.backup);
    this.backup = null;
  }
}
