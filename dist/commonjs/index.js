var t,
  e,
  i =
    ((t = (t, e) => {
      var i = class {
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
            const n = JSON.parse(e);
            if (!(Array.isArray(n) && n.length > 0))
              return void console.warn(
                "Empty or invalid array in data-values:",
                t,
              );
            if ("object" == typeof n[0] && null !== n[0])
              (a = !0),
                (s = n.map((t) => ({
                  timestamp: t.timestamp,
                  value: t.value,
                }))),
                (i = s.map((t) => t.value));
            else {
              if ("number" != typeof n[0])
                return void console.warn(
                  "Invalid data format in data-values:",
                  t,
                );
              i = n.filter(Number.isFinite);
            }
          } catch {
            i = e.split(",").map(parseFloat).filter(Number.isFinite);
          }
          if (0 === i.length)
            return void console.warn("No valid data values for element:", t);
          const n = t.dataset.width ? parseInt(t.dataset.width) : 200,
            o = t.dataset.height
              ? parseInt(t.dataset.height)
              : Math.round(0.2 * n),
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
          this.makeChart(i, s, a, n, o, t, r, d, u, c, l, p, h, b, y);
        }
        makeChart(t, e, i, s, a, n, o, r, l, d, u, c, p, m, h) {
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
            S = t.map((t, e) => `${(e * w).toFixed(2)},${x(t).toFixed(2)}`);
          if (o) {
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
            C.setAttribute("stroke", r),
            C.setAttribute("stroke-width", d.toString()),
            C.setAttribute("stroke-linecap", "butt"),
            C.setAttribute("stroke-linejoin", "round"),
            C.classList.add("sparkline-path"),
            k.appendChild(C);
          const F = document.createElement("div");
          if (
            ((F.style.position = "relative"),
            (F.style.display = "inline-block"),
            (F.style.width = `${y}px`),
            F.appendChild(k),
            p)
          ) {
            const s = document.createElement("div");
            s.classList.add("sparkline-tooltip"),
              (s.style.position = "absolute"),
              (s.style.pointerEvents = "none"),
              (s.style.background = "#333"),
              (s.style.border = "1px solid #222"),
              (s.style.color = "#fff"),
              (s.style.fontSize = "small"),
              (s.style.padding = "2px 4px"),
              (s.style.borderRadius = "4px"),
              (s.style.whiteSpace = "nowrap"),
              (s.style.display = "none"),
              (s.style["bottom" === m ? "top" : "bottom"] = `${f}px`),
              F.appendChild(s);
            const a = document.createElementNS(b, "line");
            a.setAttribute("x1", "0"),
              a.setAttribute("y1", "0"),
              a.setAttribute("x2", "0"),
              a.setAttribute("y2", f.toString()),
              a.setAttribute("stroke", r),
              a.setAttribute("stroke-width", "1"),
              a.setAttribute("stroke-dasharray", "4"),
              (a.style.display = "none"),
              k.appendChild(a);
            const n = document.createElementNS(b, "circle");
            n.setAttribute("r", (1.5 * d).toString()),
              n.setAttribute("fill", r),
              n.setAttribute("stroke", "#fff"),
              n.setAttribute("stroke-width", "1"),
              (n.style.display = "none"),
              k.appendChild(n);
            const o = document.createElementNS(b, "rect");
            o.setAttribute("width", y.toString()),
              o.setAttribute("height", f.toString()),
              o.setAttribute("fill", "transparent"),
              (o.style.cursor = "pointer"),
              k.appendChild(o);
            const l = new Intl.DateTimeFormat(h, {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              u = (o) => {
                const r = k.getBoundingClientRect(),
                  d =
                    (o instanceof MouseEvent
                      ? o.clientX
                      : o.touches[0].clientX) - r.left,
                  u = Math.round(d / w),
                  c = Math.max(0, Math.min(t.length - 1, u)),
                  p = c * w,
                  m = x(t[c]);
                if (
                  (n.setAttribute("cx", p.toFixed(2)),
                  n.setAttribute("cy", m.toFixed(2)),
                  (n.style.display = "block"),
                  a.setAttribute("x1", p.toFixed(2)),
                  a.setAttribute("x2", p.toFixed(2)),
                  (a.style.display = "block"),
                  i)
                ) {
                  const t = e[c],
                    i = l.format(new Date(t.timestamp));
                  s.innerHTML = `${t.value} (${i})`;
                } else s.textContent = t[c].toString();
                s.style.display = "block";
                const h = s.getBoundingClientRect();
                s.style.left = `${Math.max(0, Math.min(y - h.width, p - h.width / 2))}px`;
              },
              c = () => {
                (n.style.display = "none"),
                  (a.style.display = "none"),
                  (s.style.display = "none");
              };
            o.addEventListener("mousemove", u),
              o.addEventListener("touchmove", u),
              o.addEventListener("mouseleave", c),
              o.addEventListener("touchend", c),
              o.addEventListener("touchcancel", c);
          }
          (n.innerHTML = ""), n.appendChild(F);
        }
      };
      e.exports && (e.exports = i);
    }),
    () => (e || t((e = { exports: {} }).exports, e), e.exports));
export default i();
//# sourceMappingURL=index.js.map
