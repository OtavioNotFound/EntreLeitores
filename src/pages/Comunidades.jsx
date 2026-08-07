import { useCallback, useEffect, useState } from 'react';
import {
  ArrowBackRounded as BackIcon,
  ForumOutlined as ForumIcon,
  Groups as GroupsIcon,
  ImageOutlined as ImageIcon,
} from '@mui/icons-material';
import CommunityChat from '../components/CommunityChat.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createClub, getClubs, toggleClubMembership } from '../services/social.js';
import { useToast } from '../components/Toast.jsx';

function CapaClube({ clube }) {
  const [falhou, setFalhou] = useState(false);
  if (!clube.cover_url || falhou) return <GroupsIcon />;
  return <img src={clube.cover_url} alt={`Capa do clube ${clube.name}`} onError={() => setFalhou(true)} />;
}

export default function Comunidades() {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [clubes, setClubes] = useState([]);
  const [clubeAberto, setClubeAberto] = useState(null);
  const [formAberto, setFormAberto] = useState(false);
  const [capaInvalida, setCapaInvalida] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', coverUrl: '' });
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(() => {
    setLoading(true);
    getClubs(user.id).then(setClubes).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [user.id, mostrarToast]);
  useEffect(carregar, [carregar]);

  async function criar(evento) {
    evento.preventDefault();
    try {
      const clube = await createClub(user.id, form.name.trim(), form.description.trim() || null, form.coverUrl.trim() || null);
      const novoClube = { ...clube, joined: true, member_count: 1 };
      setClubes((atuais) => [novoClube, ...atuais]);
      setForm({ name: '', description: '', coverUrl: '' });
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

  if (clubeAberto) {
    return (
      <section className="pagina ativa" id="pagina-comunidades">
        <div className="pagina-cabecalho pagina-cabecalho--sala">
          <button className="btn-voltar" onClick={() => setClubeAberto(null)}><BackIcon /> Voltar aos clubes</button>
          <span className="sala-clube__membros">{clubeAberto.member_count} {clubeAberto.member_count === 1 ? 'membro' : 'membros'}</span>
        </div>
        <CommunityChat club={clubeAberto} />
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
        </div>
        <div className="clube-form__preview">
          {form.coverUrl && !capaInvalida ? <img src={form.coverUrl} alt="Pré-visualização da capa" onError={() => setCapaInvalida(true)} /> : <><ImageIcon /><span>{capaInvalida ? 'Não foi possível carregar essa imagem' : 'Prévia da capa'}</span></>}
        </div>
        <button className="btn-primario">Criar clube e abrir conversa</button>
      </form>}

      {loading ? <div className="skeleton-card" /> : clubes.length ? <div className="clubes-grid">{clubes.map((clube) => {
        const podeConversar = clube.joined || clube.owner_id === user.id;
        return (
          <article className="clube-card" key={clube.id}>
            <div className="clube-card__capa"><CapaClube clube={clube} /></div>
            <div className="clube-card__corpo">
              <span className="clube-card__membros">{clube.member_count} {clube.member_count === 1 ? 'membro' : 'membros'}</span>
              <h2>{clube.name}</h2>
              <p>{clube.description || 'O clube ainda não adicionou uma descrição.'}</p>
              <div className="clube-card__acoes">
                {podeConversar ? <button className="btn-primario" onClick={() => setClubeAberto(clube)}><ForumIcon fontSize="small" /> Abrir conversa</button> : <button className="btn-primario" onClick={() => alternar(clube)}>Entrar no clube</button>}
                {clube.joined && clube.owner_id !== user.id && <button className="btn-texto-perigo" onClick={() => alternar(clube)}>Sair</button>}
              </div>
            </div>
          </article>
        );
      })}</div> : <EmptyState icon={<GroupsIcon />} title="Ainda não há clubes" description="Crie o primeiro clube e abra um espaço de conversa para leitores com os mesmos interesses." action={<button className="btn-primario" onClick={() => setFormAberto(true)}>Criar o primeiro clube</button>} />}
    </section>
  );
}
