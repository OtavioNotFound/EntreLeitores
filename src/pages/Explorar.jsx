import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { addToShelf, getBooks, getLocalClubs, recommendByIntent } from '../services/social.js';
import { useToast } from '../components/Toast.jsx';
import { Search as SearchIcon, MenuBook as BookIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

const INTENCOES = {
  relaxar: 'Relaxar',
  estudar: 'Aprender',
  emocionar: 'Me emocionar',
  debater: 'Debater',
  rapido: 'Leitura curta',
  descobrir: 'Me surpreender',
};

export default function Explorar({ aoAbrirLivro, buscaGlobal = '', buscaGlobalAtiva = false, aoLimparBuscaGlobal }) {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [livros, setLivros] = useState([]);
  const [busca, setBusca] = useState('');
  const [resultadosGlobais, setResultadosGlobais] = useState([]);
  const [carregandoGlobal, setCarregandoGlobal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [intencao, setIntencao] = useState('descobrir');
  const [recomendados, setRecomendados] = useState([]);
  const [cidade, setCidade] = useState('');
  const [clubesLocais, setClubesLocais] = useState([]);

  useEffect(() => {
    if (buscaGlobalAtiva) {
      setLoading(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      getBooks(busca, pagina).then((data) => { setLivros((atuais) => pagina ? [...atuais, ...data] : data); setTemMais(data.length === 24); }).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [busca, pagina, buscaGlobalAtiva]);

  useEffect(() => {
    if (!buscaGlobalAtiva || !buscaGlobal.trim()) {
      setResultadosGlobais([]);
      setCarregandoGlobal(false);
      return undefined;
    }
    let vigente = true;
    setCarregandoGlobal(true);
    getBooks(buscaGlobal, 0).then((data) => {
      if (vigente) setResultadosGlobais(data);
    }).catch((error) => {
      if (vigente) mostrarToast(error.message);
    }).finally(() => {
      if (vigente) setCarregandoGlobal(false);
    });
    return () => { vigente = false; };
  }, [buscaGlobal, buscaGlobalAtiva, mostrarToast]);

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
      {!buscaGlobalAtiva && <>
        <section className="descoberta-intencao widget"><div><h2>O que você precisa desta leitura?</h2><p>Escolha pela intenção do momento, não apenas pelo seu histórico.</p></div><div className="descoberta-intencao__opcoes">{Object.entries(INTENCOES).map(([id, label]) => <button key={id} className={`filtro-pill${intencao === id ? ' ativo' : ''}`} onClick={() => descobrirPorIntencao(id)}>{label}</button>)}</div>{recomendados.length > 0 && <div className="recomendacoes-rapidas">{recomendados.slice(0,4).map((book) => <button key={book.id} onClick={() => aoAbrirLivro(book)}><strong>{book.title}</strong><span>{book.author}</span></button>)}</div>}</section>
        <form className="descoberta-local widget" onSubmit={buscarLocal}><div><h2>Leitura perto de você</h2><p>Encontre clubes, bibliotecas e encontros da sua cidade.</p></div><input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Digite sua cidade" aria-label="Cidade para procurar clubes"/><button className="btn-secundario">Buscar clubes</button>{clubesLocais.length > 0 && <div className="clubes-locais">{clubesLocais.map((club) => <span key={club.id}><strong>{club.name}</strong><small>{club.city}{club.meeting_place ? ` · ${club.meeting_place}` : ''}</small></span>)}</div>}</form>
      </>}
      {buscaGlobalAtiva && <section className="busca-global-resultados" aria-labelledby="busca-global-titulo">
        <header className="busca-global-resultados__cabecalho">
          <div><h2 id="busca-global-titulo">Resultados para “{buscaGlobal}”</h2><p>Pesquisa feita pela barra superior</p></div>
          <button type="button" className="btn-secundario" onClick={aoLimparBuscaGlobal}><CloseIcon fontSize="small" /> Limpar pesquisa</button>
        </header>
        {carregandoGlobal ? <div className="skeleton-card" /> : resultadosGlobais.length ? <div className="busca-global-resultados__lista">{resultadosGlobais.map((livro) => {
          const ano = livro.published_at ? new Date(`${livro.published_at}T00:00:00`).getFullYear() : null;
          return <button type="button" className="resultado-livro" key={livro.id} onClick={() => aoAbrirLivro(livro)}>
            <span className="resultado-livro__capa">{livro.cover_url ? <img src={livro.cover_url} alt={`Capa de ${livro.title}`} loading="lazy" /> : <BookIcon />}</span>
            <span className="resultado-livro__texto"><strong>{livro.title}</strong><span>{livro.author}</span><small>{[livro.genre, ano, livro.page_count && `${livro.page_count} páginas`].filter(Boolean).join(' · ')}</small></span>
            <span className="resultado-livro__abrir">Ver livro</span>
          </button>;
        })}</div> : <EmptyState icon={<SearchIcon />} title="Nenhum resultado" description="Tente outro título ou autor na busca global." />}
      </section>}
      {!buscaGlobalAtiva && <div className="header__busca busca-pagina busca-pagina--larga"><span className="header__busca-icone"><SearchIcon fontSize="small" /></span><input aria-label="Buscar livros nesta grade" type="search" placeholder="Buscar na grade por título ou autor..." value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(0); }} /></div>}
      {!buscaGlobalAtiva && (loading ? <div className="skeleton-card" /> : livros.length ? <div className="biblioteca__grid">{livros.map((livro) => (
        <article className="livro-card" key={livro.id} role="button" tabIndex="0" onClick={() => aoAbrirLivro(livro)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') aoAbrirLivro(livro); }}>
          <div className="livro-card__capa">{livro.cover_url ? <img src={livro.cover_url} alt={`Capa de ${livro.title}`} /> : <BookIcon />}</div>
          <div className="livro-card__corpo"><div className="livro-card__titulo">{livro.title}</div><div className="livro-card__autor">{livro.author}</div><button className="livro-card__adicionar" onClick={(e) => salvar(e, livro.id)}><AddIcon fontSize="small" /> Estante</button></div>
        </article>
      ))}</div> : <EmptyState icon={<SearchIcon />} title={busca ? 'Nenhum resultado' : 'Nenhum livro cadastrado'} description={busca ? 'Tente outro título ou autor.' : 'Livros adicionados pelos leitores aparecerão aqui.'} />)}{!buscaGlobalAtiva && temMais && livros.length > 0 && <button className="btn-secundario carregar-mais" disabled={loading} onClick={() => setPagina((p) => p + 1)}>{loading ? 'Carregando...' : 'Carregar mais'}</button>}
    </section>
  );
}
