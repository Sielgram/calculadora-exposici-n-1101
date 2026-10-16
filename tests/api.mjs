// Prueba la API /api/calc contra valores matemáticos conocidos. Requiere el servidor en marcha:
//   npm run build && npm start     (en otra terminal)   →   npm run test:api
// Variable BASE_URL opcional (por defecto http://localhost:3000).
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { evaluate } = require("mathjs");
const m = JSON.parse(readFileSync(new URL("../lib/modelo.json", import.meta.url), "utf8"));
const base = process.env.BASE_URL || "http://localhost:3000";
const llamar = async (q) => { const r = await fetch(base + "/api/calc", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q }) }); let d = {}; try { d = await r.json(); } catch {} return { status: r.status, d }; };
const cerca = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const igualFn = (expr, ref, xs = [-1.7, -0.4, 0.3, 0.9, 1.3, 2.2, 100, 600]) => xs.every((x) => cerca(Number(evaluate(expr, { x })), ref(x), 1e-9));
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const casos = [
  ["diff sin(x)*x^2", (r) => igualFn(r, (x) => 2 * x * Math.sin(x) + x * x * Math.cos(x))],
  ["diff2 exp(x)*cos(x)", (r) => igualFn(r, (x) => -2 * Math.exp(x) * Math.sin(x), [-1, 0.5, 1])],
  ["integrate x^2 from 0 to 3", (r) => cerca(+r, 9)],
  ["limit sin(x)/x at 0", (r) => cerca(+r, 1)],
  ["root x^3-x-2 guess 1", (r) => cerca(+r, 1.5213797068045676, 1e-9)],
  ["taylor exp(x) at 0 order 6", (r) => igualFn(r, (x) => [0, 1, 2, 3, 4, 5, 6].reduce((s, k) => s + x ** k / fact(k), 0), [-1, 0.4, 1])],
  ["diff x^5-3*x^2+7", (r) => igualFn(r, (x) => 5 * x ** 4 - 6 * x)],
  ["diff sin(x^2)", (r) => igualFn(r, (x) => 2 * x * Math.cos(x * x))],
  ["integrate x^3+2*x from 0 to 2", (r) => cerca(+r, 8)],
  ["limit (x^2-1)/(x-1) at 1", (r) => cerca(+r, 2)],
  ["root cos(x)-x guess 1", (r) => cerca(+r, 0.7390851332151607, 1e-9)],
  ["taylor sin(x) at 0 order 7", (r) => igualFn(r, (x) => x - x ** 3 / 6 + x ** 5 / 120 - x ** 7 / 5040, [-1, 0.4, 1])],
  ["eval sin(pi/4)+sqrt(2)", (r) => cerca(+r, Math.SQRT1_2 + Math.SQRT2, 1e-12)],
  // ejemplos del modelo económico
  [`diff ${m.R}`, (r) => igualFn(r, (x) => 50 - 0.05 * x)],
  [`diff ${m.C}`, (r) => igualFn(r, (x) => 8 + 0.02 * x)],
  [`diff ${m.G}`, (r) => igualFn(r, (x) => 42 - 0.07 * x)],
  [`diff2 ${m.G}`, (r) => igualFn(r, () => -0.07)],
  [`root ${m.Gp} guess 100`, (r) => cerca(+r, 600)],
  [`integrate ${m.Gp} from 0 to 600`, (r) => cerca(+r, 12600)],
  [`integrate ${m.Rp} from 0 to 600`, (r) => cerca(+r, 21000)],
  [`integrate ${m.Cp} from 0 to 600`, (r) => cerca(+r, 8400)],
  [`eval -0.035*600^2 + 42*600 - 500`, (r) => cerca(+r, 12100)],
];
let ok = 0;
for (const [q, valida] of casos) {
  const { status, d } = await llamar(q);
  const bien = status === 200 && !d.error && valida(d.result);
  if (bien) ok++;
  console.log(bien ? "OK   " : "FALLA", q.padEnd(44), "=>", String(d.result ?? d.error).slice(0, 60));
}
for (const q of ["integrate x^2", "limit x", "root x", "taylor x"]) {
  const { status, d } = await llamar(q);
  const bien = status === 400 && !!d.error; if (bien) ok++;
  console.log(bien ? "OK   " : "FALLA", q.padEnd(44), "=> error esperado:", d.error);
}
const total = casos.length + 4;
console.log(`\n${ok}/${total} pruebas pasan`);
process.exit(ok === total ? 0 : 1);
