import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StatsPanel } from "../../src/ui/StatsPanel";
import { NoteData, BucketMap } from "../../src/core/types";

describe("StatsPanel", () => {
  let originalDocument: any;

  beforeEach(() => {
    // Save original
    originalDocument = (globalThis as any).document;

    // Create minimal mock document
    const createMockEl = (tag: string): any => ({
      tag,
      classList: { add: vi.fn() },
      style: {},
      textContent: "",
      innerHTML: "",
      children: [] as any[],
      querySelector: vi.fn().mockReturnValue(null),
      querySelectorAll: vi.fn().mockReturnValue([]),
      appendChild: vi.fn(function (this: any, child: any) {
        this.children.push(child);
        return child;
      }),
      setAttribute: vi.fn(),
    });

    (globalThis as any).document = {
      createDocumentFragment: vi.fn(() => ({
        appendChild: vi.fn(),
      })),
      createElement: vi.fn((tag: string) => createMockEl(tag)),
    };
  });

  afterEach(() => {
    if (originalDocument !== undefined) {
      (globalThis as any).document = originalDocument;
    } else {
      delete (globalThis as any).document;
    }
  });

  it("renders statistics successfully into a container", () => {
    const mockContainer: any = {
      querySelector: vi.fn().mockReturnValue(null),
      appendChild: vi.fn(),
    };

    const stats = new StatsPanel(mockContainer);

    const notes: NoteData[] = [
      { path: "a.md", name: "a", daysSinceModified: 1, charCount: 100, outlinks: 0, inlinks: 0, visitCount: 0, tags: [], frontmatter: {} }
    ];
    const scores = { "a.md": 0.5 };
    const buckets: BucketMap = {
      frozen: [],
      cold: [],
      warm: ["a.md"],
      hot: [],
      burning: [],
    };

    stats.render(notes, scores, buckets);

    // Verify fragment was created and appended
    expect(document.createDocumentFragment).toHaveBeenCalled();
    // Verify the panel div was created  
    expect(document.createElement).toHaveBeenCalledWith("div");
    expect(document.createElement).toHaveBeenCalledWith("h3");
    // Verify container.appendChild was called (fragment appended)
    expect(mockContainer.appendChild).toHaveBeenCalled();
  });
});
