import { useCallback, useEffect, useState } from 'react';
import {
  ArrowBackRounded as BackIcon,
  ForumOutlined as ForumIcon,
  Groups as GroupsIcon,
  QuestionAnswerOutlined as QuestionIcon,
  ImageOutlined as ImageIcon,
  DeleteOutlined as DeleteIcon,
} from '@mui/icons-material';
import CommunityChat from '../components/CommunityChat.jsx';
import DiscussionKit from '../components/DiscussionKit.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createClub, deleteClub, getBooks, getClubReading, getClubs, setClubReading, toggleClubMembership } from '../services/social.js';
import { useToast } from '../components/Toast.jsx';
import { calculateDailyPace } from '../lib/readerIntelligence.js';

function CapaClube({ clube }) {
  const [falhou, setFalhou] = useState(false);
  if (!clube.cover_url || falhou) return <GroupsIcon />;
  return <img src={clube.cover_url} alt={`Capa do clube ${clube.name}`} onError={() => setFalhou(true)} />;
}

function LeituraAdaptativa({ clube, userId }) {
  const mostrarToast = useToast();
  const [reading, setReading] = useState(null); const [books, setBooks] = useState([]); const [bookId, setBookId] = useState(''); const [date, setDate] = useState('');
  useEffect(() => { getClubReading(clube.id).then(setReading).catch(() => {}); if (clube.owner_id === userId) getBooks().then(setBooks).catch(() => {}); }, [clube.id, clube.owner_id, userId]);
  async function definir(e) { e.preventDefault(); try { setReading(await setClubReading(userId, clube.id, bookId, date)); mostrarToast('Leitura coletiva definida.'); } catch (error) { mostrarToast(error.message); } }
  const pace = reading ? calculateDailyPace(reading.book?.page_count, reading.target_end_at) : null;
  return <section className="leitura-adaptativa widget"><div><strong>Ritmo adaptativo do clube</strong>{reading ? <p><b>{reading.book?.title}</b>{pace ? ` · cerca de ${pace.pagesPerDay} páginas por dia até ${new Date(reading.target_end_at).toLocaleDateString('pt-BR')}` : ' · avance no seu próprio ritmo'}</p> : <p>Nenhuma leitura coletiva ativa.</p>}</div>{clube.owner_id === userId && <form onSubmit={definir}><select required value={bookId} onChange={(e) => setBookId(e.target.value)}><option value="">Escolha o livro</option>{books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}</select><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /><button className="btn-secundario">Definir leitura</button></form>}</section>;
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
          <div className="sala-clube__cabecalho-acoes"><span className="sala-clube__membros">{clubeAberto.member_count} {clubeAberto.member_count === 1 ? 'membro' : 'membros'}</span>{clubeAberto.owner_id === user.id && <button className="btn-texto-perigo" onClick={() => excluirClube(clubeAberto)}><DeleteIcon fontSize="small" /> Excluir clube</button>}</div>
        </div>
        <nav className="comunidade-abas" aria-label="Áreas do clube"><button className={abaSala==='conversa'?'ativo':''} onClick={()=>setAbaSala('conversa')}><ForumIcon fontSize="small"/> Conversa</button><button className={abaSala==='perguntas'?'ativo':''} onClick={()=>setAbaSala('perguntas')}><QuestionIcon fontSize="small"/> Perguntas</button></nav>
        {abaSala==='perguntas'?<><LeituraAdaptativa clube={clubeAberto} userId={user.id} /><DiscussionKit club={clubeAberto} /></>:<CommunityChat club={clubeAberto} />}
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
        const podeConversar = clube.joined || clube.owner_id === user.id;
        return (
          <article className="clube-card" key={clube.id}>
            <div className="clube-card__capa"><CapaClube clube={clube} /></div>
            <div className="clube-card__corpo">
              <h2>{clube.name}</h2>
              <p>{clube.description || 'O clube ainda não adicionou uma descrição.'}</p>
              {(clube.city || clube.meeting_place) && <small className="clube-card__info">{[clube.city, clube.meeting_place].filter(Boolean).join(' · ')}</small>}
              <span className="clube-card__membros">{clube.member_count} {clube.member_count === 1 ? 'membro' : 'membros'}</span>
              <div className="clube-card__acoes">
                {podeConversar ? <button className="btn-primario" onClick={() => { setAbaSala('conversa'); setClubeAberto(clube); }}><ForumIcon fontSize="small" /> Abrir clube</button> : <button className="btn-primario" onClick={() => alternar(clube)}>Entrar no clube</button>}
                {clube.joined && clube.owner_id !== user.id && <button className="btn-texto-perigo" onClick={() => alternar(clube)}>Sair</button>}
                {clube.owner_id === user.id && <button className="btn-texto-perigo" onClick={() => excluirClube(clube)}><DeleteIcon fontSize="small" /> Excluir</button>}
              </div>
            </div>
          </article>
        );
      })}</div> : <EmptyState icon={<GroupsIcon />} title={busca.trim()?'Nenhum clube encontrado':'Ainda não há clubes'} description={busca.trim()?'Tente pesquisar por outro nome, cidade ou assunto.':'Crie o primeiro clube e abra um espaço de conversa para leitores com os mesmos interesses.'} action={!busca.trim()?<button className="btn-primario" onClick={() => setFormAberto(true)}>Criar o primeiro clube</button>:null} />}
    </section>
  );
}
