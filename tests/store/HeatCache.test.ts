import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HeatCache } from "../../src/store/HeatCache";

describe("HeatCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores and retrieves scores correctly", () => {
    const cache = new HeatCache(30);
    cache.set("a.md", 0.85);

    expect(cache.get("a.md")).toBe(0.85);
    expect(cache.get("non-existent.md")).toBeNull();
  });

  it("expires entries after TTL duration", () => {
    const cache = new HeatCache(30); // 30 minutes TTL
    cache.set("a.md", 0.85);

    // Advance time by 29 minutes -> should still be there
    vi.advanceTimersByTime(29 * 60 * 1000);
    expect(cache.get("a.md")).toBe(0.85);

    // Advance time by 2 more minutes (total 31 minutes) -> should be expired
    vi.advanceTimersByTime(2 * 60 * 1000);
    expect(cache.get("a.md")).toBeNull();
  });

  it("invalidates specific path", () => {
    const cache = new HeatCache(30);
    cache.set("a.md", 0.5);
    cache.set("b.md", 0.6);

    cache.invalidate("a.md");

    expect(cache.get("a.md")).toBeNull();
    expect(cache.get("b.md")).toBe(0.6);
  });

  it("invalidates all entries", () => {
    const cache = new HeatCache(30);
    cache.set("a.md", 0.5);
    cache.set("b.md", 0.6);

    cache.invalidateAll();

    expect(cache.get("a.md")).toBeNull();
    expect(cache.get("b.md")).toBeNull();
    expect(cache.size()).toBe(0);
  });
});
