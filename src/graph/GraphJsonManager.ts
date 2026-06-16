import { App } from "obsidian";
import { BucketMap, BucketName } from "../core/types";
import { ColorMapper } from "../core/ColorMapper";
import { GroupsBuilder } from "./GroupsBuilder";
import { Logger } from "../utils/logger";

/**
 * Manages the read, write, backup, and restore operations on Obsidian's `.obsidian/graph.json` configuration file.
 */
export class GraphJsonManager {
  private readonly GRAPH_JSON_PATH = ".obsidian/graph.json";
  private backup: string | null = null;

  constructor(private app: App) {}

  /**
   * Retrieves the current in-memory backup of graph.json.
   */
  public getBackup(): string | null {
    return this.backup;
  }

  /**
   * Overrides the in-memory backup string.
   */
  public setBackup(backup: string | null): void {
    this.backup = backup;
  }

  /**
   * Reads and parses `.obsidian/graph.json` from the vault adapter.
   * 
   * @throws Error if the file contains malformed JSON structure.
   */
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

  /**
   * Maps calculated heat buckets to Obsidian graph color groups, chunks path queries to prevent overflows, 
   * preserves existing user color configurations, and writes the updated config to disk.
   * 
   * @param buckets - Map categorizing note paths into their heat buckets.
   * @param customColors - Custom palette colors defined in settings.
   */
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

    const colorGroups = GroupsBuilder.build(buckets, customColors);

    const existingGroups = currentGraph.colorGroups ?? [];
    const userGroups = existingGroups.filter((g: any) => {
      return !g.query || !g.query.includes('path:"');
    });

    currentGraph.colorGroups = [...userGroups, ...colorGroups];

    await adapter.write(this.GRAPH_JSON_PATH, JSON.stringify(currentGraph, null, 2));
  }

  /**
   * Restores `.obsidian/graph.json` to its pre-heatmap state.
   * Falls back to a clean filtering of query rules containing `path:"` if no backup exists.
   */
  public async restore(): Promise<void> {
    const adapter = this.app.vault.adapter;
    if (this.backup) {
      await adapter.write(this.GRAPH_JSON_PATH, this.backup);
      this.backup = null;
    } else {
      if (await adapter.exists(this.GRAPH_JSON_PATH)) {
        try {
          const content = await adapter.read(this.GRAPH_JSON_PATH);
          const currentGraph = JSON.parse(content);
          if (currentGraph && Array.isArray(currentGraph.colorGroups)) {
            currentGraph.colorGroups = currentGraph.colorGroups.filter((g: any) => {
              return !g.query || !g.query.includes('path:"');
            });
            await adapter.write(this.GRAPH_JSON_PATH, JSON.stringify(currentGraph, null, 2));
          }
        } catch (err) {
          Logger.error("Fallback restore failed", err);
        }
      }
    }
  }
}
