import { BucketMap } from "./types";
import { ColorMapper } from "./ColorMapper";

export class BucketSorter {
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
