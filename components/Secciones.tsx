// Secciones de contenido. Componentes de servidor: las cifras se calculan con mathjs
// (lib/calculos.ts) a partir de las mismas expresiones que usa la calculadora.
import type { ReactNode } from "react";
import Formula from "./Formula";
import GraficaModelo from "./GraficaModelo";
import Calculadora from "./Calculadora";
import { BotonCalc } from "./PedidoContext";
import { fmt, fmtTex, resultados, tabla } from "../lib/calculos";
import { COLOR, type Serie } from "../lib/graficar";
import modelo from "../lib/modelo.json";

const X = modelo.xOptimo;
const S_R: Serie = { expr: modelo.R, nombre: "R(x) ingresos", color: COLOR.ingresos, dash: "solid" };
const S_C: Serie = { expr: modelo.C, nombre: "C(x) costos", color: COLOR.costos, dash: "dash" };
const S_G: Serie = { expr: modelo.G, nombre: "G(x) ganancia", color: COLOR.ganancia, dash: "solid" };
const S_Rp: Serie = { expr: modelo.Rp, nombre: "R′(x)", color: COLOR.ingresos, dash: "solid" };
const S_Cp: Serie = { expr: modelo.Cp, nombre: "C′(x)", color: COLOR.costos, dash: "dash" };

function Funcion({ tipo, nombre, formula, derivada, queEs, queMide }: { tipo: "ingresos" | "costos" | "ganancia"; nombre: string; formula: string; derivada: string; queEs: ReactNode; queMide: ReactNode }) {
  return (
    <article className={`funcion ${tipo}`}>
      <div className="funcion-cab"><i className="muestra" aria-hidden="true" /><h3>{nombre}</h3></div>
      <Formula block tex={formula} />
      <div className="funcion-cols">
        <div><h4>Qué representa</h4><p>{queEs}</p></div>
        <div><h4>Su derivada</h4><Formula block tex={derivada} /><p>{queMide}</p></div>
      </div>
    </article>
  );
}

export function SeccionIntro() {
  return (
    <section className="seccion" aria-labelledby="intro-t">
      <div className="contenedor estrecho">
        <h2 id="intro-t">Qué estudia una fábrica antes de producir</h2>
        <p>Toda fábrica se hace tres preguntas: cuánto dinero entra por lo que vende, cuánto cuesta producirlo y cuánto queda al final. Si produce muy poco, no cubre sus costos fijos. Si produce demasiado, en este modelo cada unidad adicional se vende a menor precio y cuesta más fabricarla.</p>
        <p>El cálculo convierte esas preguntas en operaciones concretas:</p>
        <dl className="herramientas">
          <div><dt>Funciones</dt><dd>Describen los ingresos R(x), los costos C(x) y la ganancia G(x) según las <em>x</em> unidades producidas y vendidas.</dd></div>
          <div><dt>Derivadas</dt><dd>Miden cuánto cambia cada cantidad por una unidad adicional. En economía se llaman valores marginales.</dd></div>
          <div><dt>Integrales definidas</dt><dd>Suman lo que se acumula entre dos niveles de producción, como el costo variable total entre 0 y 600 unidades.</dd></div>
        </dl>
        <p className="nota">Todo el ejemplo es ilustrativo: la fábrica y sus cifras son ficticias. Sirve para aprender el método, no para tomar decisiones sobre una empresa real.</p>
      </div>
    </section>
  );
}

