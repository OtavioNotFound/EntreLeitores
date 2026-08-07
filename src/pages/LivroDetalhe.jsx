import { useEffect, useState } from 'react';
import Post from '../components/Post.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { addToShelf, getPostsByBook } from '../services/social.js';
import { useToast } from '../components/Toast.jsx';
import { MenuBook as BookIcon, Forum as ForumIcon } from '@mui/icons-material';

export default function LivroDetalhe({ livro }) {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const title = livro?.title || livro?.titulo;
  const author = livro?.author || livro?.autor;
  const cover = livro?.cover_url || livro?.capa;

  useEffect(() => {
    if (!livro?.id) { setLoading(false); return; }
    getPostsByBook(livro.id, user.id).then(setPosts).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [livro?.id, user.id]);

  async function adicionar(status) {
    try { await addToShelf(user.id, livro.id, status); mostrarToast(status === 'lendo' ? 'Leitura iniciada.' : 'Livro adicionado à estante.'); }
    catch (error) { mostrarToast(error.message); }
  }

  if (!livro?.id) return <section className="pagina ativa"><EmptyState icon={<BookIcon />} title="Selecione um livro" description="Abra um livro pela sua estante ou pela página Explorar." /></section>;

  return (
    <section className="pagina ativa" id="pagina-livro">
      <div className="livro-detalhe">
        <div className="livro-detalhe__capa">{cover ? <img src={cover} alt={`Capa de ${title}`} /> : <BookIcon fontSize="large" />}</div>
        <div>
          <h1 className="livro-detalhe__titulo">{title}</h1>
          <div className="livro-detalhe__autor">{author}</div>
          {livro.description && <p className="livro-detalhe__sinopse">{livro.description}</p>}
          <div className="livro-detalhe__meta">
            {livro.page_count && <div className="livro-detalhe__meta-item"><div className="livro-detalhe__meta-valor">{livro.page_count}</div><div className="livro-detalhe__meta-label">Páginas</div></div>}
            {livro.genre && <div className="livro-detalhe__meta-item"><div className="livro-detalhe__meta-valor">{livro.genre}</div><div className="livro-detalhe__meta-label">Gênero</div></div>}
            {livro.publisher && <div className="livro-detalhe__meta-item"><div className="livro-detalhe__meta-valor">{livro.publisher}</div><div className="livro-detalhe__meta-label">Editora</div></div>}
          </div>
          <div className="livro-detalhe__acoes"><button className="btn-primario" onClick={() => adicionar('quero-ler')}>+ Quero ler</button><button className="btn-secundario" onClick={() => adicionar('lendo')}>Começar leitura</button></div>
        </div>
      </div>
      <div className="titulo-secao" style={{ marginTop: 'var(--space-6)' }}>Conversas sobre este livro</div>
      {loading ? <div className="skeleton-card" /> : posts.length ? <div className="feed__lista">{posts.map((post) => <Post key={post.id} post={post} />)}</div> : <EmptyState icon={<ForumIcon />} title="Ainda não há conversas" description="Associe este livro a uma publicação para iniciar a discussão." />}
    </section>
  );
}
