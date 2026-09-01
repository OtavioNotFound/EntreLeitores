import { useEffect, useState } from 'react';
import { itensMenu } from '../data/navigation.js';
import { getAchievementMetrics, getMyClubs } from '../services/social.js';
import { Menu as MenuIcon, MenuBook as BookIcon } from '@mui/icons-material';

export default function Sidebar({ paginaAtual, irParaPagina, recolhida, alternarRecolhida, aberta, fecharMobile, userId, isAdmin = false, isOwner = false }) {
  const [clubes, setClubes] = useState([]);
  const [ofensiva, setOfensiva] = useState(0);

  useEffect(() => {
    getMyClubs(userId).then(setClubes).catch((error) => console.error('Falha ao carregar clubes:', error.message));
  }, [userId, paginaAtual]);

  useEffect(() => {
    getAchievementMetrics(userId).then((metricas) => setOfensiva(metricas.streak || 0)).catch(() => setOfensiva(0));
  }, [userId, paginaAtual]);

  return (
    <>
      <div className={`sidebar-overlay${aberta ? ' ativo' : ''}`} onClick={fecharMobile} />
      <aside className={`sidebar${aberta ? ' aberta' : ''}`}>
        <div className="sidebar__logo">
          <div className="sidebar__logo-icone"><BookIcon /></div>
          <span className="sidebar__logo-texto">Entre Leitores</span>
          <button className="sidebar__hamburguer" onClick={alternarRecolhida} aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'} title={recolhida ? 'Expandir menu' : 'Recolher menu'}><MenuIcon /></button>
        </div>
        <span className="sidebar__label">MENU</span>
        <nav className="sidebar__menu">
          {itensMenu.filter((item) => (!item.adminOnly || isAdmin || isOwner) && (!item.ownerOnly || isOwner)).map((item) => {
            const Icone = item.icone;
            return (
              <button key={item.pagina} className={`sidebar__item${paginaAtual === item.pagina ? ' ativo' : ''}${item.pagina === 'ofensiva' ? ' sidebar__item--ofensiva' : ''}`} onClick={() => irParaPagina(item.pagina)} aria-label={item.pagina === 'ofensiva' ? `Ofensiva de livros: ${ofensiva} dias` : undefined}>
                <span className="sidebar__icone"><Icone /></span>
                <span className="item-texto">{item.label}{item.pagina === 'ofensiva' && <small>{ofensiva} {ofensiva === 1 ? 'dia seguido' : 'dias seguidos'}</small>}</span>
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
      </aside>
    </>
  );
}