export function SeccionModelo() {
  const r = resultados();
  const t = tabla();
  const dR = r.R - r.R0, dC = r.C - r.C0, dG = r.G - r.G0;
  return (
    <section id="modelo" className="seccion" aria-labelledby="modelo-t">
      <div className="contenedor">
        <h2 id="modelo-t">El modelo económico</h2>
        <p className="intro">Sea <Formula tex="x" /> el número de unidades producidas y vendidas. Los valores están en unidades monetarias (u. m.).</p>

        <div className="funciones">
          <Funcion tipo="ingresos" nombre="Ingresos" formula="R(x) = 50x - 0.025x^2" derivada="R'(x) = 50 - 0.05x"
            queEs={<>Dinero que entra al vender <em>x</em> unidades. Equivale a vender cada una al precio <Formula tex="p(x)=50-0.025x" />: el precio baja conforme se vende más.</>}
            queMide={<><strong>Ingreso marginal:</strong> ingreso adicional aproximado al vender una unidad más.</>} />
          <Funcion tipo="costos" nombre="Costos" formula="C(x) = 500 + 8x + 0.01x^2" derivada="C'(x) = 8 + 0.02x"
            queEs={<>El 500 es el costo fijo, que se paga aunque no se produzca. El término 8x es el costo por unidad y 0.01x² hace que cada unidad adicional sea más cara.</>}
            queMide={<><strong>Costo marginal:</strong> costo adicional aproximado de fabricar una unidad más.</>} />
          <Funcion tipo="ganancia" nombre="Ganancia" formula={String.raw`\begin{aligned}G(x)&=R(x)-C(x)\\&=-0.035x^2+42x-500\end{aligned}`} derivada="G'(x) = R'(x) - C'(x) = 42 - 0.07x"
            queEs={<>Lo que queda después de pagar los costos. Con cero producción es <Formula tex={`G(0)=${fmtTex(r.G0)}`} />: se pierde el costo fijo.</>}
            queMide={<><strong>Ganancia marginal:</strong> cuánto cambia la ganancia al producir una unidad más.</>} />
        </div>

        <h3 className="sub">Las tres funciones juntas</h3>
        <GraficaModelo
          marcaTexto={`Máximo: x = ${fmt(r.x)}, G = ${fmt(r.G)}`}
          descripcion={`Gráfica de ingresos, costos y ganancia según las unidades producidas, de 0 a ${fmt(modelo.xMax)}. La ganancia alcanza su máximo de ${fmt(r.G)} con ${fmt(r.x)} unidades.`} />
        <table className="valores">
          <caption>Valores en distintos niveles de producción (u. m.)</caption>
          <thead><tr><th scope="col">Unidades x</th><th scope="col" className="c-ingresos">Ingresos R</th><th scope="col" className="c-costos">Costos C</th><th scope="col" className="c-ganancia">Ganancia G</th></tr></thead>
          <tbody>{t.map((f) => <tr key={f.x} className={f.x === r.x ? "optimo" : ""}><th scope="row">{fmt(f.x)}</th><td>{fmt(f.R)}</td><td>{fmt(f.C)}</td><td>{fmt(f.G)}</td></tr>)}</tbody>
        </table>

        <div className="dos-col">
          <div>
            <h3 className="sub">La derivada en economía</h3>
            <p>La derivada mide el cambio por unidad adicional. Si <Formula tex="G'(x)>0" />, producir una unidad más aumenta la ganancia; si <Formula tex="G'(x)<0" />, la reduce. Por eso el máximo se busca donde la ganancia marginal es cero, que equivale a que el ingreso marginal iguale al costo marginal:</p>
            <Formula block tex="G'(x)=0 \iff R'(x)=C'(x)" />
          </div>
          <div>
            <h3 className="sub">La integral definida en economía</h3>
            <p>La integral definida suma cambios pequeños a lo largo de un intervalo de producción. Si se conoce la tasa marginal, su integral da el cambio total (teorema fundamental del cálculo):</p>
            <Formula block tex="\int_a^b f'(x)\,dx = f(b)-f(a)" />
          </div>
        </div>

        <ul className="acumulados">
          <li className="ingresos"><Formula block tex={`\\int_0^{${X}} R'(x)\\,dx = R(${X})-R(0) = ${fmtTex(dR)}`} /><p>Ingresos acumulados al pasar de 0 a {fmt(X)} unidades.</p>
            <BotonCalc pedido={{ cmd: `integrate ${modelo.Rp} from 0 to ${X}` }}>Comprobar en la calculadora</BotonCalc></li>
          <li className="costos"><Formula block tex={`\\int_0^{${X}} C'(x)\\,dx = C(${X})-C(0) = ${fmtTex(dC)}`} /><p>Costo variable acumulado. Sumando el costo fijo de {fmt(r.C0)} se obtiene C({fmt(X)}) = {fmt(r.C)}.</p>
            <BotonCalc pedido={{ cmd: `integrate ${modelo.Cp} from 0 to ${X}` }}>Comprobar en la calculadora</BotonCalc></li>
          <li className="ganancia"><Formula block tex={`\\int_0^{${X}} G'(x)\\,dx = G(${X})-G(0) = ${fmtTex(dG)}`} /><p>Ganancia acumulada: G({fmt(X)}) = {fmt(r.G0)} + {fmt(dG)} = {fmt(r.G)}. En [0, {fmt(X)}] es también el área entre las curvas R′ y C′.</p>
            <BotonCalc pedido={{ cmd: `integrate ${modelo.Gp} from 0 to ${X}` }}>Comprobar en la calculadora</BotonCalc></li>
        </ul>
        <p className="nota">La calculadora de esta página aproxima las integrales definidas con un método numérico (regla de Simpson). No obtiene primitivas simbólicas ni sombrea el área bajo la curva.</p>
      </div>
    </section>
  );
}

