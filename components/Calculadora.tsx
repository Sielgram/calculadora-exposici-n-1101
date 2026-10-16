"use client";
// Calculadora original de Calculus Studio (Resolver, Gráfica, Referencia, Práctica y Cuaderno),
// movida desde app/page.tsx. La lógica de solve(), practice(), el historial y el cuaderno es la
// original; los cambios son: textos en español, rango de x y varias funciones en la gráfica,
// y los ejemplos del modelo económico. La API (/api/calc) no se modificó.
import { useEffect, useState } from "react";
import { usePedido } from "./PedidoContext";
import { dibujar, COLOR, type Serie } from "../lib/graficar";
import modelo from "../lib/modelo.json";

const examples = ["diff sin(x)*x^2", "diff2 exp(x)*cos(x)", "integrate x^2 from 0 to 3", "limit sin(x)/x at 0", "root x^3-x-2 guess 1", "taylor exp(x) at 0 order 6"];
const refs = [
  ["Reglas de derivación", "(xⁿ)′ = n xⁿ⁻¹ • (fg)′ = f′g + fg′ • (f/g)′ = (f′g − fg′)/g²"],
  ["Regla de la cadena", "d/dx f(g(x)) = f′(g(x))·g′(x)"],
  ["Teorema fundamental del cálculo", "d/dx ∫ₐˣ f(t)dt = f(x)"],
  ["Integración por partes", "∫u dv = uv − ∫v du"],
  ["Serie de Taylor", "f(x) = Σ f⁽ⁿ⁾(a)(x−a)ⁿ/n!"],
  ["Regla de L'Hôpital", "En formas 0/0 o ∞/∞ que cumplan las condiciones, lim f/g = lim f′/g′."],
  ["Gradiente", "∇f = ⟨fₓ, fᵧ, f_z⟩"],
  ["Teorema de la divergencia", "∭ᵥ ∇·F dV = ∬ₛ F·n dS"],
  ["Teorema de Green", "∮C P dx + Q dy = ∬D (Qₓ − Pᵧ)dA"],
  ["Teorema de Stokes", "∬S (∇×F)·n dS = ∮∂S F·dr"],
];
const TABS: [string, string][] = [["Solver", "Resolver"], ["Graph", "Gráfica"], ["Reference", "Referencia"], ["Practice", "Práctica"], ["Notebook", "Cuaderno"]];

// La API devuelve los pasos del método en inglés; aquí solo se traducen para mostrarlos.
const PASOS: Record<string, string> = {
  "Differentiate the expression once.": "Derivar la expresión una vez.",
  "Differentiate the resulting expression again.": "Derivar de nuevo el resultado.",
  "Simplify the symbolic result.": "Simplificar el resultado simbólico.",
  "Parse the function of x.": "Interpretar la función de x.",
  "Apply symbolic differentiation rules.": "Aplicar las reglas de derivación simbólica.",
  "Simplify the derivative.": "Simplificar la derivada.",
  "Apply composite Simpson numerical quadrature with 1000 subintervals.": "Aplicar la cuadratura numérica compuesta de Simpson con 1000 subintervalos.",
  "Return the numerical approximation.": "Devolver la aproximación numérica.",
  "Approach the point from both sides.": "Acercarse al punto por ambos lados.",
  "Evaluate progressively smaller offsets.": "Evaluar con distancias cada vez más pequeñas.",
  "Compare and average convergent left/right values.": "Comparar y promediar los valores de izquierda y derecha.",
  "Start from the supplied initial guess.": "Partir del valor inicial indicado.",
  "Approximate the derivative numerically.": "Aproximar la derivada numéricamente.",
  "Iterate Newton's method until stable.": "Iterar el método de Newton hasta que se estabilice.",
  "Evaluate successive symbolic derivatives at the center.": "Evaluar derivadas sucesivas en el centro.",
  "Divide each coefficient by k!.": "Dividir cada coeficiente entre k!.",
  "Assemble the Taylor polynomial.": "Armar el polinomio de Taylor.",
  "Parse the mathematical expression.": "Interpretar la expresión matemática.",
  "Evaluate using the math engine.": "Evaluar con el motor matemático.",
};
function paso(s: string) {
  const m = s.match(/^Interpret the definite integral on \[(.+), (.+)\]\.$/);
  return m ? `Interpretar la integral definida en [${m[1]}, ${m[2]}].` : PASOS[s] ?? s;
}

