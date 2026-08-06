import { useState } from 'react';
import { livrosExplorar } from '../data/mockData.js';
import { Search as SearchIcon } from '@mui/icons-material';

const abas = ['Tendências', 'Lançamentos', 'Autores', 'Categorias'];

export default function Explorar({ aoAbrirLivro }) {
  const [abaAtiva, setAbaAtiva] = useState(abas[0]);
  const [busca, setBusca] = useState('');

  return (
    <section className="pagina ativa" id="pagina-explorar">
      <div className="pagina-cabecalho">
        <div><h1 className="pagina-cabecalho__titulo">Explorar</h1><p className="pagina-cabecalho__sub">Descubra autores, lançamentos e tendências.</p></div>
      </div>
      <div className="header__busca" style={{ maxWidth: '100%', marginBottom: 'var(--space-5)' }}>
        <span className="header__busca-icone"><SearchIcon fontSize="small" /></span>
        <input type="search" placeholder="Buscar por gênero, autor ou título..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      <div className="biblioteca__abas">
        {abas.map((a) => (
          <button key={a} className={`filtro-pill${abaAtiva === a ? ' ativo' : ''}`} onClick={() => setAbaAtiva(a)}>{a}</button>
        ))}
      </div>
      <div className="biblioteca__grid">
        {livrosExplorar
          .filter((l) => l.titulo.toLowerCase().includes(busca.toLowerCase()))
          .map((livro) => (
            <div className="livro-card" key={livro.id} onClick={() => aoAbrirLivro(livro)}>
              <div className="livro-card__capa">{livro.capaIcon ? (() => { const C = livro.capaIcon; return <C />; })() : livro.capa}</div>
              <div className="livro-card__corpo">
                <div className="livro-card__titulo">{livro.titulo}</div>
                <div className="livro-card__autor">{livro.autor}</div>
                <div className="livro-card__nota">{livro.nota}</div>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
