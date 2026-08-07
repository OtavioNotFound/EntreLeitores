import { useEffect, useRef, useState } from 'react';
import { getNotifications } from '../services/social.js';
import { useClickOutside } from '../hooks/useClickOutside.js';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

function notificationText(item) {
  const nome = item.actor?.display_name || 'Alguém';
  if (item.type === 'follow') return `${nome} começou a seguir você`;
  if (item.type === 'like') return `${nome} curtiu sua publicação`;
  if (item.type === 'comment') return `${nome} comentou na sua publicação`;
  if (item.type === 'event') return `Há uma novidade em um evento`;
  return `Há uma novidade em um dos seus clubes`;
}

export default function Header({ irParaPagina, abrirSidebarMobile, temaEscuro, alternarTema, aoSair, profile, userId, aoBuscar: executarBusca }) {
  const [dropdownAberto, setDropdownAberto] = useState(null);
  const [busca, setBusca] = useState('');
  const [notificacoes, setNotificacoes] = useState([]);
  const refNotificacoes = useRef(null);
  const refPerfil = useRef(null);

  useEffect(() => {
    getNotifications(userId).then(setNotificacoes).catch((error) => console.error('Falha ao carregar notificações:', error.message));
  }, [userId]);

  useClickOutside([refNotificacoes, refPerfil], () => setDropdownAberto(null), dropdownAberto !== null);

  function aoBuscar(evento) {
    if (evento.key === 'Enter' && busca.trim()) {
      executarBusca?.(busca.trim());
    }
  }

  const nome = profile?.display_name || 'Leitor';
  const inicial = nome.trim().charAt(0).toUpperCase() || 'L';
  const naoLidas = notificacoes.filter((item) => !item.read_at).length;

  return (
    <header className="header">
      <button className="menu-mobile-toggle" aria-label="Abrir menu" onClick={abrirSidebarMobile}><MenuIcon /></button>
      <div className="header__busca">
        <span className="header__busca-icone"><SearchIcon fontSize="small" /></span>
        <input type="search" placeholder="Buscar pessoas, livros ou clubes..." value={busca} onChange={(e) => setBusca(e.target.value)} onKeyDown={aoBuscar} />
      </div>
      <div className="header__acoes">
        <button className="header__icone-btn" aria-label="Alternar tema" title="Alternar tema" onClick={alternarTema}>
          {temaEscuro ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
        </button>
        <div className="header__dropdown-wrap" ref={refNotificacoes}>
          <button className="header__icone-btn" aria-label="Notificações" onClick={() => setDropdownAberto(dropdownAberto === 'notificacoes' ? null : 'notificacoes')}>
            <NotificationsIcon fontSize="small" />{naoLidas > 0 && <span className="header__ponto" />}
          </button>
          <div className={`dropdown${dropdownAberto === 'notificacoes' ? ' aberto' : ''}`}>
            <div className="dropdown__titulo">Notificações</div>
            {notificacoes.length ? notificacoes.slice(0, 5).map((item) => (
              <button className="dropdown__item dropdown__item--button" key={item.id} onClick={() => { irParaPagina('notificacoes'); setDropdownAberto(null); }}>
                <span className="avatar sm avatar--placeholder">{item.actor?.display_name?.charAt(0) || '•'}</span>
                <span><span className="dropdown__item-texto">{notificationText(item)}</span></span>
              </button>
            )) : <p className="dropdown__vazio">Nenhuma notificação ainda.</p>}
          </div>
        </div>
        <div className="header__dropdown-wrap" ref={refPerfil}>
          <button className="header__perfil" onClick={() => setDropdownAberto(dropdownAberto === 'perfil' ? null : 'perfil')}>
            {profile?.avatar_url ? <img className="avatar" src={profile.avatar_url} alt={nome} /> : <span className="avatar avatar--placeholder">{inicial}</span>}
            <span className="header__perfil-texto"><span className="header__perfil-nome">{nome}</span><br /><span className="header__perfil-user">@{profile?.username || 'perfil'}</span></span>
            <span className="header__perfil-chevron">▾</span>
          </button>
          <div className={`dropdown${dropdownAberto === 'perfil' ? ' aberto' : ''}`}>
            <button className="dropdown__item dropdown__item--button" onClick={() => { irParaPagina('perfil'); setDropdownAberto(null); }}><PersonIcon fontSize="small" /> Ver perfil</button>
            <button className="dropdown__item dropdown__item--button" onClick={() => { irParaPagina('configuracoes'); setDropdownAberto(null); }}><SettingsIcon fontSize="small" /> Configurações</button>
            <button className="dropdown__item dropdown__item--button" onClick={() => { setDropdownAberto(null); aoSair(); }}><LogoutIcon fontSize="small" /> Sair</button>
          </div>
        </div>
      </div>
    </header>
  );
}
