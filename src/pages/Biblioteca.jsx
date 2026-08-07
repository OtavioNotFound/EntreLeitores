import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import { LoanDashboard } from '../components/TrustedLending.jsx';
import { useToast } from '../components/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { abasBiblioteca } from '../data/navigation.js';
import { addToShelf, createBook, createReadingSession, getActiveReadingGoal, getReadingMemories, getReadingSessions, getShelf, saveReadingGoal } from '../services/social.js';
import { buildWeeklyActivity, calculateGentleGoal, calculateReadingStreak, summarizeSessions } from '../lib/readerIntelligence.js';
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
  const [sessoes, setSessoes] = useState([]);
  const [formato, setFormato] = useState('todos');
  const [sessaoAberta, setSessaoAberta] = useState(false);
  const [sessao, setSessao] = useState({ bookId: '', pages: '', minutes: '', format: 'fisico', note: '', date: new Date().toISOString().slice(0,10) });
  const [timerBookId, setTimerBookId] = useState('');
  const [timerStart, setTimerStart] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [goal, setGoal] = useState(null); const [goalForm, setGoalForm] = useState({metric:'minutes',target:120});
  const [memories,setMemories]=useState([]);

  const carregar = useCallback(() => {
    setLoading(true);
    Promise.all([getShelf(user.id), getReadingSessions(user.id), getActiveReadingGoal(user.id),getReadingMemories(user.id)]).then(([shelf, readingSessions, activeGoal,readingMemories]) => { setLivros(shelf); setSessoes(readingSessions); setGoal(activeGoal);setMemories(readingMemories); }).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [user.id]);
  useEffect(carregar, [carregar]);
  useEffect(() => { if (!timerStart) return undefined; const id=setInterval(() => setTimerSeconds(Math.floor((Date.now()-timerStart)/1000)),1000); return () => clearInterval(id); }, [timerStart]);

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

  async function registrarSessao(evento) {
    evento.preventDefault();
    if (!sessao.pages && !sessao.minutes) return mostrarToast('Informe páginas ou minutos lidos.');
    try { await createReadingSession(user.id, { ...sessao, pages: Number(sessao.pages) || null, minutes: Number(sessao.minutes) || null }); setSessao({ ...sessao, pages: '', minutes: '', note: '' }); setSessaoAberta(false); setSessoes(await getReadingSessions(user.id)); mostrarToast('Sessão registrada. Sua sequência foi atualizada!'); }
    catch (error) { mostrarToast(error.message); }
  }
  function iniciarTimer() { if (!timerBookId) return mostrarToast('Escolha o livro antes de iniciar.'); setTimerStart(Date.now()); setTimerSeconds(0); }
  function pararTimer() { const minutes=Math.max(1,Math.ceil(timerSeconds/60)); setSessao((current)=>({...current,bookId:timerBookId,minutes})); setTimerStart(null); setSessaoAberta(true); }
  async function salvarMeta(evento){evento.preventDefault();try{setGoal(await saveReadingGoal(user.id,goalForm.metric,Number(goalForm.target)));mostrarToast('Meta flexível criada. Ajustaremos a sugestão ao seu ritmo.');}catch(error){mostrarToast(error.message)}}

  const filtrados = livros.filter((livro) => (categoriaAtiva === 'todos' || livro.status === categoriaAtiva) && (formato === 'todos' || livro.format === formato) && `${livro.title} ${livro.author} ${(livro.tags || []).join(' ')}`.toLowerCase().includes(busca.toLowerCase().trim()));
  const resumo = summarizeSessions(sessoes); const sequencia = calculateReadingStreak(sessoes);
  const semana = buildWeeklyActivity(sessoes); const maiorDia = Math.max(1,...semana.map((day)=>day.minutes || day.pages));
  const porFormato = sessoes.reduce((acc,item)=>({ ...acc,[item.format]:(acc[item.format]||0)+1 }),{});
  const goalProgress=goal?calculateGentleGoal(goal,sessoes):null; const metricLabel={pages:'páginas',minutes:'minutos',active_days:'dias ativos'};

  return (
    <section className="pagina ativa" id="pagina-biblioteca">
      <LoanDashboard />
      <div className="pagina-cabecalho">
        <div><h1 className="pagina-cabecalho__titulo">Minha estante</h1><p className="pagina-cabecalho__sub">{livros.length} {livros.length === 1 ? 'livro organizado' : 'livros organizados'} por você.</p></div>
        <button className="btn-primario" onClick={() => setFormAberto(!formAberto)}>{formAberto ? 'Cancelar' : '+ Adicionar livro'}</button>
      </div>

      <section className="diario-leitura widget"><div className="diario-leitura__stats"><span><strong>{sequencia}</strong><small>dias de sequência</small></span><span><strong>{resumo.pages}</strong><small>páginas em 30 dias</small></span><span><strong>{resumo.minutes}</strong><small>minutos em 30 dias</small></span><span><strong>{resumo.days.size}</strong><small>dias ativos</small></span></div><button className="btn-primario" onClick={() => setSessaoAberta(!sessaoAberta)}>{sessaoAberta ? 'Cancelar' : '+ Registrar leitura'}</button></section>
      <section className="painel-leitura"><div className="widget atividade-semanal"><div><strong>Seus últimos 7 dias</strong><small>Páginas ou minutos registrados</small></div><div className="atividade-semanal__grafico">{semana.map((day)=><span key={day.date}><i style={{height:`${Math.max(4,((day.minutes||day.pages)/maiorDia)*100)}%`}} title={`${day.pages} páginas · ${day.minutes} min`}/><small>{day.label}</small></span>)}</div></div><div className="widget timer-leitura"><strong>Leitura focada</strong><select disabled={Boolean(timerStart)} value={timerBookId} onChange={(e)=>setTimerBookId(e.target.value)}><option value="">Escolha o livro</option>{livros.filter((book)=>book.status==='lendo').map((book)=><option key={book.id} value={book.id}>{book.title}</option>)}</select><div className="timer-leitura__relogio">{String(Math.floor(timerSeconds/60)).padStart(2,'0')}:{String(timerSeconds%60).padStart(2,'0')}</div>{timerStart?<button className="btn-primario" onClick={pararTimer}>Parar e registrar</button>:<button className="btn-secundario" onClick={iniciarTimer}>Iniciar cronômetro</button>}<small>{Object.entries(porFormato).map(([key,value])=>`${key}: ${value}`).join(' · ') || 'Suas sessões aparecerão aqui.'}</small></div></section>
      <section className="meta-gentil widget">{goal?<><div><strong>Meta flexível da semana</strong><p>{goalProgress.progress} de {goal.target} {metricLabel[goal.metric]} · {goalProgress.percent}%</p><small>{goalProgress.remaining?`Sugestão leve: ${goalProgress.dailySuggestion} ${metricLabel[goal.metric]} por dia. Sem punição se você pausar.`:'Meta alcançada — continue apenas se estiver com vontade.'}</small></div><div className="meta-gentil__barra"><span style={{width:`${goalProgress.percent}%`}}/></div></>:<form onSubmit={salvarMeta}><div><strong>Crie uma meta sem pressão</strong><small>Ela se adapta aos dias restantes, sem ranking ou sequência punitiva.</small></div><select value={goalForm.metric} onChange={(e)=>setGoalForm({...goalForm,metric:e.target.value})}><option value="minutes">Minutos</option><option value="pages">Páginas</option><option value="active_days">Dias ativos</option></select><input type="number" min="1" value={goalForm.target} onChange={(e)=>setGoalForm({...goalForm,target:e.target.value})}/><button className="btn-secundario">Criar meta semanal</button></form>}</section>
      {memories[0]&&<button className="memoria-leitura widget" onClick={()=>aoAbrirLivro(memories[0].book)}><span>Uma memória da sua leitura</span><blockquote>“{memories[0].content}”</blockquote><small>{memories[0].book?.title} · {memories[0].progress??0}%</small></button>}
      {sessaoAberta && <form className="sessao-form widget" onSubmit={registrarSessao}><label>Livro<select required value={sessao.bookId} onChange={(e) => setSessao({ ...sessao, bookId:e.target.value })}><option value="">Escolha uma leitura</option>{livros.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}</select></label><label>Páginas<input type="number" min="1" value={sessao.pages} onChange={(e) => setSessao({ ...sessao, pages:e.target.value })}/></label><label>Minutos<input type="number" min="1" value={sessao.minutes} onChange={(e) => setSessao({ ...sessao, minutes:e.target.value })}/></label><label>Formato<select value={sessao.format} onChange={(e) => setSessao({ ...sessao, format:e.target.value })}><option value="fisico">Físico</option><option value="ebook">E-book</option><option value="audiobook">Audiobook</option><option value="outro">Outro</option></select></label><label>Data<input type="date" value={sessao.date} onChange={(e) => setSessao({ ...sessao, date:e.target.value })}/></label><label className="sessao-form__nota">Nota<input maxLength={500} value={sessao.note} onChange={(e) => setSessao({ ...sessao, note:e.target.value })} placeholder="Uma lembrança desta leitura..."/></label><button className="btn-primario">Salvar sessão</button></form>}

      {formAberto && <form className="widget livro-form" onSubmit={adicionar}>
        <label>Título<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label>Autor<input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></label>
        <label>URL da capa <span>(opcional)</span><input type="url" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} /></label>
        <button className="btn-primario">Adicionar à estante</button>
      </form>}

      <div className="header__busca busca-pagina"><span className="header__busca-icone"><SearchIcon fontSize="small" /></span><input type="search" placeholder="Buscar na estante..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
      <div className="biblioteca__abas">{abasBiblioteca.map((aba) => <button key={aba.categoria} className={`filtro-pill biblioteca__aba${categoriaAtiva === aba.categoria ? ' ativa' : ''}`} onClick={() => setCategoriaAtiva(aba.categoria)}>{aba.label}</button>)}</div>
      <div className="colecao-inteligente"><strong>Coleção dinâmica</strong><select value={formato} onChange={(e) => setFormato(e.target.value)}><option value="todos">Todos os formatos</option><option value="fisico">Físicos</option><option value="ebook">E-books</option><option value="audiobook">Audiobooks</option><option value="outro">Outros</option></select><span>{filtrados.length} livros correspondem aos filtros</span></div>

      {loading ? <div className="skeleton-card" /> : filtrados.length ? <div className="biblioteca__grid">{filtrados.map((livro) => (
        <button className="livro-card" key={livro.id} onClick={() => aoAbrirLivro(livro)}>
          <div className="livro-card__capa">{livro.cover_url ? <img src={livro.cover_url} alt={`Capa de ${livro.title}`} /> : <BookIcon />}{livro.progress > 0 && <div className="livro-card__progresso"><span style={{ width: `${livro.progress}%` }} /></div>}</div>
          <div className="livro-card__corpo"><div className="livro-card__titulo">{livro.title}</div><div className="livro-card__autor">{livro.author}</div>{livro.format && <span className="livro-card__formato">{({fisico:'Físico',ebook:'E-book',audiobook:'Áudio',outro:'Outro'})[livro.format]}</span>}{livro.rating && <div className="livro-card__nota">★ {livro.rating}</div>}</div>
        </button>
      ))}</div> : <EmptyState icon={<BookIcon />} title={busca ? 'Nenhum livro encontrado' : 'Sua estante está vazia'} description={busca ? 'Tente buscar por outro título ou autor.' : 'Adicione seu primeiro livro para começar a organizar suas leituras.'} />}
    </section>
  );
}
