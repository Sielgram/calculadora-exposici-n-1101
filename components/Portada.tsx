// Barra de navegación y portada. Componente de servidor: la curva se calcula con mathjs
// a partir de la misma expresión de G(x) que usa la calculadora.
import type { ReactNode } from "react";
import NavSecciones from "./NavSecciones";
import { curvaG, fmt, resultados } from "../lib/calculos";
import modelo from "../lib/modelo.json";

function CurvaGanancia() {
  const W = 560, H = 340, m = { l: 20, r: 20, t: 30, b: 62 };
  const x1 = modelo.xMax, ymin = -1200, ymax = 13800;
  const sx = (x: number) => m.l + (x / x1) * (W - m.l - m.r);
  const sy = (y: number) => H - m.b - ((y - ymin) / (ymax - ymin)) * (H - m.t - m.b);
  const puntos = curvaG(0, x1);
  const d = puntos.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ");
  const r = resultados();
  const px = sx(r.x), py = sy(r.G);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="curva-t curva-d" className="curva">
      <title id="curva-t">Curva de ganancia G(x)</title>
      <desc id="curva-d">La ganancia sube hasta un máximo de {fmt(r.G)} unidades monetarias con {fmt(r.x)} unidades producidas y luego baja.</desc>
      <line x1={m.l} x2={W - m.r} y1={sy(0)} y2={sy(0)} className="svg-cero" />
      <text x={sx(850)} y={sy(0) - 8} textAnchor="middle" className="svg-txt">G = 0</text>
      <line x1={px} x2={px} y1={py} y2={H - m.b + 6} className="svg-guia" />
      <path d={d} className="svg-curva" fill="none" />
      <circle cx={px} cy={py} r="7" className="svg-punto" />
      <text x={px + 16} y={py + 4} className="svg-dato">Máximo: G = {fmt(r.G)}</text>
      {[0, 300, 600, 900, 1200].map((v) => (
        <text key={v} x={sx(v)} y={H - m.b + 24} textAnchor={v === 0 ? "start" : v === x1 ? "end" : "middle"} className={v === r.x ? "svg-dato" : "svg-txt"}>{fmt(v)}</text>
      ))}
      <text x={W / 2} y={H - 8} textAnchor="middle" className="svg-txt">unidades producidas (x)</text>
    </svg>
  );
}

// Los hijos (las demás secciones) van dentro del mismo <main> que la portada, para que todo el
// contenido quede dentro de un landmark.
export default function Portada({ children }: { children?: ReactNode }) {
  return (
    <>
      <a className="saltar" href="#modelo">Saltar al modelo</a>
      <header className="topbar">
        <div className="contenedor topbar-in">
          <a href="#introduccion" className="marca">Cálculo aplicado a la economía</a>
          <NavSecciones />
        </div>
      </header>
      <main id="contenido">
      <section id="introduccion" className="portada">
        <div className="contenedor portada-in">
          <div className="portada-texto">
            <h1>¿Cuántos componentes conviene producir?</h1>
            <p className="lead">Una fábrica ficticia de componentes electrónicos usa la derivada para encontrar la producción que maximiza su ganancia, y la integral para medir lo que se acumula mientras produce.</p>
            <div className="acciones">
              <a className="btn btn-primario" href="#caso">Ver el caso práctico</a>
              <a className="btn btn-secundario" href="#calculadora">Abrir la calculadora</a>
            </div>
          </div>
          <figure className="portada-fig">
            <div className="curva-caja"><CurvaGanancia /></div>
            <figcaption>Ganancia G(x) del modelo ilustrativo: sube hasta las {fmt(resultados().x)} unidades y después baja.</figcaption>
          </figure>
        </div>
      </section>
      {children}
      </main>
    </>
  );
}
