!(function () {
  var t = class {
    constructor(t) {
      document.querySelectorAll(t).forEach((t) => {
        this.createChart(t);
      });
    }
    createChart(t) {
      const e = t.dataset.values;
      let i = [],
        a = [],
        s = !1;
      if (!e)
        return void console.warn(
          "Missing data-values attribute for element:",
          t,
        );
      try {
        const n = JSON.parse(e);
        if (!(Array.isArray(n) && n.length > 0))
          return void console.warn("Empty or invalid array in data-values:", t);
        if ("object" == typeof n[0] && null !== n[0])
          (s = !0),
            (a = n.map((t) => ({ timestamp: t.timestamp, value: t.value }))),
            (i = a.map((t) => t.value));
        else {
          if ("number" != typeof n[0])
            return void console.warn("Invalid data format in data-values:", t);
          i = n.filter(Number.isFinite);
        }
      } catch {
        i = e.split(",").map(parseFloat).filter(Number.isFinite);
      }
      if (0 === i.length)
        return void console.warn("No valid data values for element:", t);
      const n = t.dataset.width ? parseInt(t.dataset.width) : 200,
        o = t.dataset.height ? parseInt(t.dataset.height) : Math.round(0.2 * n),
        r = void 0 !== t.dataset.filled && "false" !== t.dataset.filled,
        l = r ? parseFloat(t.dataset.filled || "0.2") : 0,
        d = t.dataset.colorStroke || "#8956ff",
        u = t.dataset.colorFilled || d,
        c = t.dataset.strokeWidth ? parseFloat(t.dataset.strokeWidth) : 2,
        p = t.dataset.ariaLabel || "Simple SparkLine Chart",
        m = t.dataset.tooltip,
        h = void 0 !== m,
        b = "bottom" === m ? "bottom" : "top",
        y = t.dataset.locale || navigator.language || "en-US";
      this.makeChart(i, a, s, n, o, t, r, d, u, c, l, p, h, b, y);
    }
    makeChart(t, e, i, a, s, n, o, r, l, d, u, c, p, m, h) {
      const b = "http://www.w3.org/2000/svg",
        y = a,
        f = s,
        v = Math.max(...t),
        A = Math.min(...t),
        g = v - A || 1,
        w = (t) => f - d / 2 - ((f - d) / g) * (t - A),
        x = document.createElementNS(b, "svg");
      x.setAttribute("role", "img"),
        x.setAttribute("width", y.toString()),
        x.setAttribute("height", f.toString()),
        x.setAttribute("aria-label", c),
        x.setAttribute("viewBox", `0 0 ${y} ${f}`),
        x.setAttribute("overflow", "visible"),
        x.setAttribute("preserveAspectRatio", "none");
      const k = t.length > 1 ? y / (t.length - 1) : 0,
        S = t.map((t, e) => `${(e * k).toFixed(2)},${w(t).toFixed(2)}`);
      if (o) {
        const t = `${S.map((t, e) => (0 === e ? "M" + t : "L" + t)).join(" ")} L${y.toFixed(2)},${f.toFixed(2)} L0,${f.toFixed(2)} Z`,
          e = document.createElementNS(b, "path");
        e.setAttribute("d", t),
          e.setAttribute("stroke", "none"),
          e.setAttribute("fill", l),
          e.setAttribute("fill-opacity", u.toString()),
          e.classList.add("sparkline-fill"),
          x.appendChild(e);
      }
      const C = `M${S.join(" L")}`,
        E = document.createElementNS(b, "path");
      E.setAttribute("d", C),
        E.setAttribute("fill", "none"),
        E.setAttribute("stroke", r),
        E.setAttribute("stroke-width", d.toString()),
        E.setAttribute("stroke-linecap", "butt"),
        E.setAttribute("stroke-linejoin", "round"),
        E.classList.add("sparkline-path"),
        x.appendChild(E);
      const L = document.createElement("div");
      if (
        ((L.style.position = "relative"),
        (L.style.display = "inline-block"),
        (L.style.width = `${y}px`),
        L.appendChild(x),
        p)
      ) {
        const a = document.createElement("div");
        a.classList.add("sparkline-tooltip"),
          (a.style.position = "absolute"),
          (a.style.pointerEvents = "none"),
          (a.style.background = "#333"),
          (a.style.border = "1px solid #222"),
          (a.style.color = "#fff"),
          (a.style.fontSize = "small"),
          (a.style.padding = "2px 4px"),
          (a.style.borderRadius = "4px"),
          (a.style.whiteSpace = "nowrap"),
          (a.style.display = "none"),
          (a.style["bottom" === m ? "top" : "bottom"] = `${f}px`),
          L.appendChild(a);
        const s = document.createElementNS(b, "line");
        s.setAttribute("x1", "0"),
          s.setAttribute("y1", "0"),
          s.setAttribute("x2", "0"),
          s.setAttribute("y2", f.toString()),
          s.setAttribute("stroke", r),
          s.setAttribute("stroke-width", "1"),
          s.setAttribute("stroke-dasharray", "4"),
          (s.style.display = "none"),
          x.appendChild(s);
        const n = document.createElementNS(b, "circle");
        n.setAttribute("r", (1.5 * d).toString()),
          n.setAttribute("fill", r),
          n.setAttribute("stroke", "#fff"),
          n.setAttribute("stroke-width", "1"),
          (n.style.display = "none"),
          x.appendChild(n);
        const o = document.createElementNS(b, "rect");
        o.setAttribute("width", y.toString()),
          o.setAttribute("height", f.toString()),
          o.setAttribute("fill", "transparent"),
          (o.style.cursor = "pointer"),
          x.appendChild(o);
        const l = new Intl.DateTimeFormat(h, {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          u = (o) => {
            const r = x.getBoundingClientRect(),
              d =
                (o instanceof MouseEvent ? o.clientX : o.touches[0].clientX) -
                r.left,
              u = Math.round(d / k),
              c = Math.max(0, Math.min(t.length - 1, u)),
              p = c * k,
              m = w(t[c]);
            if (
              (n.setAttribute("cx", p.toFixed(2)),
              n.setAttribute("cy", m.toFixed(2)),
              (n.style.display = "block"),
              s.setAttribute("x1", p.toFixed(2)),
              s.setAttribute("x2", p.toFixed(2)),
              (s.style.display = "block"),
              i)
            ) {
              const t = e[c],
                i = l.format(new Date(t.timestamp));
              a.innerHTML = `${t.value} (${i})`;
            } else a.textContent = t[c].toString();
            a.style.display = "block";
            const h = a.getBoundingClientRect();
            a.style.left = `${Math.max(0, Math.min(y - h.width, p - h.width / 2))}px`;
          },
          c = () => {
            (n.style.display = "none"),
              (s.style.display = "none"),
              (a.style.display = "none");
          };
        o.addEventListener("mousemove", u),
          o.addEventListener("touchmove", u),
          o.addEventListener("mouseleave", c),
          o.addEventListener("touchend", c),
          o.addEventListener("touchcancel", c);
      }
      (n.innerHTML = ""), n.appendChild(L);
    }
  };
  "undefined" != typeof window && (window.SimpleSparkLineChart = t);
})();
//# sourceMappingURL=index.js.map
