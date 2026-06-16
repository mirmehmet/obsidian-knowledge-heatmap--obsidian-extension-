import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ExportUtils } from "../../src/utils/ExportUtils";

describe("ExportUtils", () => {
  let originalXMLSerializer: any;
  let originalBlob: any;
  let originalURL: any;
  let originalDocument: any;

  beforeEach(() => {
    originalXMLSerializer = (globalThis as any).XMLSerializer;
    originalBlob = (globalThis as any).Blob;
    originalURL = (globalThis as any).URL;
    originalDocument = (globalThis as any).document;

    // Minimal Mock implementations
    (globalThis as any).XMLSerializer = class {
      serializeToString() {
        return "<svg></svg>";
      }
    };

    (globalThis as any).Blob = class {
      constructor(public parts: any[], public options: any) {}
    };

    (globalThis as any).URL = {
      createObjectURL: vi.fn(() => "blob:test-url"),
      revokeObjectURL: vi.fn()
    };

    (globalThis as any).document = {
      createElement: vi.fn((tag) => {
        return {
          href: "",
          download: "",
          click: vi.fn(),
          style: {}
        };
      }),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    };
  });

  afterEach(() => {
    (globalThis as any).XMLSerializer = originalXMLSerializer;
    (globalThis as any).Blob = originalBlob;
    (globalThis as any).URL = originalURL;
    (globalThis as any).document = originalDocument;
  });

  it("should serialize and trigger download for SVG", () => {
    const dummySvg = {} as SVGSVGElement;
    ExportUtils.exportAsSvg(dummySvg, "test.svg");

    expect((globalThis as any).URL.createObjectURL).toHaveBeenCalled();
    expect((globalThis as any).document.createElement).toHaveBeenCalledWith("a");
  });
});
