class SimpleSparkLineChart {
  constructor(selector: string) {
    console.log("SimpleSparkLineChart");
    const elements = document.querySelectorAll<HTMLElement>(selector);
    elements.forEach((element) => {
      this.createChart(element);
    });
  }

  private createChart(element: HTMLElement): void {
    const valuesAttr = element.dataset.values;
    let dataValues: number[] = [];
    let dataObjects: { timestamp: number; value: number }[] = [];
    let isObjectData = false;

    if (valuesAttr) {
      try {
        const parsedData = JSON.parse(valuesAttr);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          if (typeof parsedData[0] === "object" && parsedData[0] !== null) {
            isObjectData = true;
            dataObjects = parsedData.map((item) => ({
              timestamp: item.timestamp,
              value: item.value,
            }));
            dataValues = dataObjects.map((item) => item.value);
          } else if (typeof parsedData[0] === "number") {
            dataValues = parsedData.filter(Number.isFinite);
          } else {
            console.warn("Invalid data format in data-values:", element);
            return;
          }
        } else {
          console.warn("Empty or invalid array in data-values:", element);
          return;
        }
      } catch (e) {
        // If not JSON, try parsing as CSV
        dataValues = valuesAttr
          .split(",")
          .map(parseFloat)
          .filter(Number.isFinite);
      }
    } else {
      console.warn("Missing data-values attribute for element:", element);
      return;
    }

    if (dataValues.length === 0) {
      console.warn("No valid data values for element:", element);
      return;
    }

    const width = element.dataset.width ? parseInt(element.dataset.width) : 200;
    const height = element.dataset.height
      ? parseInt(element.dataset.height)
      : Math.round(width * 0.2);
    const filled = element.dataset.filled === "true";
    const colorStroke = element.dataset.colorStroke || "#000";
    const colorFilled = element.dataset.colorFilled || colorStroke;
    const strokeWidth = element.dataset.strokeWidth
      ? parseFloat(element.dataset.strokeWidth)
      : 2;
    const filledOpacity =
      element.dataset.filledOpacity !== undefined
        ? parseFloat(element.dataset.filledOpacity)
        : 0.2;
    const ariaLabel = element.dataset.ariaLabel || "Simple SparkLine Chart";
    const showTooltip = element.dataset.tooltip !== "false";
    const tooltipPosition = element.dataset.tooltipPosition || "above";
    const locale = element.dataset.locale || navigator.language || "en-US";

