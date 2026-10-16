// Fórmulas con KaTeX renderizadas en el servidor: no añaden JavaScript al navegador.
// Solo se pasan cadenas TeX fijas escritas en el código (nunca entrada del usuario).
import katex from "katex";

export default function Formula({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = katex.renderToString(tex, { displayMode: block, throwOnError: false, output: "htmlAndMathml" });
  return block
    ? <div className="formula" dangerouslySetInnerHTML={{ __html: html }} />
    : <span className="formula-inline" dangerouslySetInnerHTML={{ __html: html }} />;
}
