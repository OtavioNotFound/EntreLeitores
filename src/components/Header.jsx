import { useEffect, useRef, useState } from 'react';
import { useClickOutside } from '../hooks/useClickOutside.js';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  AutoStoriesOutlined as StreakIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

export default function Header({ paginaAtual, irParaPagina, abrirSidebarMobile, temaEscuro, alternarTema, aoSair, profile, aoBuscar: executarBusca }) {
  const [dropdownAberto, setDropdownAberto] = useState(null);
  const [busca, setBusca] = useState('');
  const refPerfil = useRef(null);
  useClickOutside([refPerfil], () => setDropdownAberto(null), dropdownAberto !== null);
  useEffect(() => { setBusca(''); }, [paginaAtual]);

  function aoBuscar(evento) {
    if (evento.key === 'Enter' && busca.trim()) {
      executarBusca?.(busca.trim());
    }
  }

  const nome = profile?.display_name || 'Leitor';
  const inicial = nome.trim().charAt(0).toUpperCase() || 'L';
  const pesquisandoClubes = paginaAtual === 'comunidades';

  return (
    <header className="header">
      <button className="menu-mobile-toggle" aria-label="Abrir menu" onClick={abrirSidebarMobile}><MenuIcon /></button>
      <div className="header__busca">
        <span className="header__busca-icone"><SearchIcon fontSize="small" /></span>
        <input aria-label={pesquisandoClubes ? 'Pesquisar clubes' : 'Buscar livros'} type="search" placeholder={pesquisandoClubes ? 'Pesquisar clubes por nome, cidade ou descrição...' : 'Buscar livros por título ou autor...'} value={busca} onChange={(e) => setBusca(e.target.value)} onKeyDown={aoBuscar} />
      </div>
      <div className="header__acoes">
        <button className="header__icone-btn header__ofensiva-btn" aria-label="Ofensiva de livros" title="Ver minha Ofensiva de Leitura" onClick={() => irParaPagina('ofensiva')}>
          <StreakIcon fontSize="small" /><i aria-hidden="true" />
        </button>
        <button className="header__icone-btn" aria-label="Alternar tema" title="Alternar tema" onClick={alternarTema}>
          {temaEscuro ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
        </button>
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
