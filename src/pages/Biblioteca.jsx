import { useState } from 'react';
import { biblioteca, abasBiblioteca } from '../data/mockData.js';
import { useToast } from '../components/Toast.jsx';

export default function Biblioteca({ aoAbrirLivro }) {
  const mostrarToast = useToast();
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [busca, setBusca] = useState('');

  const livrosFiltrados = biblioteca.filter((livro) => {
    const combinaCategoria = categoriaAtiva === 'todos' || livro.status === categoriaAtiva;
    const combinaBusca = livro.titulo.toLowerCase().includes(busca.toLowerCase().trim());
    return combinaCategoria && combinaBusca;
  });

  return (
    <section className="pagina ativa" id="pagina-biblioteca">
      <div className="pagina-cabecalho">
        <div><h1 className="pagina-cabecalho__titulo">Minha Biblioteca</h1><p className="pagina-cabecalho__sub">32 livros organizados nas suas estantes.</p></div>
        <button className="btn-primario" onClick={() => mostrarToast('Livro adicionado à sua biblioteca!')}>+ Adicionar livro</button>
      </div>

      <div className="header__busca" style={{ maxWidth: 320, marginBottom: 'var(--space-4)' }}>
        <span className="header__busca-icone">🔎</span>
        <input type="search" placeholder="Buscar na biblioteca..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <div className="biblioteca__abas">
        {abasBiblioteca.map((aba) => (
          <button
            key={aba.categoria}
            className={`filtro-pill biblioteca__aba${categoriaAtiva === aba.categoria ? ' ativa' : ''}`}
            onClick={() => setCategoriaAtiva(aba.categoria)}
          >
            {aba.label}
          </button>
        ))}
      </div>

      <div className="biblioteca__grid">
        {livrosFiltrados.map((livro) => (
          <div className="livro-card" key={livro.id} onClick={() => aoAbrirLivro(livro)}>
            <div className="livro-card__capa">
              {livro.capa}
              {livro.progresso != null && (
                <div className="livro-card__progresso"><span style={{ width: `${livro.progresso}%` }} /></div>
              )}
            </div>
            <div className="livro-card__corpo">
              <div className="livro-card__titulo">{livro.titulo}</div>
              <div className="livro-card__autor">{livro.autor}</div>
              {livro.nota && <div className="livro-card__nota">{livro.nota}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
