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
});