    this.makeChart(
      dataValues,
      dataObjects,
      isObjectData,
      width,
      height,
      element,
      filled,
      colorStroke,
      colorFilled,
      strokeWidth,
      filledOpacity,
      ariaLabel,
      showTooltip,
      tooltipPosition,
      locale
    );
  }

  private makeChart(
    values: number[],
    dataObjects: { timestamp: number; value: number }[],
    isObjectData: boolean,
    width: number,
    height: number,
    parent: HTMLElement,
    filled: boolean,
    colorStroke: string,
    colorFilled: string,
    strokeWidth: number,
    filledOpacity: number,
    ariaLabel: string,
    showTooltip: boolean,
    tooltipPosition: string,
    locale: string
  ): void {
    const svgNS = "http://www.w3.org/2000/svg";

    const adjustedWidth = width;
    const adjustedHeight = height;

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const c = (x: number): number => {
      const s = (adjustedHeight - strokeWidth) / range;
      return adjustedHeight - strokeWidth / 2 - s * (x - min);
    };

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", adjustedWidth.toString());
    svg.setAttribute("height", adjustedHeight.toString());
    svg.setAttribute("aria-label", ariaLabel);
    svg.setAttribute("viewBox", `0 0 ${adjustedWidth} ${adjustedHeight}`);
    svg.setAttribute("overflow", "visible");
    svg.setAttribute("preserveAspectRatio", "none");

    const offset = values.length > 1 ? adjustedWidth / (values.length - 1) : 0;

    const linePoints: string[] = [];
    for (let i = 0; i < values.length; i++) {
      const x = (i * offset).toFixed(2);
      const y = c(values[i]).toFixed(2);
      linePoints.push(`${x},${y}`);
    }

    if (filled) {
      const fillPathD = `${linePoints
        .map((p, i) => (i === 0 ? "M" + p : "L" + p))
        .join(" ")} L${adjustedWidth.toFixed(2)},${adjustedHeight.toFixed(
        2
      )} L0,${adjustedHeight.toFixed(2)} Z`;

      const fillElm = document.createElementNS(svgNS, "path");
      fillElm.setAttribute("d", fillPathD);
      fillElm.setAttribute("stroke", "none");
      fillElm.setAttribute("fill", colorFilled);
      fillElm.setAttribute("fill-opacity", filledOpacity.toString());
      fillElm.classList.add("sparkline-fill");
      svg.appendChild(fillElm);
    }

    const linePathD = `M${linePoints.join(" L")}`;

    const pathElm = document.createElementNS(svgNS, "path");
    pathElm.setAttribute("d", linePathD);
    pathElm.setAttribute("fill", "none");
    pathElm.setAttribute("stroke", colorStroke);
    pathElm.setAttribute("stroke-width", strokeWidth.toString());
    pathElm.setAttribute("stroke-linecap", "butt");
    pathElm.setAttribute("stroke-linejoin", "round");
    pathElm.classList.add("sparkline-path");
    svg.appendChild(pathElm);

    parent.appendChild(svg);

    const tooltipContainer = document.createElement("div");
    tooltipContainer.style.position = "relative";
    tooltipContainer.style.width = adjustedWidth + "px";

    const tooltip = document.createElement("div");
    tooltip.style.position = "block";
    tooltip.style.pointerEvents = "none";
    tooltip.style.background = "#fff";
    tooltip.style.border = "1px solid #ccc";
    tooltip.style.color = "#444";
    tooltip.style.fontSize = "small";
    tooltip.style.whiteSpace = "nowrap";
    tooltip.classList.add("sparkline-tooltip");

    tooltip.textContent = ariaLabel;

    tooltipContainer.appendChild(tooltip);

    parent.innerHTML = "";
    parent.appendChild(tooltipContainer);
    tooltipContainer.insertBefore(svg, tooltip);

    if (!showTooltip) {
      return;
    }

    const cursorLine = document.createElementNS(svgNS, "line");
    cursorLine.setAttribute("class", "sparkline-cursor-line");
    cursorLine.setAttribute("x1", "0");
    cursorLine.setAttribute("y1", "0");
    cursorLine.setAttribute("x2", "0");
    cursorLine.setAttribute("y2", adjustedHeight.toString());
    cursorLine.setAttribute("stroke", colorStroke);
    cursorLine.setAttribute("stroke-width", "1");
    cursorLine.setAttribute("stroke-dasharray", "4");
    cursorLine.style.display = "none";
    svg.appendChild(cursorLine);

    const spot = document.createElementNS(svgNS, "circle");
    spot.setAttribute("class", "sparkline-spot");
    spot.setAttribute("r", (strokeWidth * 1.5).toString());
    spot.setAttribute("fill", colorStroke);
    spot.setAttribute("stroke", "#fff");
    spot.setAttribute("stroke-width", "1");
    spot.style.display = "none";
    svg.appendChild(spot);

    const interactionLayer = document.createElementNS(svgNS, "rect");
    interactionLayer.setAttribute("width", adjustedWidth.toString());
    interactionLayer.setAttribute("height", adjustedHeight.toString());
    interactionLayer.setAttribute("fill", "transparent");
    interactionLayer.style.cursor = "pointer";
    svg.appendChild(interactionLayer);

    const dateFormatter = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const handleMove = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      let clientX;
      if (event instanceof MouseEvent) {
        clientX = event.clientX;
      } else if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
      } else {
        return;
      }
      const x = clientX - rect.left;
      const index = Math.round((x - strokeWidth / 2) / offset);
      const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
      const cx = strokeWidth / 2 + clampedIndex * offset;
      const cy = c(values[clampedIndex]);

      spot.setAttribute("cx", cx.toFixed(2));
      spot.setAttribute("cy", cy.toFixed(2));
      spot.style.display = "block";

      cursorLine.setAttribute("x1", cx.toFixed(2));
      cursorLine.setAttribute("x2", cx.toFixed(2));
      cursorLine.style.display = "block";

      if (isObjectData) {
        const dataPoint = dataObjects[clampedIndex];
        const date = dateFormatter.format(new Date(dataPoint.timestamp));
        tooltip.innerHTML = `${dataPoint.value} (${date})`;
      } else {
        tooltip.textContent = values[clampedIndex].toString();
      }
    };

    const handleOut = () => {
      spot.style.display = "none";
      cursorLine.style.display = "none";
      tooltip.textContent = ariaLabel;
    };

    interactionLayer.addEventListener("mousemove", handleMove);
    interactionLayer.addEventListener("touchmove", handleMove);
    interactionLayer.addEventListener("mouseleave", handleOut);
    interactionLayer.addEventListener("touchend", handleOut);
    interactionLayer.addEventListener("touchcancel", handleOut);
  }
}

export default SimpleSparkLineChart;
