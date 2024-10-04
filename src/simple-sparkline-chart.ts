class SimpleSparkLineChart {
  constructor(selector: string) {
    console.log('SimpleSparkLineChart')
    const elements = document.querySelectorAll<HTMLElement>(selector);
    elements.forEach((element) => {
      this.createChart(element);
    });
  }

  private createChart(element: HTMLElement): void {
    // Read the data-values attribute
    const valuesAttr = element.dataset.values;
    const values: number[] = valuesAttr
      ? valuesAttr.split(",").map(parseFloat).filter(Number.isFinite)
      : [];

    if (values.length === 0) {
      console.warn("Invalid or missing data-values for element:", element);
      return;
    }

    // Read optional data attributes with default values
    const width = element.dataset.width ? parseInt(element.dataset.width) : 160; // Default width
    const height = element.dataset.height
      ? parseInt(element.dataset.height)
      : Math.round(width * 0.25); // Default height proportional to width
    const filled = element.dataset.filled === "true";
    const colorStroke = element.dataset.colorStroke || "#000"; // Default stroke color
    const colorFilled = element.dataset.colorFilled || "none"; // Default fill color
    const strokeWidth = element.dataset.strokeWidth
      ? parseFloat(element.dataset.strokeWidth)
      : 2; // Default stroke width
    const filledOpacity =
      element.dataset.filledOpacity !== undefined
        ? parseFloat(element.dataset.filledOpacity)
        : 1; // Default filled opacity
    const ariaLabel = element.dataset.ariaLabel || "Simple SparkLine Chart"; // Default aria-label

    this.makeChart(
      values,
      width,
      height,
      element,
      filled,
      colorStroke,
      strokeWidth,
      filledOpacity,
      ariaLabel
    );
  }

  private makeChart(
    values: number[],
    width: number,
    height: number,
    parent: HTMLElement,
    filled: boolean,
    colorStroke: string,
    strokeWidth: number,
    filledOpacity: number,
    ariaLabel: string
  ): void {
    const svgNS = "http://www.w3.org/2000/svg";

    // Dimensions
    const adjustedWidth = width;
    const adjustedHeight = height;

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1; // Avoid division by zero

    const c = (x: number): number => {
      const s = (adjustedHeight - strokeWidth) / range;
      return strokeWidth / 2 + (adjustedHeight - strokeWidth) - s * (x - min);
    };

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", adjustedWidth.toString());
    svg.setAttribute("height", adjustedHeight.toString());
    svg.setAttribute("aria-label", ariaLabel);
    svg.setAttribute("viewBox", `0 0 ${adjustedWidth} ${adjustedHeight}`);
    svg.setAttribute("preserveAspectRatio", "none");

    const offset =
      values.length > 1
        ? (adjustedWidth - strokeWidth) / (values.length - 1)
        : 0;
    let pathD = `M${(strokeWidth / 2).toFixed(2)},${c(values[0]).toFixed(2)}`;

    for (let i = 1; i < values.length; i++) {
      pathD += ` L${(strokeWidth / 2 + i * offset).toFixed(2)},${c(
        values[i]
      ).toFixed(2)}`;
    }

    // If filled, add the fill path before the line path
    if (filled) {
      const lastX = strokeWidth / 2 + (values.length - 1) * offset;
      const fillPathD = `${pathD} L${lastX.toFixed(2)},${(
        adjustedHeight -
        strokeWidth / 2
      ).toFixed(2)} L${(strokeWidth / 2).toFixed(2)},${(
        adjustedHeight -
        strokeWidth / 2
      ).toFixed(2)} Z`;
      const fillElm = document.createElementNS(svgNS, "path");
      fillElm.setAttribute("d", fillPathD);
      fillElm.setAttribute("stroke", "none");
      fillElm.setAttribute("fill", colorStroke);
      fillElm.setAttribute("fill-opacity", filledOpacity.toString());
      fillElm.classList.add("sparkline-fill");
      svg.appendChild(fillElm);
    }

    // Then add the line path
    const pathElm = document.createElementNS(svgNS, "path");
    pathElm.setAttribute("d", pathD);
    pathElm.setAttribute("fill", "none");
    pathElm.setAttribute("stroke", colorStroke);
    pathElm.setAttribute("stroke-width", strokeWidth.toString());
    pathElm.setAttribute("stroke-linecap", "round");
    pathElm.setAttribute("stroke-linejoin", "round");
    pathElm.classList.add("sparkline-path");
    svg.appendChild(pathElm);

    parent.appendChild(svg);
  }
}

export default SimpleSparkLineChart;

