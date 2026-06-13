import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { VisitTracker } from "../../src/store/VisitTracker";

describe("VisitTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads and returns visit counts", async () => {
    const mockPlugin: any = {
      loadData: vi.fn().mockResolvedValue({
        visits: { "a.md": 5 },
      }),
    };

    const tracker = new VisitTracker({} as any, mockPlugin);
    const visits = await tracker.load();

    expect(visits).toEqual({ "a.md": 5 });
    expect(tracker.getVisitCount("a.md")).toBe(5);
    expect(tracker.getVisitCount("non-existent.md")).toBe(0);
  });

  it("tracks file opening and debounces save", async () => {
    let fileOpenCallback: ((file: any) => void) | null = null;
    const mockApp: any = {
      workspace: {
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === "file-open") {
            fileOpenCallback = callback;
          }
          return {};
        }),
      },
    };

    const mockPlugin: any = {
      loadData: vi.fn().mockResolvedValue({ visits: {} }),
      saveData: vi.fn().mockResolvedValue(undefined),
      registerEvent: vi.fn(),
    };

    const tracker = new VisitTracker(mockApp, mockPlugin);
    await tracker.load();
    tracker.register();

    expect(fileOpenCallback).toBeDefined();

    if (fileOpenCallback) {
      fileOpenCallback({ path: "test.md", extension: "md" });
      fileOpenCallback({ path: "test.md", extension: "md" });
      fileOpenCallback({ path: "other.md", extension: "md" });
      fileOpenCallback({ path: "canvas.canvas", extension: "canvas" }); 
    }

    expect(tracker.getVisitCount("test.md")).toBe(2);
    expect(tracker.getVisitCount("other.md")).toBe(1);
    expect(tracker.getVisitCount("canvas.canvas")).toBe(0);

    expect(mockPlugin.saveData).not.toHaveBeenCalled();

    // Advance clock to trigger setTimeout
    vi.advanceTimersByTime(100);

    // Flush the promise microtask queue (for the awaits inside the async setTimeout callback)
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }

    expect(mockPlugin.saveData).toHaveBeenCalledWith({
      visits: {
        "test.md": 2,
        "other.md": 1,
      },
    });
  });
});
