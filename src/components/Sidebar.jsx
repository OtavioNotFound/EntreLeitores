import { useEffect, useState } from 'react';
import { itensMenu } from '../data/navigation.js';
import { getAchievementMetrics, getMyClubs } from '../services/social.js';
import { LocalFireDepartment as FireIcon, Menu as MenuIcon, MenuBook as BookIcon } from '@mui/icons-material';

export default function Sidebar({ paginaAtual, irParaPagina, recolhida, alternarRecolhida, aberta, fecharMobile, userId }) {
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
        <button className="sidebar__ofensiva" onClick={() => irParaPagina('conquistas')} aria-label={`Ofensiva de livros: ${ofensiva} dias`}>
          <span className="sidebar__ofensiva-icone"><FireIcon /></span>
          <span className="item-texto"><strong>Ofensiva de livros</strong><small>{ofensiva} {ofensiva === 1 ? 'dia seguido' : 'dias seguidos'}</small></span>
        </button>
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
