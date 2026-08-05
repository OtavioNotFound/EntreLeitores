import { comunidades } from '../data/mockData.js';
import { useToast } from '../components/Toast.jsx';

export default function Comunidades() {
  const mostrarToast = useToast();

  return (
    <section className="pagina ativa" id="pagina-comunidades">
      <div className="pagina-cabecalho">
        <div><h1 className="pagina-cabecalho__titulo">Comunidades</h1><p className="pagina-cabecalho__sub">Participe de clubes de leitura e discussões em grupo.</p></div>
        <button className="btn-primario" onClick={() => mostrarToast('Criação de comunidades em breve!')}>+ Criar comunidade</button>
      </div>
      <div className="biblioteca__grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))' }}>
        {comunidades.map((c, i) => (
          <div className="cartao-mini" key={i}>
            <div className="cartao-mini__topo">
              <div className={`cartao-mini__icone cartao-mini__icone--${c.cor}`}>
                {(() => {
                  const IconeComponente = c.icone;
                  return IconeComponente ? <IconeComponente /> : null;
                })()}
              </div>
              <span className="cartao-mini__valor">{c.membros}</span>
            </div>
            <div className="cartao-mini__titulo">{c.titulo}</div>
            <p className="post__texto" style={{ margin: 0 }}>{c.desc}</p>
            <button className="btn-secundario" onClick={() => mostrarToast(`Você entrou em ${c.titulo}!`)}>Entrar</button>
          </div>
        ))}
      </div>
    </section>
  );
}
