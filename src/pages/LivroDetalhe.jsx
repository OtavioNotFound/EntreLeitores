import { useEffect, useState } from 'react';
import Post from '../components/Post.jsx';
import Compositor from '../components/Compositor.jsx';
import ReadingNotebook from '../components/ReadingNotebook.jsx';
import ReadingExperience from '../components/ReadingExperience.jsx';
import TrustedLending from '../components/TrustedLending.jsx';
import BookSafety from '../components/BookSafety.jsx';
import ReadingPause from '../components/ReadingPause.jsx';
import EmptyState from '../components/EmptyState.jsx';
import BookRating from '../components/BookRating.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { addToShelf, createPost, getBookReadingFiles, getEmotionMap, getPostsByBook, getReadingFileUrl, getSimilarBooks, removeFromShelf, saveEmotion, startReread, updateBookOrganization, updateReading } from '../services/social.js';
import { useToast } from '../components/Toast.jsx';
import { MenuBook as BookIcon, Forum as ForumIcon, OpenInNewOutlined as OpenIcon, AutoStoriesOutlined as ReaderIcon } from '@mui/icons-material';

export default function LivroDetalhe({ livro, aoAbrirLivro, aoAbrirPerfil, aoRemoverDaEstante }) {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoLeitura, setEditandoLeitura] = useState(false);
  const [leitura, setLeitura] = useState({ status: livro?.status || 'lendo', progress: livro?.progress || 0, rating: livro?.rating || '', format: livro?.format || '', source: livro?.source || '', tags: (livro?.tags || []).join(', ') });
  const [emocoes, setEmocoes] = useState([]);
  const [emocao, setEmocao] = useState('curioso');
  const [materiais, setMateriais] = useState([]);
  const [similares, setSimilares] = useState([]);
  const [readerPage, setReaderPage] = useState(1);
  const [notebookRevision, setNotebookRevision] = useState(0);
  const title = livro?.title || livro?.titulo;
  const author = livro?.author || livro?.autor;
  const cover = livro?.cover_url || livro?.capa;

  useEffect(() => {
    if (!livro?.id) { setLoading(false); return; }
    setLeitura({ status: livro.status || 'lendo', progress: livro.progress || 0, rating: livro.rating || '', format: livro.format || '', source: livro.source || '', tags: (livro.tags || []).join(', ') });
    setEditandoLeitura(false);
    Promise.all([getPostsByBook(livro.id, user.id), getEmotionMap(livro.id), getBookReadingFiles(livro.id), getSimilarBooks(livro)]).then(([bookPosts, emotionMap, readingFiles, relatedBooks]) => { setPosts(bookPosts); setEmocoes(emotionMap); setMateriais(readingFiles); setSimilares(relatedBooks); }).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [livro?.id, user.id]);

  async function adicionar(status) {
    try { await addToShelf(user.id, livro.id, status); mostrarToast(status === 'lendo' ? 'Leitura iniciada.' : 'Livro adicionado à estante.'); }
    catch (error) { mostrarToast(error.message); }
  }

  async function salvarLeitura(evento) {
    evento.preventDefault();
    try {
      await updateReading(user.id, livro.id, leitura);
      await updateBookOrganization(user.id, livro.id, { format: leitura.format, source: leitura.source, tags: leitura.tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 12) });
      setEditandoLeitura(false);
      mostrarToast('Leitura atualizada.');
    } catch (error) { mostrarToast(error.message); }
  }

  async function registrarEmocao() {
    try { await saveEmotion(user.id, livro.id, Number(leitura.progress), emocao); setEmocoes(await getEmotionMap(livro.id)); mostrarToast('Momento emocional registrado.'); }
    catch (error) { mostrarToast(error.message); }
  }

  async function publicar(post) { await createPost(user.id, post); setPosts(await getPostsByBook(livro.id, user.id)); }
  async function reler(){try{const cycle=await startReread(livro.id,leitura.format);setLeitura({...leitura,status:'lendo',progress:0});mostrarToast(`Releitura ${cycle} iniciada sem apagar suas memórias anteriores.`)}catch(error){mostrarToast(error.message)}}
  async function excluirDaEstante(){if(!window.confirm(`Excluir “${title}” da sua estante? Suas publicações sobre o livro não serão apagadas.`))return;try{await removeFromShelf(user.id,livro.id);mostrarToast('Livro excluído da estante.');aoRemoverDaEstante?.();}catch(error){mostrarToast(error.message)}}
  async function abrirMaterial(material){try{const url=await getReadingFileUrl(material.file_path);window.open(url,'_blank','noopener,noreferrer');}catch(error){mostrarToast(error.message)}}

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
          <div className="livro-detalhe__acoes"><button className="btn-primario" onClick={() => adicionar('quero-ler')}>+ Quero ler</button><button className="btn-secundario" onClick={() => adicionar('lendo')}>Começar leitura</button>{livro.status&&<button className="btn-texto-perigo" onClick={excluirDaEstante}>Excluir da estante</button>}</div>
          {(livro.status==='lidos'||livro.progress===100)&&<button className="btn-texto" onClick={reler}>↻ Iniciar releitura preservando histórico</button>}
          <button className="btn-texto" onClick={() => setEditandoLeitura(!editandoLeitura)}>{editandoLeitura ? 'Cancelar atualização' : 'Atualizar progresso e nota'}</button>
          {editandoLeitura && <form className="leitura-form" onSubmit={salvarLeitura}>
            <label>Status<select value={leitura.status} onChange={(e) => setLeitura({ ...leitura, status: e.target.value })}><option value="quero-ler">Quero ler</option><option value="lendo">Lendo</option><option value="pausados">Pausado</option><option value="lidos">Lido</option><option value="favoritos">Favorito</option><option value="abandonados">Abandonado</option></select></label>
            <label>Progresso: {leitura.progress}%<input type="range" min="0" max="100" value={leitura.progress} onChange={(e) => setLeitura({ ...leitura, progress: Number(e.target.value) })} /></label>
            <label className="leitura-form__avaliacao">Sua avaliação<BookRating value={leitura.rating} onChange={(rating) => setLeitura({ ...leitura, rating })} /></label>
            <label>Formato<select value={leitura.format} onChange={(e) => setLeitura({ ...leitura, format:e.target.value })}><option value="">Não informado</option><option value="fisico">Físico</option><option value="ebook">E-book</option><option value="audiobook">Audiobook</option><option value="outro">Outro</option></select></label><label>Origem<select value={leitura.source} onChange={(e) => setLeitura({ ...leitura, source:e.target.value })}><option value="">Não informada</option><option value="proprio">Meu acervo</option><option value="biblioteca">Biblioteca</option><option value="emprestado">Emprestado</option><option value="assinatura">Assinatura</option><option value="outro">Outra</option></select></label><label>Etiquetas<input value={leitura.tags} onChange={(e) => setLeitura({ ...leitura, tags:e.target.value })} placeholder="fantasia, favorito, faculdade" /></label>
            <button className="btn-primario">Salvar leitura</button>
          </form>}
        </div>
      </div>
      <section className="mapa-emocional widget"><div><h2>Mapa emocional coletivo</h2><p>Veja como a experiência muda ao longo do livro, sem revelar acontecimentos.</p></div><div className="mapa-emocional__linha">{emocoes.length ? emocoes.map((item, index) => <span key={`${item.progress}-${index}`} title={`${item.emotion} em ${item.progress}%`} style={{ left: `${item.progress}%` }}>{({curioso:'🤔',feliz:'😊',tenso:'😰',triste:'😢',surpreso:'😮',inspirado:'✨'})[item.emotion]}</span>) : <small>Seja a primeira pessoa a registrar uma emoção.</small>}</div><div className="mapa-emocional__form"><select value={emocao} onChange={(e) => setEmocao(e.target.value)}><option value="curioso">🤔 Curioso</option><option value="feliz">😊 Feliz</option><option value="tenso">😰 Tenso</option><option value="triste">😢 Triste</option><option value="surpreso">😮 Surpreso</option><option value="inspirado">✨ Inspirado</option></select><span>em {leitura.progress}%</span><button className="btn-secundario" onClick={registrarEmocao}>Registrar</button></div></section>
      <BookSafety bookId={livro.id}/>
      <ReadingPause book={livro}/>
      <TrustedLending book={livro} isOwned={Boolean(livro.status) && (!livro.format || livro.format === 'fisico')}/>
      <ReadingExperience key={livro.id} bookId={livro.id} bookTitle={title} files={materiais} pageFromNotebook={readerPage} onAnnotationSaved={() => setNotebookRevision((value) => value + 1)} onProgressChange={(progress) => setLeitura((current) => ({ ...current, progress }))}/>
      <ReadingNotebook bookId={livro.id} currentProgress={Number(leitura.progress)||0} onGoToPage={setReaderPage} revision={notebookRevision}/>
      <section className="materiais-leitura widget"><header><ReaderIcon /><div><h2>Leitura no Entre Leitores</h2><p>Materiais enviados por administradores para leitura autorizada.</p></div></header>{materiais.length ? <div>{materiais.map((material) => <button key={material.id} onClick={() => abrirMaterial(material)}><span>{material.file_type.toUpperCase()}</span><strong>{material.file_name}</strong><OpenIcon fontSize="small" /></button>)}</div> : <p className="estado-vazio__texto">Ainda não há um material de leitura para este título.</p>}<small>Use apenas arquivos que você tem autorização para acessar e compartilhar.</small></section>
      {similares.length > 0 && <section className="similares widget"><header><h2>Você também pode gostar</h2><p>Outros livros do mesmo gênero disponíveis no catálogo.</p></header><div>{similares.map((item) => <button key={item.id} onClick={() => aoAbrirLivro(item)}>{item.cover_url ? <img src={item.cover_url} alt="" /> : <BookIcon />}<span><strong>{item.title}</strong><small>{item.author}</small></span></button>)}</div></section>}
      <div className="titulo-secao" style={{ marginTop: 'var(--space-6)' }}>Conversas sobre este livro</div>
      <Compositor aoPublicar={publicar} bookId={livro.id} showSpoilerControls />
      {loading ? <div className="skeleton-card" /> : posts.length ? <div className="feed__lista">{posts.map((post) => <Post key={post.id} post={post} aoAbrirLivro={aoAbrirLivro} aoAbrirPerfil={aoAbrirPerfil} />)}</div> : <EmptyState icon={<ForumIcon />} title="Ainda não há conversas" description="Associe este livro a uma publicação para iniciar a discussão." />}
    </section>
  );
}
