import { useEffect, useState } from 'react';
import { itensMenu } from '../data/navigation.js';
import { getMyClubs } from '../services/social.js';
import { MenuBook as BookIcon } from '@mui/icons-material';

export default function Sidebar({ paginaAtual, irParaPagina, recolhida, alternarRecolhida, aberta, fecharMobile, userId }) {
  const [clubes, setClubes] = useState([]);

  useEffect(() => {
    getMyClubs(userId).then(setClubes).catch((error) => console.error('Falha ao carregar clubes:', error.message));
  }, [userId, paginaAtual]);

  return (
    <>
      <div className={`sidebar-overlay${aberta ? ' ativo' : ''}`} onClick={fecharMobile} />
      <aside className={`sidebar${aberta ? ' aberta' : ''}`}>
        <div className="sidebar__logo">
          <div className="sidebar__logo-icone"><BookIcon /></div>
          <span className="sidebar__logo-texto">Entre Leitores</span>
        </div>
        <span className="sidebar__label">MENU</span>
        <nav className="sidebar__menu">
          {itensMenu.map((item) => {
            const Icone = item.icone;
            return (
              <button key={item.pagina} className={`sidebar__item${paginaAtual === item.pagina ? ' ativo' : ''}`} onClick={() => irParaPagina(item.pagina)}>
                <span className="sidebar__icone"><Icone /></span>
                <span className="item-texto">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <span className="sidebar__label">SEUS CLUBES</span>
        <div className="sidebar__canais">
          {clubes.length ? clubes.map((clube) => (
            <button className="sidebar__canal" key={clube.id} onClick={() => irParaPagina('comunidades')}>
              <span className="sidebar__canal-ponto" />{clube.name}
            </button>
          )) : <span className="sidebar__vazio item-texto">Você ainda não entrou em clubes.</span>}
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
