import { itensMenu, canais } from '../data/mockData.js';

export default function Sidebar({ paginaAtual, irParaPagina, recolhida, alternarRecolhida, aberta, fecharMobile }) {
  return (
    <>
      <div className={`sidebar-overlay${aberta ? ' ativo' : ''}`} onClick={fecharMobile} />

      <aside className={`sidebar${aberta ? ' aberta' : ''}`}>
        <div className="sidebar__logo">
          <div className="sidebar__logo-icone">📖</div>
          <span className="sidebar__logo-texto">Entre Leitores</span>
        </div>

        <span className="sidebar__label">MENU</span>
        <nav className="sidebar__menu">
          {itensMenu.map((item) => (
            <button
              key={item.pagina}
              className={`sidebar__item${paginaAtual === item.pagina ? ' ativo' : ''}`}
              onClick={() => irParaPagina(item.pagina)}
            >
              {(() => {
                const IconeComponente = item.icone;
                return IconeComponente ? <span className="sidebar__icone"><IconeComponente /></span> : null;
              })()}
              <span className="item-texto">{item.label}</span>
              {item.contador && <span className="sidebar__contador">{item.contador}</span>}
            </button>
          ))}
        </nav>

        <span className="sidebar__label">CANAIS</span>
        <div className="sidebar__canais">
          {canais.map((canal) => (
            <a className="sidebar__canal" href="#" key={canal.nome} onClick={(e) => e.preventDefault()}>
              {canal.nome}<span className="sidebar__canal-contador">{canal.contador}</span>
            </a>
          ))}
        </div>

        <div className="sidebar__rodape">
          <button className="sidebar__toggle" onClick={alternarRecolhida}>
            <span className="sidebar__icone">{recolhida ? '⏵' : '⏴'}</span>
            <span className="sidebar__toggle-texto">Recolher menu</span>
          </button>
        </div>
      </aside>
    </>
  );
}
