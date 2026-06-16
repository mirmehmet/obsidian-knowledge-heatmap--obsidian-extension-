import { describe, it, expect, vi } from "vitest";
import { DigestService } from "../../src/store/DigestService";
import { KnowledgeHeatMapSettings } from "../../src/store/PluginSettings";

describe("DigestService", () => {
  it("does not show digest if weeklyDigestEnabled is false", async () => {
    const mockSettings = {
      weeklyDigestEnabled: false,
      lastDigestDate: "",
      scoreHistory: {},
    } as any as KnowledgeHeatMapSettings;

    const saveCallback = vi.fn();
    const result = await DigestService.checkAndShow(mockSettings, saveCallback);
    expect(result).toBe(false);
    expect(saveCallback).not.toHaveBeenCalled();
  });

  it("does not show digest if interval is not met", async () => {
    const mockSettings = {
      weeklyDigestEnabled: true,
      lastDigestDate: new Date().toISOString(),
      scoreHistory: {},
    } as any as KnowledgeHeatMapSettings;

    const saveCallback = vi.fn();
    const result = await DigestService.checkAndShow(mockSettings, saveCallback);
    expect(result).toBe(false);
  });

  it("generates digest correctly when interval is met and there are changes", async () => {
    const lastWeek = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const mockSettings = {
      weeklyDigestEnabled: true,
      lastDigestDate: lastWeek,
      scoreHistory: {
        "note1.md": [
          { score: 0.1, timestamp: 1 },
          { score: 0.9, timestamp: 2 }, // Frozen -> Burning (improved)
        ],
        "note2.md": [
          { score: 0.8, timestamp: 1 },
          { score: 0.2, timestamp: 2 }, // Hot -> Cold (declined)
        ],
      },
    } as any as KnowledgeHeatMapSettings;

    const saveCallback = vi.fn().mockResolvedValue(undefined);
    const result = await DigestService.checkAndShow(mockSettings, saveCallback);
    expect(result).toBe(true);
    expect(saveCallback).toHaveBeenCalled();
    expect(mockSettings.lastDigestDate).not.toBe(lastWeek);
  });
});
