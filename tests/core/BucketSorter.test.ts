import { describe, it, expect } from "vitest";
import { BucketSorter } from "../../src/core/BucketSorter";

describe("BucketSorter", () => {
  it("sorts path-score pairs using a Record/Object", () => {
    const scores: Record<string, number> = {
      "noteA.md": 0.1,  // frozen
      "noteB.md": 0.3,  // cold
      "noteC.md": 0.5,  // warm
      "noteD.md": 0.7,  // hot
      "noteE.md": 0.9,  // burning
      "noteF.md": 0.95, // burning
    };

    const buckets = BucketSorter.sort(scores);

    expect(buckets.frozen).toEqual(["noteA.md"]);
    expect(buckets.cold).toEqual(["noteB.md"]);
    expect(buckets.warm).toEqual(["noteC.md"]);
    expect(buckets.hot).toEqual(["noteD.md"]);
    expect(buckets.burning).toEqual(["noteE.md", "noteF.md"]);
  });

  it("sorts path-score pairs using a Map", () => {
    const scores = new Map<string, number>([
      ["noteA.md", 0.1],
      ["noteB.md", 0.5],
    ]);

    const buckets = BucketSorter.sort(scores);

    expect(buckets.frozen).toEqual(["noteA.md"]);
    expect(buckets.warm).toEqual(["noteB.md"]);
    expect(buckets.cold).toEqual([]);
    expect(buckets.hot).toEqual([]);
    expect(buckets.burning).toEqual([]);
  });
});
