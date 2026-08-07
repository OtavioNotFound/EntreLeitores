import { useEffect, useState } from 'react';

const formatarNumero = (numero) => new Intl.NumberFormat('pt-BR').format(numero);

/** Anima um contador numérico de 0 até o valor alvo — equivalente a animarContador() do utils.js */
export default function AnimatedNumber({ valor, duracaoMs = 900 }) {
  const [exibido, setExibido] = useState(0);
  useEffect(() => {
    setExibido(0);

    const inicio = performance.now();
    let quadro;

    function passo(agora) {
      const progresso = Math.min((agora - inicio) / duracaoMs, 1);
      setExibido(Math.floor(progresso * valor));
      if (progresso < 1) quadro = requestAnimationFrame(passo);
    }
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [valor, duracaoMs]);

  return <>{formatarNumero(exibido)}</>;
}
