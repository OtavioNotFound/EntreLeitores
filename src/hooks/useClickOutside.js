import { useEffect } from 'react';

/**
 * Executa `aoClicarFora` quando o usuário clica fora de qualquer elemento referenciado em `refs`.
 * Substitui a função fecharAoClicarFora do utils.js original.
 */
export function useClickOutside(refs, aoClicarFora, ativo = true) {
  useEffect(() => {
    if (!ativo) return;

    function handler(evento) {
      const listaRefs = Array.isArray(refs) ? refs : [refs];
      const dentro = listaRefs.some((ref) => ref.current && ref.current.contains(evento.target));
      if (!dentro) aoClicarFora();
    }

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [refs, aoClicarFora, ativo]);
}
