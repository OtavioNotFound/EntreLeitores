import { conquistas } from '../data/mockData.js';

export default function Desafios() {
  return (
    <section className="pagina ativa" id="pagina-desafios">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Desafios de Leitura</h1><p className="pagina-cabecalho__sub">Acompanhe suas metas e conquistas.</p></div></div>
      <div className="cartao-mini" style={{ maxWidth: 420 }}>
        <div className="cartao-mini__legenda">Desafio 2025</div>
        <div className="cartao-mini__titulo">Meta anual: 24 de 30 livros</div>
        <div className="progresso"><span className="progresso__barra progresso__barra--amarelo" style={{ width: '80%' }} /></div>
      </div>
      <div className="titulo-secao" style={{ marginTop: 'var(--space-6)' }}>Conquistas</div>
      <div className="conquistas-grid">
        {conquistas.map((c, i) => (
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
    </section>
  );
}
