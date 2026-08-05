import Post from '../components/Post.jsx';
import { lojasLivroDetalhe } from '../data/mockData.js';
import { useToast } from '../components/Toast.jsx';

const resenhaExemplo = {
  id: 'resenha-livro-1',
  autor: 'Mariana Souza',
  usuario: '@mariana.s',
  tempo: 'há 2 dias',
  avatar: '/img/assets/avatar-1.svg',
  tag: { texto: 'Resenha', classe: 'post__tag--resenha' },
  texto: 'Uma obra-prima sobre alienação. Kafka constrói uma atmosfera claustrofóbica que reflete muito sobre a condição humana.',
  curtidas: 58,
  comentarios: 9,
};

export default function LivroDetalhe({ livro }) {
  const mostrarToast = useToast();
  const dados = livro || { titulo: 'A Metamorfose', autor: 'Franz Kafka', capa: '📘' };

  return (
    <section className="pagina ativa" id="pagina-livro">
      <div className="livro-detalhe">
        <div className="livro-detalhe__capa">{dados.capa || '📘'}</div>
        <div>
          <h1 className="livro-detalhe__titulo">{dados.titulo}</h1>
          <div className="livro-detalhe__autor">{dados.autor}</div>
          <p className="livro-detalhe__sinopse">Gregor Samsa acorda uma manhã transformado em um inseto monstruoso. A partir desse evento absurdo, a novela explora temas de alienação, identidade e a fragilidade das relações familiares diante do inesperado.</p>
          <div className="livro-detalhe__meta">
            <div className="livro-detalhe__meta-item"><div className="livro-detalhe__meta-valor">★ 4.6</div><div className="livro-detalhe__meta-label">Nota média</div></div>
            <div className="livro-detalhe__meta-item"><div className="livro-detalhe__meta-valor">124</div><div className="livro-detalhe__meta-label">Páginas</div></div>
            <div className="livro-detalhe__meta-item"><div className="livro-detalhe__meta-valor">Ficção</div><div className="livro-detalhe__meta-label">Gênero</div></div>
            <div className="livro-detalhe__meta-item"><div className="livro-detalhe__meta-valor">Companhia das Letras</div><div className="livro-detalhe__meta-label">Editora</div></div>
          </div>
          <div className="livro-detalhe__acoes">
            <button className="btn-primario" onClick={() => mostrarToast('Livro adicionado à sua biblioteca!')}>+ Adicionar à biblioteca</button>
            <button className="btn-secundario">▶ Começar leitura</button>
            <button className="btn-secundario">👥 Participar do Clube</button>
          </div>
        </div>
      </div>

      <div className="titulo-secao">Onde encontrar</div>
      <div className="lojas-grid">
        {lojasLivroDetalhe.map((loja, i) => (
          <div className="item-plataforma widget" style={{ margin: 0 }} key={i}>
            <div className="item-plataforma__icone">
              {(() => {
                const IconeComponente = loja.icone;
                return IconeComponente ? <IconeComponente /> : null;
              })()}
            </div>
            <div><div className="item-plataforma__titulo">{loja.titulo}</div><div className="item-plataforma__sub">{loja.sub}</div></div>
          </div>
        ))}
      </div>

      <div className="titulo-secao" style={{ marginTop: 'var(--space-6)' }}>Resenhas da comunidade</div>
      <div className="feed__lista">
        <Post post={resenhaExemplo} />
      </div>
    </section>
  );
}
