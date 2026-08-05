import { useState, useEffect } from 'react';

const PREFIXO = 'entreLeitores:';

/** Lê um valor do localStorage (equivalente a Storage.obter) */
export function lerStorage(chave, valorPadrao = null) {
  try {
    const bruto = localStorage.getItem(PREFIXO + chave);
    return bruto ? JSON.parse(bruto) : valorPadrao;
  } catch (erro) {
    console.warn('Não foi possível ler do localStorage:', erro);
    return valorPadrao;
  }
}

/** Escreve um valor no localStorage (equivalente a Storage.definir) */
export function definirStorage(chave, valor) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch (erro) {
    console.warn('Não foi possível salvar no localStorage:', erro);
  }
}

/**
 * Hook de estado que persiste automaticamente no localStorage,
 * substituindo o padrão Storage.obter/definir usado na versão original em JS puro.
 */
export function useLocalStorage(chave, valorPadrao) {
  const [valor, setValor] = useState(() => lerStorage(chave, valorPadrao));

  useEffect(() => {
    definirStorage(chave, valor);
  }, [chave, valor]);

  return [valor, setValor];
}

/** Hook para persistir um conjunto (Set) de ids — usado em curtidas e salvos */
export function useConjuntoStorage(chave) {
  const [lista, setLista] = useLocalStorage(chave, []);
  const conjunto = new Set(lista);

  function alternar(id) {
    const novo = new Set(lista);
    let adicionado;
    if (novo.has(id)) {
      novo.delete(id);
      adicionado = false;
    } else {
      novo.add(id);
      adicionado = true;
    }
    setLista(Array.from(novo));
    return adicionado;
  }

  function contem(id) {
    return conjunto.has(id);
  }

  return { alternar, contem };
}
