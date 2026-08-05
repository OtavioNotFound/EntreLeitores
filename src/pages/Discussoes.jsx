import { discussoes } from '../data/mockData.js';

export default function Discussoes() {
  return (
    <section className="pagina ativa" id="pagina-discussoes">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Discussões</h1><p className="pagina-cabecalho__sub">Debata teorias, teorias malucas e finais alternativos.</p></div></div>
      <div className="feed__lista">
        {discussoes.map((d, i) => (
          <article className="post" key={i}>
            <div className="post__cabecalho">
              <img className="avatar" src={d.avatar} alt="" />
              <div className="post__autor-info"><div className="post__autor-nome">{d.autor}</div><div className="post__autor-meta">{d.meta}</div></div>
            </div>
            <p className="post__texto">{d.texto}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
