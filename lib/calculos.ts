// Cálculos del modelo para el contenido de la página. Solo se importa desde componentes de
// servidor (así mathjs no entra al JavaScript del navegador). Las cifras que se muestran se
// calculan con mathjs a partir de las MISMAS expresiones que usa la calculadora.
import { evaluate } from "mathjs";
import modelo from "./modelo.json";

export const f = (expr: string, x: number): number => Number(evaluate(expr, { x }));

/** Formato de cifras: punto decimal y espacio fino como separador de miles (12 100). */
export function fmt(n: number, dec = 0): string {
  const k = 10 ** dec;
  const r = Math.round(n * k) / k;
  if (r === 0) return "0";
  const [ent, frac] = Math.abs(r).toFixed(dec).split(".");
  const miles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (r < 0 ? "−" : "") + miles + (frac ? "." + frac : "");
}

export function resultados() {
  const x = modelo.xOptimo;
  return {
    x,
    R: f(modelo.R, x), C: f(modelo.C, x), G: f(modelo.G, x),
    Rp: f(modelo.Rp, x), Cp: f(modelo.Cp, x), Gp: f(modelo.Gp, x),
    R0: f(modelo.R, 0), C0: f(modelo.C, 0), G0: f(modelo.G, 0),
  };
}

/** Tabla de valores para varios niveles de producción. */
export function tabla(xs = [0, 300, 600, 900, 1200]) {
  return xs.map((x) => ({ x, R: f(modelo.R, x), C: f(modelo.C, x), G: f(modelo.G, x) }));
}

/** Puntos de G(x) para la curva de la portada. */
export function curvaG(x0: number, x1: number, n = 120) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / n;
    return { x, y: f(modelo.G, x) };
  });
}

/** Igual que fmt, pero con separadores válidos dentro de una fórmula TeX. */
export const fmtTex = (n: number, dec = 0) => fmt(n, dec).replace(/\u202f/g, "\\,").replace("\u2212", "-");
