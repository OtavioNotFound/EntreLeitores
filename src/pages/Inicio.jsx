import { useCallback, useEffect, useState } from 'react';
import Post from '../components/Post.jsx';
import Compositor from '../components/Compositor.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useToast } from '../components/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createPost, getClubs, getFeed, getProfileSuggestions, getShelf, toggleFollow } from '../services/social.js';
import { MenuBook as BookIcon, Forum as ForumIcon, Groups as GroupsIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';

const filtros = [
  { id: 'para-voce', label: 'Para você' },
  { id: 'seguindo', label: 'Seguindo' },
];

export default function Inicio({ aoAbrirLivro, aoAbrirPerfil, aoAbrirClubes, aoConhecerPessoas }) {
  const { user, profile } = useAuth();
  const mostrarToast = useToast();
  const [posts, setPosts] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [leituraAtual, setLeituraAtual] = useState(null);
  const [filtroAtivo, setFiltroAtivo] = useState('para-voce');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarFeed = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try { setPosts(await getFeed(user.id, filtroAtivo)); }
    catch (error) { setErro(error.message); }
    finally { setCarregando(false); }
  }, [user.id, filtroAtivo]);

  useEffect(() => { carregarFeed(); }, [carregarFeed]);
  useEffect(() => {
    Promise.all([getProfileSuggestions(user.id), getClubs(user.id), getShelf(user.id)])
      .then(([profiles, allClubs, shelf]) => {
        setSugestoes(profiles);
        setClubes(allClubs.slice(0, 3));
        setLeituraAtual(shelf.find((book) => book.status === 'lendo') || null);
      })
      .catch((error) => console.error('Falha nas descobertas:', error.message));
  }, [user.id]);

  async function publicarPost(post) {
    await createPost(user.id, post);
    await carregarFeed();
  }

  async function alternarSeguir(pessoa) {
    try {
      const following = await toggleFollow(user.id, pessoa.id, pessoa.following);
      setSugestoes((atuais) => following ? atuais.filter((item) => item.id !== pessoa.id) : atuais);
      mostrarToast(following ? `Agora você segue ${pessoa.display_name}` : `Você deixou de seguir ${pessoa.display_name}`);
    } catch (error) { mostrarToast(error.message); }
  }

  const nome = profile?.display_name?.split(' ')[0] || 'leitor';

  return (
    <section className="pagina ativa" id="pagina-inicio">
      <div className="feed-coluna">
        <div className="feed-intro">
          <div><h1>Entre conversas.</h1><p>Olá, {nome}. Tem uma leitura para compartilhar?</p></div>
          <button className="btn-texto feed-intro__pessoas" onClick={aoConhecerPessoas}><PersonAddIcon fontSize="small" /> Encontrar leitores</button>
        </div>

        {sugestoes.length > 0 && (
          <div className="leitores-ativos" aria-label="Leitores para conhecer">
            {sugestoes.slice(0, 6).map((pessoa) => (
              <button className="leitor-ativo" key={pessoa.id} onClick={() => aoAbrirPerfil(pessoa.id)}>
                <span className="leitor-ativo__avatar">
                  {pessoa.avatar_url ? <img src={pessoa.avatar_url} alt="" /> : <span className="avatar avatar--placeholder">{pessoa.display_name?.charAt(0) || 'L'}</span>}
                </span>
                <span className="leitor-ativo__nome">{pessoa.display_name}</span>
                <span className="leitor-ativo__estado">@{pessoa.username}</span>
              </button>
            ))}
          </div>
        )}

        <Compositor aoPublicar={publicarPost} />
        <div className="feed__filtros" aria-label="Filtrar conversas">
          {filtros.map((filtro) => <button key={filtro.id} aria-pressed={filtroAtivo === filtro.id} className={`filtro-pill${filtroAtivo === filtro.id ? ' ativo' : ''}`} onClick={() => setFiltroAtivo(filtro.id)}>{filtro.label}</button>)}
          <span className="feed__contexto">Conversas da comunidade</span>
        </div>

        <div className="feed__lista">
          {carregando ? <div className="skeleton-card" /> : erro ? (
            <EmptyState title="Não foi possível carregar o feed" description={erro} action={<button className="btn-secundario" onClick={carregarFeed}>Tentar novamente</button>} />
          ) : posts.length ? posts.map((post) => <Post key={post.id} post={post} aoAbrirLivro={aoAbrirLivro} aoAbrirPerfil={aoAbrirPerfil} />) : (
            <EmptyState icon={<ForumIcon />} title="O feed começa com você" description="Publique sua primeira leitura ou siga outras pessoas para ver novas conversas aqui." />
          )}
        </div>
      </div>

      <aside className="widgets-coluna" aria-label="Descobertas">
        <div className="widget">
          <div className="titulo-secao">Quem seguir <button className="titulo-secao__acao" onClick={aoConhecerPessoas} aria-label="Conhecer pessoas" title="Conhecer pessoas"><PersonAddIcon fontSize="small" /></button></div>
          {sugestoes.length ? <div className="sugestoes-lista">{sugestoes.slice(0, 4).map((pessoa) => (
            <div className="sugestao-pessoa" key={pessoa.id}>
              <button className="sugestao-pessoa__perfil" onClick={() => aoAbrirPerfil(pessoa.id)}>
                {pessoa.avatar_url ? <img className="avatar" src={pessoa.avatar_url} alt="" /> : <span className="avatar avatar--placeholder">{pessoa.display_name?.charAt(0) || 'L'}</span>}
                <span><strong>{pessoa.display_name}</strong><small>@{pessoa.username}</small></span>
              </button>
              <button className="btn-seguir" onClick={() => alternarSeguir(pessoa)}>Seguir</button>
            </div>
          ))}</div> : <p className="widget__vazio">Novos leitores aparecerão aqui quando entrarem na comunidade.</p>}
        </div>

        {clubes[0] && <button className="widget-discussao" onClick={aoAbrirClubes}>
          <span className="widget-discussao__icone"><ForumIcon /></span>
          <span className="widget-discussao__titulo">{clubes[0].name}</span>
          <span className="widget-discussao__meta">{clubes[0].member_count} {clubes[0].member_count === 1 ? 'membro' : 'membros'}</span>
          <span className="widget-discussao__link">Conhecer o clube <span aria-hidden="true">↗</span></span>
        </button>}

        {leituraAtual && <div className="widget">
          <div className="titulo-secao">Continue lendo <BookIcon fontSize="small" /></div>
          <button className="continuar-lendo continuar-lendo--button" onClick={() => aoAbrirLivro(leituraAtual)}>
            <div className="continuar-lendo__capa">{leituraAtual.cover_url ? <img src={leituraAtual.cover_url} alt="" /> : <BookIcon />}</div>
            <div className="continuar-lendo__info"><strong>{leituraAtual.title}</strong><span>{leituraAtual.author} · {leituraAtual.progress}%</span><div className="progresso"><span className="progresso__barra progresso__barra--azul" style={{ width: `${leituraAtual.progress}%` }} /></div></div>
          </button>
        </div>}

        <button className="widget clube-convite" onClick={aoAbrirClubes}>
          <GroupsIcon /><span><strong>{clubes.length ? `${clubes.length} clubes para conhecer` : 'Crie o primeiro clube'}</strong><small>Construa uma comunidade de leitura</small></span><ForumIcon fontSize="small" />
        </button>
        <p className="rodape-produto">Entre Leitores · Feito de boas conversas.</p>
      </aside>
    </section>
  );
}
