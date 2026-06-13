import { HeatScore } from "../core/types";

interface CacheEntry {
  score: HeatScore;
  timestamp: number;
}

export class HeatCache {
  private cache = new Map<string, CacheEntry>();
  private ttlMs: number;

  constructor(ttlMinutes = 30) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  public setTTL(ttlMinutes: number): void {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  public get(path: string): HeatScore | null {
    const entry = this.cache.get(path);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.ttlMs;
    if (isExpired) {
      this.cache.delete(path);
      return null;
    }

    return entry.score;
  }

  public set(path: string, score: HeatScore): void {
    this.cache.set(path, {
      score,
      timestamp: Date.now(),
    });
  }

  public invalidate(path: string): void {
    this.cache.delete(path);
  }

  public invalidateAll(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}
