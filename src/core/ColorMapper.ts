import { BucketName } from "./types";

export interface ColorInfo {
  hex: string;
  rgb: number;
}

export class ColorMapper {
  public static readonly DEFAULT_COLORS: Record<BucketName, string> = {
    frozen: "#0f2942",
    cold: "#1e5c8a",
    warm: "#d97706",
    hot: "#f59e0b",
    burning: "#ef4444",
  };

  public static hexToRgbInt(hex: string): number {
    let cleanHex = hex.replace("#", "").trim();
    if (cleanHex.length === 3) {
      cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
    }
    const r = parseInt(cleanHex.slice(0, 2), 16) || 0;
    const g = parseInt(cleanHex.slice(2, 4), 16) || 0;
    const b = parseInt(cleanHex.slice(4, 6), 16) || 0;
    return r * 65536 + g * 256 + b;
  }

  public static getBucketName(score: number): BucketName {
    if (score < 0.2) return "frozen";
    if (score < 0.4) return "cold";
    if (score < 0.6) return "warm";
    if (score < 0.8) return "hot";
    return "burning";
  }

  public static getColor(bucket: BucketName, customColors?: Partial<Record<BucketName, string>>): ColorInfo {
    const hex = (customColors && customColors[bucket]) || this.DEFAULT_COLORS[bucket];
    return {
      hex,
      rgb: this.hexToRgbInt(hex),
    };
  }
}
