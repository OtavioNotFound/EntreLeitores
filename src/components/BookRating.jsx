import { MenuBook as BookIcon } from '@mui/icons-material';
import { useState } from 'react';

export default function BookRating({ value = 0, onChange, label = 'Avaliação', size = 'medium' }) {
  const nota = Number(value) || 0;
  const [paginaVirando, setPaginaVirando] = useState(null);

  function avaliar(item) {
    setPaginaVirando(null);
    requestAnimationFrame(() => {
      setPaginaVirando(item);
      onChange(item === nota ? '' : item);
    });
  }

  return <div className={`avaliacao-livrinhos avaliacao-livrinhos--${size}`} role={onChange ? 'radiogroup' : 'img'} aria-label={`${label}: ${nota || 'sem nota'} de 5`}>
    {[1, 2, 3, 4, 5].map((item) => {
      const className = `livrinho${item <= nota ? ' ativo' : ''}${paginaVirando === item ? ' livrinho--virando' : ''}`;
      const conteudo = <><i className="livrinho__pagina" aria-hidden="true" /><BookIcon /></>;
      return onChange
        ? <button type="button" key={item} className={className} role="radio" aria-checked={item === nota} aria-label={`${item} de 5`} onClick={() => avaliar(item)}>{conteudo}</button>
        : <span key={item} className={className}>{conteudo}</span>;
    })}
  </div>;
}
  
