import { useState } from 'react';
import Post from '../components/Post.jsx';
import Compositor from '../components/Compositor.jsx';
import { postsIniciais, plataformas, ranking } from '../data/mockData.js';
import { MenuBook as BookIcon, EmojiEvents as TrophyIcon, LocalFireDepartment as FireIcon, Forum as ForumIcon, Description as DescriptionIcon, AccessTime as AccessTimeIcon, AutoAwesome as AutoAwesomeIcon, EmojiPeople as EmojiPeopleIcon } from '@mui/icons-material';

const filtros = ['Para você', 'Seguindo', 'Populares', 'Recentes'];

function gerarId() {
  return `post-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function Inicio({ aoAbrirLivro }) {
  const [posts, setPosts] = useState(postsIniciais);
  const [filtroAtivo, setFiltroAtivo] = useState(filtros[0]);

  function publicarPost(texto) {
    setPosts((atual) => [
      {
        id: gerarId(),
        autor: 'Ana Clara',
        usuario: '@anaclara',
        tempo: 'agora',
        avatar: '/img/assets/avatar-usuario.svg',
        tag: { texto: 'Publicação', classe: 'post__tag--resenha' },
        texto,
        curtidas: 0,
        comentarios: 0,
      },
      ...atual,
    ]);
  }

  return (
    <section className="pagina ativa" id="pagina-inicio">
      <div className="feed-coluna">

        <div className="trio-topo">
          <div className="cartao-boasvindas">
            <span className="cartao-boasvindas__eyebrow">BEM-VINDA DE VOLTA</span>
            <h2 className="cartao-boasvindas__titulo">Ana Clara! <EmojiPeopleIcon fontSize="small" /></h2>
            <p className="cartao-boasvindas__texto">Você tem 3 livros em andamento esta semana.</p>
            <button className="cartao-boasvindas__btn">Ver atividade</button>
          </div>

          <div className="cartao-mini">
            <div className="cartao-mini__topo">
              <div className="cartao-mini__icone cartao-mini__icone--azul"><BookIcon /></div>
              <span className="cartao-mini__valor">Kafka</span>
            </div>
            <div>
              <div className="cartao-mini__legenda">Leitura atual</div>
              <div className="cartao-mini__titulo">A Metamorfose</div>
            </div>
            <div className="progresso"><span className="progresso__barra progresso__barra--azul" style={{ width: '68%' }} /></div>
            <div className="cartao-mini__rodape">Pág. 84 de 124 · estimativa: 1h restante</div>
          </div>

          <div className="cartao-mini">
            <div className="cartao-mini__topo">
              <div className="cartao-mini__icone cartao-mini__icone--amarelo"><TrophyIcon /></div>
              <span className="cartao-mini__valor">24/30</span>
            </div>
            <div>
              <div className="cartao-mini__legenda">Desafio 2025</div>
              <div className="cartao-mini__titulo">Meta anual</div>
            </div>
            <div className="progresso"><span className="progresso__barra progresso__barra--amarelo" style={{ width: '80%' }} /></div>
            <div className="cartao-mini__rodape">6 livros para completar a meta! <FireIcon fontSize="small" /></div>
          </div>
        </div>

        <Compositor aoPublicar={publicarPost} />

        <div className="feed__filtros">
          {filtros.map((f) => (
            <button
              key={f}
              className={`filtro-pill${filtroAtivo === f ? ' ativo' : ''}`}
              onClick={() => setFiltroAtivo(f)}
            >
              {f}
            </button>
          ))}
          <button className="feed__ordenar">⇅ Ordenar</button>
        </div>

        <div className="feed__lista">
          {posts.map((post) => (
            <Post key={post.id} post={post} aoAbrirLivro={aoAbrirLivro} />
          ))}
        </div>
      </div>

      <div className="widgets-coluna">
        <div className="widget">
          <div className="titulo-secao" style={{ marginBottom: 12 }}>
            Plataformas disponíveis <AutoAwesomeIcon fontSize="small" style={{ cursor: 'pointer', marginLeft: 8 }} />
          </div>
          <div className="lista-plataformas">
            {plataformas.map((p, i) => (
              <div className="item-plataforma" key={i}>
                <div className="item-plataforma__icone">
                  {(() => {
                    const IconeComponente = p.icone;
                    return IconeComponente ? <IconeComponente /> : null;
                  })()}
                </div>
                <div><div className="item-plataforma__titulo">{p.titulo}</div><div className="item-plataforma__sub">{p.sub}</div></div>
                <span className="item-plataforma__seta">›</span>
              </div>
            ))}
          </div>
        </div>

        <div className="widget-discussao">
          <div className="widget-discussao__eyebrow"><FireIcon /> DISCUSSÃO EM DESTAQUE</div>
          <div className="widget-discussao__titulo">Qual o melhor plot twist da ficção?</div>
          <div className="widget-discussao__meta">312 respostas · Clube Ficção</div>
        </div>

        <div className="widget">
          <div className="titulo-secao">Mais comentados <span className="ver-todos">Ver todos</span></div>
          <div className="lista-ranking">
            {ranking.map((r) => (
              <div className="item-ranking" key={r.numero}>
                <div className="item-ranking__numero">{r.numero}</div>
                <div className="item-ranking__texto">
                  <div className="item-ranking__titulo">{r.titulo}</div>
                  <div className="item-ranking__autor">{r.autor}</div>
                  <div className="item-ranking__meta"><ForumIcon fontSize="small" /> {r.comentarios} comentários</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="widget">
          <div className="titulo-secao">Sua semana</div>
          <div className="resumo-grid">
            <div className="resumo-item"><div className="resumo-item__icone"><DescriptionIcon /></div><div className="resumo-item__valor">312</div><div className="resumo-item__label">Páginas</div></div>
            <div className="resumo-item"><div className="resumo-item__icone"><AccessTimeIcon /></div><div className="resumo-item__valor">8,4</div><div className="resumo-item__label">Horas</div></div>
            <div className="resumo-item"><div className="resumo-item__icone"><ForumIcon /></div><div className="resumo-item__valor">14</div><div className="resumo-item__label">Posts</div></div>
          </div>
        </div>

        <p style={{ fontSize: '.72rem', color: 'var(--cinza-400)', textAlign: 'center' }}>Entre Leitores © 2026 · Termos · Privacidade</p>
      </div>
    </section>
  );
}
