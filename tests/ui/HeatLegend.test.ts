import { describe, it, expect, vi } from "vitest";
import { HeatLegend } from "../../src/ui/HeatLegend";

describe("HeatLegend", () => {
  it("renders legend gradient and labels into container", () => {
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

    const legend = new HeatLegend(mockContainer);
    legend.render();

    expect(mockContainer.createEl).toHaveBeenCalledWith("div", { cls: "heat-legend-container" });
    
    const barElement = createdElements.find(el => el.tag === "div" && el.attrs?.cls === "heat-legend-bar");
    expect(barElement).toBeDefined();
    expect(barElement.style.background).toContain("linear-gradient");

    const labels = createdElements.filter(el => el.tag === "span" && ["Frozen", "Cold", "Warm", "Hot", "Burning"].includes(el.attrs?.text));
    expect(labels.length).toBe(5);
  });
});
