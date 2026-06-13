import { BucketMap } from "./types";
import { ColorMapper } from "./ColorMapper";

/**
 * Utility class to sort calculated note scores into their corresponding heat buckets.
 */
export class BucketSorter {
  /**
   * Sorts note scores into discrete Heatmap buckets (frozen, cold, warm, hot, burning).
   * 
   * @param noteScores - A record mapping note paths to their calculated heat scores [0.0, 1.0].
   * @returns A BucketMap containing lists of file paths for each bucket.
   */
  public static sort(noteScores: Record<string, number> | Map<string, number>): BucketMap {
    const buckets: BucketMap = {
      frozen: [],
      cold: [],
      warm: [],
      hot: [],
      burning: [],
    };

    const entries = noteScores instanceof Map 
      ? Array.from(noteScores.entries()) 
      : Object.entries(noteScores);

    for (const [path, score] of entries) {
      const bucketName = ColorMapper.getBucketName(score);
      buckets[bucketName].push(path);
    }

    return buckets;
  }
}
