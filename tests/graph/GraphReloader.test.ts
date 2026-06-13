import { describe, it, expect, vi } from "vitest";
import { GraphReloader } from "../../src/graph/GraphReloader";

describe("GraphReloader", () => {
  it("reloads all open graph leaves", async () => {
    const mockLeaf1 = {
      getViewState: vi.fn().mockReturnValue({ type: "graph", state: {} }),
      setViewState: vi.fn().mockResolvedValue(undefined),
    };
    const mockLeaf2 = {
      getViewState: vi.fn().mockReturnValue({ type: "graph", state: { local: true } }),
      setViewState: vi.fn().mockResolvedValue(undefined),
    };

    const mockApp: any = {
      workspace: {
        getLeavesOfType: vi.fn().mockReturnValue([mockLeaf1, mockLeaf2]),
      },
    };

    const result = await GraphReloader.reload(mockApp, false);

    expect(result).toBe(true);
    expect(mockApp.workspace.getLeavesOfType).toHaveBeenCalledWith("graph");
    
    expect(mockLeaf1.getViewState).toHaveBeenCalled();
    expect(mockLeaf1.setViewState).toHaveBeenCalledWith({ type: "graph", state: {} });
    
    expect(mockLeaf2.getViewState).toHaveBeenCalled();
    expect(mockLeaf2.setViewState).toHaveBeenCalledWith({ type: "graph", state: { local: true } });
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