export function SeccionCaso() {
  const r = resultados();
  return (
    <section id="caso" className="seccion" aria-labelledby="caso-t">
      <div className="contenedor estrecho">
        <h2 id="caso-t">Caso práctico: maximizar la ganancia</h2>
        <p className="intro">¿Con cuántas unidades la fábrica obtiene la mayor ganancia? Se resuelve en seis pasos; cada uno se puede comprobar en la calculadora.</p>
        <ol className="pasos">
          <li>
            <h3>Plantear la ganancia</h3>
            <p>La ganancia es ingresos menos costos.</p>
            <Formula block tex={String.raw`\begin{aligned}G(x)&=\bigl(50x-0.025x^2\bigr)\\&\quad-\bigl(500+8x+0.01x^2\bigr)\\&=-0.035x^2+42x-500\end{aligned}`} />
            <BotonCalc pedido={{ graf: { series: [S_R, S_C, S_G], x0: 0, x1: modelo.xMax } }}>Graficar R, C y G</BotonCalc>
          </li>
          <li>
            <h3>Derivar</h3>
            <Formula block tex="G'(x)=-0.07x+42" />
            <BotonCalc pedido={{ cmd: `diff ${modelo.G}` }}>Comprobar en la calculadora</BotonCalc>
          </li>
          <li>
            <h3>Hallar el punto crítico</h3>
            <p>Se iguala la derivada a cero.</p>
            <Formula block tex={String.raw`\begin{aligned}-0.07x+42&=0\\x&=\dfrac{42}{0.07}=${fmtTex(r.x)}\end{aligned}`} />
            <BotonCalc pedido={{ cmd: `root ${modelo.Gp} guess 100` }}>Comprobar en la calculadora</BotonCalc>
          </li>
          <li>
            <h3>Clasificar con la segunda derivada</h3>
            <Formula block tex="G''(x)=-0.07<0" />
            <p>Es negativa, así que la gráfica abre hacia abajo y en x = {fmt(r.x)} hay un <strong>máximo</strong>.</p>
            <BotonCalc pedido={{ cmd: `diff2 ${modelo.G}` }}>Comprobar en la calculadora</BotonCalc>
          </li>
          <li>
            <h3>Evaluar en el óptimo</h3>
            <Formula block tex={String.raw`\begin{aligned}G(${fmtTex(r.x)})&=-0.035(${fmtTex(r.x)})^2\\&\quad+42(${fmtTex(r.x)})-500\\&=${fmtTex(r.G)}\end{aligned}`} />
            <BotonCalc pedido={{ cmd: `eval -0.035*${X}^2 + 42*${X} - 500` }}>Comprobar en la calculadora</BotonCalc>
          </li>
          <li>
            <h3>Verificar con los valores marginales</h3>
            <Formula block tex={String.raw`\begin{aligned}R'(${fmtTex(r.x)})&=50-0.05(${fmtTex(r.x)})=${fmtTex(r.Rp)}\\C'(${fmtTex(r.x)})&=8+0.02(${fmtTex(r.x)})=${fmtTex(r.Cp)}\end{aligned}`} />
            <p>Coinciden: en el máximo, producir una unidad más cuesta tanto como lo que aporta.</p>
            <BotonCalc pedido={{ graf: { series: [S_Rp, S_Cp], x0: 0, x1: modelo.xMax } }}>Graficar R′ y C′</BotonCalc>
          </li>
        </ol>

        <div className="resultado" role="group" aria-label={`Resultado con ${fmt(r.x)} unidades`}>
          <h3>Resultado con {fmt(r.x)} unidades</h3>
          <div className="ecuacion">
            <div className="termino ingresos"><span className="etq"><i className="muestra" aria-hidden="true" />Ingresos R</span><b>{fmt(r.R)}</b></div>
            <span className="op" aria-label="menos">−</span>
            <div className="termino costos"><span className="etq"><i className="muestra" aria-hidden="true" />Costos C</span><b>{fmt(r.C)}</b></div>
            <span className="op" aria-label="igual a">=</span>
            <div className="termino ganancia"><span className="etq"><i className="muestra" aria-hidden="true" />Ganancia G</span><b>{fmt(r.G)}</b></div>
          </div>
          <p className="tiny">Unidades monetarias.</p>
        </div>

        <table className="signos">
          <caption>Dónde sube y dónde baja la ganancia</caption>
          <thead><tr><th scope="col">Producción</th><th scope="col">Signo de G′</th><th scope="col">La ganancia…</th></tr></thead>
          <tbody>
            <tr><td>x &lt; {fmt(r.x)}</td><td>positivo</td><td>aumenta</td></tr>
            <tr className="optimo"><td>x = {fmt(r.x)}</td><td>cero</td><td>es máxima</td></tr>
            <tr><td>x &gt; {fmt(r.x)}</td><td>negativo</td><td>disminuye</td></tr>
          </tbody>
        </table>

        <aside className="aviso">
          <strong>Modelo ilustrativo.</strong> Los resultados dependen de sus supuestos: el precio baja de forma lineal al vender más, el costo crece de forma cuadrática, todo lo que se produce se vende y no hay límite de capacidad. Con otros supuestos, el óptimo sería distinto.
        </aside>
      </div>
    </section>
  );
}

