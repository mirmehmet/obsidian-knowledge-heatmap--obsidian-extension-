import { describe, it, expect } from "vitest";
import { GroupsBuilder } from "../../src/graph/GroupsBuilder";
import { BucketMap } from "../../src/core/types";

describe("GroupsBuilder", () => {
  it("builds empty array for empty buckets", () => {
    const buckets: BucketMap = { frozen: [], cold: [], warm: [], hot: [], burning: [] };
    const result = GroupsBuilder.build(buckets);
    expect(result).toEqual([]);
  });

  it("builds color groups for single path per bucket", () => {
    const buckets: BucketMap = {
      frozen: ["notes/a.md"],
      cold: [],
      warm: ["notes/b.md"],
      hot: [],
      burning: [],
    };
    const result = GroupsBuilder.build(buckets);
    expect(result.length).toBe(2);
    expect(result[0].query).toBe('path:"notes/a.md"');
    expect(result[0].color.a).toBe(1);
    expect(result[1].query).toBe('path:"notes/b.md"');
  });

  it("chunks large path lists according to chunkSize", () => {
    const paths = Array.from({ length: 450 }, (_, i) => `note${i}.md`);
    const buckets: BucketMap = {
      frozen: paths,
      cold: [],
      warm: [],
      hot: [],
      burning: [],
    };
    const result = GroupsBuilder.build(buckets, undefined, 200);
    expect(result.length).toBe(3); // 200 + 200 + 50
    expect(result[0].query.split(" OR ").length).toBe(200);
    expect(result[1].query.split(" OR ").length).toBe(200);
    expect(result[2].query.split(" OR ").length).toBe(50);
  });

  it("respects custom colors", () => {
    const buckets: BucketMap = {
      frozen: ["a.md"],
      cold: [],
      warm: [],
      hot: [],
      burning: [],
    };
    const result = GroupsBuilder.build(buckets, { frozen: "#ffffff" });
    expect(result[0].color.rgb).toBe(16777215); // white = 255*65536 + 255*256 + 255
  });
});
