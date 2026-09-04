import { useEffect, useState } from 'react';
import AnimatedNumber from '../components/AnimatedNumber.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Post from '../components/Post.jsx';
import AchievementsPanel from '../components/AchievementsPanel.jsx';
import ProfileConversation from '../components/ProfileConversation.jsx';
import ProfilePeopleList from '../components/ProfilePeopleList.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { blockUser, getAchievementMetrics, getCompatibility, getPlatformSettings, getPostsByUser, getProfileStats, getSavedPosts, getShelf, reportContent, toggleFollow, uploadProfileImage } from '../services/social.js';
import { useToast } from '../components/Toast.jsx';
import { MenuBook as BookIcon, Forum as ForumIcon, ChatOutlined as ChatIcon, WorkspacePremiumOutlined as OwnerIcon, AdminPanelSettingsOutlined as AdminIcon } from '@mui/icons-material';

const STAT_PANELS = { Livros: 'leituras', Seguidores: 'seguidores', Seguindo: 'seguindo', Posts: 'posts' };

export default function Perfil({ profileId, aoAbrirLivro, aoAbrirPerfil }) {
  const { user, profile: ownProfile, refreshProfile } = useAuth();
  const mostrarToast = useToast();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState([]);
  const [posts, setPosts] = useState([]);
  const [salvos, setSalvos] = useState([]);
  const [shelf, setShelf] = useState([]);
  const [painelAtivo, setPainelAtivo] = useState('posts');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: '', bio: '', city: '', state_code: '', avatar_url: '', banner_url: '', avatar_position_x:50, avatar_position_y:50, banner_position_x:50, banner_position_y:50 });
  const [uploading, setUploading] = useState('');
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [compatibilidade, setCompatibilidade] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [achievementMetrics,setAchievementMetrics]=useState(null);
  const [platformSettings,setPlatformSettings]=useState(null);
  const [conversaAberta, setConversaAberta] = useState(false);
  const isOwn = profileId === user.id;

  useEffect(()=>{ setPainelAtivo('posts'); setConversaAberta(false); },[profileId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from('profiles').select('*').eq('id', profileId).single(),
      getProfileStats(profileId),
      getPostsByUser(profileId),
      getShelf(profileId),
      isOwn ? getSavedPosts(user.id) : Promise.resolve([]),
      isOwn ? Promise.resolve({ data: null }) : supabase.from('follows').select('following_id').eq('follower_id', user.id).eq('following_id', profileId).maybeSingle(),
      isOwn ? Promise.resolve(null) : getCompatibility(user.id, profileId),
      isOwn ? Promise.resolve({ data: null }) : supabase.from('user_blocks').select('blocked_id').eq('blocker_id', user.id).eq('blocked_id', profileId).maybeSingle(),
      isOwn ? getAchievementMetrics(user.id) : Promise.resolve(null),
      isOwn ? getPlatformSettings() : Promise.resolve(null),
    ]).then(([profileResult, profileStats, profilePosts, profileShelf, savedPosts, followResult, compatibilityResult, blockResult,achievementResult,settingsResult]) => {
      if (profileResult.error) throw profileResult.error;
      setProfile(profileResult.data);
      setForm({ display_name: profileResult.data.display_name, bio: profileResult.data.bio || '', city: profileResult.data.city || '', state_code: profileResult.data.state_code || '', avatar_url: profileResult.data.avatar_url || '', banner_url: profileResult.data.banner_url || '', avatar_position_x:profileResult.data.avatar_position_x ?? 50, avatar_position_y:profileResult.data.avatar_position_y ?? 50, banner_position_x:profileResult.data.banner_position_x ?? 50, banner_position_y:profileResult.data.banner_position_y ?? 50 });
      setStats(profileStats);
      setPosts(profilePosts);
      setShelf(profileShelf);
      setSalvos(savedPosts);
      setFollowing(Boolean(followResult.data));
      setCompatibilidade(compatibilityResult); setBlocked(Boolean(blockResult.data));
      setAchievementMetrics(achievementResult);
      setPlatformSettings(settingsResult);
    }).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [profileId, user.id, isOwn]);

  async function salvarPerfil(evento) {
    evento.preventDefault();
    const { data, error } = await supabase.from('profiles').update({ display_name: form.display_name.trim(), bio: form.bio.trim() || null, city: form.city.trim() || null, state_code: form.state_code.trim().toUpperCase() || null, avatar_url: form.avatar_url || null, banner_url: form.banner_url || null, avatar_position_x:Number(form.avatar_position_x), avatar_position_y:Number(form.avatar_position_y), banner_position_x:Number(form.banner_position_x), banner_position_y:Number(form.banner_position_y) }).eq('id', user.id).select().single();
    if (error) return mostrarToast(error.message);
    setProfile(data);
    setEditing(false);
    await refreshProfile();
    mostrarToast('Perfil atualizado.');
  }

  async function escolherImagem(evento, kind) {
    const file = evento.target.files?.[0];
    if (!file) return;
    setUploading(kind);
    try {
      const url = await uploadProfileImage(user.id, file, kind);
      setForm((atual) => ({ ...atual, [kind === 'avatar' ? 'avatar_url' : 'banner_url']: url }));
      mostrarToast(kind === 'avatar' ? 'Nova foto pronta para salvar.' : 'Novo banner pronto para salvar.');
    } catch (error) { mostrarToast(error.message); }
    finally { setUploading(''); evento.target.value = ''; }
  }

  function ajustarEnquadramento(evento, kind) {
    const url = kind === 'avatar' ? form.avatar_url : form.banner_url;
    if (!url) return mostrarToast('Escolha uma imagem antes de ajustar o enquadramento.');
    const bounds = evento.currentTarget.getBoundingClientRect();
    const x = Math.round(Math.min(100, Math.max(0, ((evento.clientX - bounds.left) / bounds.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, ((evento.clientY - bounds.top) / bounds.height) * 100)));
    setForm((current) => kind === 'avatar' ? { ...current, avatar_position_x:x, avatar_position_y:y } : { ...current, banner_position_x:x, banner_position_y:y });
  }

  async function alternarFollow() {
    try { setFollowing(await toggleFollow(user.id, profileId, following)); }
    catch (error) { mostrarToast(error.message); }
  }

  async function alternarBloqueio() { try { setBlocked(await blockUser(user.id, profileId, blocked)); mostrarToast(blocked ? 'Leitor desbloqueado.' : 'Leitor bloqueado.'); } catch (error) { mostrarToast(error.message); } }
  async function denunciarPerfil() { try { await reportContent(user.id, 'profile', profileId, 'outro'); mostrarToast('Denúncia enviada.'); } catch (error) { mostrarToast(error.message); } }

  if (loading) return <section className="pagina ativa"><div className="skeleton-card skeleton-card--alto" /></section>;
  if (!profile) return <section className="pagina ativa"><EmptyState title="Perfil não encontrado" /></section>;
  const inicial = profile.display_name.charAt(0).toUpperCase();

  return (
    <section className="pagina ativa" id="pagina-perfil">
      <div className={`perfil__banner${profile.banner_url ? ' perfil__banner--imagem' : ''}`} style={profile.banner_url ? { backgroundImage: `linear-gradient(180deg, transparent 25%, rgba(20, 14, 42, .42)), url(${profile.banner_url})`, backgroundPosition: `${profile.banner_position_x ?? 50}% ${profile.banner_position_y ?? 50}%` } : undefined}>
        <div className="perfil__cabecalho">
          {profile.avatar_url ? <img className="avatar lg" src={profile.avatar_url} alt={profile.display_name} style={{ objectPosition:`${profile.avatar_position_x ?? 50}% ${profile.avatar_position_y ?? 50}%` }} /> : <span className="avatar lg avatar--placeholder">{inicial}</span>}
          <div className="perfil__info"><div className="perfil__nome">{profile.display_name}{profile.is_owner && <span className="perfil-selo perfil-selo--dono"><OwnerIcon fontSize="inherit" /> Dono</span>}{!profile.is_owner && profile.is_admin && <span className="perfil-selo perfil-selo--admin"><AdminIcon fontSize="inherit" /> Admin</span>}</div><div className="perfil__user">@{profile.username}</div></div>
          <div className="perfil__acoes">
            {isOwn ? <button className="btn-secundario" onClick={() => setEditing(!editing)}>{editing ? 'Cancelar' : 'Editar perfil'}</button> : <><button className="btn-primario" onClick={() => setConversaAberta(!conversaAberta)}><ChatIcon fontSize="small" /> {conversaAberta ? 'Fechar conversa' : 'Conversar'}</button><button className={`btn-seguir${following ? ' seguindo' : ''}`} onClick={alternarFollow}>{following ? 'Seguindo' : 'Seguir'}</button><button className="btn-secundario" onClick={alternarBloqueio}>{blocked ? 'Desbloquear' : 'Bloquear'}</button><button className="btn-texto-perigo" onClick={denunciarPerfil}>Denunciar</button></>}
          </div>
        </div>
      </div>

      {editing ? <form className="perfil-edicao widget" onSubmit={salvarPerfil}>
        <div className="perfil-edicao__imagens">
          <label className="perfil-imagem-campo"><span>Foto do perfil</span><span className="perfil-imagem-preview perfil-imagem-preview--avatar perfil-imagem-preview--clicavel" onClick={(e) => ajustarEnquadramento(e, 'avatar')} title="Clique na parte da foto que deve aparecer">{form.avatar_url ? <img src={form.avatar_url} alt="Prévia da foto do perfil" style={{ objectPosition:`${form.avatar_position_x}% ${form.avatar_position_y}%` }} /> : inicial}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => escolherImagem(e, 'avatar')} disabled={Boolean(uploading)} /><input type="url" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url:e.target.value })} placeholder="ou cole o link da foto" /><span className="perfil-enquadramento"><strong>Clique na prévia ou ajuste abaixo</strong><span>Horizontal<input type="range" min="0" max="100" value={form.avatar_position_x} onChange={(e) => setForm({ ...form, avatar_position_x:e.target.value })} /></span><span>Vertical<input type="range" min="0" max="100" value={form.avatar_position_y} onChange={(e) => setForm({ ...form, avatar_position_y:e.target.value })} /></span></span><small>{uploading === 'avatar' ? 'Enviando foto...' : 'Arquivo JPG, PNG ou WebP, ou link de imagem.'}</small></label>
          <label className="perfil-imagem-campo perfil-imagem-campo--banner"><span>Banner do perfil</span><span className="perfil-imagem-preview perfil-imagem-preview--banner perfil-imagem-preview--clicavel" onClick={(e) => ajustarEnquadramento(e, 'banner')} title="Clique na parte do banner que deve aparecer">{form.banner_url ? <img src={form.banner_url} alt="Prévia do banner" style={{ objectPosition:`${form.banner_position_x}% ${form.banner_position_y}%` }} /> : 'Escolher banner'}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => escolherImagem(e, 'banner')} disabled={Boolean(uploading)} /><input type="url" value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url:e.target.value })} placeholder="ou cole o link do banner" /><span className="perfil-enquadramento"><strong>Clique na prévia ou ajuste abaixo</strong><span>Horizontal<input type="range" min="0" max="100" value={form.banner_position_x} onChange={(e) => setForm({ ...form, banner_position_x:e.target.value })} /></span><span>Vertical<input type="range" min="0" max="100" value={form.banner_position_y} onChange={(e) => setForm({ ...form, banner_position_y:e.target.value })} /></span></span><small>{uploading === 'banner' ? 'Enviando banner...' : 'Arquivo JPG, PNG, WebP ou GIF, ou link de imagem.'}</small></label>
        </div>
        <label>Nome<input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} maxLength={60} /></label>
        <label>Bio<textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={280} rows={3} /></label>
        <label>Cidade<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={100} /></label><label>UF<input value={form.state_code} onChange={(e) => setForm({ ...form, state_code: e.target.value })} maxLength={2} /></label>
        <button className="btn-primario" disabled={!form.display_name.trim() || Boolean(uploading)}>Salvar alterações</button>
      </form> : <p className={`perfil__bio${profile.bio ? '' : ' perfil__bio--vazia'}`}>{profile.bio || (isOwn ? 'Conte um pouco sobre você e suas leituras.' : 'Este leitor ainda não escreveu uma bio.')}</p>}

      {!isOwn && conversaAberta && <ProfileConversation person={profile} />}

      <div className="perfil__stats">{stats.map((stat) => <button className={`perfil__stat${painelAtivo === STAT_PANELS[stat.label] ? ' ativo' : ''}`} key={stat.label} onClick={() => setPainelAtivo(STAT_PANELS[stat.label])} aria-pressed={painelAtivo === STAT_PANELS[stat.label]}><span className="perfil__stat-valor"><AnimatedNumber valor={stat.valor} /></span><span className="perfil__stat-label">{stat.label}</span></button>)}</div>
      {!isOwn && compatibilidade && <section className="compatibilidade widget"><div className="compatibilidade__score">{compatibilidade.score}%</div><div><h2>Compatibilidade literária</h2><p>{compatibilidade.commonBooks} livros em comum{compatibilidade.sharedGenres.length ? ` · afinidade em ${compatibilidade.sharedGenres.join(', ')}` : ' · explorem um livro novo juntos'}.</p><small>A pontuação considera concordância de notas e gêneros compartilhados.</small></div></section>}
      <div className="perfil__abas">
        <button className={`filtro-pill perfil__aba${painelAtivo === 'posts' ? ' ativa' : ''}`} onClick={() => setPainelAtivo('posts')}>Posts</button>
        <button className={`filtro-pill perfil__aba${painelAtivo === 'leituras' ? ' ativa' : ''}`} onClick={() => setPainelAtivo('leituras')}>Estante</button>
        <button className={`filtro-pill perfil__aba${painelAtivo === 'seguidores' ? ' ativa' : ''}`} onClick={() => setPainelAtivo('seguidores')}>Seguidores</button>
        <button className={`filtro-pill perfil__aba${painelAtivo === 'seguindo' ? ' ativa' : ''}`} onClick={() => setPainelAtivo('seguindo')}>Seguindo</button>
        {isOwn&&<button className={`filtro-pill perfil__aba${painelAtivo === 'salvos' ? ' ativa' : ''}`} onClick={() => setPainelAtivo('salvos')}>Salvos</button>}
        {isOwn&&<button className={`filtro-pill perfil__aba${painelAtivo === 'conquistas' ? ' ativa' : ''}`} onClick={() => setPainelAtivo('conquistas')}>Conquistas</button>}
      </div>

      <div className={`perfil__painel${painelAtivo === 'posts' ? ' ativo' : ''}`}>
        <div className="feed__lista perfil__feed">{posts.length ? posts.map((post) => <Post key={post.id} post={post} aoAbrirLivro={aoAbrirLivro} />) : <EmptyState icon={<ForumIcon />} title="Nenhuma publicação ainda" description={isOwn ? 'Quando você publicar, suas conversas aparecerão aqui.' : 'Este leitor ainda não publicou.'} />}</div>
      </div>
      <div className={`perfil__painel${painelAtivo === 'leituras' ? ' ativo' : ''}`}>
        {shelf.length ? <div className="biblioteca__grid">{shelf.map((book) => <button className="livro-card" key={book.id} onClick={() => aoAbrirLivro(book)}><div className="livro-card__capa">{book.cover_url ? <img src={book.cover_url} alt="" /> : <BookIcon />}</div><div className="livro-card__corpo"><div className="livro-card__titulo">{book.title}</div><div className="livro-card__autor">{book.author}</div></div></button>)}</div> : <EmptyState icon={<BookIcon />} title="A estante está vazia" description={isOwn ? 'Adicione livros pelo Explorar para construir sua estante.' : 'Este leitor ainda não adicionou livros.'} />}
      </div>
      <div className={`perfil__painel${painelAtivo === 'seguidores' ? ' ativo' : ''}`}><ProfilePeopleList profileId={profileId} type="followers" aoAbrirPerfil={aoAbrirPerfil} /></div>
      <div className={`perfil__painel${painelAtivo === 'seguindo' ? ' ativo' : ''}`}><ProfilePeopleList profileId={profileId} type="following" aoAbrirPerfil={aoAbrirPerfil} /></div>
      {isOwn&&<div className={`perfil__painel${painelAtivo === 'salvos' ? ' ativo' : ''}`}><div className="feed__lista perfil__feed">{salvos.length ? salvos.map((post) => <Post key={post.id} post={post} aoAbrirLivro={aoAbrirLivro} aoRemoverSalvo={(postId) => setSalvos((atuais) => atuais.filter((item) => item.id !== postId))} />) : <EmptyState icon={<ForumIcon />} title="Nenhuma publicação salva" description="Use o marcador nas publicações para guardar resenhas e conversas para depois." />}</div></div>}
      {isOwn&&<div className={`perfil__painel${painelAtivo === 'conquistas' ? ' ativo' : ''}`}>{achievementMetrics&&<AchievementsPanel metrics={achievementMetrics} rankThresholds={platformSettings?.rank_thresholds} readerRank={profile.reader_rank} rankManual={profile.rank_manual}/>}</div>}
    </section>
  );
}