const S_R: Serie = { expr: modelo.R, nombre: "R(x) ingresos", color: COLOR.ingresos, dash: "solid" };
const S_C: Serie = { expr: modelo.C, nombre: "C(x) costos", color: COLOR.costos, dash: "dash" };
const S_G: Serie = { expr: modelo.G, nombre: "G(x) ganancia", color: COLOR.ganancia, dash: "solid" };
const S_Rp: Serie = { expr: modelo.Rp, nombre: "R′(x)", color: COLOR.ingresos, dash: "solid" };
const S_Cp: Serie = { expr: modelo.Cp, nombre: "C′(x)", color: COLOR.costos, dash: "dash" };
const S_Gp: Serie = { expr: modelo.Gp, nombre: "G′(x)", color: COLOR.ganancia, dash: "solid" };

export default function Calculadora() {
  const { pedido } = usePedido();
  const [tab, setTab] = useState("Solver"), [q, setQ] = useState("diff sin(x)*x^2"), [res, setRes] = useState<any>(null), [hist, setHist] = useState<any[]>([]);
  const [graph, setGraph] = useState("sin(x)"), [gx0, setGx0] = useState("-10"), [gx1, setGx1] = useState("10"), [gmsg, setGmsg] = useState(""), [note, setNote] = useState("");

  useEffect(() => { try { setHist(JSON.parse(localStorage.getItem("calc-history") || "[]")); setNote(localStorage.getItem("calc-note") || ""); } catch {} }, []);

  async function solve(x = q) {
    setQ(x);
    try {
      const r = await fetch("/api/calc", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q: x }) });
      const d = await r.json();
      setRes({ ...d, cmd: x });
      if (!d.error) {
        const h = [{ q: x, r: d.result, t: new Date().toLocaleString("es-MX") }, ...hist].slice(0, 30);
        setHist(h);
        try { localStorage.setItem("calc-history", JSON.stringify(h)); } catch {}
      }
    } catch {
      setRes({ error: "No se pudo contactar el servidor de cálculo. Revisa la conexión e inténtalo de nuevo." });
    }
  }

  // series: lista de funciones; si no se indica, se toman del cuadro de texto (separadas por «;»).
  function draw(series?: Serie[], a: string | number = gx0, b: string | number = gx1) {
    setTab("Graph"); setGmsg("");
    // Si la gráfica viene de un ejemplo, el cuadro de función y el rango muestran lo que se cargó.
    if (series) { setGraph(series.map((s) => s.expr).join("; ")); setGx0(String(a)); setGx1(String(b)); }
    setTimeout(async () => {
      const lo = Number(a), hi = Number(b);
      if (!isFinite(lo) || !isFinite(hi) || hi <= lo) { setGmsg("El rango no es válido: x mínimo debe ser menor que x máximo."); return; }
      const lista = series ?? graph.split(";").map((s) => s.trim()).filter(Boolean).map((expr) => ({ expr }));
      if (!lista.length) { setGmsg("Escribe al menos una función de x."); return; }
      const usadas = lista.slice(0, 3);
      const invalidas = await dibujar("plot", usadas, lo, hi, series ? { ejeX: "x (unidades producidas)", ejeY: "unidades monetarias" } : {});
      const avisos: string[] = [];
      if (lista.length > 3) avisos.push("Se grafican como máximo 3 funciones a la vez.");
      if (invalidas.length) avisos.push(`No se pudo evaluar: ${invalidas.join(", ")}. Usa la variable x.`);
      setGmsg(avisos.join(" "));
    }, 30);
  }

  function practice() {
    const pool = ["diff x^5-3*x^2+7", "diff sin(x^2)", "integrate x^3+2*x from 0 to 2", "limit (x^2-1)/(x-1) at 1", "root cos(x)-x guess 1", "taylor sin(x) at 0 order 7"];
    setQ(pool[Math.floor(Math.random() * pool.length)]); setTab("Solver"); setRes(null);
  }

  // Peticiones que llegan desde otras secciones (botones «Comprobar en la calculadora»).
  useEffect(() => {
    if (!pedido) return;
    if (pedido.cmd) { setTab("Solver"); solve(pedido.cmd); }
    else if (pedido.graf) {
      const { series, x0, x1 } = pedido.graf;
      draw(series, x0, x1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido?.id]);

  const X = modelo.xOptimo;
  const resolver = (cmd: string) => { setTab("Solver"); solve(cmd); }; // muestra la pestaña Resolver aunque se esté en otra
  const filas: { clave: string; nombre: string; expr: string; serie: Serie; acciones: [string, () => void][] }[] = [
    { clave: "r", nombre: "Ingresos R(x)", expr: modelo.R, serie: S_R, acciones: [["Derivar", () => resolver(`diff ${modelo.R}`)], ["Graficar", () => draw([S_R], 0, modelo.xMax)]] },
    { clave: "c", nombre: "Costos C(x)", expr: modelo.C, serie: S_C, acciones: [["Derivar", () => resolver(`diff ${modelo.C}`)], ["Graficar", () => draw([S_C], 0, modelo.xMax)]] },
    { clave: "g", nombre: "Ganancias G(x)", expr: modelo.G, serie: S_G, acciones: [["Derivar", () => resolver(`diff ${modelo.G}`)], ["Graficar", () => draw([S_G], 0, modelo.xMax)]] },
    { clave: "gp", nombre: "Ganancia marginal G′(x)", expr: modelo.Gp, serie: S_Gp, acciones: [
      ["Graficar", () => draw([S_Gp], 0, modelo.xMax)],
      ["Raíz (óptimo)", () => resolver(`root ${modelo.Gp} guess 100`)],
      [`Integrar de 0 a ${X}`, () => resolver(`integrate ${modelo.Gp} from 0 to ${X}`)],
    ] },
  ];

  return (
    <div className="calc">
      <div className="eco" aria-labelledby="eco-titulo">
        <h3 id="eco-titulo">Ejemplos del modelo económico</h3>
        <p className="muted">Cada botón carga la expresión en la calculadora de abajo y la ejecuta.</p>
        <ul className="eco-lista">
          {filas.map((f) => (
            <li key={f.clave}>
              <span className="eco-nombre"><i className="muestra" style={{ borderTopColor: f.serie.color, borderTopStyle: f.serie.dash === "dash" ? "dashed" : "solid" }} aria-hidden="true" />{f.nombre}</span>
              <code>{f.expr}</code>
              <span className="eco-acciones">{f.acciones.map(([t, fn]) => <button key={t} type="button" className="chip-eco" onClick={fn}>{t}</button>)}</span>
            </li>
          ))}
        </ul>
        <div className="eco-juntas">
          <button type="button" className="chip-eco" onClick={() => draw([S_R, S_C, S_G], 0, modelo.xMax)}>Graficar R, C y G juntas</button>
          <button type="button" className="chip-eco" onClick={() => draw([S_Rp, S_Cp], 0, modelo.xMax)}>Graficar R′ y C′ (se cruzan en x = {X})</button>
        </div>
      </div>

      <div id="calc-trabajo" className="trabajo">
        <div className="tabs" role="group" aria-label="Herramientas de la calculadora">
          {TABS.map(([k, t]) => (
            <button key={k} type="button" className={tab === k ? "active" : ""} aria-pressed={tab === k} onClick={() => (k === "Practice" ? practice() : setTab(k))}>{t}</button>
          ))}
        </div>

        {tab === "Solver" && <>
          <div className="card">
            <div className="inputrow">
              <input aria-label="Comando de cálculo" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && solve()} placeholder="Escribe un comando, por ejemplo: diff x^2" />
              <button className="primary" onClick={() => solve()}>Resolver</button>
            </div>
            <p className="tiny" style={{ marginTop: 10 }}>Ejemplos generales:</p>
            <div className="chips">{examples.map((x) => <button className="chip" key={x} onClick={() => solve(x)}>{x}</button>)}</div>
            <details className="ayuda">
              <summary>Guía de comandos</summary>
              <table>
                <tbody>
                  <tr><td><code>diff f(x)</code></td><td>Derivada de f respecto a x</td></tr>
                  <tr><td><code>diff2 f(x)</code></td><td>Segunda derivada</td></tr>
                  <tr><td><code>integrate f(x) from a to b</code></td><td>Integral definida (aproximación numérica)</td></tr>
                  <tr><td><code>limit f(x) at a</code></td><td>Límite estimado numéricamente</td></tr>
                  <tr><td><code>root f(x) guess a</code></td><td>Raíz de f cerca de a (método de Newton)</td></tr>
                  <tr><td><code>taylor f(x) at a order n</code></td><td>Polinomio de Taylor</td></tr>
                  <tr><td><code>eval expresión</code></td><td>Evalúa una expresión numérica</td></tr>
                </tbody>
              </table>
            </details>
          </div>
          {res && <div className="grid">
            <div className="card"><h3>Resultado</h3><div className={res.error ? "error result" : "result"}>{res.error || res.result}</div>
              {!res.error && <p className="tiny">Los resultados numéricos pueden mostrar redondeo de coma flotante (por ejemplo, 12099.999999999998 equivale a 12 100).</p>}
              {!res.error && /^diff2?\s/i.test(res.cmd ?? "") && <p className="tiny">La derivada es correcta aunque no siempre aparezca simplificada: por ejemplo, <code>x * -7 / 100 + 42</code> equivale a −0.07x + 42.</p>}</div>
            <div className="card"><h3>Método</h3><div className="steps">{res.steps?.map((x: string, i: number) => <div key={i}>{i + 1}. {paso(x)}</div>)}</div></div>
          </div>}
        </>}

        {tab === "Graph" && <div className="card">
          <div className="inputrow">
            <input aria-label="Función de x" value={graph} onChange={(e) => setGraph(e.target.value)} onKeyDown={(e) => e.key === "Enter" && draw()} placeholder="Función de x; separa varias con «;»" />
            <button className="primary" onClick={() => draw()}>Graficar</button>
          </div>
          <div className="rango">
            <label>x mínimo <input type="number" step="any" value={gx0} onChange={(e) => setGx0(e.target.value)} onKeyDown={(e) => e.key === "Enter" && draw()} /></label>
            <label>x máximo <input type="number" step="any" value={gx1} onChange={(e) => setGx1(e.target.value)} onKeyDown={(e) => e.key === "Enter" && draw()} /></label>
            <span className="tiny">Hasta 3 funciones separadas por «;».</span>
          </div>
          {gmsg && <p className="error" role="alert">{gmsg}</p>}
          <div id="plot" className="plot plot-calc"></div>
        </div>}

        {tab === "Reference" && <div className="refgrid">{refs.map(([a, b]) => <div className="ref" key={a}><b>{a}</b><p>{b}</p></div>)}</div>}

        {tab === "Notebook" && <>
          <div className="card"><h3>Notas</h3><textarea className="field" aria-label="Notas" value={note} onChange={(e) => { setNote(e.target.value); try { localStorage.setItem("calc-note", e.target.value); } catch {} }} placeholder="Escribe definiciones, procedimientos o recordatorios…" /></div>
          <div className="card"><h3>Historial de cálculos</h3><div className="history">{hist.length ? hist.map((h, i) => <div className="historyItem" key={i} onClick={() => { setQ(h.q); setTab("Solver"); setRes({ result: h.r, steps: [] }); }}><b>{h.q}</b><div>{h.r}</div><div className="tiny">{h.t}</div></div>) : <span className="muted">Todavía no hay cálculos.</span>}</div></div>
        </>}
      </div>
    </div>
  );
}
