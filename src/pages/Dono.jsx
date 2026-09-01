import { useEffect, useMemo, useState } from 'react';
import { AdminPanelSettingsOutlined as AdminIcon, AutoStoriesOutlined as BookIcon, GroupsOutlined as ClubsIcon, PeopleAltOutlined as ReadersIcon, ReportOutlined as ReportIcon, WorkspacePremiumOutlined as OwnerIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { getOwnerOverview, getOwnerUsers, setOwnerAdminRole } from '../services/social.js';

const cards = [{ key:'readers', label:'Leitores', Icon:ReadersIcon }, { key:'books', label:'Livros', Icon:BookIcon }, { key:'clubs', label:'Clubes', Icon:ClubsIcon }, { key:'reports', label:'Denúncias', Icon:ReportIcon }];

export default function Dono() {
  const { profile } = useAuth();
  const toast = useToast();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState('');
  const load = () => Promise.all([getOwnerOverview(), getOwnerUsers()]).then(([summary, people]) => { setOverview(summary); setUsers(people); }).catch((error) => toast(error.message));
  useEffect(() => { if (profile?.is_owner) load(); }, [profile?.is_owner]);
  const filtered = useMemo(() => users.filter((person) => `${person.display_name} ${person.username}`.toLowerCase().includes(search.trim().toLowerCase())), [users, search]);
  if (!profile?.is_owner) return <section className="pagina ativa"><div className="owner-bloqueado widget"><OwnerIcon /><h1>Área do dono</h1><p>Esta área é reservada à pessoa responsável pela plataforma.</p></div></section>;
  async function toggleAdmin(person) { setBusyId(person.id); try { await setOwnerAdminRole(person.id, !person.is_admin); setUsers((current) => current.map((item) => item.id === person.id ? { ...item, is_admin:!person.is_admin } : item)); toast(person.is_admin ? 'Acesso administrativo removido.' : 'Administrador adicionado.'); } catch (error) { toast(error.message); } finally { setBusyId(''); } }
  return <section className="pagina ativa owner-pagina"><div className="owner-hero"><span><OwnerIcon /></span><div><p>CONTROLE DA PLATAFORMA</p><h1>Área do dono</h1><small>Visão geral do Entre Leitores e gestão dos administradores.</small></div></div><div className="owner-metricas">{cards.map(({ key, label, Icon }) => <article key={key} className="widget"><Icon /><strong>{overview?.[key] ?? '—'}</strong><span>{label}</span></article>)}</div><section className="owner-usuarios widget"><header><div><h2>Equipe e permissões</h2><p>Administradores podem cadastrar livros e materiais. Só o dono gerencia esses acessos.</p></div><label>Buscar leitor<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome ou @usuário" /></label></header><div className="owner-usuarios__lista">{filtered.map((person) => <article key={person.id}><span className="owner-usuarios__avatar">{person.avatar_url ? <img src={person.avatar_url} alt="" /> : person.display_name?.[0] || 'L'}</span><div><strong>{person.display_name}</strong><small>@{person.username}</small></div><span className={`perfil-selo ${person.is_owner ? 'perfil-selo--dono' : person.is_admin ? 'perfil-selo--admin' : ''}`}>{person.is_owner ? 'Dono' : person.is_admin ? 'Administrador' : 'Leitor'}</span>{!person.is_owner && <button className={person.is_admin ? 'btn-secundario' : 'btn-primario'} onClick={() => toggleAdmin(person)} disabled={busyId === person.id}>{busyId === person.id ? 'Salvando…' : person.is_admin ? 'Remover admin' : 'Tornar admin'}</button>}</article>)}</div></section></section>;
}
