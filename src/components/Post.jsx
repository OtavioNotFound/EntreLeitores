import { useConjuntoStorage } from '../hooks/useLocalStorage.js';
import { useToast } from './Toast.jsx';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, ChatBubble as ChatIcon, Share as ShareIcon, BookmarkBorder as BookmarkIcon } from '@mui/icons-material';

const formatarNumero = (numero) => new Intl.NumberFormat('pt-BR').format(numero);

export default function Post({ post, aoAbrirLivro }) {
  const mostrarToast = useToast();
  const curtidos = useConjuntoStorage('postsCurtidos');
  const salvos = useConjuntoStorage('postsSalvos');

  const curtido = curtidos.contem(post.id);
  const salvo = salvos.contem(post.id);
  const totalCurtidas = post.curtidas + (curtido ? 1 : 0);

  function alternarCurtida() {
    curtidos.alternar(post.id);
  }

  function alternarSalvar() {
    const agoraSalvo = salvos.alternar(post.id);
    mostrarToast(agoraSalvo ? 'Post salvo nos seus favoritos' : 'Post removido dos favoritos');
  }

  function compartilhar() {
    mostrarToast('Link da publicação copiado!');
  }

  return (
    <article className="post">
      <div className="post__cabecalho">
        {post.avatar && <img className="avatar" src={post.avatar} alt="" />}
        <div className="post__autor-info">
          <div className="post__autor-nome">{post.autor}</div>
          <div className="post__autor-meta">{post.usuario} <span>·</span> {post.tempo}</div>
        </div>
        {post.tag && <span className={`post__tag ${post.tag.classe}`}>{post.tag.texto}</span>}
      </div>

      <p className="post__texto">{post.texto}</p>

      {post.livro && (
        <div className="post__livro">
          <div className="post__livro-capa" />
          <div className="post__livro-info">
            <div className="post__livro-titulo">{post.livro.titulo}</div>
            <div className="post__livro-autor">{post.livro.autor}</div>
          </div>
          <button className="btn-ver-livro" onClick={() => aoAbrirLivro && aoAbrirLivro(post.livro)}>Ver livro</button>
        </div>
      )}

      <div className="post__acoes">
        <button className={`post__acao post__acao--curtir${curtido ? ' curtido' : ''}`} onClick={alternarCurtida}>
          <span className="icone">{curtido ? <FavoriteIcon /> : <FavoriteBorderIcon />}</span><span className="post__acao-contador">{formatarNumero(totalCurtidas)}</span>
        </button>
        <button className="post__acao"><span className="icone"><ChatIcon /></span><span>{post.comentarios ?? 0}</span></button>
        <button className="post__acao compartilhar" onClick={compartilhar}><span className="icone"><ShareIcon /></span>Compartilhar</button>
        <button className={`post__acao post__acao--salvar post__acao-salvar${salvo ? ' salvo' : ''}`} onClick={alternarSalvar}>
          <span className="icone"><BookmarkIcon /></span>
        </button>
      </div>
    </article>
  );
}
