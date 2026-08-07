import { useCallback, useEffect, useState } from 'react';
import { ForumOutlined as ForumIcon, Groups as GroupsIcon } from '@mui/icons-material';
import CommunityChat from '../components/CommunityChat.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createClub, getClubs, toggleClubMembership } from '../services/social.js';
import { useToast } from '../components/Toast.jsx';

export default function Comunidades() {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [aba, setAba] = useState('conversa');
  const [clubes, setClubes] = useState([]);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(() => {
    setLoading(true);
    getClubs(user.id).then(setClubes).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [user.id, mostrarToast]);
  useEffect(carregar, [carregar]);

  async function criar(evento) {
    evento.preventDefault();
    try {
      await createClub(user.id, form.name.trim(), form.description.trim() || null);
      setForm({ name: '', description: '' });
      setFormAberto(false);
      carregar();
      mostrarToast('Clube criado. Você já é o primeiro membro!');
    } catch (error) { mostrarToast(error.message); }
  }

  async function alternar(clube) {
    if (clube.owner_id === user.id) return mostrarToast('Você é responsável por este clube.');
    try {
      const joined = await toggleClubMembership(user.id, clube.id, clube.joined);
      setClubes((atuais) => atuais.map((item) => item.id === clube.id ? { ...item, joined, member_count: Math.max(0, item.member_count + (joined ? 1 : -1)) } : item));
    } catch (error) { mostrarToast(error.message); }
  }

  return (
    <section className="pagina ativa" id="pagina-comunidades">
      <div className="pagina-cabecalho">
        <div><h1 className="pagina-cabecalho__titulo">Comunidade</h1><p className="pagina-cabecalho__sub">Converse agora ou encontre seu próximo clube de leitura.</p></div>
        {aba === 'clubes' && <button className="btn-primario" onClick={() => setFormAberto(!formAberto)}>{formAberto ? 'Cancelar' : '+ Criar clube'}</button>}
      </div>

      <div className="comunidade-abas" role="tablist" aria-label="Seções da comunidade">
        <button role="tab" aria-selected={aba === 'conversa'} className={aba === 'conversa' ? 'ativo' : ''} onClick={() => setAba('conversa')}><ForumIcon fontSize="small" /> Conversa</button>
        <button role="tab" aria-selected={aba === 'clubes'} className={aba === 'clubes' ? 'ativo' : ''} onClick={() => setAba('clubes')}><GroupsIcon fontSize="small" /> Clubes</button>
      </div>

      {aba === 'conversa' ? <CommunityChat /> : <>
        {formAberto && <form className="widget clube-form" onSubmit={criar}>
          <label>Nome do clube<input required minLength={3} maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Descrição<textarea rows={3} maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <button className="btn-primario">Criar clube</button>
        </form>}

        {loading ? <div className="skeleton-card" /> : clubes.length ? <div className="clubes-grid">{clubes.map((clube) => (
          <article className="clube-card" key={clube.id}>
            <div className="clube-card__capa">{clube.cover_url ? <img src={clube.cover_url} alt="" /> : <GroupsIcon />}</div>
            <div className="clube-card__corpo"><span className="clube-card__membros">{clube.member_count} {clube.member_count === 1 ? 'membro' : 'membros'}</span><h2>{clube.name}</h2><p>{clube.description || 'O clube ainda não adicionou uma descrição.'}</p><button className={clube.joined ? 'btn-secundario' : 'btn-primario'} onClick={() => alternar(clube)}>{clube.owner_id === user.id ? 'Você administra' : clube.joined ? 'Sair do clube' : 'Entrar no clube'}</button></div>
          </article>
        ))}</div> : <EmptyState icon={<GroupsIcon />} title="Ainda não há clubes" description="Crie o primeiro espaço da comunidade e convide leitores com os mesmos interesses." action={<button className="btn-primario" onClick={() => setFormAberto(true)}>Criar o primeiro clube</button>} />}
      </>}
    </section>
  );
}
