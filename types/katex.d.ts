// katex no incluye tipos; declaración mínima de lo que usa components/Formula.tsx.
declare module "katex" {
  interface Opciones { displayMode?: boolean; throwOnError?: boolean; output?: "html" | "mathml" | "htmlAndMathml"; [k: string]: unknown }
  const katex: { renderToString(tex: string, opciones?: Opciones): string };
  export default katex;
}
