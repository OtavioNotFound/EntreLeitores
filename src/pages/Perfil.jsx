import { useEffect, useState } from 'react';
import AnimatedNumber from '../components/AnimatedNumber.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Post from '../components/Post.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { getPostsByUser, getProfileStats, getShelf, toggleFollow } from '../services/social.js';
import { useToast } from '../components/Toast.jsx';
import { MenuBook as BookIcon, Forum as ForumIcon } from '@mui/icons-material';

export default function Perfil({ profileId, aoAbrirLivro }) {
  const { user, profile: ownProfile, refreshProfile } = useAuth();
  const mostrarToast = useToast();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState([]);
  const [posts, setPosts] = useState([]);
  const [shelf, setShelf] = useState([]);
  const [painelAtivo, setPainelAtivo] = useState('posts');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: '', bio: '' });
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const isOwn = profileId === user.id;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from('profiles').select('*').eq('id', profileId).single(),
      getProfileStats(profileId),
      getPostsByUser(profileId),
      getShelf(profileId),
      isOwn ? Promise.resolve({ data: null }) : supabase.from('follows').select('following_id').eq('follower_id', user.id).eq('following_id', profileId).maybeSingle(),
    ]).then(([profileResult, profileStats, profilePosts, profileShelf, followResult]) => {
      if (profileResult.error) throw profileResult.error;
      setProfile(profileResult.data);
      setForm({ display_name: profileResult.data.display_name, bio: profileResult.data.bio || '' });
      setStats(profileStats);
      setPosts(profilePosts);
      setShelf(profileShelf);
      setFollowing(Boolean(followResult.data));
    }).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [profileId, user.id, isOwn]);

  async function salvarPerfil(evento) {
    evento.preventDefault();
    const { data, error } = await supabase.from('profiles').update({ display_name: form.display_name.trim(), bio: form.bio.trim() || null }).eq('id', user.id).select().single();
    if (error) return mostrarToast(error.message);
    setProfile(data);
    setEditing(false);
    await refreshProfile();
    mostrarToast('Perfil atualizado.');
  }

  async function alternarFollow() {
    try { setFollowing(await toggleFollow(user.id, profileId, following)); }
    catch (error) { mostrarToast(error.message); }
  }

  if (loading) return <section className="pagina ativa"><div className="skeleton-card skeleton-card--alto" /></section>;
  if (!profile) return <section className="pagina ativa"><EmptyState title="Perfil não encontrado" /></section>;
  const inicial = profile.display_name.charAt(0).toUpperCase();

  return (
    <section className="pagina ativa" id="pagina-perfil">
      <div className="perfil__banner">
        <div className="perfil__cabecalho">
          {profile.avatar_url ? <img className="avatar lg" src={profile.avatar_url} alt={profile.display_name} /> : <span className="avatar lg avatar--placeholder">{inicial}</span>}
          <div className="perfil__info"><div className="perfil__nome">{profile.display_name}</div><div className="perfil__user">@{profile.username}</div></div>
          <div className="perfil__acoes">
            {isOwn ? <button className="btn-secundario" onClick={() => setEditing(!editing)}>{editing ? 'Cancelar' : 'Editar perfil'}</button> : <button className={`btn-seguir${following ? ' seguindo' : ''}`} onClick={alternarFollow}>{following ? 'Seguindo' : 'Seguir'}</button>}
          </div>
        </div>
      </div>

      {editing ? <form className="perfil-edicao widget" onSubmit={salvarPerfil}>
        <label>Nome<input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} maxLength={60} /></label>
        <label>Bio<textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={280} rows={3} /></label>
        <button className="btn-primario" disabled={!form.display_name.trim()}>Salvar</button>
      </form> : <p className={`perfil__bio${profile.bio ? '' : ' perfil__bio--vazia'}`}>{profile.bio || (isOwn ? 'Conte um pouco sobre você e suas leituras.' : 'Este leitor ainda não escreveu uma bio.')}</p>}

      <div className="perfil__stats">{stats.map((stat) => <div key={stat.label}><div className="perfil__stat-valor"><AnimatedNumber valor={stat.valor} /></div><div className="perfil__stat-label">{stat.label}</div></div>)}</div>
      <div className="perfil__abas">
        <button className={`filtro-pill perfil__aba${painelAtivo === 'posts' ? ' ativa' : ''}`} onClick={() => setPainelAtivo('posts')}>Publicações</button>
        <button className={`filtro-pill perfil__aba${painelAtivo === 'leituras' ? ' ativa' : ''}`} onClick={() => setPainelAtivo('leituras')}>Estante</button>
      </div>

      <div className={`perfil__painel${painelAtivo === 'posts' ? ' ativo' : ''}`}>
        <div className="feed__lista perfil__feed">{posts.length ? posts.map((post) => <Post key={post.id} post={post} aoAbrirLivro={aoAbrirLivro} />) : <EmptyState icon={<ForumIcon />} title="Nenhuma publicação ainda" description={isOwn ? 'Quando você publicar, suas conversas aparecerão aqui.' : 'Este leitor ainda não publicou.'} />}</div>
      </div>
      <div className={`perfil__painel${painelAtivo === 'leituras' ? ' ativo' : ''}`}>
        {shelf.length ? <div className="biblioteca__grid">{shelf.map((book) => <button className="livro-card" key={book.id} onClick={() => aoAbrirLivro(book)}><div className="livro-card__capa">{book.cover_url ? <img src={book.cover_url} alt="" /> : <BookIcon />}</div><div className="livro-card__corpo"><div className="livro-card__titulo">{book.title}</div><div className="livro-card__autor">{book.author}</div></div></button>)}</div> : <EmptyState icon={<BookIcon />} title="A estante está vazia" description={isOwn ? 'Adicione livros pelo Explorar para construir sua estante.' : 'Este leitor ainda não adicionou livros.'} />}
      </div>
    </section>
  );
}
