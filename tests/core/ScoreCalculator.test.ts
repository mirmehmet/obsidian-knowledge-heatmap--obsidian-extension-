import { describe, it, expect } from "vitest";
import { ScoreCalculator } from "../../src/core/ScoreCalculator";
import { NoteData, Weights } from "../../src/core/types";

describe("ScoreCalculator", () => {
  const mockNote: NoteData = {
    path: "test.md",
    name: "test",
    daysSinceModified: 0, // e^(-0/30) = 1.0
    charCount: 5000,      // 5000/5000 = 1.0
    outlinks: 25,
    inlinks: 25,          // links = 50 -> 50/50 = 1.0
    visitCount: 100,      // 100/100 = 1.0
    tags: [],
    frontmatter: {},
  };

  it("calculates maximum score when all normalized values are 1.0", () => {
    const weights: Weights = {
      recency: 20,
      linkDensity: 20,
      visitFreq: 20,
      orphan: 20,
      contentLen: 20,
    };
    const score = ScoreCalculator.calculate(mockNote, weights);
    expect(score).toBeCloseTo(1.0, 5);
  });

  it("calculates minimum score when all normalized values are 0.0", () => {
    const coldNote: NoteData = {
      path: "cold.md",
      name: "cold",
      daysSinceModified: 9999, // e^(-9999/30) ~ 0
      charCount: 0,            // 0
      outlinks: 0,
      inlinks: 0,              // 0 links
      visitCount: 0,           // 0
      tags: [],
      frontmatter: {},
    };
    const weights: Weights = {
      recency: 20,
      linkDensity: 20,
      visitFreq: 20,
      orphan: 20,
      contentLen: 20,
    };
    const score = ScoreCalculator.calculate(coldNote, weights);
    expect(score).toBeCloseTo(0.0, 5);
  });

  it("returns 0 if all weights are 0", () => {
    const weights: Weights = {
      recency: 0,
      linkDensity: 0,
      visitFreq: 0,
      orphan: 0,
      contentLen: 0,
    };
    const score = ScoreCalculator.calculate(mockNote, weights);
    expect(score).toBe(0);
  });

  it("applies weights correctly", () => {
    const mixNote: NoteData = {
      path: "mix.md",
      name: "mix",
      daysSinceModified: 0, // recency score = 1.0
      charCount: 0,         // contentLen score = 0.0
      outlinks: 0,
      inlinks: 0,           // links = 0 -> linkDensity = 0.0, orphan = 0.0
      visitCount: 0,        // visitFreq score = 0.0
      tags: [],
      frontmatter: {},
    };

    // 100% weight on recency -> score should be 1.0
    expect(
      ScoreCalculator.calculate(mixNote, {
        recency: 100,
        linkDensity: 0,
        visitFreq: 0,
        orphan: 0,
        contentLen: 0,
      })
    ).toBeCloseTo(1.0, 5);

    // 100% weight on contentLen -> score should be 0.0
    expect(
      ScoreCalculator.calculate(mixNote, {
        recency: 0,
        linkDensity: 0,
        visitFreq: 0,
        orphan: 0,
        contentLen: 100,
      })
    ).toBeCloseTo(0.0, 5);

    // 50-50 weight on recency and contentLen -> score should be 0.5
    expect(
      ScoreCalculator.calculate(mixNote, {
        recency: 50,
        linkDensity: 0,
        visitFreq: 0,
        orphan: 0,
        contentLen: 50,
      })
    ).toBeCloseTo(0.5, 5);
  });

  it("applies activeCriteria filters correctly", () => {
    const mixNote: NoteData = {
      path: "mix.md",
      name: "mix",
      daysSinceModified: 0, // recency score = 1.0
      charCount: 0,         // contentLen score = 0.0
      outlinks: 0,
      inlinks: 0,
      visitCount: 0,
      tags: [],
      frontmatter: {},
    };

    // 50% recency (value 1.0) and 50% contentLen (value 0.0)
    // but recency is disabled -> score should be 0.0 (only contentLen is active)
    expect(
      ScoreCalculator.calculate(
        mixNote,
        {
          recency: 50,
          linkDensity: 0,
          visitFreq: 0,
          orphan: 0,
          contentLen: 50,
        },
        {
          recency: false,
          linkDensity: true,
          visitFreq: true,
          orphan: true,
          contentLen: true,
        }
      )
    ).toBeCloseTo(0.0, 5);
  });

  it("calculates recency differently based on timeRange parameter", () => {
    const freshNote: NoteData = {
      path: "fresh.md",
      name: "fresh",
      daysSinceModified: 7, // 7 days old
      charCount: 0,
      outlinks: 0,
      inlinks: 0,
      visitCount: 0,
      tags: [],
      frontmatter: {},
    };

    const weights: Weights = {
      recency: 100,
      linkDensity: 0,
      visitFreq: 0,
      orphan: 0,
      contentLen: 0,
    };

    // For 7d: e^(-7/7) = e^(-1) ~ 0.36787
    const score7d = ScoreCalculator.calculate(freshNote, weights, undefined, "7d");
    // For 90d: e^(-7/90) ~ 0.925
    const score90d = ScoreCalculator.calculate(freshNote, weights, undefined, "90d");
    // For 30d: e^(-7/30) ~ 0.792
    const score30d = ScoreCalculator.calculate(freshNote, weights, undefined, "30d");
    // Default (all): e^(-7/30) ~ 0.792
    const scoreDefault = ScoreCalculator.calculate(freshNote, weights, undefined);

    expect(score7d).toBeCloseTo(Math.exp(-1), 5);
    expect(score90d).toBeCloseTo(Math.exp(-7 / 90), 5);
    expect(score30d).toBeCloseTo(Math.exp(-7 / 30), 5);
    expect(scoreDefault).toBeCloseTo(score30d, 5);
  });
});
