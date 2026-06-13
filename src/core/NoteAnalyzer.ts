import { App, TFile } from "obsidian";
import { NoteData } from "./types";

/**
 * Scans the vault to collect, normalize, and filter note metrics utilizing Obsidian's metadataCache.
 * Designed to optimize performance on large vaults through chunked background processing.
 */
export class NoteAnalyzer {
  constructor(private app: App) {}

  /**
   * Pre-calculates incoming link counts for all nodes in the vault by parsing the resolved links cache.
   * 
   * @param resolvedLinks - Obsidian's resolved links dictionary map from metadataCache.
   * @returns A dictionary mapping file paths to their incoming link count.
   */
  public static computeAllInlinks(resolvedLinks: Record<string, Record<string, number>>): Record<string, number> {
    const inlinkCounts: Record<string, number> = {};
    for (const sourcePath in resolvedLinks) {
      const targets = resolvedLinks[sourcePath];
      for (const targetPath in targets) {
        inlinkCounts[targetPath] = (inlinkCounts[targetPath] ?? 0) + (targets[targetPath] || 0);
      }
    }
    return inlinkCounts;
  }

  /**
   * Builds NoteData metric details for a single file using Obsidian's index caches.
   * Does not perform raw file reading (I/O) to keep performance fast.
   * 
   * @param file - The target Markdown file.
   * @param inlinkCounts - Pre-calculated vault-wide inlinks map.
   * @param visitCounts - Map of accumulated file-open visit counts.
   * @returns Constructed NoteData containing collected metrics.
   */
  public collectNoteData(
    file: TFile,
    inlinkCounts: Record<string, number>,
    visitCounts: Record<string, number>
  ): NoteData {
    const cache = this.app.metadataCache.getFileCache(file);
    const resolvedLinks = this.app.metadataCache.resolvedLinks[file.path] ?? {};

    const cacheTags = (cache?.tags ?? []).map(t => t.tag);
    
    const fmTags: string[] = [];
    if (cache?.frontmatter) {
      const tagsVal = cache.frontmatter.tags || cache.frontmatter.tag;
      if (typeof tagsVal === "string") {
        fmTags.push(...tagsVal.split(",").map(t => t.trim()));
      } else if (Array.isArray(tagsVal)) {
        fmTags.push(...tagsVal.map(t => String(t).trim()));
      }
    }
    
    const allTagsSet = new Set<string>();
    [...cacheTags, ...fmTags].forEach(tag => {
      let cleanTag = tag;
      if (!cleanTag.startsWith("#")) {
        cleanTag = "#" + cleanTag;
      }
      allTagsSet.add(cleanTag);
    });

    return {
      path: file.path,
      name: file.basename,
      daysSinceModified: (Date.now() - file.stat.mtime) / 86_400_000,
      charCount: file.stat.size,
      outlinks: Object.keys(resolvedLinks).length,
      inlinks: inlinkCounts[file.path] ?? 0,
      visitCount: visitCounts[file.path] ?? 0,
      tags: Array.from(allTagsSet),
      frontmatter: cache?.frontmatter ?? {},
    };
  }

  /**
   * Filters out notes belonging to excluded folders or matching excluded tags.
   * 
   * @param notes - Note list to filter.
   * @param excludeFolders - List of folder paths to exclude.
   * @param excludeTags - List of tags to exclude.
   * @returns Filtered list of NoteData.
   */
  public filterNotes(
    notes: NoteData[],
    excludeFolders: string[],
    excludeTags: string[]
  ): NoteData[] {
    const normalizedFolders = excludeFolders.map(f => f.replace(/\\/g, "/").toLowerCase());
    const normalizedTags = excludeTags.map(t => (t.startsWith("#") ? t.toLowerCase() : `#${t.toLowerCase()}`));

    return notes.filter(note => {
      const notePathLower = note.path.replace(/\\/g, "/").toLowerCase();
      const isExcludedFolder = normalizedFolders.some(folder => {
        if (!folder) return false;
        return notePathLower.startsWith(folder + "/") || notePathLower === folder;
      });
      if (isExcludedFolder) return false;

      const isExcludedTag = note.tags.some(tag => 
        normalizedTags.includes(tag.toLowerCase())
      );
      if (isExcludedTag) return false;

      return true;
    });
  }

  /**
   * Analyzes the entire vault asynchronously, processing notes in chunks to avoid UI lag.
   * 
   * @param files - All Markdown files to process.
   * @param visitCounts - Map of accumulated file-open visit counts.
   * @param excludeFolders - Folders excluded in plugin settings.
   * @param excludeTags - Tags excluded in plugin settings.
   * @param onProgress - Callback triggered after processing each chunk, returning progress percentage (0-100).
   * @returns Filtered list of NoteData containing metrics for all relevant notes.
   */
  public async analyzeVaultChunked(
    files: TFile[],
    visitCounts: Record<string, number>,
    excludeFolders: string[],
    excludeTags: string[],
    onProgress?: (progress: number) => void
  ): Promise<NoteData[]> {
    const resolvedLinks = this.app.metadataCache?.resolvedLinks || {};
    const inlinkCounts = NoteAnalyzer.computeAllInlinks(resolvedLinks);
    const results: NoteData[] = [];
    const CHUNK_SIZE = 50;

    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      const chunk = files.slice(i, i + CHUNK_SIZE);
      const chunkData = chunk.map(file => this.collectNoteData(file, inlinkCounts, visitCounts));
      results.push(...chunkData);

      if (onProgress) {
        onProgress(Math.min(100, Math.round(((i + chunk.length) / files.length) * 100)));
      }

      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return this.filterNotes(results, excludeFolders, excludeTags);
  }
}
