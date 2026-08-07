import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import { useToast } from '../components/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { abasBiblioteca } from '../data/navigation.js';
import { addToShelf, createBook, getShelf } from '../services/social.js';
import { Search as SearchIcon, MenuBook as BookIcon } from '@mui/icons-material';

export default function Biblioteca({ aoAbrirLivro }) {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [livros, setLivros] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [busca, setBusca] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', cover_url: '' });
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(() => {
    setLoading(true);
    getShelf(user.id).then(setLivros).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [user.id]);
  useEffect(carregar, [carregar]);

  async function adicionar(evento) {
    evento.preventDefault();
    try {
      const book = await createBook(user.id, { title: form.title.trim(), author: form.author.trim(), cover_url: form.cover_url.trim() || null });
      await addToShelf(user.id, book.id);
      setForm({ title: '', author: '', cover_url: '' });
      setFormAberto(false);
      carregar();
      mostrarToast('Livro adicionado à sua estante.');
    } catch (error) { mostrarToast(error.message); }
  }

  const filtrados = livros.filter((livro) => (categoriaAtiva === 'todos' || livro.status === categoriaAtiva) && `${livro.title} ${livro.author}`.toLowerCase().includes(busca.toLowerCase().trim()));

  return (
    <section className="pagina ativa" id="pagina-biblioteca">
      <div className="pagina-cabecalho">
        <div><h1 className="pagina-cabecalho__titulo">Minha estante</h1><p className="pagina-cabecalho__sub">{livros.length} {livros.length === 1 ? 'livro organizado' : 'livros organizados'} por você.</p></div>
        <button className="btn-primario" onClick={() => setFormAberto(!formAberto)}>{formAberto ? 'Cancelar' : '+ Adicionar livro'}</button>
      </div>

      {formAberto && <form className="widget livro-form" onSubmit={adicionar}>
        <label>Título<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label>Autor<input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></label>
        <label>URL da capa <span>(opcional)</span><input type="url" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} /></label>
        <button className="btn-primario">Adicionar à estante</button>
      </form>}

      <div className="header__busca busca-pagina"><span className="header__busca-icone"><SearchIcon fontSize="small" /></span><input type="search" placeholder="Buscar na estante..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
      <div className="biblioteca__abas">{abasBiblioteca.map((aba) => <button key={aba.categoria} className={`filtro-pill biblioteca__aba${categoriaAtiva === aba.categoria ? ' ativa' : ''}`} onClick={() => setCategoriaAtiva(aba.categoria)}>{aba.label}</button>)}</div>

      {loading ? <div className="skeleton-card" /> : filtrados.length ? <div className="biblioteca__grid">{filtrados.map((livro) => (
        <button className="livro-card" key={livro.id} onClick={() => aoAbrirLivro(livro)}>
          <div className="livro-card__capa">{livro.cover_url ? <img src={livro.cover_url} alt={`Capa de ${livro.title}`} /> : <BookIcon />}{livro.progress > 0 && <div className="livro-card__progresso"><span style={{ width: `${livro.progress}%` }} /></div>}</div>
          <div className="livro-card__corpo"><div className="livro-card__titulo">{livro.title}</div><div className="livro-card__autor">{livro.author}</div>{livro.rating && <div className="livro-card__nota">★ {livro.rating}</div>}</div>
        </button>
      ))}</div> : <EmptyState icon={<BookIcon />} title={busca ? 'Nenhum livro encontrado' : 'Sua estante está vazia'} description={busca ? 'Tente buscar por outro título ou autor.' : 'Adicione seu primeiro livro para começar a organizar suas leituras.'} />}
    </section>
  );
}
