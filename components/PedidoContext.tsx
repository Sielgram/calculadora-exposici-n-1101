"use client";
// Permite que los botones «Comprobar en la calculadora» (en cualquier sección) carguen una
// operación o una gráfica en la calculadora original, sin duplicar su lógica.
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import type { Serie } from "../lib/graficar";

export type Pedido = { id: number; cmd?: string; graf?: { series: Serie[]; x0: number; x1: number } };
type Ctx = { pedido: Pedido | null; pedir: (p: Omit<Pedido, "id">) => void };
const Contexto = createContext<Ctx>({ pedido: null, pedir: () => {} });

export function ProveedorPedido({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const n = useRef(0);
  const pedir = (p: Omit<Pedido, "id">) => {
    n.current += 1;
    setPedido({ ...p, id: n.current });
    const destino = document.getElementById("calc-trabajo");
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    destino?.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "start" });
  };
  return <Contexto.Provider value={{ pedido, pedir }}>{children}</Contexto.Provider>;
}

export const usePedido = () => useContext(Contexto);

export function BotonCalc({ pedido, children, className = "btn-calc" }: { pedido: Omit<Pedido, "id">; children: ReactNode; className?: string }) {
  const { pedir } = usePedido();
  return <button type="button" className={className} onClick={() => pedir(pedido)}>{children}</button>;
}
