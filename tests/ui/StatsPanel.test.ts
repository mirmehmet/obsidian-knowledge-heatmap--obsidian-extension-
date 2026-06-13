import { describe, it, expect, vi } from "vitest";
import { StatsPanel } from "../../src/ui/StatsPanel";
import { NoteData, BucketMap } from "../../src/core/types";

describe("StatsPanel", () => {
  it("renders statistics successfully into a container", () => {
    const createdElements: any[] = [];
    
    const createMockElement = (tag: string, attrs?: any) => {
      const el: any = {
        tag,
        attrs,
        style: {},
        createEl: vi.fn().mockImplementation((subtag, subattrs) => {
          const subel = createMockElement(subtag, subattrs);
          createdElements.push(subel);
          return subel;
        }),
      };
      return el;
    };

    const mockContainer: any = {
      querySelector: vi.fn().mockReturnValue(null),
      createEl: vi.fn().mockImplementation((tag, attrs) => {
        const el = createMockElement(tag, attrs);
        createdElements.push(el);
        return el;
      }),
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

    expect(mockContainer.createEl).toHaveBeenCalledWith("div", { cls: "heat-stats-panel" });
    expect(createdElements.length).toBeGreaterThan(0);
    
    const hasTitle = createdElements.some(el => el.tag === "h3" && (el.attrs?.text === "📊 Vault İstatistikleri" || el.attrs?.text === "📊 Vault Statistics"));
    expect(hasTitle).toBe(true);
  });
});
