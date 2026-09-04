import { useEffect, useMemo, useState } from 'react';
import { AutoStoriesOutlined as BookIcon, GroupsOutlined as ClubsIcon, PeopleAltOutlined as ReadersIcon, ReportOutlined as ReportIcon, SaveOutlined as SaveIcon, ShieldOutlined as ShieldIcon, WorkspacePremiumOutlined as OwnerIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { DEFAULT_RANK_THRESHOLDS, READER_RANKS } from '../lib/achievements.js';
import { getOwnerOverview, getOwnerUsers, getPlatformSettings, setOwnerAdminPermissions, updateOwnerPlatformSettings } from '../services/social.js';

const cards = [{ key:'readers', label:'Leitores', Icon:ReadersIcon }, { key:'books', label:'Livros', Icon:BookIcon }, { key:'clubs', label:'Clubes', Icon:ClubsIcon }, { key:'reports', label:'Denúncias', Icon:ReportIcon }];
const permissionGroups = [
  { label:'Livros', items:[['books.view','Ver'],['books.create','Criar'],['books.edit','Editar'],['books.unpublish','Despublicar'],['books.delete','Excluir'],['books.files','Materiais']] },
  { label:'Leitores', items:[['readers.view','Ver'],['ranks.manage','Ranks'],['achievements.grant','Conceder conquistas'],['achievements.remove','Remover conquistas']] },
  { label:'Clubes', items:[['clubs.view','Ver'],['clubs.edit','Editar'],['clubs.delete','Excluir']] },
  { label:'Denúncias e ofensiva', items:[['reports.view','Ver denúncias'],['reports.resolve','Resolver'],['reports.archive','Arquivar'],['streak.manage','Configurar ofensiva']] },
];
const defaultAdminPermissions = ['books.view','books.create','books.edit','books.unpublish','books.files'];

export default function Dono() {
  const { profile } = useAuth();
  const toast = useToast();
  const [overview, setOverview] = useState(null); const [users, setUsers] = useState([]); const [settings, setSettings] = useState(null); const [search, setSearch] = useState(''); const [busyId, setBusyId] = useState(''); const [savingSettings, setSavingSettings] = useState(false);
  const load = () => Promise.all([getOwnerOverview(), getOwnerUsers(), getPlatformSettings()]).then(([summary, people, platformSettings]) => { setOverview(summary); setUsers(people); setSettings(platformSettings); }).catch((error) => toast(error.message));
  useEffect(() => { if (profile?.is_owner) load(); }, [profile?.is_owner]);
  const filtered = useMemo(() => users.filter((person) => `${person.display_name} ${person.username}`.toLowerCase().includes(search.trim().toLowerCase())), [users, search]);
  if (!profile?.is_owner) return <section className="pagina ativa"><div className="owner-bloqueado widget"><OwnerIcon /><h1>Área do dono</h1><p>Esta área é reservada à pessoa responsável pela plataforma.</p></div></section>;

  async function saveAdmin(person, nextIsAdmin, nextPermissions) { setBusyId(person.id); try { await setOwnerAdminPermissions(person.id, nextIsAdmin, nextPermissions); setUsers((current) => current.map((item) => item.id === person.id ? { ...item, is_admin:nextIsAdmin, admin_permissions:nextIsAdmin?nextPermissions:[] } : item)); toast(nextIsAdmin?'Permissões administrativas salvas.':'Acesso administrativo removido.'); } catch(error){toast(error.message);} finally{setBusyId('');} }
  function togglePermission(person, permission) { const current=person.admin_permissions||[]; const next=current.includes(permission)?current.filter((item)=>item!==permission):[...current,permission]; setUsers((people)=>people.map((item)=>item.id===person.id?{...item,admin_permissions:next}:item)); }
  async function saveSettings(event) { event.preventDefault(); setSavingSettings(true); try { await updateOwnerPlatformSettings(settings); toast('Configurações gerais salvas.'); } catch(error){toast(error.message);} finally{setSavingSettings(false);} }
  function updateThreshold(key, value){setSettings({...settings,rank_thresholds:{...DEFAULT_RANK_THRESHOLDS,...settings.rank_thresholds,[key]:Number(value)}})}

  return <section className="pagina ativa owner-pagina">
    <div className="owner-hero"><span><OwnerIcon /></span><div><p>CONTROLE DA PLATAFORMA</p><h1>Área do dono</h1><small>Permissões individuais, ranks e proteção automática da ofensiva.</small></div></div>
    <div className="owner-metricas">{cards.map(({key,label,Icon})=><article key={key} className="widget"><Icon/><strong>{overview?.[key]??'—'}</strong><span>{label}</span></article>)}</div>
    <section className="owner-usuarios widget"><header><div><h2>Equipe e permissões</h2><p>Cada administrador recebe apenas as ações necessárias para sua função.</p></div><label>Buscar leitor<input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Nome ou @usuário"/></label></header><div className="owner-usuarios__lista">{filtered.map((person)=><article className="owner-permissoes" key={person.id}><div className="owner-permissoes__identidade"><span className="owner-usuarios__avatar">{person.avatar_url?<img src={person.avatar_url} alt=""/>:person.display_name?.[0]||'L'}</span><div><strong>{person.display_name}</strong><small>@{person.username}</small></div><span className={`perfil-selo ${person.is_owner?'perfil-selo--dono':person.is_admin?'perfil-selo--admin':''}`}>{person.is_owner?'Dono':person.is_admin?'Administrador':'Leitor'}</span></div>{!person.is_owner&&<>{person.is_admin&&<div className="owner-permissoes__grupos">{permissionGroups.map((group)=><fieldset key={group.label}><legend>{group.label}</legend>{group.items.map(([id,label])=><label key={id}><input type="checkbox" checked={(person.admin_permissions||[]).includes(id)} onChange={()=>togglePermission(person,id)}/>{label}</label>)}</fieldset>)}</div>}<div className="owner-permissoes__acoes">{person.is_admin?<><button className="btn-primario" disabled={busyId===person.id} onClick={()=>saveAdmin(person,true,person.admin_permissions||[])}><SaveIcon fontSize="small"/>Salvar permissões</button><button className="btn-texto-perigo" disabled={busyId===person.id} onClick={()=>saveAdmin(person,false,[])}>Remover admin</button></>:<button className="btn-primario" disabled={busyId===person.id} onClick={()=>saveAdmin(person,true,defaultAdminPermissions)}>Tornar administrador</button>}</div></>}</article>)}</div></section>
    {settings&&<form className="widget owner-configuracoes" onSubmit={saveSettings}><header><ShieldIcon/><div><h2>Progressão e ofensiva</h2><p>Defina os limites globais. Ranks manuais podem ser aplicados na área Administração.</p></div></header><div className="owner-configuracoes__grade"><label>Dias no calendário<input type="number" min="7" max="366" value={settings.streak_days_displayed} onChange={(e)=>setSettings({...settings,streak_days_displayed:Number(e.target.value)})}/></label><label>Proteções por mês<input type="number" min="0" max="31" value={settings.streak_max_protections} onChange={(e)=>setSettings({...settings,streak_max_protections:Number(e.target.value)})}/></label>{READER_RANKS.filter((rank)=>rank.key!=='visitor').map((rank)=><label key={rank.key}>{rank.label}<input type="number" min="0" value={{...DEFAULT_RANK_THRESHOLDS,...settings.rank_thresholds}[rank.key]} onChange={(e)=>updateThreshold(rank.key,e.target.value)}/></label>)}</div><button className="btn-primario" disabled={savingSettings}>{savingSettings?'Salvando…':'Salvar progressão'}</button></form>}
  </section>;
}
