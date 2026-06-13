import { describe, it, expect, vi } from "vitest";
import { GraphReloader } from "../../src/graph/GraphReloader";

describe("GraphReloader", () => {
  it("reloads all open graph leaves using renderer or data methods if available", async () => {
    const mockLeaf1 = {
      view: {
        renderer: {
          onSettingsChanged: vi.fn(),
        },
      },
      getViewState: vi.fn().mockReturnValue({ type: "graph", state: {} }),
      setViewState: vi.fn().mockResolvedValue(undefined),
    };
    const mockLeaf2 = {
      view: {
        data: {
          onChanged: vi.fn(),
        },
      },
      getViewState: vi.fn().mockReturnValue({ type: "graph", state: { local: true } }),
      setViewState: vi.fn().mockResolvedValue(undefined),
    };

    const mockApp: any = {
      vault: {
        adapter: {
          exists: vi.fn().mockResolvedValue(true),
          read: vi.fn().mockResolvedValue(JSON.stringify({ colorGroups: [{ query: "test", color: {} }] })),
        },
      },
      internalPlugins: {
        plugins: {
          graph: {
            instance: {
              options: {},
            },
          },
        },
      },
      workspace: {
        getLeavesOfType: vi.fn().mockReturnValue([mockLeaf1, mockLeaf2]),
      },
    };

    const result = await GraphReloader.reload(mockApp, false);

    expect(result).toBe(true);
    expect(mockApp.workspace.getLeavesOfType).toHaveBeenCalledWith("graph");
    expect(mockApp.vault.adapter.read).toHaveBeenCalledWith(".obsidian/graph.json");
    
    expect(mockLeaf1.view.renderer.onSettingsChanged).toHaveBeenCalled();
    expect(mockLeaf2.view.data.onChanged).toHaveBeenCalled();
    
    expect(mockLeaf1.setViewState).not.toHaveBeenCalled();
    expect(mockLeaf2.setViewState).not.toHaveBeenCalled();
  });

  it("falls back to setViewState toggling when methods are missing", async () => {
    const mockLeaf = {
      view: {},
      getViewState: vi.fn().mockReturnValue({ type: "graph", state: { query: "test" } }),
      setViewState: vi.fn().mockResolvedValue(undefined),
    };

    const mockApp: any = {
      vault: {
        adapter: {
          exists: vi.fn().mockResolvedValue(true),
          read: vi.fn().mockResolvedValue(JSON.stringify({})),
        },
      },
      workspace: {
        getLeavesOfType: vi.fn().mockReturnValue([mockLeaf]),
      },
    };

    const result = await GraphReloader.reload(mockApp, false);

    expect(result).toBe(true);
    expect(mockLeaf.setViewState).toHaveBeenNthCalledWith(1, { type: "empty" });
    expect(mockLeaf.setViewState).toHaveBeenNthCalledWith(2, { type: "graph", state: { query: "test" } });
  });

  it("returns false and optionally notifies when no graph leaves are open", async () => {
    const mockApp: any = {
      workspace: {
        getLeavesOfType: vi.fn().mockReturnValue([]),
      },
    };

    const result = await GraphReloader.reload(mockApp, false);
    expect(result).toBe(false);
  });
});
