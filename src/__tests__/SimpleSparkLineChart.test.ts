import SimpleSparkLineChart from "../index";

// Helper to create a mock HTML element
function createMockElement(values: string, options: any = {}): HTMLElement {
  const element = document.createElement("div");
  element.dataset.values = values;
  element.dataset.width = options.width || "200";
  element.dataset.height = options.height || "40";
  element.dataset.filled = options.filled || "true";
  element.dataset.colorStroke = options.colorStroke || "#000";
  element.dataset.strokeWidth = options.strokeWidth || "2";
  element.dataset.filledOpacity = options.filledOpacity || "0.2";
  element.dataset.ariaLabel = options.ariaLabel || "Test Chart";
  return element;
}

beforeEach(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

describe("SimpleSparkLineChart", () => {
  beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = "";
  });

  it("should create a chart with valid numeric data", () => {
    const element = createMockElement("1,2,3,4,5");
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    const svg = element.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("aria-label")).toBe("Test Chart");
  });

  it("should create a chart with object data", () => {
    const element = createMockElement(
      JSON.stringify([
        { timestamp: 1693526400000, value: 1.2 },
        { timestamp: 1693612800000, value: 2.4 },
      ]),
    );
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    const svg = element.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("should handle empty data gracefully", () => {
    const element = createMockElement("", { values: "" });
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    const svg = element.querySelector("svg");
    expect(svg).toBeNull();
  });

  it("should add a tooltip if data-tooltip is true", () => {
    const element = createMockElement("1,2,3,4,5", { tooltip: "true" });
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    const tooltip = element.querySelector(".sparkline-tooltip");
    expect(tooltip).not.toBeNull();
  });

  it("should not add a tooltip if data-tooltip is false", () => {
    const element = createMockElement("1,2,3,4,5", { tooltip: "false" });
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    const tooltip = element.querySelector(".sparkline-tooltip") as HTMLElement;
    expect(tooltip).not.toBeNull();
    expect(tooltip!.style.display).toBe("none");
  });
});
