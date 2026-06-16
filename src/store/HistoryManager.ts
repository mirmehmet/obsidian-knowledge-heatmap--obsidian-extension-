import { BucketMap } from "../core/types";
import { Logger } from "../utils/logger";

/**
 * A snapshot of the vault's heat state at a specific point in time.
 */
export interface HeatSnapshot {
  timestamp: number;
  avgScore: number;
  totalNotes: number;
  bucketCounts: Record<string, number>;
}

/**
 * Manages heat map history snapshots for the Time Travel feature.
 * Stores up to maxSnapshots entries and provides retrieval/querying.
 */
export class HistoryManager {
  /**
   * Saves a new snapshot to the history array.
   * 
   * @param snapshots - Current history array (mutated in place).
   * @param scores - Current scores map.
   * @param buckets - Current bucket assignments.
   * @param maxSnapshots - Maximum number of snapshots to retain.
   */
  public static saveSnapshot(
    snapshots: HeatSnapshot[],
    scores: Record<string, number>,
    buckets: BucketMap,
    maxSnapshots = 90
  ): void {
    const values = Object.values(scores);
    if (values.length === 0) return;

    const avgScore = values.reduce((a, b) => a + b, 0) / values.length;

    const bucketCounts: Record<string, number> = {};
    for (const [bucket, paths] of Object.entries(buckets)) {
      bucketCounts[bucket] = paths.length;
    }

    snapshots.push({
      timestamp: Date.now(),
      avgScore,
      totalNotes: values.length,
      bucketCounts,
    });

    // Trim old entries
    while (snapshots.length > maxSnapshots) {
      snapshots.shift();
    }

    Logger.debug(`Saved heat snapshot (${snapshots.length}/${maxSnapshots})`);
  }

  /**
   * Returns the snapshot closest to the given timestamp.
   */
  public static getSnapshotAt(snapshots: HeatSnapshot[], timestamp: number): HeatSnapshot | null {
    if (snapshots.length === 0) return null;

    let closest = snapshots[0];
    let minDiff = Math.abs(snapshots[0].timestamp - timestamp);

    for (const snap of snapshots) {
      const diff = Math.abs(snap.timestamp - timestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closest = snap;
      }
    }
    return closest;
  }

  /**
   * Returns all snapshots within a date range.
   */
  public static getSnapshotsInRange(snapshots: HeatSnapshot[], from: number, to: number): HeatSnapshot[] {
    return snapshots.filter(s => s.timestamp >= from && s.timestamp <= to);
  }
}
