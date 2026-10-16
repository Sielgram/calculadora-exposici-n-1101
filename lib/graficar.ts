// Dibujo de gráficas con Plotly + mathjs (el mismo motor de la calculadora original).
// Lo usan la pestaña «Gráfica» de la calculadora y la gráfica del modelo, para no duplicar código.

export type Serie = { expr: string; nombre?: string; color?: string; dash?: "solid" | "dash" | "dot" };

// Colores de las series, validados para fondo oscuro y daltonismo. Deben coincidir con las
// variables --serie-* de app/educativo.css.
export const COLOR = { ingresos: "#05a0c4", costos: "#c9790a", ganancia: "#7b61ff" };
const PALETA = [COLOR.ingresos, COLOR.costos, COLOR.ganancia];
const SUPERFICIE = "#0f1a30", LINEA = "#243656", TINTA = "#e8eefb", TINTA2 = "#a9b8d6";

export type Marca = { serie: number; x: number; texto: string };
export type Extra = { marca?: Marca; ejeX?: string; ejeY?: string };

/** Dibuja las series en el elemento con id `id`. Devuelve las expresiones que no se pudieron evaluar. */
export async function dibujar(id: string, series: Serie[], x0: number, x1: number, extra: Extra = {}): Promise<string[]> {
  const el = document.getElementById(id);
  if (!el) return [];
  const [{ default: Plotly }, math] = await Promise.all([import("plotly.js-dist-min"), import("mathjs")]);
  const n = 400, paso = (x1 - x0) / n;
  const xs: number[] = [];
  for (let i = 0; i <= n; i++) xs.push(x0 + i * paso);
  const ev = (e: string, x: number) => { try { return Number(math.evaluate(e, { x })); } catch { return NaN; } };
  const ys = series.map((s) => xs.map((x) => ev(s.expr, x)));
  const invalidas = series.filter((_, i) => ys[i].every((v) => !isFinite(v))).map((s) => s.expr);
  const varias = series.length > 1;
  const trazas: any[] = series.map((s, i) => ({
    x: xs, y: ys[i], type: "scatter", mode: "lines", name: s.nombre ?? s.expr,
    line: { color: s.color ?? PALETA[i % PALETA.length], width: 3, dash: s.dash ?? (i === 1 ? "dash" : "solid") },
    hovertemplate: `${s.nombre ?? s.expr}: %{y:,.2f}<extra></extra>`,
  }));
  const anotaciones: any[] = [];
  const formas: any[] = [];
  if (varias) {
    // Etiquetas directas sobre las líneas con nombre (además de la leyenda).
    const k = Math.floor(n * 0.9);
    series.forEach((s, i) => {
      if (s.nombre && isFinite(ys[i][k])) anotaciones.push({ x: xs[k], y: ys[i][k], text: s.nombre, showarrow: false, yshift: 16, xanchor: "right", font: { color: TINTA, size: 13 }, bgcolor: SUPERFICIE, borderpad: 2 });
    });
  }
  if (extra.marca && series[extra.marca.serie]) {
    const { serie, x, texto } = extra.marca;
    const y = ev(series[serie].expr, x);
    trazas.push({ x: [x], y: [y], type: "scatter", mode: "markers", showlegend: false, hoverinfo: "skip",
      marker: { size: 12, color: series[serie].color ?? PALETA[serie % PALETA.length], line: { color: SUPERFICIE, width: 2 } } });
    formas.push({ type: "line", x0: x, x1: x, y0: 0, y1: y, xref: "x", yref: "y", line: { color: TINTA2, width: 1, dash: "dot" } });
    anotaciones.push({ x, y, text: texto, showarrow: true, arrowcolor: TINTA2, ax: 0, ay: -56, font: { color: TINTA, size: 13 }, bgcolor: SUPERFICIE, bordercolor: LINEA, borderpad: 4 });
  }
  const layout: any = {
    paper_bgcolor: SUPERFICIE, plot_bgcolor: SUPERFICIE,
    font: { color: TINTA, family: "system-ui, -apple-system, 'Segoe UI', sans-serif", size: 13 },
    margin: { t: 24, r: 24, b: varias ? 112 : 56, l: 64 },
    xaxis: { gridcolor: LINEA, zerolinecolor: "#3a4f7a", title: { text: extra.ejeX ?? "x", standoff: 10 }, range: [x0, x1] },
    yaxis: { gridcolor: LINEA, zerolinecolor: "#3a4f7a", title: { text: extra.ejeY ?? "" } },
    showlegend: varias, legend: { orientation: "h", x: 0, y: -0.3, yanchor: "top" },
    hovermode: "x unified", shapes: formas, annotations: anotaciones,
  };
  await Plotly.newPlot(el, trazas, layout, { responsive: true, displaylogo: false });
  return invalidas;
}
