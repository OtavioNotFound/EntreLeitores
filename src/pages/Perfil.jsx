import { useEffect, useState } from 'react';
import AnimatedNumber from '../components/AnimatedNumber.jsx';
import { estatisticasPerfil, dashboardPerfil, abasPerfil, conquistas, graficoBarras } from '../data/mockData.js';

export default function Perfil() {
  const [painelAtivo, setPainelAtivo] = useState('dashboard');
  const [barrasVisiveis, setBarrasVisiveis] = useState(false);

  useEffect(() => {
    const quadro = requestAnimationFrame(() => setBarrasVisiveis(true));
    return () => cancelAnimationFrame(quadro);
  }, []);

  return (
    <section className="pagina ativa" id="pagina-perfil">
      <div className="perfil__banner">
        <div className="perfil__cabecalho">
          <img className="avatar lg" src="/img/assets/avatar-usuario.svg" alt="Ana Clara" />
          <div className="perfil__info">
            <div className="perfil__nome">Ana Clara</div>
            <div className="perfil__user">@anaclara</div>
          </div>
          <div className="perfil__acoes"><button className="btn-secundario">Editar perfil</button></div>
        </div>
      </div>

      <p className="perfil__bio">Leitora voraz de ficção e clássicos brasileiros. Sempre em busca da próxima história que vai mudar minha forma de ver o mundo. 📚✨</p>

      <div className="perfil__stats">
        {estatisticasPerfil.map((s) => (
          <div key={s.label}>
            <div className="perfil__stat-valor"><AnimatedNumber valor={s.valor} /></div>
            <div className="perfil__stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="perfil__abas">
        {abasPerfil.map((aba) => (
          <button
            key={aba.painel}
            className={`filtro-pill perfil__aba${painelAtivo === aba.painel ? ' ativa' : ''}`}
            onClick={() => setPainelAtivo(aba.painel)}
          >
            {aba.label}
          </button>
        ))}
      </div>

      <div className={`perfil__painel${painelAtivo === 'dashboard' ? ' ativo' : ''}`} id="perfil-dashboard">
        <div className="dashboard-grid">
          {dashboardPerfil.map((d, i) => (
            <div className="cartao-mini" key={i}>
              <div className="cartao-mini__legenda">{d.legenda}</div>
              <div className="cartao-mini__titulo">{d.titulo}</div>
            </div>
          ))}
        </div>
        <div className="widget">
          <div className="titulo-secao">Livros lidos por mês</div>
          <div className="grafico-barra">
            {graficoBarras.map((altura, i) => (
              <div className="grafico-barra__coluna" key={i} style={{ height: barrasVisiveis ? `${altura}%` : 0 }} />
            ))}
          </div>
        </div>
      </div>

      <div className={`perfil__painel${painelAtivo === 'conquistas' ? ' ativo' : ''}`} id="perfil-conquistas">
        <div className="conquistas-grid">
          {conquistas.slice(0, 3).map((c, i) => (
            <div className="conquista" key={i}>
              <div className="conquista__icone">
                {(() => {
                  const IconeComponente = c.icone;
                  return IconeComponente ? <IconeComponente /> : null;
                })()}
              </div>
              <div className="conquista__titulo">{c.titulo}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={`perfil__painel${painelAtivo === 'posts' ? ' ativo' : ''}`} id="perfil-posts">
        <div className="feed__lista">
          <article className="post">
            <p className="post__texto">Recomeçando "Duna" pela segunda vez — dessa vez prestando atenção em cada detalhe político.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
