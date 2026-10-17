import { useCallback, useEffect, useState } from 'react';
import {
  ArrowBackRounded as BackIcon,
  ForumOutlined as ForumIcon,
  Groups as GroupsIcon,
  MenuBook as BookIcon,
  QuestionAnswerOutlined as QuestionIcon,
  ImageOutlined as ImageIcon,
  DeleteOutlined as DeleteIcon,
} from '@mui/icons-material';
import CommunityChat from '../components/CommunityChat.jsx';
import DiscussionKit from '../components/DiscussionKit.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createClub, deleteClub, getBooks, getClubReading, getClubs, setClubReading, toggleClubMembership, updateClubReadingProgress } from '../services/social.js';
import { useToast } from '../components/Toast.jsx';
import { calculateDailyPace } from '../lib/readerIntelligence.js';

function CapaClube({ clube }) {
  const [falhou, setFalhou] = useState(false);
  if (!clube.cover_url || falhou) return <GroupsIcon />;
  return <img src={clube.cover_url} alt={`Capa do clube ${clube.name}`} onError={() => setFalhou(true)} />;
}

function LeituraAdaptativa({ clube, userId, aoAbrirLivro }) {
  const mostrarToast = useToast();
  const [reading, setReading] = useState(null);
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState('');
  const [date, setDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const responsavel = clube.owner_id === userId;

  useEffect(() => {
    let vigente = true;
    setLoading(true);
    setReading(null);
    setProgress(0);
    getClubReading(clube.id).then((activeReading) => {
      if (!vigente) return;
      setReading(activeReading);
      setProgress(activeReading?.current_progress || 0);
    }).catch((error) => {
      if (vigente) mostrarToast(error.message);
    }).finally(() => {
      if (vigente) setLoading(false);
    });
    if (responsavel) getBooks().then((data) => { if (vigente) setBooks(data); }).catch((error) => { if (vigente) mostrarToast(error.message); });
    return () => { vigente = false; };
  }, [clube.id, responsavel, mostrarToast]);

  async function definir(evento) {
    evento.preventDefault();
    try {
      const novaLeitura = await setClubReading(userId, clube.id, bookId, date);
      setReading(novaLeitura);
      setProgress(novaLeitura.current_progress || 0);
      setBookId('');
      setDate('');
      mostrarToast('Leitura coletiva definida.');
    } catch (error) { mostrarToast(error.message); }
  }

  async function salvarProgresso(evento) {
    evento.preventDefault();
    if (!reading) return;
    setSavingProgress(true);
    try {
      const atualizado = await updateClubReadingProgress(clube.id, reading.id, progress);
      setProgress(atualizado);
      setReading({ ...reading, current_progress: atualizado });
      mostrarToast('Progresso coletivo atualizado.');
    } catch (error) { mostrarToast(error.message); }
    finally { setSavingProgress(false); }
  }

  const pace = reading ? calculateDailyPace(reading.book?.page_count, reading.target_end_at) : null;
  return (
    <section className="clube-leitura-atual widget" aria-labelledby="leitura-atual-titulo">
      <div className="clube-leitura-atual__titulo"><span>LEITURA ATUAL</span><h2 id="leitura-atual-titulo">Uma história em comum</h2></div>
      {loading ? <div className="clube-leitura-atual__vazio">Carregando leitura coletiva…</div> : reading ? <div className="clube-leitura-atual__livro">
        <div className="clube-leitura-atual__capa">{reading.book?.cover_url ? <img src={reading.book.cover_url} alt={`Capa de ${reading.book.title}`} /> : <BookIcon />}</div>
        <div className="clube-leitura-atual__conteudo">
          <button type="button" className="clube-leitura-atual__livro-link" onClick={() => reading.book && aoAbrirLivro?.(reading.book)} disabled={!reading.book}>
            <strong>{reading.book?.title || 'Livro da leitura coletiva'}</strong>
            {reading.book?.author && <span>{reading.book.author}</span>}
          </button>
          {pace && <p className="clube-leitura-atual__ritmo">Cerca de {pace.pagesPerDay} páginas por dia{reading.target_end_at ? ` até ${new Date(`${reading.target_end_at}T00:00:00`).toLocaleDateString('pt-BR')}` : ''}</p>}
          <div className="clube-leitura-atual__progresso">
            <div className="clube-leitura-atual__trilha" role="progressbar" aria-label="Progresso coletivo da leitura" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
            <strong>{progress}%</strong>
          </div>
          {responsavel && <form className="clube-leitura-atual__form-progresso" onSubmit={salvarProgresso}>
            <label htmlFor="progresso-coletivo">Andamento coletivo</label>
            <input id="progresso-coletivo" type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
            <button className="btn-secundario" disabled={savingProgress}>{savingProgress ? 'Salvando…' : 'Atualizar andamento'}</button>
          </form>}
        </div>
      </div> : <p className="clube-leitura-atual__vazio">Nenhuma leitura em andamento.</p>}
      {responsavel && <form className="leitura-adaptativa__form" onSubmit={definir}>
        <label>Escolher leitura coletiva<select required value={bookId} onChange={(event) => setBookId(event.target.value)}><option value="">Selecione um livro da comunidade</option>{books.map((book) => <option key={book.id} value={book.id}>{book.title} — {book.author}</option>)}</select></label>
        <label>Data de término<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <button className="btn-secundario" disabled={!bookId}>{reading ? 'Trocar livro' : 'Definir leitura'}</button>
      </form>}
      <p className="clube-leitura-atual__nota">O andamento é atualizado pela pessoa responsável e representa o clube, não o progresso individual dos participantes.</p>
    </section>
  );
}

export default function Comunidades({ buscaInicial = '' }) {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [clubes, setClubes] = useState([]);
  const [clubeAberto, setClubeAberto] = useState(null);
  const [formAberto, setFormAberto] = useState(false);
  const [capaInvalida, setCapaInvalida] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', coverUrl: '', city: '', meetingPlace: '' });
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState(buscaInicial);
  const [abaSala, setAbaSala] = useState('conversa');

  useEffect(() => { setBusca(buscaInicial); }, [buscaInicial]);

  const carregar = useCallback(() => {
    setLoading(true);
    getClubs(user.id).then(setClubes).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [user.id, mostrarToast]);
  useEffect(carregar, [carregar]);

  async function criar(evento) {
    evento.preventDefault();
    try {
      const clube = await createClub(user.id, form.name.trim(), form.description.trim() || null, form.coverUrl.trim() || null, form.city.trim() || null, form.meetingPlace.trim() || null);
      const novoClube = { ...clube, joined: true, member_count: 1 };
      setClubes((atuais) => [novoClube, ...atuais]);
      setForm({ name: '', description: '', coverUrl: '', city: '', meetingPlace: '' });
      setCapaInvalida(false);
      setFormAberto(false);
      setClubeAberto(novoClube);
      mostrarToast('Clube criado. A sala de conversa já está aberta!');
    } catch (error) { mostrarToast(error.message); }
  }

  async function alternar(clube) {
    if (clube.owner_id === user.id) return mostrarToast('Você é responsável por este clube.');
    try {
      const joined = await toggleClubMembership(user.id, clube.id, clube.joined);
      const atualizado = { ...clube, joined, member_count: Math.max(0, clube.member_count + (joined ? 1 : -1)) };
      setClubes((atuais) => atuais.map((item) => item.id === clube.id ? atualizado : item));
      if (!joined && clubeAberto?.id === clube.id) setClubeAberto(null);
      if (joined && clubeAberto?.id === clube.id) setClubeAberto(atualizado);
      if (joined) mostrarToast('Você entrou no clube. A conversa foi liberada.');
    } catch (error) { mostrarToast(error.message); }
  }

  async function excluirClube(clube) {
    if (clube.owner_id !== user.id) return;
    if (!window.confirm(`Excluir o clube “${clube.name}”? As conversas, perguntas e encontros dele também serão apagados.`)) return;
    try {
      await deleteClub(user.id, clube.id);
      setClubes((atuais) => atuais.filter((item) => item.id !== clube.id));
      if (clubeAberto?.id === clube.id) setClubeAberto(null);
      mostrarToast('Clube excluído.');
    } catch (error) { mostrarToast(error.message); }
  }

  if (clubeAberto) {
    return (
      <section className="pagina ativa" id="pagina-comunidades">
        <div className="pagina-cabecalho pagina-cabecalho--sala">
          <button className="btn-voltar" onClick={() => setClubeAberto(null)}><BackIcon /> Voltar aos clubes</button>
          {clubeAberto.owner_id === user.id && <button className="btn-texto-perigo" onClick={() => excluirClube(clubeAberto)}><DeleteIcon fontSize="small" /> Excluir clube</button>}
        </div>
        <section className="clube-detalhe" aria-labelledby="clube-detalhe-nome">
          <div className="clube-detalhe__banner">{clubeAberto.cover_url && !capaInvalida ? <img src={clubeAberto.cover_url} alt={`Capa do clube ${clubeAberto.name}`} onError={() => setCapaInvalida(true)} /> : <GroupsIcon />}</div>
          <div className="clube-detalhe__corpo">
            <div className="clube-detalhe__avatar" aria-hidden="true">{clubeAberto.cover_url && !capaInvalida ? <img src={clubeAberto.cover_url} alt="" /> : <span>{clubeAberto.name.trim().charAt(0).toUpperCase()}</span>}</div>
            <div className="clube-detalhe__identidade">
              <div className="clube-detalhe__topo"><div><h1 id="clube-detalhe-nome">{clubeAberto.name}</h1><span className="clube-detalhe__membros">{clubeAberto.member_count} {clubeAberto.member_count === 1 ? 'membro' : 'membros'}</span></div>
                {clubeAberto.owner_id === user.id ? <span className="clube-detalhe__responsavel">Seu clube</span> : clubeAberto.joined ? <button className="btn-secundario" onClick={() => alternar(clubeAberto)}>Sair do clube</button> : <button className="btn-primario" onClick={() => alternar(clubeAberto)}>Participar</button>}
              </div>
              <div className="clube-detalhe__etiquetas">{clubeAberto.is_private && <span>Clube privado</span>}{clubeAberto.city && <span>{clubeAberto.city}</span>}{clubeAberto.meeting_place && <span>{clubeAberto.meeting_place}</span>}</div>
              {clubeAberto.description && <p className="clube-detalhe__descricao">{clubeAberto.description}</p>}
            </div>
          </div>
        </section>
        <LeituraAdaptativa clube={clubeAberto} userId={user.id} aoAbrirLivro={aoAbrirLivro} />
        {clubeAberto.joined || clubeAberto.owner_id === user.id ? <>
          <nav className="comunidade-abas" aria-label="Áreas do clube"><button className={abaSala==='conversa'?'ativo':''} onClick={()=>setAbaSala('conversa')}><ForumIcon fontSize="small"/> Conversa</button><button className={abaSala==='perguntas'?'ativo':''} onClick={()=>setAbaSala('perguntas')}><QuestionIcon fontSize="small"/> Perguntas</button></nav>
          {abaSala==='perguntas'?<DiscussionKit club={clubeAberto} />:<CommunityChat club={clubeAberto} />}
        </> : <p className="clube-detalhe__acesso">Participe do clube para conversar e acompanhar as perguntas da leitura.</p>}
      </section>
    );
  }

  return (
    <section className="pagina ativa" id="pagina-comunidades">
      <div className="pagina-cabecalho">
        <div><h1 className="pagina-cabecalho__titulo">Clubes</h1><p className="pagina-cabecalho__sub">Entre em um clube para participar da conversa dele.</p></div>
        <button className="btn-primario" onClick={() => setFormAberto(!formAberto)}>{formAberto ? 'Cancelar' : '+ Criar clube'}</button>
      </div>

      {formAberto && <form className="widget clube-form clube-form--com-capa" onSubmit={criar}>
        <div className="clube-form__campos">
          <label>Nome do clube<input required minLength={3} maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Descrição<textarea rows={3} maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label>URL da imagem de capa <span>Use uma imagem pública em JPG, PNG ou WebP.</span><input type="url" placeholder="https://exemplo.com/capa.jpg" value={form.coverUrl} onChange={(e) => { setForm({ ...form, coverUrl: e.target.value }); setCapaInvalida(false); }} /></label>
          <label>Cidade<input maxLength={100} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label><label>Local dos encontros<input maxLength={180} value={form.meetingPlace} onChange={(e) => setForm({ ...form, meetingPlace: e.target.value })} /></label>
        </div>
        <div className="clube-form__preview">
          {form.coverUrl && !capaInvalida ? <img src={form.coverUrl} alt="Pré-visualização da capa" onError={() => setCapaInvalida(true)} /> : <><ImageIcon /><span>{capaInvalida ? 'Não foi possível carregar essa imagem' : 'Prévia da capa'}</span></>}
        </div>
        <button className="btn-primario">Criar clube e abrir conversa</button>
      </form>}

      {loading ? <div className="skeleton-card" /> : clubes.filter((clube)=>!busca.trim()||`${clube.name} ${clube.description||''} ${clube.city||''}`.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR'))).length ? <div className="clubes-grid">{clubes.filter((clube)=>!busca.trim()||`${clube.name} ${clube.description||''} ${clube.city||''}`.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR'))).map((clube) => {
        return (
          <article className="clube-card" key={clube.id}>
            <div className="clube-card__capa"><CapaClube clube={clube} /></div>
            <div className="clube-card__corpo">
              <h2>{clube.name}</h2>
              <p>{clube.description || 'O clube ainda não adicionou uma descrição.'}</p>
              {(clube.city || clube.meeting_place) && <small className="clube-card__info">{[clube.city, clube.meeting_place].filter(Boolean).join(' · ')}</small>}
              <span className="clube-card__membros">{clube.member_count} {clube.member_count === 1 ? 'membro' : 'membros'}</span>
              <div className="clube-card__acoes">
                <button className="btn-primario" onClick={() => { setAbaSala('conversa'); setCapaInvalida(false); setClubeAberto(clube); }}>{clube.joined || clube.owner_id === user.id ? <><ForumIcon fontSize="small" /> Abrir clube</> : 'Ver clube'}</button>
                {clube.owner_id === user.id && <button className="btn-texto-perigo" onClick={() => excluirClube(clube)}><DeleteIcon fontSize="small" /> Excluir</button>}
              </div>
            </div>
          </article>
        );
      })}</div> : <EmptyState icon={<GroupsIcon />} title={busca.trim()?'Nenhum clube encontrado':'Ainda não há clubes'} description={busca.trim()?'Tente pesquisar por outro nome, cidade ou assunto.':'Crie o primeiro clube e abra um espaço de conversa para leitores com os mesmos interesses.'} action={!busca.trim()?<button className="btn-primario" onClick={() => setFormAberto(true)}>Criar o primeiro clube</button>:null} />}
    </section>
  );
}
