import { describe, it, expect } from "vitest";
import { ColorMapper } from "../../src/core/ColorMapper";

describe("ColorMapper", () => {
  describe("hexToRgbInt", () => {
    it("converts standard 6-digit hex values correctly", () => {
      // Amber: #f59e0b -> R=245, G=158, B=11 -> 245*65536 + 158*256 + 11 = 16096779
      expect(ColorMapper.hexToRgbInt("#f59e0b")).toBe(16096779);
      
      // Black: #000000 -> 0
      expect(ColorMapper.hexToRgbInt("#000000")).toBe(0);

      // White: #ffffff -> R=255, G=255, B=255 -> 255*65536 + 255*256 + 255 = 16777215
      expect(ColorMapper.hexToRgbInt("#ffffff")).toBe(16777215);
    });

    it("converts 3-digit shorthand hex values correctly", () => {
      // #f00 -> #ff0000 -> 16711680
      expect(ColorMapper.hexToRgbInt("#f00")).toBe(16711680);
      
      // #0f0 -> #00ff00 -> 65280
      expect(ColorMapper.hexToRgbInt("#0f0")).toBe(65280);
    });

    it("ignores leading hash sign and handles whitespace", () => {
      expect(ColorMapper.hexToRgbInt("f59e0b")).toBe(16096779);
      expect(ColorMapper.hexToRgbInt("  #f59e0b  ")).toBe(16096779);
    });
  });

  describe("getBucketName", () => {
    it("maps score to correct bucket name", () => {
      expect(ColorMapper.getBucketName(0.0)).toBe("frozen");
      expect(ColorMapper.getBucketName(0.199)).toBe("frozen");
      
      expect(ColorMapper.getBucketName(0.2)).toBe("cold");
      expect(ColorMapper.getBucketName(0.399)).toBe("cold");
      
      expect(ColorMapper.getBucketName(0.4)).toBe("warm");
      expect(ColorMapper.getBucketName(0.599)).toBe("warm");
      
      expect(ColorMapper.getBucketName(0.6)).toBe("hot");
      expect(ColorMapper.getBucketName(0.799)).toBe("hot");
      
      expect(ColorMapper.getBucketName(0.8)).toBe("burning");
      expect(ColorMapper.getBucketName(1.0)).toBe("burning");
    });
  });

  describe("getColor", () => {
    it("returns default colors info", () => {
      const frozenInfo = ColorMapper.getColor("frozen");
      expect(frozenInfo.hex).toBe("#0f2942");
      expect(frozenInfo.rgb).toBe(ColorMapper.hexToRgbInt("#0f2942"));
    });

    it("supports custom colors override", () => {
      const customColors = {
        frozen: "#111111",
        burning: "#990000",
      };
      
      const frozenInfo = ColorMapper.getColor("frozen", customColors);
      expect(frozenInfo.hex).toBe("#111111");
      expect(frozenInfo.rgb).toBe(ColorMapper.hexToRgbInt("#111111"));

      // Non-overridden bucket should fall back to default
      const coldInfo = ColorMapper.getColor("cold", customColors);
      expect(coldInfo.hex).toBe("#1e5c8a");
    });
  });
});
