import { describe, it, expect, vi } from "vitest";
import { GraphJsonManager } from "../../src/graph/GraphJsonManager";
import { BucketMap } from "../../src/core/types";

describe("GraphJsonManager", () => {
  it("reads graph.json and handles error cases", async () => {
    const mockAdapter: any = {
      exists: vi.fn().mockResolvedValue(true),
      read: vi.fn().mockResolvedValue('{"colorGroups": []}'),
    };
    const mockApp: any = {
      vault: {
        adapter: mockAdapter,
      },
    };

    const manager = new GraphJsonManager(mockApp);
    const result = await manager.readGraphJson();

    expect(mockAdapter.exists).toHaveBeenCalledWith(".obsidian/graph.json");
    expect(mockAdapter.read).toHaveBeenCalledWith(".obsidian/graph.json");
    expect(result).toEqual({ colorGroups: [] });
  });

  it("throws error when graph.json contains invalid JSON", async () => {
    const mockAdapter: any = {
      exists: vi.fn().mockResolvedValue(true),
      read: vi.fn().mockResolvedValue('{invalid json}'),
    };
    const mockApp: any = {
      vault: {
        adapter: mockAdapter,
      },
    };

    const manager = new GraphJsonManager(mockApp);
    await expect(manager.readGraphJson()).rejects.toThrow("graph.json dosya formatı bozuk veya geçersiz.");
  });

  it("applies heat groups, preserves user groups, and backs up original config", async () => {
    const originalConfig = JSON.stringify({
      colorGroups: [
        { query: "tag:#todo", color: { a: 1, rgb: 12345 } },
        { query: 'path:"Old/Note.md"', color: { a: 1, rgb: 99999 } }, 
      ],
    });

    let writtenContent = "";
    const mockAdapter: any = {
      exists: vi.fn().mockResolvedValue(true),
      read: vi.fn().mockResolvedValue(originalConfig),
      write: vi.fn().mockImplementation((path, content) => {
        writtenContent = content;
        return Promise.resolve();
      }),
    };
    const mockApp: any = {
      vault: {
        adapter: mockAdapter,
      },
    };

    const manager = new GraphJsonManager(mockApp);
    
    const buckets: BucketMap = {
      frozen: ["FrozenNote.md"],
      cold: [],
      warm: [],
      hot: [],
      burning: ["BurningNote.md"],
    };

    await manager.applyHeatGroups(buckets);

    expect(manager.getBackup()).toBe(originalConfig);

    const parsedWritten = JSON.parse(writtenContent);

    expect(parsedWritten.colorGroups).toContainEqual({
      query: "tag:#todo",
      color: { a: 1, rgb: 12345 },
    });

    expect(parsedWritten.colorGroups).not.toContainEqual({
      query: 'path:"Old/Note.md"',
      color: { a: 1, rgb: 99999 },
    });

    expect(parsedWritten.colorGroups).toContainEqual({
      query: 'path:"FrozenNote.md"',
      color: { a: 1, rgb: 993602 }, 
    });
    expect(parsedWritten.colorGroups).toContainEqual({
      query: 'path:"BurningNote.md"',
      color: { a: 1, rgb: 15680580 }, 
    });
  });

  it("restores original config correctly", async () => {
    const originalConfig = '{"colorGroups": []}';
    let restoredContent = "";
    const mockAdapter: any = {
      write: vi.fn().mockImplementation((path, content) => {
        restoredContent = content;
        return Promise.resolve();
      }),
    };
    const mockApp: any = {
      vault: {
        adapter: mockAdapter,
      },
    };

    const manager = new GraphJsonManager(mockApp);
    manager.setBackup(originalConfig);

    await manager.restore();

    expect(mockAdapter.write).toHaveBeenCalledWith(".obsidian/graph.json", originalConfig);
    expect(manager.getBackup()).toBeNull();
    expect(restoredContent).toBe(originalConfig);
  });

  it("performs fallback restore when backup is null", async () => {
    const graphWithHeatGroups = JSON.stringify({
      colorGroups: [
        { query: "tag:#todo", color: { a: 1, rgb: 12345 } },
        { query: 'path:"FrozenNote.md"', color: { a: 1, rgb: 993602 } },
        { query: 'path:"BurningNote.md"', color: { a: 1, rgb: 15680580 } },
      ],
    });

    let writtenContent = "";
    const mockAdapter: any = {
      exists: vi.fn().mockResolvedValue(true),
      read: vi.fn().mockResolvedValue(graphWithHeatGroups),
      write: vi.fn().mockImplementation((path, content) => {
        writtenContent = content;
        return Promise.resolve();
      }),
    };
    const mockApp: any = {
      vault: {
        adapter: mockAdapter,
      },
    };

    const manager = new GraphJsonManager(mockApp);
    // backup remains null

    await manager.restore();

    expect(mockAdapter.exists).toHaveBeenCalledWith(".obsidian/graph.json");
    expect(mockAdapter.read).toHaveBeenCalledWith(".obsidian/graph.json");
    expect(mockAdapter.write).toHaveBeenCalledWith(".obsidian/graph.json", expect.any(String));

    const parsed = JSON.parse(writtenContent);
    expect(parsed.colorGroups).toEqual([
      { query: "tag:#todo", color: { a: 1, rgb: 12345 } },
    ]);
  });
});
