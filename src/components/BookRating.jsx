import { MenuBook as BookIcon } from '@mui/icons-material';

export default function BookRating({ value = 0, onChange, label = 'Avaliação', size = 'medium' }) {
  const nota = Number(value) || 0;
  return <div className={`avaliacao-livrinhos avaliacao-livrinhos--${size}`} role={onChange ? 'radiogroup' : 'img'} aria-label={`${label}: ${nota || 'sem nota'} de 5`}>
    {[1, 2, 3, 4, 5].map((item) => onChange ? <button type="button" key={item} className={item <= nota ? 'ativo' : ''} role="radio" aria-checked={item === nota} aria-label={`${item} de 5`} onClick={() => onChange(item === nota ? '' : item)}><BookIcon /></button> : <span key={item} className={item <= nota ? 'ativo' : ''}><BookIcon /></span>)}
  </div>;
}
