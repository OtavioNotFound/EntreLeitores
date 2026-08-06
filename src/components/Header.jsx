import { useRef, useState } from 'react';
import { linksHeader, mensagens, notificacoes } from '../data/mockData.js';
import { useClickOutside } from '../hooks/useClickOutside.js';
import { useToast } from './Toast.jsx';
import { Menu as MenuIcon, Search as SearchIcon, LightMode as LightIcon, DarkMode as DarkIcon, ChatBubble as ChatIcon, Notifications as NotificationsIcon, Person as PersonIcon, Settings as SettingsIcon, Logout as LogoutIcon } from '@mui/icons-material';

export default function Header({ paginaAtual, irParaPagina, abrirSidebarMobile, temaEscuro, alternarTema, aoSair }) {
  const mostrarToast = useToast();
  const [dropdownAberto, setDropdownAberto] = useState(null); // 'mensagens' | 'notificacoes' | 'perfil' | null
  const [busca, setBusca] = useState('');

  const refMensagens = useRef(null);
  const refNotificacoes = useRef(null);
  const refPerfil = useRef(null);

  useClickOutside(
    [refMensagens, refNotificacoes, refPerfil],
    () => setDropdownAberto(null),
    dropdownAberto !== null
  );

  function alternarDropdown(nome) {
    setDropdownAberto((atual) => (atual === nome ? null : nome));
  }

  function aoBuscar(evento) {
    if (evento.key === 'Enter' && busca.trim()) {
      mostrarToast(`Buscando por "${busca.trim()}"...`);
    }
  }

  return (
    <header className="header">
      <button className="menu-mobile-toggle" aria-label="Abrir menu" onClick={abrirSidebarMobile}><MenuIcon /></button>

      <nav className="header__nav">
        {linksHeader.map((link, i) => (
          <a
            key={i}
            href="#"
            className={`header__link${paginaAtual === link.pagina ? ' ativo' : ''}`}
            onClick={(e) => { e.preventDefault(); irParaPagina(link.pagina); }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="header__busca">
        <span className="header__busca-icone"><SearchIcon fontSize="small" /></span>
        <input
          type="search"
          placeholder="Buscar livros, autores..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={aoBuscar}
        />
      </div>

      <div className="header__acoes">
        <button className="header__icone-btn" title="Alternar tema" onClick={alternarTema}>
          {temaEscuro ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
        </button>

        <div style={{ position: 'relative' }} ref={refMensagens}>
          <button className="header__icone-btn" onClick={() => alternarDropdown('mensagens')}><ChatIcon fontSize="small" /></button>
          <div className={`dropdown${dropdownAberto === 'mensagens' ? ' aberto' : ''}`}>
            <div className="dropdown__titulo">Mensagens</div>
            {mensagens.map((m, i) => (
              <div className="dropdown__item" key={i}>
                <img className="avatar sm" src={m.avatar} alt="" />
                <div>
                  <div className="dropdown__item-texto"><strong>{m.destaque}</strong> {m.texto}</div>
                  <div className="dropdown__item-tempo">{m.tempo}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }} ref={refNotificacoes}>
          <button className="header__icone-btn" onClick={() => alternarDropdown('notificacoes')}>
            <NotificationsIcon fontSize="small" /><span className="header__ponto" />
          </button>
          <div className={`dropdown${dropdownAberto === 'notificacoes' ? ' aberto' : ''}`}>
            <div className="dropdown__titulo">Notificações</div>
            {notificacoes.map((n, i) => (
              <div className="dropdown__item" key={i}>
                {(() => {
                  const IconeComponente = n.icone;
                  return IconeComponente ? <span className="badge-emoji"><IconeComponente /></span> : null;
                })()}
                <div>
                  <div className="dropdown__item-texto">
                    {n.destaque ? <><strong>{n.destaque}</strong> {n.texto.replace(n.destaque, '').trim()}</> : n.texto}
                  </div>
                  <div className="dropdown__item-tempo">{n.tempo}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }} ref={refPerfil}>
          <button className="header__perfil" onClick={() => alternarDropdown('perfil')}>
            <img className="avatar" src="/img/assets/avatar-usuario.svg" alt="Ana Clara" />
            <span className="header__perfil-texto">
              <span className="header__perfil-nome">Ana Clara</span><br />
              <span className="header__perfil-user">@anaclara</span>
            </span>
            <span className="header__perfil-chevron">▾</span>
          </button>
          <div className={`dropdown${dropdownAberto === 'perfil' ? ' aberto' : ''}`}>
            <div className="dropdown__item" onClick={() => { irParaPagina('perfil'); setDropdownAberto(null); }}><PersonIcon fontSize="small" /> Ver perfil</div>
            <div className="dropdown__item" onClick={() => { irParaPagina('configuracoes'); setDropdownAberto(null); }}><SettingsIcon fontSize="small" /> Configurações</div>
            <div
              className="dropdown__item"
              onClick={() => { setDropdownAberto(null); aoSair?.(); }}
            >
              <LogoutIcon fontSize="small" /> Sair
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
