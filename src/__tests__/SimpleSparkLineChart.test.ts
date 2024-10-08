import SimpleSparkLineChart from "../index";

// Helper to create a mock HTML element
function createMockElement(values: string, options: any = {}): HTMLElement {
  const element = document.createElement("div");
  element.dataset.values = values;
  element.dataset.width = options.width || "200";
  if (options.height) element.dataset.height = options.height;
  if (options.filled) element.dataset.filled = options.filled;
  element.dataset.colorStroke = options.colorStroke || "#000";
  element.dataset.strokeWidth = options.strokeWidth || "2";
  element.dataset.ariaLabel = options.ariaLabel || "Test Chart";
  if (options.tooltip) element.dataset.tooltip = options.tooltip;
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

  it("should handle the proportional height when data-height is not specified", () => {
    const element = createMockElement("1,2,3,4,5", { width: "200" });
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    const svg = element.querySelector("svg");
    const height = parseInt(svg!.getAttribute("height")!, 10);
    const width = parseInt(svg!.getAttribute("width")!, 10);

    expect(height).toBe(Math.round(width * 0.2)); // Height should be 20% of width
  });

  it("should create a filled chart with a specific opacity", () => {
    const element = createMockElement("1,2,3,4,5", { filled: "0.4" });
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    const path = element.querySelector(".sparkline-fill");
    expect(path).not.toBeNull();
    expect(path!.getAttribute("fill-opacity")).toBe("0.4");
  });

  it("should not create a filled chart when data-filled is not provided", () => {
    const element = createMockElement("1,2,3,4,5");
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    const path = element.querySelector(".sparkline-fill");
    expect(path).toBeNull(); // No fill path should be created
  });

  it("should show tooltip if data-tooltip is set", () => {
    const element = createMockElement("1,2,3,4,5", { tooltip: "bottom" });
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    const tooltip = element.querySelector(".sparkline-tooltip") as HTMLElement;
    expect(tooltip).not.toBeNull();
    expect(tooltip!.style.top).toBe("40px"); // Default tooltip position
  });

  it("should not show tooltip if data-tooltip is not set", () => {
    const element = createMockElement("1,2,3,4,5", { tooltip: undefined });
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    const tooltip = element.querySelector(".sparkline-tooltip");
    expect(tooltip).toBeNull(); // Tooltip should not exist
  });

  it("should use the top position for tooltip by default", () => {
    const element = createMockElement("1,2,3,4,5", { tooltip: "top" });
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    const tooltip = element.querySelector(".sparkline-tooltip") as HTMLElement;
    expect(tooltip).not.toBeNull();
    expect(tooltip!.style.bottom).toBe("40px"); // Default height for top tooltip
  });

  it("should warn if data-values is missing", () => {
    const element = createMockElement("", { values: "" });
    document.body.appendChild(element);

    new SimpleSparkLineChart("div");

    expect(console.warn).toHaveBeenCalledWith(
      "Missing data-values attribute for element:",
      element,
    );
  });
});
