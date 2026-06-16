import { describe, it, expect } from "vitest";

// Pure function test for getTrend logic implemented in main.ts
function getTrend(scoreHistory: Record<string, { score: number; timestamp: number }[]>, path: string, currentScore: number): "up" | "down" | "stable" {
  const history = scoreHistory[path];
  if (!history || history.length < 2) return "stable";

  const previousEntries = history.slice(0, -1);
  const avgPrevious = previousEntries.reduce((sum, e) => sum + e.score, 0) / previousEntries.length;
  const diff = currentScore - avgPrevious;

  if (diff > 0.05) return "up";
  if (diff < -0.05) return "down";
  return "stable";
}

describe("getTrend", () => {
  it("returns stable if history is missing or too short", () => {
    expect(getTrend({}, "note.md", 0.5)).toBe("stable");
    expect(getTrend({ "note.md": [{ score: 0.5, timestamp: 1 }] }, "note.md", 0.6)).toBe("stable");
  });

  it("returns up when current score is significantly higher than previous average", () => {
    const history = {
      "note.md": [
        { score: 0.3, timestamp: 1 },
        { score: 0.4, timestamp: 2 },
        { score: 0.5, timestamp: 3 }, // Average of previous (first two) = 0.35
      ]
    };
    // 0.5 - 0.35 = 0.15 > 0.05
    expect(getTrend(history, "note.md", 0.5)).toBe("up");
  });

  it("returns down when current score is significantly lower than previous average", () => {
    const history = {
      "note.md": [
        { score: 0.8, timestamp: 1 },
        { score: 0.8, timestamp: 2 },
        { score: 0.6, timestamp: 3 }, // Average of previous = 0.8
      ]
    };
    // 0.6 - 0.8 = -0.2 < -0.05
    expect(getTrend(history, "note.md", 0.6)).toBe("down");
  });

  it("returns stable when current score is close to previous average", () => {
    const history = {
      "note.md": [
        { score: 0.5, timestamp: 1 },
        { score: 0.5, timestamp: 2 },
        { score: 0.52, timestamp: 3 }, // Average of previous = 0.5
      ]
    };
    // 0.52 - 0.5 = 0.02 <= 0.05
    expect(getTrend(history, "note.md", 0.52)).toBe("stable");
  });
});
