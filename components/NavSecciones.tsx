"use client";
import { useEffect, useState } from "react";

const items: [string, string][] = [
  ["introduccion", "Introducción"], ["modelo", "Modelo económico"], ["caso", "Caso práctico"],
  ["calculadora", "Calculadora"], ["conclusiones", "Conclusiones"],
];

export default function NavSecciones() {
  const [activa, setActiva] = useState("introduccion");
  useEffect(() => {
    const els = items.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActiva(e.target.id)), { rootMargin: "-30% 0px -60% 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return (
    <nav aria-label="Secciones de la página" className="navsec">
      {items.map(([id, t]) => (
        <a key={id} href={`#${id}`} className={activa === id ? "on" : ""} aria-current={activa === id ? "true" : undefined}>{t}</a>
      ))}
    </nav>
  );
}
