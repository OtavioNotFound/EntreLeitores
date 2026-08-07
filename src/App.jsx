import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import Inicio from './pages/Inicio.jsx';
import Explorar from './pages/Explorar.jsx';
import Comunidades from './pages/Comunidades.jsx';
import Biblioteca from './pages/Biblioteca.jsx';
import LivroDetalhe from './pages/LivroDetalhe.jsx';
import Notificacoes from './pages/Notificacoes.jsx';
import Perfil from './pages/Perfil.jsx';
import Configuracoes from './pages/Configuracoes.jsx';
import Login from './pages/Login.jsx';

function AppInterno() {
  const { user, profile, loading, signOut } = useAuth();
  const [paginaAtual, setPaginaAtual] = useLocalStorage('paginaAtual', 'inicio');
  const [sidebarRecolhida, setSidebarRecolhida] = useLocalStorage('sidebarRecolhida', false);
  const [temaEscuro, setTemaEscuro] = useLocalStorage('tema', 'claro');
  const [sidebarMobileAberta, setSidebarMobileAberta] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [perfilSelecionadoId, setPerfilSelecionadoId] = useState(null);
  const [buscaGlobal, setBuscaGlobal] = useState('');

  const escuro = temaEscuro === 'escuro';

  // Aplica a classe de tema escuro no <body>, equivalente ao App.iniciarTema() original
  useEffect(() => {
    document.body.classList.toggle('tema-escuro', escuro);
  }, [escuro]);

  if (loading) return <div className="app-loading"><span className="loading-spinner" />Conectando ao Entre Leitores...</div>;
  if (!user) return <Login />;

  function irParaPagina(nomePagina) {
    if (nomePagina === 'perfil') setPerfilSelecionadoId(user.id);
    setPaginaAtual(nomePagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.innerWidth <= 768) setSidebarMobileAberta(false);
  }

  function abrirPerfil(profileId) {
    setPerfilSelecionadoId(profileId || user.id);
    setPaginaAtual('perfil');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function abrirLivro(livro) {
    setLivroSelecionado(livro);
    irParaPagina('livro');
  }

  function alternarTema() {
    setTemaEscuro(escuro ? 'claro' : 'escuro');
  }

  const paginas = {
    inicio: <Inicio aoAbrirLivro={abrirLivro} aoAbrirPerfil={abrirPerfil} aoAbrirClubes={() => irParaPagina('comunidades')} />,
    explorar: <Explorar aoAbrirLivro={abrirLivro} buscaInicial={buscaGlobal} />,
    comunidades: <Comunidades />,
    biblioteca: <Biblioteca aoAbrirLivro={abrirLivro} />,
    livro: <LivroDetalhe livro={livroSelecionado} />,
    notificacoes: <Notificacoes />,
    perfil: <Perfil profileId={perfilSelecionadoId || user.id} aoAbrirLivro={abrirLivro} />,
    configuracoes: <Configuracoes alternarTema={alternarTema} />,
  };

  return (
    <div className={`app${sidebarRecolhida ? ' sidebar-recolhida' : ''}`}>
      <Sidebar
        paginaAtual={paginaAtual}
        irParaPagina={irParaPagina}
        recolhida={sidebarRecolhida}
        alternarRecolhida={() => setSidebarRecolhida((v) => !v)}
        aberta={sidebarMobileAberta}
        fecharMobile={() => setSidebarMobileAberta(false)}
        userId={user.id}
        aoBuscar={(termo) => { setBuscaGlobal(termo); irParaPagina('explorar'); }}
      />

      <Header
        paginaAtual={paginaAtual}
        irParaPagina={irParaPagina}
        abrirSidebarMobile={() => setSidebarMobileAberta(true)}
        temaEscuro={escuro}
        alternarTema={alternarTema}
        aoSair={signOut}
        profile={profile}
        userId={user.id}
      />

      <main className="conteudo-principal">
        {paginas[paginaAtual] ?? paginas.inicio}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppInterno />
      </AuthProvider>
    </ToastProvider>
  );
}
