class SimpleSparkLineChart {
  constructor(selector: string) {
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

    const filled =
      element.dataset.filled !== undefined &&
      element.dataset.filled !== "false";
    const filledOpacity = filled
      ? parseFloat(element.dataset.filled || "0.2")
      : 0;

    const colorStroke = element.dataset.colorStroke || "#8956ff";
    const colorFilled = element.dataset.colorFilled || colorStroke;
    const strokeWidth = element.dataset.strokeWidth
      ? parseFloat(element.dataset.strokeWidth)
      : 2;

    const ariaLabel = element.dataset.ariaLabel || "Simple SparkLine Chart";

    const tooltipAttr = element.dataset.tooltip;
    const showTooltip = tooltipAttr !== undefined;
    const tooltipPosition = tooltipAttr === "bottom" ? "bottom" : "top";

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
      locale,
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
    locale: string,
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
    svg.setAttribute("role", "img");
    svg.setAttribute("width", adjustedWidth.toString());
    svg.setAttribute("height", adjustedHeight.toString());
    svg.setAttribute("aria-label", ariaLabel);
    svg.setAttribute("viewBox", `0 0 ${adjustedWidth} ${adjustedHeight}`);
    svg.setAttribute("overflow", "visible");
    svg.setAttribute("preserveAspectRatio", "none");

    const offset = values.length > 1 ? adjustedWidth / (values.length - 1) : 0;
    const linePoints: string[] = values.map(
      (val, i) => `${(i * offset).toFixed(2)},${c(val).toFixed(2)}`,
    );

    if (filled) {
      const fillPathD = `${linePoints
        .map((p, i) => (i === 0 ? "M" + p : "L" + p))
        .join(" ")} L${adjustedWidth.toFixed(2)},${adjustedHeight.toFixed(
        2,
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

    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.display = "inline-block";
    container.style.width = `${adjustedWidth}px`;

    container.appendChild(svg);

    if (showTooltip) {
      const tooltip = document.createElement("div");
      tooltip.classList.add("sparkline-tooltip");
      tooltip.style.position = "absolute";
      tooltip.style.pointerEvents = "none";
      tooltip.style.background = "#333";
      tooltip.style.border = "1px solid #222";
      tooltip.style.color = "#fff";
      tooltip.style.fontSize = "small";
      tooltip.style.padding = "2px 4px";
      tooltip.style.borderRadius = "4px";
      tooltip.style.whiteSpace = "nowrap";
      tooltip.style.display = "none";
      tooltip.style[tooltipPosition === "bottom" ? "top" : "bottom"] =
        `${adjustedHeight}px`;

      container.appendChild(tooltip);

      const cursorLine = document.createElementNS(svgNS, "line");
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
        const rect = svg.getBoundingClientRect();
        const clientX =
          event instanceof MouseEvent
            ? event.clientX
            : event.touches[0].clientX;
        const x = clientX - rect.left;
        const index = Math.round(x / offset);
        const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
        const cx = clampedIndex * offset;
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

        tooltip.style.display = "block";
        const tooltipRect = tooltip.getBoundingClientRect();
        tooltip.style.left = `${Math.max(
          0,
          Math.min(
            adjustedWidth - tooltipRect.width,
            cx - tooltipRect.width / 2,
          ),
        )}px`;
      };

      const handleOut = () => {
        spot.style.display = "none";
        cursorLine.style.display = "none";
        tooltip.style.display = "none";
      };

      interactionLayer.addEventListener("mousemove", handleMove);
      interactionLayer.addEventListener("touchmove", handleMove);
      interactionLayer.addEventListener("mouseleave", handleOut);
      interactionLayer.addEventListener("touchend", handleOut);
      interactionLayer.addEventListener("touchcancel", handleOut);
    }

    parent.innerHTML = "";
    parent.appendChild(container);
  }
}

export default SimpleSparkLineChart;
