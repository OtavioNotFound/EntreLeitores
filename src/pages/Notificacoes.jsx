import { notificacoes } from '../data/mockData.js';

export default function Notificacoes() {
  return (
    <section className="pagina ativa" id="pagina-notificacoes">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Notificações</h1></div></div>
      <div className="widget">
        {notificacoes.map((n, i) => (
          <div className="dropdown__item" key={i}>
            {(() => {
              const IconeComponente = n.icone;
              return IconeComponente ? <span className="badge-emoji"><IconeComponente /></span> : null;
            })()}
            <div className="dropdown__item-texto">
              {n.destaque ? <><strong>{n.destaque}</strong> {n.texto.replace(n.destaque, '').trim()}</> : n.texto}
              <div className="dropdown__item-tempo">{n.tempo}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
