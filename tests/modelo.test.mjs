// Verifica con mathjs las cifras que la página muestra. Ejecutar: npm run test:modelo
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { evaluate, derivative } = require("mathjs");
const m = JSON.parse(readFileSync(new URL("../lib/modelo.json", import.meta.url), "utf8"));
const f = (e, x) => Number(evaluate(e, { x }));
const cerca = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);
const simpson = (e, a, b, n = 1000) => { const h = (b - a) / n; let s = f(e, a) + f(e, b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(e, a + i * h); return (s * h) / 3; };
const X = m.xOptimo;

test("G(x) = R(x) − C(x)", () => { for (let x = 0; x <= 1200; x += 25) cerca(f(m.G, x), f(m.R, x) - f(m.C, x)); });
test("las derivadas del modelo coinciden con la derivación simbólica de mathjs", () => {
  for (const [e, d] of [["R", "Rp"], ["C", "Cp"], ["G", "Gp"]])
    for (const x of [0, 100, 600, 1000]) cerca(f(derivative(m[e], "x").toString(), x), f(m[d], x));
});
test("G'(600) = 0 y G'' = −0.07 < 0 (máximo)", () => {
  cerca(f(m.Gp, X), 0);
  const g2 = derivative(derivative(m.G, "x"), "x").toString();
  cerca(f(g2, 0), -0.07); cerca(f(g2, 1000), -0.07);
});
test("x* = 42 / 0.07 = 600", () => cerca(42 / 0.07, 600));
test("en x = 600: R = 21 000, C = 8 900, G = 12 100", () => { cerca(f(m.R, X), 21000); cerca(f(m.C, X), 8900); cerca(f(m.G, X), 12100); });
test("en x = 600: R' = C' = 20", () => { cerca(f(m.Rp, X), 20); cerca(f(m.Cp, X), 20); });
test("600 es el máximo de G en [0, 1200] (barrido de 1 en 1)", () => {
  let mejor = 0; for (let x = 0; x <= 1200; x++) if (f(m.G, x) > f(m.G, mejor)) mejor = x;
  assert.equal(mejor, 600);
});
test("G(0) = −500 y valores simétricos G(300) = G(900) = 8 950", () => { cerca(f(m.G, 0), -500); cerca(f(m.G, 300), 8950); cerca(f(m.G, 900), 8950); });
test("integrales de 0 a 600 (Simpson, como la API) = diferencias del teorema fundamental", () => {
  cerca(simpson(m.Rp, 0, X), 21000, 1e-9); cerca(simpson(m.Cp, 0, X), 8400, 1e-9); cerca(simpson(m.Gp, 0, X), 12600, 1e-9);
  cerca(f(m.R, X) - f(m.R, 0), 21000); cerca(f(m.C, X) - f(m.C, 0), 8400); cerca(f(m.G, X) - f(m.G, 0), 12600);
});
