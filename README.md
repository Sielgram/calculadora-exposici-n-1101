# Optimización económica con cálculo

Página educativa interactiva sobre **derivadas e integrales aplicadas a la economía**, pensada para una exposición académica. Estudia los ingresos, costos y ganancias de una **fábrica ficticia de componentes electrónicos** y encuentra la producción que maximiza la ganancia.

Todas las cifras son inventadas para ilustrar el método; no describen ninguna empresa real.

## Qué incluye

- **Introducción** con la gráfica de la ganancia y su máximo.
- **Modelo económico**: funciones de ingresos, costos y ganancia, sus derivadas (valores marginales), gráfica conjunta, tabla de valores y una explicación de la integral definida como cambio acumulado.
- **Caso práctico** resuelto en seis pasos, cada uno con un botón que lo comprueba en la calculadora.
- **Calculadora** (heredada de Calculus Studio): resolver comandos, graficar, referencia de fórmulas, práctica, cuaderno e historial.
- **Conclusiones** y sus limitaciones.

### El modelo

| Función | Expresión |
|---|---|
| Ingresos | R(x) = 50x − 0.025x² |
| Costos | C(x) = 500 + 8x + 0.01x² |
| Ganancia | G(x) = R(x) − C(x) = −0.035x² + 42x − 500 |

G′(x) = −0.07x + 42 = 0 → x = 600, y como G″(x) = −0.07 < 0 es un máximo: G(600) = 12 100, con R(600) = 21 000 y C(600) = 8 900. Las expresiones viven en un solo lugar, `lib/modelo.json`, y las cifras de la página se calculan a partir de ellas.

## Tecnologías

Next.js 15 (App Router), React 18, TypeScript, mathjs (motor de cálculo), Plotly.js (gráficas) y KaTeX (fórmulas, renderizadas en el servidor).

## Instalación y ejecución

Requisitos: Node.js 18.18 o superior (se recomienda una versión LTS: 20 o 22) y npm.

```bash
npm install
npm run dev        # desarrollo en http://localhost:3000
```

Versión de producción:

```bash
npm run build
npm start
```

## Pruebas

```bash
npm run test:modelo   # verifica con mathjs las cifras del modelo (no requiere servidor)
npm run test:api      # prueba la API /api/calc (requiere `npm start` en otra terminal)
```

`test:api` acepta `BASE_URL` si el servidor no está en `http://localhost:3000`.

## Publicar en GitHub y Vercel

```bash
git init
git add .
git commit -m "Página educativa de optimización económica"
git branch -M main
git remote add origin <URL-DEL-REPOSITORIO>
git push -u origin main
```

En [Vercel](https://vercel.com): *Add New → Project*, importa el repositorio y despliega. Se detecta como proyecto Next.js (ver `vercel.json`); no necesita variables de entorno. Antes de publicar, confirma que `npm run build` termina sin errores.

## Estructura

```text
app/
  api/calc/route.ts     API de cálculo (sin cambios respecto al proyecto original)
  page.tsx              composición de la página
  layout.tsx            idioma, metadatos y hojas de estilo
  globals.css           estilos originales de la calculadora
  educativo.css         estilos de la página educativa
components/
  Calculadora.tsx       calculadora original, ahora con rango de x y varias funciones
  Portada.tsx           barra de navegación y portada
  Secciones.tsx         introducción, modelo, caso práctico, calculadora y conclusiones
  GraficaModelo.tsx     gráfica de R, C y G
  PedidoContext.tsx     conecta los botones de las secciones con la calculadora
  Formula.tsx, NavSecciones.tsx
app/icon.svg            icono de la pestaña del navegador
lib/
  modelo.json           expresiones del modelo (fuente única)
  calculos.ts           cifras del contenido, calculadas con mathjs
  graficar.ts           dibujo de gráficas con Plotly
tests/                  pruebas del modelo y de la API
types/                  declaraciones de tipos para plotly.js-dist-min y katex
```

## Limitaciones matemáticas

- Las derivadas son simbólicas (mathjs), pero la expresión devuelta puede no verse simplificada (por ejemplo `x * -7 / 100 + 42` equivale a 42 − 0.07x).
- Las integrales definidas, los límites y las raíces son **aproximaciones numéricas** (regla de Simpson con 1000 subintervalos, estimación por acercamiento y método de Newton). Pueden mostrar redondeo de coma flotante, como `12099.999999999998` en lugar de 12 100.
- La calculadora **no** obtiene primitivas simbólicas ni sombrea el área bajo la curva.
- Los límites de integración solo aceptan números decimales (no `pi` ni fracciones), el solver de raíces no avisa si no converge y el cálculo de límites promedia ambos lados, lo que puede dar un valor engañoso cuando el límite no existe.
- La calculadora usa la variable `x`.

## Origen y licencia

Este proyecto parte de [Calculus Studio](https://github.com/PVirgil/Calculus_Studio) de PVirgil. El README original afirma que se distribuye bajo licencia MIT, pero el repositorio original **no incluye un archivo `LICENSE`**, y este repositorio tampoco define ninguna licencia. Antes de redistribuirlo o reutilizarlo fuera del ámbito académico conviene aclarar la licencia con el autor original.
