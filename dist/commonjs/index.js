var t,
  e,
  i =
    ((t = (t, e) => {
      var i =
        /*
         *
         * Simple SparkLine Chart
         * @version 0.1.0
         * @license MIT
         * @author https://github.com/dejurin
         *
         * https://github.com/dejurin/simple-sparkline
         *
         */
        class {
          constructor(t) {
            document.querySelectorAll(t).forEach((t) => {
              this.createChart(t);
            });
          }
          createChart(t) {
            const e = t.dataset.values;
            let i = [],
              s = [],
              a = !1;
            if (!e)
              return void console.warn(
                "Missing data-values attribute for element:",
                t,
              );
            try {
              const r = JSON.parse(e);
              if (!(Array.isArray(r) && r.length > 0))
                return void console.warn(
                  "Empty or invalid array in data-values:",
                  t,
                );
              if ("object" == typeof r[0] && null !== r[0])
                (a = !0),
                  (s = r.map((t) => ({
                    timestamp: t.timestamp,
                    value: t.value,
                  }))),
                  (i = s.map((t) => t.value));
              else {
                if ("number" != typeof r[0])
                  return void console.warn(
                    "Invalid data format in data-values:",
                    t,
                  );
                i = r.filter(Number.isFinite);
              }
            } catch {
              i = e.split(",").map(parseFloat).filter(Number.isFinite);
            }
            if (0 === i.length)
              return void console.warn("No valid data values for element:", t);
            const r = t.dataset.width ? parseInt(t.dataset.width) : 200,
              n = t.dataset.height
                ? parseInt(t.dataset.height)
                : Math.round(0.2 * r),
              o = "true" === t.dataset.filled,
              l = t.dataset.colorStroke || "#8956ff",
              d = t.dataset.colorFilled || l,
              u = t.dataset.strokeWidth ? parseFloat(t.dataset.strokeWidth) : 2,
              c =
                void 0 !== t.dataset.filledOpacity
                  ? parseFloat(t.dataset.filledOpacity)
                  : 0.2,
              p = t.dataset.ariaLabel || "Simple SparkLine Chart",
              h = "false" !== t.dataset.tooltip,
              m = t.dataset.tooltipPosition || "above",
              b = t.dataset.locale || navigator.language || "en-US";
            this.makeChart(i, s, a, r, n, t, o, l, d, u, c, p, h, m, b);
          }
          makeChart(t, e, i, s, a, r, n, o, l, d, u, c, p, h, m) {
            const b = "http://www.w3.org/2000/svg",
              y = s,
              f = a,
              v = Math.max(...t),
              A = Math.min(...t),
              g = v - A || 1,
              x = (t) => f - d / 2 - ((f - d) / g) * (t - A),
              k = document.createElementNS(b, "svg");
            k.setAttribute("role", "img"),
              k.setAttribute("width", y.toString()),
              k.setAttribute("height", f.toString()),
              k.setAttribute("aria-label", c),
              k.setAttribute("viewBox", `0 0 ${y} ${f}`),
              k.setAttribute("overflow", "visible"),
              k.setAttribute("preserveAspectRatio", "none");
            const w = t.length > 1 ? y / (t.length - 1) : 0,
              S = [];
            for (let e = 0; e < t.length; e++) {
              const i = (e * w).toFixed(2),
                s = x(t[e]).toFixed(2);
              S.push(`${i},${s}`);
            }
            if (n) {
              const t = `${S.map((t, e) => (0 === e ? "M" + t : "L" + t)).join(" ")} L${y.toFixed(2)},${f.toFixed(2)} L0,${f.toFixed(2)} Z`,
                e = document.createElementNS(b, "path");
              e.setAttribute("d", t),
                e.setAttribute("stroke", "none"),
                e.setAttribute("fill", l),
                e.setAttribute("fill-opacity", u.toString()),
                e.classList.add("sparkline-fill"),
                k.appendChild(e);
            }
            const E = `M${S.join(" L")}`,
              C = document.createElementNS(b, "path");
            C.setAttribute("d", E),
              C.setAttribute("fill", "none"),
              C.setAttribute("stroke", o),
              C.setAttribute("stroke-width", d.toString()),
              C.setAttribute("stroke-linecap", "butt"),
              C.setAttribute("stroke-linejoin", "round"),
              C.classList.add("sparkline-path"),
              k.appendChild(C);
            const F = document.createElement("div");
            (F.style.position = "relative"),
              (F.style.display = "inline-block"),
              (F.style.width = y + "px"),
              F.appendChild(k);
            const L = document.createElement("div");
            if (
              ((L.style.position = "absolute"),
              (L.style.pointerEvents = "none"),
              (L.style.background = "#333"),
              (L.style.border = "1px solid #222"),
              (L.style.color = "#fff"),
              (L.style.fontSize = "small"),
              (L.style.whiteSpace = "nowrap"),
              (L.style.padding = "2px 4px"),
              (L.style.borderRadius = "4px"),
              L.classList.add("sparkline-tooltip"),
              (L.style.display = "none"),
              "bottom" === h
                ? (L.style.top = f + "px")
                : (L.style.bottom = f + "px"),
              F.appendChild(L),
              (r.innerHTML = ""),
              r.appendChild(F),
              !p)
            )
              return;
            const M = document.createElementNS(b, "line");
            M.setAttribute("class", "sparkline-cursor-line"),
              M.setAttribute("x1", "0"),
              M.setAttribute("y1", "0"),
              M.setAttribute("x2", "0"),
              M.setAttribute("y2", f.toString()),
              M.setAttribute("stroke", o),
              M.setAttribute("stroke-width", "1"),
              M.setAttribute("stroke-dasharray", "4"),
              (M.style.display = "none"),
              k.appendChild(M);
            const $ = document.createElementNS(b, "circle");
            $.setAttribute("class", "sparkline-spot"),
              $.setAttribute("r", (1.5 * d).toString()),
              $.setAttribute("fill", o),
              $.setAttribute("stroke", "#fff"),
              $.setAttribute("stroke-width", "1"),
              ($.style.display = "none"),
              k.appendChild($);
            const N = document.createElementNS(b, "rect");
            N.setAttribute("width", y.toString()),
              N.setAttribute("height", f.toString()),
              N.setAttribute("fill", "transparent"),
              (N.style.cursor = "pointer"),
              k.appendChild(N);
            const j = new Intl.DateTimeFormat(m, {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              I = (s) => {
                s.preventDefault();
                const a = k.getBoundingClientRect();
                let r;
                if (s instanceof MouseEvent) r = s.clientX;
                else {
                  if (!(s.touches && s.touches.length > 0)) return;
                  r = s.touches[0].clientX;
                }
                const n = r - a.left,
                  o = Math.round(n / w),
                  l = Math.max(0, Math.min(t.length - 1, o)),
                  d = l * w,
                  u = x(t[l]);
                if (
                  ($.setAttribute("cx", d.toFixed(2)),
                  $.setAttribute("cy", u.toFixed(2)),
                  ($.style.display = "block"),
                  M.setAttribute("x1", d.toFixed(2)),
                  M.setAttribute("x2", d.toFixed(2)),
                  (M.style.display = "block"),
                  i)
                ) {
                  const t = e[l],
                    i = j.format(new Date(t.timestamp));
                  L.innerHTML = `${t.value} (${i})`;
                } else L.textContent = t[l].toString();
                L.style.display = "block";
                const c = L.getBoundingClientRect();
                let p = d - c.width / 2;
                p < 0 ? (p = 0) : p + c.width > y && (p = y - c.width),
                  (L.style.left = p + "px");
              },
              R = () => {
                ($.style.display = "none"),
                  (M.style.display = "none"),
                  (L.style.display = "none");
              };
            N.addEventListener("mousemove", I),
              N.addEventListener("touchmove", I),
              N.addEventListener("mouseleave", R),
              N.addEventListener("touchend", R),
              N.addEventListener("touchcancel", R);
          }
        };
      e.exports && (e.exports = i);
    }),
    () => (e || t((e = { exports: {} }).exports, e), e.exports));
export default i();
//# sourceMappingURL=index.js.map
