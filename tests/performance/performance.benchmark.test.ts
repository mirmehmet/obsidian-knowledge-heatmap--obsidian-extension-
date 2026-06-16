import { describe, it, expect } from "vitest";
import { NoteAnalyzer } from "../../src/core/NoteAnalyzer";
import { ScoreCalculator } from "../../src/core/ScoreCalculator";
import { BucketSorter } from "../../src/core/BucketSorter";
import { Weights } from "../../src/core/types";

describe("Performance Benchmark", () => {
  it("processes 1000 notes in less than 2 seconds", async () => {
    const mockFiles: any[] = [];
    const resolvedLinks: Record<string, Record<string, number>> = {};

    for (let i = 0; i < 1000; i++) {
      const path = `folder/note-${i}.md`;
      mockFiles.push({
        path,
        basename: `note-${i}`,
        stat: {
          mtime: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30, 
          size: Math.floor(Math.random() * 8000),
        },
      });

      const target1 = `folder/note-${Math.floor(Math.random() * 1000)}.md`;
      const target2 = `folder/note-${Math.floor(Math.random() * 1000)}.md`;
      resolvedLinks[path] = {
        [target1]: 1,
        [target2]: 1,
      };
    }

    const mockApp: any = {
      metadataCache: {
        getFileCache: () => ({
          tags: [{ tag: "#active" }],
          frontmatter: {},
        }),
        resolvedLinks,
      },
    };

    const analyzer = new NoteAnalyzer(mockApp);
    const visitCounts: Record<string, number> = {};
    const weights: Weights = {
      recency: 40,
      linkDensity: 30,
      visitFreq: 20,
      orphan: 10,
      contentLen: 0,
    };

    const start = performance.now();

    const notesData = await analyzer.analyzeVaultChunked(mockFiles, visitCounts, [], []);

    const scores: Record<string, number> = {};
    notesData.forEach(note => {
      scores[note.path] = ScoreCalculator.calculate(note, weights, undefined, "all");
    });

    const buckets = BucketSorter.sort(scores);

    const end = performance.now();
    const elapsed = end - start;

    console.log(`Benchmark: Analyzed and sorted 1000 notes in ${elapsed.toFixed(2)}ms`);

    expect(notesData.length).toBe(1000);
    expect(buckets.frozen).toBeDefined();
    expect(elapsed).toBeLessThan(2000);
  });
});
