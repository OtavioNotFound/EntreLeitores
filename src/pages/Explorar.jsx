import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { addToShelf, getBooks, getLocalClubs, recommendByIntent } from '../services/social.js';
import { useToast } from '../components/Toast.jsx';
import { Search as SearchIcon, MenuBook as BookIcon, Add as AddIcon } from '@mui/icons-material';

export default function Explorar({ aoAbrirLivro, buscaInicial = '' }) {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [livros, setLivros] = useState([]);
  const [busca, setBusca] = useState(buscaInicial);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [intencao, setIntencao] = useState('descobrir');
  const [recomendados, setRecomendados] = useState([]);
  const [cidade, setCidade] = useState('');
  const [clubesLocais, setClubesLocais] = useState([]);

  useEffect(() => { setBusca(buscaInicial); }, [buscaInicial]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      getBooks(busca, pagina).then((data) => { setLivros((atuais) => pagina ? [...atuais, ...data] : data); setTemMais(data.length === 24); }).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [busca, pagina]);

  async function salvar(evento, bookId) {
    evento.stopPropagation();
    try { await addToShelf(user.id, bookId); mostrarToast('Livro adicionado à estante.'); }
    catch (error) { mostrarToast(error.message); }
  }

  async function descobrirPorIntencao(novaIntencao) { setIntencao(novaIntencao); try { setRecomendados(await recommendByIntent(novaIntencao)); } catch (error) { mostrarToast(error.message); } }
  async function buscarLocal(evento) { evento.preventDefault(); try { setClubesLocais(await getLocalClubs(cidade)); } catch (error) { mostrarToast(error.message); } }

  return (
    <section className="pagina ativa" id="pagina-explorar">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Explorar livros</h1><p className="pagina-cabecalho__sub">Descubra os livros cadastrados pela comunidade.</p></div></div>
      <section className="descoberta-intencao widget"><div><h2>O que você precisa desta leitura?</h2><p>Escolha pela intenção do momento, não apenas pelo seu histórico.</p></div><div className="descoberta-intencao__opcoes">{{relaxar:'Relaxar',estudar:'Aprender',emocionar:'Me emocionar',debater:'Debater',rapido:'Ler algo curto',descobrir:'Me surpreender'} && Object.entries({relaxar:'Relaxar',estudar:'Aprender',emocionar:'Me emocionar',debater:'Debater',rapido:'Leitura curta',descobrir:'Me surpreender'}).map(([id,label]) => <button key={id} className={`filtro-pill${intencao===id?' ativo':''}`} onClick={() => descobrirPorIntencao(id)}>{label}</button>)}</div>{recomendados.length > 0 && <div className="recomendacoes-rapidas">{recomendados.slice(0,4).map((book) => <button key={book.id} onClick={() => aoAbrirLivro(book)}><strong>{book.title}</strong><span>{book.author}</span></button>)}</div>}</section>
      <form className="descoberta-local widget" onSubmit={buscarLocal}><div><h2>Leitura perto de você</h2><p>Encontre clubes, bibliotecas e encontros da sua cidade.</p></div><input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Digite sua cidade" aria-label="Cidade para procurar clubes"/><button className="btn-secundario">Buscar clubes</button>{clubesLocais.length > 0 && <div className="clubes-locais">{clubesLocais.map((club) => <span key={club.id}><strong>{club.name}</strong><small>{club.city}{club.meeting_place ? ` · ${club.meeting_place}` : ''}</small></span>)}</div>}</form>
      <div className="header__busca busca-pagina busca-pagina--larga"><span className="header__busca-icone"><SearchIcon fontSize="small" /></span><input aria-label="Buscar por título ou autor" type="search" placeholder="Buscar por título ou autor..." value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(0); }} /></div>
      {loading ? <div className="skeleton-card" /> : livros.length ? <div className="biblioteca__grid">{livros.map((livro) => (
        <article className="livro-card" key={livro.id} role="button" tabIndex="0" onClick={() => aoAbrirLivro(livro)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') aoAbrirLivro(livro); }}>
          <div className="livro-card__capa">{livro.cover_url ? <img src={livro.cover_url} alt={`Capa de ${livro.title}`} /> : <BookIcon />}</div>
          <div className="livro-card__corpo"><div className="livro-card__titulo">{livro.title}</div><div className="livro-card__autor">{livro.author}</div><button className="livro-card__adicionar" onClick={(e) => salvar(e, livro.id)}><AddIcon fontSize="small" /> Estante</button></div>
        </article>
      ))}</div> : <EmptyState icon={<SearchIcon />} title={busca ? 'Nenhum resultado' : 'Nenhum livro cadastrado'} description={busca ? 'Tente outro título ou autor.' : 'Livros adicionados pelos leitores aparecerão aqui.'} />}{temMais && livros.length > 0 && <button className="btn-secundario carregar-mais" disabled={loading} onClick={() => setPagina((p) => p + 1)}>{loading ? 'Carregando...' : 'Carregar mais'}</button>}
    </section>
  );
}
