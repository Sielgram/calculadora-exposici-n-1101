import { ProveedorPedido } from "../components/PedidoContext";
import Portada from "../components/Portada";
import { SeccionIntro, SeccionModelo, SeccionCaso, SeccionCalculadora, SeccionConclusiones } from "../components/Secciones";

// Página educativa. La calculadora original vive en components/Calculadora.tsx.
export default function Home() {
  return (
    <ProveedorPedido>
      <Portada>
        <SeccionIntro />
        <SeccionModelo />
        <SeccionCaso />
        <SeccionCalculadora />
        <SeccionConclusiones />
      </Portada>
    </ProveedorPedido>
  );
}
