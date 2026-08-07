import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { createComment, getComments, toggleLike, toggleSave } from '../services/social.js';
import { useToast } from './Toast.jsx';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, ChatBubble as ChatIcon, Bookmark as BookmarkIcon, BookmarkBorder as BookmarkBorderIcon, Send as SendIcon, MenuBook as BookIcon } from '@mui/icons-material';

const formatarNumero = (numero) => new Intl.NumberFormat('pt-BR').format(numero);

export default function Post({ post, aoAbrirLivro, aoAbrirPerfil }) {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [curtido, setCurtido] = useState(Boolean(post.curtido));
  const [salvo, setSalvo] = useState(Boolean(post.salvo));
  const [totalCurtidas, setTotalCurtidas] = useState(post.curtidas || 0);
  const [totalComentarios, setTotalComentarios] = useState(post.comentarios || 0);
  const [comentarios, setComentarios] = useState([]);
  const [comentariosAbertos, setComentariosAbertos] = useState(false);
  const [novoComentario, setNovoComentario] = useState('');

  async function alternarCurtida() {
    try {
      const novoEstado = await toggleLike(user.id, post.id, curtido);
      setCurtido(novoEstado);
      setTotalCurtidas((total) => Math.max(0, total + (novoEstado ? 1 : -1)));
    } catch (error) { mostrarToast(error.message); }
  }

  async function alternarSalvar() {
    try {
      const novoEstado = await toggleSave(user.id, post.id, salvo);
      setSalvo(novoEstado);
      mostrarToast(novoEstado ? 'Publicação salva.' : 'Publicação removida dos salvos.');
    } catch (error) { mostrarToast(error.message); }
  }

  async function abrirComentarios() {
    const abrir = !comentariosAbertos;
    setComentariosAbertos(abrir);
    if (abrir) {
      try { setComentarios(await getComments(post.id)); }
      catch (error) { mostrarToast(error.message); }
    }
  }

  async function comentar(evento) {
    evento.preventDefault();
    const content = novoComentario.trim();
    if (!content) return;
    try {
      await createComment(user.id, post.id, content);
      setNovoComentario('');
      setTotalComentarios((total) => total + 1);
      setComentarios(await getComments(post.id));
    } catch (error) { mostrarToast(error.message); }
  }

  const inicial = post.autor?.charAt(0)?.toUpperCase() || 'L';

  return (
    <article className="post">
      <div className="post__cabecalho">
        {post.avatar ? <img className="avatar" src={post.avatar} alt="" /> : <span className="avatar avatar--placeholder">{inicial}</span>}
        <button className="post__autor-info" onClick={() => aoAbrirPerfil?.(post.autorId)}>
          <span className="post__autor-nome">{post.autor}</span>
          <span className="post__autor-meta">{post.usuario} <span>·</span> {post.tempo}</span>
        </button>
        {post.tag && <span className={`post__tag ${post.tag.classe}`}>{post.tag.texto}</span>}
      </div>
      <p className="post__texto">{post.texto}</p>
      {post.livro && (
        <button className="post__livro post__livro--button" onClick={() => aoAbrirLivro?.(post.livro)}>
          <span className="post__livro-capa">{post.livro.capa ? <img src={post.livro.capa} alt="" /> : <BookIcon />}</span>
          <span className="post__livro-info"><span className="post__livro-titulo">{post.livro.titulo}</span><span className="post__livro-autor">{post.livro.autor}</span></span>
          <span className="btn-ver-livro">Ver livro</span>
        </button>
      )}
      <div className="post__acoes">
        <button aria-label={curtido ? 'Remover curtida' : 'Curtir'} className={`post__acao${curtido ? ' curtido' : ''}`} onClick={alternarCurtida}>
          <span className="icone">{curtido ? <FavoriteIcon /> : <FavoriteBorderIcon />}</span><span>{formatarNumero(totalCurtidas)}</span>
        </button>
        <button className="post__acao" onClick={abrirComentarios}><span className="icone"><ChatIcon /></span><span>{totalComentarios}</span></button>
        <button aria-label={salvo ? 'Remover dos salvos' : 'Salvar'} className={`post__acao post__acao-salvar${salvo ? ' salvo' : ''}`} onClick={alternarSalvar}>
          <span className="icone">{salvo ? <BookmarkIcon /> : <BookmarkBorderIcon />}</span>
        </button>
      </div>
      {comentariosAbertos && (
        <div className="comentarios">
          {comentarios.length ? comentarios.map((comentario) => (
            <div className="comentario" key={comentario.id}>
              <span className="avatar sm avatar--placeholder">{comentario.author?.display_name?.charAt(0) || 'L'}</span>
              <span><strong>{comentario.author?.display_name || 'Leitor'}</strong><p>{comentario.content}</p></span>
            </div>
          )) : <p className="estado-vazio__texto">Seja a primeira pessoa a comentar.</p>}
          <form className="comentario-form" onSubmit={comentar}>
            <input value={novoComentario} onChange={(e) => setNovoComentario(e.target.value)} placeholder="Escreva um comentário..." />
            <button aria-label="Enviar comentário" disabled={!novoComentario.trim()}><SendIcon fontSize="small" /></button>
          </form>
        </div>
      )}
    </article>
  );
}
