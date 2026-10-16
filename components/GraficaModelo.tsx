"use client";
// Gráfica de R, C y G. Plotly (≈4 MB) se carga solo cuando la gráfica está por verse.
import { useEffect, useRef } from "react";
import { dibujar, COLOR, type Serie } from "../lib/graficar";
import modelo from "../lib/modelo.json";

const series: Serie[] = [
  { expr: modelo.R, nombre: "R(x) ingresos", color: COLOR.ingresos, dash: "solid" },
  { expr: modelo.C, nombre: "C(x) costos", color: COLOR.costos, dash: "dash" },
  { expr: modelo.G, nombre: "G(x) ganancia", color: COLOR.ganancia, dash: "solid" },
];

export default function GraficaModelo({ marcaTexto, descripcion }: { marcaTexto: string; descripcion: string }) {
  const caja = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) {
        io.disconnect();
        dibujar("grafica-modelo", series, 0, modelo.xMax, { ejeX: "x (unidades producidas y vendidas)", ejeY: "unidades monetarias", marca: { serie: 2, x: modelo.xOptimo, texto: marcaTexto } });
      }
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [marcaTexto]);
  return (
    <div ref={caja} className="grafica-caja">
      <div id="grafica-modelo" className="plot plot-lg" role="img" aria-label={descripcion} />
    </div>
  );
}