export function SeccionCalculadora() {
  return (
    <section id="calculadora" className="seccion" aria-labelledby="calc-t">
      <div className="contenedor">
        <h2 id="calc-t">Calculadora</h2>
        <p className="intro">Deriva, calcula integrales definidas, límites, raíces y polinomios de Taylor, y grafica funciones de x. Los botones de los pasos anteriores cargan aquí sus operaciones.</p>
        <Calculadora />
      </div>
    </section>
  );
}

export function SeccionConclusiones() {
  const r = resultados();
  return (
    <section id="conclusiones" className="seccion" aria-labelledby="concl-t">
      <div className="contenedor estrecho">
        <h2 id="concl-t">Conclusiones</h2>
        <ul className="conclusiones">
          <li>Con este modelo, producir <strong>{fmt(r.x)} unidades</strong> maximiza la ganancia: <strong>{fmt(r.G)} u. m.</strong>, con ingresos de {fmt(r.R)} y costos de {fmt(r.C)}.</li>
          <li>La derivada localiza el óptimo: la ganancia deja de crecer donde el ingreso marginal iguala al costo marginal ({fmt(r.Rp)} u. m. por unidad).</li>
          <li>La integral definida mide lo acumulado entre dos niveles de producción: {fmt(r.G - r.G0)} u. m. de ganancia entre 0 y {fmt(r.x)} unidades, que descontando el costo fijo de {fmt(r.C0)} deja {fmt(r.G)}.</li>
          <li>Los resultados valen solo para este modelo ilustrativo. Una empresa real tendría que estimar sus propias funciones de ingreso y costo.</li>
        </ul>
        <p className="nota">La calculadora usa derivación simbólica de mathjs y aproximaciones numéricas para integrales, límites y raíces; esos resultados son aproximados y pueden mostrar pequeños errores de redondeo.</p>
      </div>
      <footer className="pie contenedor">
        <p>Proyecto educativo basado en <a href="https://github.com/PVirgil/Calculus_Studio">Calculus Studio</a> de PVirgil. La fábrica y todas sus cifras son ficticias.</p>
      </footer>
    </section>
  );
}
