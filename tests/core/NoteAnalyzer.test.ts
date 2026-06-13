import { describe, it, expect } from "vitest";
import { NoteAnalyzer } from "../../src/core/NoteAnalyzer";

describe("NoteAnalyzer", () => {
  it("computes all inlinks correctly", () => {
    const resolvedLinks = {
      "a.md": { "b.md": 1, "c.md": 2 },
      "b.md": { "c.md": 1 },
    };

    const inlinks = NoteAnalyzer.computeAllInlinks(resolvedLinks);
    expect(inlinks["b.md"]).toBe(1);
    expect(inlinks["c.md"]).toBe(3);
    expect(inlinks["a.md"]).toBeUndefined();
  });

  it("filters notes by folder and tag correctly", () => {
    const analyzer = new NoteAnalyzer({} as any);

    const notes = [
      {
        path: "Inbox/note1.md",
        name: "note1",
        daysSinceModified: 1,
        charCount: 100,
        outlinks: 0,
        inlinks: 0,
        visitCount: 0,
        tags: ["#active", "#project"],
        frontmatter: {},
      },
      {
        path: "Archive/note2.md",
        name: "note2",
        daysSinceModified: 10,
        charCount: 200,
        outlinks: 0,
        inlinks: 0,
        visitCount: 0,
        tags: ["#old"],
        frontmatter: {},
      },
      {
        path: "Inbox/note3.md",
        name: "note3",
        daysSinceModified: 1,
        charCount: 100,
        outlinks: 0,
        inlinks: 0,
        visitCount: 0,
        tags: ["#archive"],
        frontmatter: {},
      },
    ];

    const filtered = analyzer.filterNotes(notes, ["Archive"], ["#archive"]);
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].path).toBe("Inbox/note1.md");
  });

  it("collects note data with correct values including normalized tags", () => {
    const mockFile: any = {
      path: "Inbox/test.md",
      basename: "test",
      stat: {
        mtime: Date.now(),
        size: 500,
      },
    };

    const mockApp: any = {
      metadataCache: {
        getFileCache: () => ({
          tags: [{ tag: "#active" }],
          frontmatter: {
            tags: ["project", "cool"],
          },
        }),
        resolvedLinks: {
          "Inbox/test.md": {
            "other.md": 1,
          },
        },
      },
    };

    const analyzer = new NoteAnalyzer(mockApp);
    const inlinkCounts = { "Inbox/test.md": 5 };
    const visitCounts = { "Inbox/test.md": 10 };

    const data = analyzer.collectNoteData(mockFile, inlinkCounts, visitCounts);

    expect(data.path).toBe("Inbox/test.md");
    expect(data.name).toBe("test");
    expect(data.daysSinceModified).toBeCloseTo(0, 3);
    expect(data.charCount).toBe(500);
    expect(data.outlinks).toBe(1);
    expect(data.inlinks).toBe(5);
    expect(data.visitCount).toBe(10);
    expect(data.tags).toContain("#active");
    expect(data.tags).toContain("#project");
    expect(data.tags).toContain("#cool");
  });
});
