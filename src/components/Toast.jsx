import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

/** Hook público — substitui as chamadas a Toast.mostrar(...) do JS original */
export function useToast() {
  return useContext(ToastContext);
}

let contadorId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const mostrar = useCallback((mensagem, duracaoMs = 2600) => {
    const id = ++contadorId;
    setToasts((atual) => [...atual, { id, mensagem }]);
    timers.current[id] = setTimeout(() => {
      setToasts((atual) => atual.filter((t) => t.id !== id));
      delete timers.current[id];
    }, duracaoMs);
  }, []);

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>{t.mensagem}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
