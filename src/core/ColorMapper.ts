import { BucketName } from "./types";

export interface ColorInfo {
  hex: string;
  rgb: number;
}

/**
 * Handles color mapping, conversions, and default visual settings for heat map score representations.
 */
export class ColorMapper {
  /** All available palettes */
  public static readonly PALETTES: Record<string, Record<BucketName, string>> = {
    amber: {
      frozen: "#0f2942",
      cold: "#1e5c8a",
      warm: "#d97706",
      hot: "#f59e0b",
      burning: "#ef4444",
    },
    ocean: {
      frozen: "#0c1426",
      cold: "#1a3a5c",
      warm: "#2980b9",
      hot: "#3498db",
      burning: "#1abc9c",
    },
    forest: {
      frozen: "#1a2e1a",
      cold: "#2d5a2d",
      warm: "#4caf50",
      hot: "#8bc34a",
      burning: "#cddc39",
    },
    sunset: {
      frozen: "#1a0a2e",
      cold: "#4a1a6b",
      warm: "#e91e63",
      hot: "#ff5722",
      burning: "#ff9800",
    },
    monochrome: {
      frozen: "#1a1a1a",
      cold: "#4a4a4a",
      warm: "#8a8a8a",
      hot: "#c0c0c0",
      burning: "#f0f0f0",
    },
    neon: {
      frozen: "#0a0a1a",
      cold: "#1a0a3a",
      warm: "#e040fb",
      hot: "#7c4dff",
      burning: "#00e5ff",
    },
  };

  /** Default color hex codes for each of the 5 heat buckets (amber palette). */
  public static readonly DEFAULT_COLORS: Record<BucketName, string> = ColorMapper.PALETTES.amber;

  /**
   * Converts a hex color string into a decimal integer color code as required by Obsidian's graph.json schema.
   * e.g., `#f59e0b` -> `16072715`.
   * 
   * @param hex - Hexadecimal color representation (e.g. "#fff", "#ef4444").
   * @returns Decimal integer representation of the RGB color value.
   */
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

  /**
   * Decides which heat bucket a given score belongs to based on score thresholds.
   * 
   * @param score - Calculated normalized heat score in the range [0.0, 1.0].
   * @returns The BucketName corresponding to the score.
   */
  public static getBucketName(score: number): BucketName {
    if (score < 0.2) return "frozen";
    if (score < 0.4) return "cold";
    if (score < 0.6) return "warm";
    if (score < 0.8) return "hot";
    return "burning";
  }

  /**
   * Resolves the hex code and decimal integer representation for a specific heat bucket.
   * Supports falling back to defaults if a custom palette color is missing.
   * 
   * @param bucket - The name of the target heat bucket.
   * @param customColors - Optional override colors for each bucket.
   * @returns ColorInfo containing both hex string and decimal RGB representations.
   */
  public static getColor(bucket: BucketName, customColors?: Partial<Record<BucketName, string>>): ColorInfo {
    const hex = (customColors && customColors[bucket]) || this.DEFAULT_COLORS[bucket];
    return {
      hex,
      rgb: this.hexToRgbInt(hex),
    };
  }

  /**
   * Resolves palette colors by name. Returns the colors for the given palette,
   * or the default amber palette if the name is not recognized.
   */
  public static getPaletteColors(paletteName: string): Record<BucketName, string> {
    return this.PALETTES[paletteName] || this.PALETTES.amber;
  }

  /**
   * Returns all available palette names.
   */
  public static getAvailablePaletteNames(): string[] {
    return Object.keys(this.PALETTES);
  }
}
