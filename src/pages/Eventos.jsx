import { eventos } from '../data/mockData.js';
import { useToast } from '../components/Toast.jsx';

export default function Eventos() {
  const mostrarToast = useToast();

  return (
    <section className="pagina ativa" id="pagina-eventos">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Eventos</h1><p className="pagina-cabecalho__sub">Encontros literários, saraus e clubes ao vivo.</p></div></div>
      <div className="biblioteca__grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))' }}>
        {eventos.map((ev, i) => (
          <div className="cartao-mini" key={i}>
            <div className="cartao-mini__legenda">{ev.data}</div>
            <div className="cartao-mini__titulo">{ev.titulo}</div>
            <button className="btn-secundario" onClick={() => mostrarToast('Presença confirmada!')}>Participar</button>
          </div>
        ))}
      </div>
    </section>
  );
}
