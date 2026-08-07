import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { addToShelf, getBooks } from '../services/social.js';
import { useToast } from '../components/Toast.jsx';
import { Search as SearchIcon, MenuBook as BookIcon, Add as AddIcon } from '@mui/icons-material';

export default function Explorar({ aoAbrirLivro, buscaInicial = '' }) {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [livros, setLivros] = useState([]);
  const [busca, setBusca] = useState(buscaInicial);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setBusca(buscaInicial); }, [buscaInicial]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      getBooks(busca).then(setLivros).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [busca]);

  async function salvar(evento, bookId) {
    evento.stopPropagation();
    try { await addToShelf(user.id, bookId); mostrarToast('Livro adicionado à estante.'); }
    catch (error) { mostrarToast(error.message); }
  }

  return (
    <section className="pagina ativa" id="pagina-explorar">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Explorar livros</h1><p className="pagina-cabecalho__sub">Descubra os livros cadastrados pela comunidade.</p></div></div>
      <div className="header__busca busca-pagina busca-pagina--larga"><span className="header__busca-icone"><SearchIcon fontSize="small" /></span><input type="search" placeholder="Buscar por título ou autor..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
      {loading ? <div className="skeleton-card" /> : livros.length ? <div className="biblioteca__grid">{livros.map((livro) => (
        <article className="livro-card" key={livro.id} onClick={() => aoAbrirLivro(livro)}>
          <div className="livro-card__capa">{livro.cover_url ? <img src={livro.cover_url} alt={`Capa de ${livro.title}`} /> : <BookIcon />}</div>
          <div className="livro-card__corpo"><div className="livro-card__titulo">{livro.title}</div><div className="livro-card__autor">{livro.author}</div><button className="livro-card__adicionar" onClick={(e) => salvar(e, livro.id)}><AddIcon fontSize="small" /> Estante</button></div>
        </article>
      ))}</div> : <EmptyState icon={<SearchIcon />} title={busca ? 'Nenhum resultado' : 'Nenhum livro cadastrado'} description={busca ? 'Tente outro título ou autor.' : 'Livros adicionados pelos leitores aparecerão aqui.'} />}
    </section>
  );
}
