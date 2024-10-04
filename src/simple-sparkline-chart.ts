class SimpleSparkLineChart {
  constructor(selector: string) {
    console.log('SimpleSparkLineChart');
    const elements = document.querySelectorAll<HTMLElement>(selector);
    elements.forEach((element) => {
      this.createChart(element);
    });
  }

  private createChart(element: HTMLElement): void {
    // Получение атрибута data-values
    const valuesAttr = element.dataset.values;
    const values: number[] = valuesAttr
      ? valuesAttr.split(",").map(parseFloat).filter(Number.isFinite)
      : [];

    if (values.length === 0) {
      console.warn("Invalid or missing data-values for element:", element);
      return;
    }

    // Получение опциональных атрибутов с значениями по умолчанию
    const width = element.dataset.width ? parseInt(element.dataset.width) : 200; // Ширина по умолчанию
    const height = element.dataset.height
      ? parseInt(element.dataset.height)
      : Math.round(width * 0.2); // Высота пропорционально ширине
    const filled = element.dataset.filled === "true";
    const colorStroke = element.dataset.colorStroke || "#000"; // Цвет линии по умолчанию
    const colorFilled = element.dataset.colorFilled || colorStroke; // Цвет заливки по умолчанию
    const strokeWidth = element.dataset.strokeWidth
      ? parseFloat(element.dataset.strokeWidth)
      : 2; // Толщина линии по умолчанию
    const filledOpacity =
      element.dataset.filledOpacity !== undefined
        ? parseFloat(element.dataset.filledOpacity)
        : 0.2; // Прозрачность заливки по умолчанию
    const ariaLabel = element.dataset.ariaLabel || "Simple SparkLine Chart"; // aria-label по умолчанию

    this.makeChart(
      values,
      width,
      height,
      element,
      filled,
      colorStroke,
      colorFilled,
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
    colorFilled: string,
    strokeWidth: number,
    filledOpacity: number,
    ariaLabel: string
  ): void {
    const svgNS = "http://www.w3.org/2000/svg";

    // Размеры
    const adjustedWidth = width;
    const adjustedHeight = height;

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1; // Избегаем деления на ноль

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

    // Генерация точек для линии
    const linePoints: string[] = [];
    for (let i = 0; i < values.length; i++) {
      const x = (strokeWidth / 2 + i * offset).toFixed(2);
      const y = c(values[i]).toFixed(2);
      linePoints.push(`${x},${y}`);
    }

    // Создание области заливки, если filled=true
    if (filled) {
      const fillPathD = `${linePoints.map((p, i) => (i === 0 ? 'M' + p : 'L' + p)).join(' ')} L${(strokeWidth / 2 + (values.length - 1) * offset).toFixed(2)},${adjustedHeight.toFixed(2)} L${(strokeWidth / 2).toFixed(2)},${adjustedHeight.toFixed(2)} Z`;

      const fillElm = document.createElementNS(svgNS, "path");
      fillElm.setAttribute("d", fillPathD);
      fillElm.setAttribute("stroke", "none");
      fillElm.setAttribute("fill", colorFilled);
      fillElm.setAttribute("fill-opacity", filledOpacity.toString());
      fillElm.classList.add("sparkline-fill");
      svg.appendChild(fillElm);
    }

    // Создание линии графика
    const linePathD = `M${linePoints.join(" L")}`;

    // Добавление линии на SVG
    const pathElm = document.createElementNS(svgNS, "path");
    pathElm.setAttribute("d", linePathD);
    pathElm.setAttribute("fill", "none");
    pathElm.setAttribute("stroke", colorStroke);
    pathElm.setAttribute("stroke-width", strokeWidth.toString());
    pathElm.setAttribute("stroke-linecap", "round");
    pathElm.setAttribute("stroke-linejoin", "round");
    pathElm.classList.add("sparkline-path");
    svg.appendChild(pathElm);

    // Добавление вертикальной линии (курсор)
    const cursorLine = document.createElementNS(svgNS, "line");
    cursorLine.setAttribute("class", "sparkline-cursor-line");
    cursorLine.setAttribute("x1", "0");
    cursorLine.setAttribute("y1", "0");
    cursorLine.setAttribute("x2", "0");
    cursorLine.setAttribute("y2", adjustedHeight.toString());
    cursorLine.setAttribute("stroke", colorStroke);
    cursorLine.setAttribute("stroke-width", "1");
    cursorLine.setAttribute("stroke-dasharray", "4");
    cursorLine.style.display = "none"; // Скрываем изначально
    svg.appendChild(cursorLine);

    // Добавление точки (spot)
    const spot = document.createElementNS(svgNS, "circle");
    spot.setAttribute("class", "sparkline-spot");
    spot.setAttribute("r", (strokeWidth * 1.5).toString()); // Радиус круга
    spot.setAttribute("fill", colorStroke);
    spot.setAttribute("stroke", "#fff");
    spot.setAttribute("stroke-width", "1");
    spot.style.display = "none"; // Скрываем изначально
    svg.appendChild(spot);

    // Добавление tooltip (опционально)
    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.pointerEvents = "none";
    tooltip.style.background = "#fff";
    tooltip.style.border = "1px solid #ccc";
    tooltip.style.padding = "2px 4px";
    tooltip.style.fontSize = "12px";
    tooltip.style.display = "none";
    tooltip.style.transform = "translate(-50%, -100%)";
    tooltip.classList.add("sparkline-tooltip");
    parent.style.position = "relative";
    parent.appendChild(tooltip);

    // Добавление слоя для взаимодействия
    const interactionLayer = document.createElementNS(svgNS, "rect");
    interactionLayer.setAttribute("width", adjustedWidth.toString());
    interactionLayer.setAttribute("height", adjustedHeight.toString());
    interactionLayer.setAttribute("fill", "transparent");
    interactionLayer.style.cursor = "pointer";
    svg.appendChild(interactionLayer);

    // Обработчики событий
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

      // Позиционирование tooltip
      tooltip.style.left = `${cx}px`;
      tooltip.style.top = `${cy - strokeWidth * 1.5 - 10}px`;
      tooltip.textContent = values[clampedIndex].toString();
      tooltip.style.display = "block";
    };

    const handleOut = () => {
      spot.style.display = "none";
      tooltip.style.display = "none";
      cursorLine.style.display = "none";
    };

    interactionLayer.addEventListener("mousemove", handleMove);
    interactionLayer.addEventListener("touchmove", handleMove);
    interactionLayer.addEventListener("mouseleave", handleOut);
    interactionLayer.addEventListener("touchend", handleOut);
    interactionLayer.addEventListener("touchcancel", handleOut);

    parent.appendChild(svg);
  }
}

export default SimpleSparkLineChart;