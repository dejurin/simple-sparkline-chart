/*
 *
 * Simple SparkLine Chart
 * @version 0.2.2
 * @license MIT
 * @author https://github.com/dejurin
 *
 * https://github.com/dejurin/simple-sparkline
 *
 */ class $efcab5d8b7cb3e5f$var$SimpleSparkLineChart {
    constructor(selector){
        const elements = document.querySelectorAll(selector);
        elements.forEach((element)=>{
            this.createChart(element);
        });
    }
    createChart(element) {
        const valuesAttr = element.dataset.values;
        let dataValues = [];
        let dataObjects = [];
        let isObjectData = false;
        if (valuesAttr) try {
            const parsedData = JSON.parse(valuesAttr);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                if (typeof parsedData[0] === "object" && parsedData[0] !== null) {
                    // Data is an array of objects with 'timestamp' and 'value'
                    isObjectData = true;
                    dataObjects = parsedData.map((item)=>({
                            timestamp: item.timestamp,
                            value: item.value
                        }));
                    dataValues = dataObjects.map((item)=>item.value);
                } else if (typeof parsedData[0] === "number") // Data is an array of numbers
                dataValues = parsedData.filter(Number.isFinite);
                else {
                    console.warn("Invalid data format in data-values:", element);
                    return;
                }
            } else {
                console.warn("Empty or invalid array in data-values:", element);
                return;
            }
        } catch (e) {
            // If not JSON, try parsing as CSV (comma-separated values)
            dataValues = valuesAttr.split(",").map(parseFloat).filter(Number.isFinite);
        }
        else {
            console.warn("Missing data-values attribute for element:", element);
            return;
        }
        if (dataValues.length === 0) {
            console.warn("No valid data values for element:", element);
            return;
        }
        // Read optional attributes with default values
        const width = element.dataset.width ? parseInt(element.dataset.width) : 200;
        const height = element.dataset.height ? parseInt(element.dataset.height) : Math.round(width * 0.2);
        const filled = element.dataset.filled === "true";
        const colorStroke = element.dataset.colorStroke || "#8956ff";
        const colorFilled = element.dataset.colorFilled || colorStroke;
        const strokeWidth = element.dataset.strokeWidth ? parseFloat(element.dataset.strokeWidth) : 2;
        const filledOpacity = element.dataset.filledOpacity !== undefined ? parseFloat(element.dataset.filledOpacity) : 0.2;
        const ariaLabel = element.dataset.ariaLabel || "Simple SparkLine Chart";
        const showTooltip = element.dataset.tooltip !== "false";
        const tooltipPosition = element.dataset.tooltipPosition || "above";
        const locale = element.dataset.locale || navigator.language || "en-US";
        this.makeChart(dataValues, dataObjects, isObjectData, width, height, element, filled, colorStroke, colorFilled, strokeWidth, filledOpacity, ariaLabel, showTooltip, tooltipPosition, locale);
    }
    makeChart(values, dataObjects, isObjectData, width, height, parent, filled, colorStroke, colorFilled, strokeWidth, filledOpacity, ariaLabel, showTooltip, tooltipPosition, locale) {
        const svgNS = "http://www.w3.org/2000/svg";
        const adjustedWidth = width;
        const adjustedHeight = height;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min || 1;
        // Function to calculate Y coordinate
        const c = (x)=>{
            const s = (adjustedHeight - strokeWidth) / range;
            return adjustedHeight - strokeWidth / 2 - s * (x - min);
        };
        // Create SVG element
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("role", "img");
        svg.setAttribute("width", adjustedWidth.toString());
        svg.setAttribute("height", adjustedHeight.toString());
        svg.setAttribute("aria-label", ariaLabel);
        svg.setAttribute("viewBox", `0 0 ${adjustedWidth} ${adjustedHeight}`);
        svg.setAttribute("overflow", "visible");
        svg.setAttribute("preserveAspectRatio", "none");
        const offset = values.length > 1 ? adjustedWidth / (values.length - 1) : 0;
        // Generate points for the line
        const linePoints = [];
        for(let i = 0; i < values.length; i++){
            const x = (i * offset).toFixed(2);
            const y = c(values[i]).toFixed(2);
            linePoints.push(`${x},${y}`);
        }
        // Create filled area if 'filled' is true
        if (filled) {
            const fillPathD = `${linePoints.map((p, i)=>i === 0 ? "M" + p : "L" + p).join(" ")} L${adjustedWidth.toFixed(2)},${adjustedHeight.toFixed(2)} L0,${adjustedHeight.toFixed(2)} Z`;
            const fillElm = document.createElementNS(svgNS, "path");
            fillElm.setAttribute("d", fillPathD);
            fillElm.setAttribute("stroke", "none");
            fillElm.setAttribute("fill", colorFilled);
            fillElm.setAttribute("fill-opacity", filledOpacity.toString());
            fillElm.classList.add("sparkline-fill");
            svg.appendChild(fillElm);
        }
        // Create the line path
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
        // Create container for SVG and Tooltip
        const container = document.createElement("div");
        container.style.position = "relative";
        container.style.display = "inline-block";
        container.style.width = adjustedWidth + "px";
        // Append SVG to container
        container.appendChild(svg);
        // Create Tooltip
        const tooltip = document.createElement("div");
        tooltip.style.position = "absolute";
        tooltip.style.pointerEvents = "none";
        tooltip.style.background = "#333";
        tooltip.style.border = "1px solid #222";
        tooltip.style.color = "#fff";
        tooltip.style.fontSize = "small";
        tooltip.style.whiteSpace = "nowrap";
        tooltip.style.padding = "2px 4px";
        tooltip.style.borderRadius = "4px";
        tooltip.classList.add("sparkline-tooltip");
        tooltip.style.display = "none";
        // Position the tooltip
        if (tooltipPosition === "bottom") tooltip.style.top = adjustedHeight + "px";
        else tooltip.style.bottom = adjustedHeight + "px";
        if (showTooltip) container.appendChild(tooltip);
        // Clear parent element and append container
        parent.innerHTML = "";
        parent.appendChild(container);
        // Create cursor line
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
        // Create spot circle
        const spot = document.createElementNS(svgNS, "circle");
        spot.setAttribute("class", "sparkline-spot");
        spot.setAttribute("r", (strokeWidth * 1.5).toString());
        spot.setAttribute("fill", colorStroke);
        spot.setAttribute("stroke", "#fff");
        spot.setAttribute("stroke-width", "1");
        spot.style.display = "none";
        svg.appendChild(spot);
        // Create interaction layer
        const interactionLayer = document.createElementNS(svgNS, "rect");
        interactionLayer.setAttribute("width", adjustedWidth.toString());
        interactionLayer.setAttribute("height", adjustedHeight.toString());
        interactionLayer.setAttribute("fill", "transparent");
        interactionLayer.style.cursor = "pointer";
        svg.appendChild(interactionLayer);
        // Create date formatter
        const dateFormatter = new Intl.DateTimeFormat(locale, {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            day: "numeric",
            month: "short",
            year: "numeric"
        });
        // Event handlers
        const handleMove = (event)=>{
            event.preventDefault();
            const rect = svg.getBoundingClientRect();
            let clientX;
            if (event instanceof MouseEvent) clientX = event.clientX;
            else if (event.touches && event.touches.length > 0) clientX = event.touches[0].clientX;
            else return;
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
            // Update tooltip content
            if (isObjectData) {
                const dataPoint = dataObjects[clampedIndex];
                const date = dateFormatter.format(new Date(dataPoint.timestamp));
                tooltip.innerHTML = `${dataPoint.value} (${date})`;
            } else tooltip.textContent = values[clampedIndex].toString();
            // Position tooltip horizontally
            // Ensure tooltip is displayed to get correct dimensions
            tooltip.style.display = "block";
            const tooltipRect = tooltip.getBoundingClientRect();
            let tooltipX = cx - tooltipRect.width / 2;
            if (tooltipX < 0) tooltipX = 0;
            else if (tooltipX + tooltipRect.width > adjustedWidth) tooltipX = adjustedWidth - tooltipRect.width;
            tooltip.style.left = tooltipX + "px";
        };
        const handleOut = ()=>{
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
}
var $efcab5d8b7cb3e5f$export$2e2bcd8739ae039 = $efcab5d8b7cb3e5f$var$SimpleSparkLineChart;


var $28907e660f7296c2$export$2e2bcd8739ae039 = (0, $efcab5d8b7cb3e5f$export$2e2bcd8739ae039);


//# sourceMappingURL=index.js.map
