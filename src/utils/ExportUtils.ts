/**
 * Utility for exporting SVG elements as PNG or SVG files.
 */
export class ExportUtils {
  /**
   * Exports an SVG element as a downloadable PNG file.
   */
  public static async exportAsPng(svgElement: SVGSVGElement, filename = "heat-map.png"): Promise<void> {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const rect = svgElement.getBoundingClientRect();
      canvas.width = rect.width * 2;   // 2x for retina
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          ExportUtils.downloadBlob(blob, filename);
        }
      }, "image/png");
    };
    img.src = url;
  }

  /**
   * Exports an SVG element as a downloadable SVG file.
   */
  public static exportAsSvg(svgElement: SVGSVGElement, filename = "heat-map.svg"): void {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    ExportUtils.downloadBlob(blob, filename);
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
