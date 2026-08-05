export default function Resenhas() {
  return (
    <section className="pagina ativa" id="pagina-resenhas">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Resenhas</h1><p className="pagina-cabecalho__sub">O que a comunidade está escrevendo sobre suas leituras.</p></div></div>
      <div className="feed__lista">
        <article className="post">
          <div className="post__cabecalho">
            <img className="avatar" src="/img/assets/avatar-1.svg" alt="" />
            <div className="post__autor-info"><div className="post__autor-nome">Mariana Souza</div><div className="post__autor-meta">O Alquimista <span>·</span> ★★★★★</div></div>
          </div>
          <p className="post__texto">Uma jornada sobre autoconhecimento que vale a pena reler a cada fase da vida.</p>
        </article>
      </div>
    </section>
  );
}
