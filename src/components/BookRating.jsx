import { useState } from 'react';
import { MenuBook as BookIcon } from '@mui/icons-material';

export default function BookRating({ value = 0, onChange, label = 'Avaliação', size = 'medium' }) {
  const nota = Number(value) || 0;
  const [paginaVirando, setPaginaVirando] = useState(null);

  function avaliar(valor, item) {
    setPaginaVirando(null);
    requestAnimationFrame(() => {
      setPaginaVirando(item);
      onChange(valor === nota ? '' : valor);
    });
  }

  return <div className={`avaliacao-livrinhos avaliacao-livrinhos--${size}`} role={onChange ? 'radiogroup' : 'img'} aria-label={`${label}: ${nota || 'sem nota'} de 5`}>
    {[1, 2, 3, 4, 5].map((item) => {
      const preenchimento = Math.max(0, Math.min(1, nota - (item - 1))) * 100;
      return <span className={`avaliacao-livrinhos__item${paginaVirando === item ? ' livrinho--virando' : ''}`} key={item}>
        <i className="livrinho__pagina" aria-hidden="true" />
        <BookIcon className="avaliacao-livrinhos__base" />
        <span className="avaliacao-livrinhos__preenchimento" style={{width:`${preenchimento}%`}}><BookIcon /></span>
        {onChange&&<><button type="button" className="avaliacao-livrinhos__metade esquerda" role="radio" aria-checked={nota===item-.5} aria-label={`${item-.5} de 5`} onClick={()=>avaliar(item-.5,item)}/><button type="button" className="avaliacao-livrinhos__metade direita" role="radio" aria-checked={nota===item} aria-label={`${item} de 5`} onClick={()=>avaliar(item,item)}/></>}
      </span>;
    })}
    {onChange&&<output className="avaliacao-livrinhos__nota">{nota?`${nota.toLocaleString('pt-BR')}/5`:'Sem nota'}</output>}
  </div>;
}
