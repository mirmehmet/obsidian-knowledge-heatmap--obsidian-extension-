import { describe, it, expect } from "vitest";
import { HistoryManager, HeatSnapshot } from "../../src/store/HistoryManager";
import { BucketMap } from "../../src/core/types";

describe("HistoryManager", () => {
  it("saves snapshots and trims correctly", () => {
    const snapshots: HeatSnapshot[] = [];
    const scores = { "a.md": 0.5, "b.md": 0.7 };
    const buckets: BucketMap = {
      frozen: [],
      cold: [],
      warm: ["a.md"],
      hot: ["b.md"],
      burning: []
    };

    HistoryManager.saveSnapshot(snapshots, scores, buckets, 2);
    expect(snapshots.length).toBe(1);
    expect(snapshots[0].avgScore).toBeCloseTo(0.6);
    expect(snapshots[0].totalNotes).toBe(2);
    expect(snapshots[0].bucketCounts.warm).toBe(1);

    // Save second snapshot
    HistoryManager.saveSnapshot(snapshots, scores, buckets, 2);
    expect(snapshots.length).toBe(2);

    // Save third snapshot, should trim first
    HistoryManager.saveSnapshot(snapshots, scores, buckets, 2);
    expect(snapshots.length).toBe(2);
  });

  it("gets snapshot at timestamp and in range", () => {
    const snapshots: HeatSnapshot[] = [
      { timestamp: 1000, avgScore: 0.1, totalNotes: 1, bucketCounts: {} },
      { timestamp: 2000, avgScore: 0.2, totalNotes: 1, bucketCounts: {} },
      { timestamp: 3000, avgScore: 0.3, totalNotes: 1, bucketCounts: {} },
    ];

    const closest = HistoryManager.getSnapshotAt(snapshots, 1900);
    expect(closest?.timestamp).toBe(2000);

    const range = HistoryManager.getSnapshotsInRange(snapshots, 1500, 3500);
    expect(range.length).toBe(2);
    expect(range[0].timestamp).toBe(2000);
    expect(range[1].timestamp).toBe(3000);
  });
});
