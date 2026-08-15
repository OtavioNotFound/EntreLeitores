import { lazy, Suspense, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import PageErrorBoundary from './components/PageErrorBoundary.jsx';

const Inicio = lazy(() => import('./pages/Inicio.jsx'));
const Explorar = lazy(() => import('./pages/Explorar.jsx'));
const Comunidades = lazy(() => import('./pages/Comunidades.jsx'));
const Biblioteca = lazy(() => import('./pages/Biblioteca.jsx'));
const LivroDetalhe = lazy(() => import('./pages/LivroDetalhe.jsx'));
const Notificacoes = lazy(() => import('./pages/Notificacoes.jsx'));
const Perfil = lazy(() => import('./pages/Perfil.jsx'));
const Configuracoes = lazy(() => import('./pages/Configuracoes.jsx'));
const Conquistas = lazy(() => import('./pages/Conquistas.jsx'));
const Pessoas = lazy(() => import('./pages/Pessoas.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));

function AppInterno() {
  const { user, profile, loading, signOut } = useAuth();
  const [paginaAtual, setPaginaAtual] = useLocalStorage('paginaAtual', 'inicio');
  const [sidebarRecolhida, setSidebarRecolhida] = useLocalStorage('sidebarRecolhida', false);
  const [temaEscuro, setTemaEscuro] = useLocalStorage('tema', 'claro');
  const [sidebarMobileAberta, setSidebarMobileAberta] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useLocalStorage('livroSelecionado', null);
  const [perfilSelecionadoId, setPerfilSelecionadoId] = useState(null);
  const [buscaGlobal, setBuscaGlobal] = useState('');

  const escuro = temaEscuro === 'escuro';

  // Aplica a classe de tema escuro no <body>, equivalente ao App.iniciarTema() original
  useEffect(() => {
    document.body.classList.toggle('tema-escuro', escuro);
  }, [escuro]);
  useEffect(() => {
    const syncHash = () => { const page = window.location.hash.replace('#/', '').split('/')[0]; if (page) setPaginaAtual(page); };
    syncHash(); window.addEventListener('hashchange', syncHash); return () => window.removeEventListener('hashchange', syncHash);
  }, [setPaginaAtual]);

  if (loading) return <div className="app-loading"><span className="loading-spinner" />Conectando ao Entre Leitores...</div>;
  if (!user) return <Suspense fallback={<div className="app-loading"><span className="loading-spinner" /></div>}><Login /></Suspense>;

  function irParaPagina(nomePagina) {
    if (nomePagina === 'perfil') setPerfilSelecionadoId(user.id);
    setPaginaAtual(nomePagina);
    window.location.hash = `/${nomePagina}`;
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
    inicio: <Inicio aoAbrirLivro={abrirLivro} aoAbrirPerfil={abrirPerfil} aoAbrirClubes={() => irParaPagina('comunidades')} aoConhecerPessoas={() => irParaPagina('pessoas')} />,
    explorar: <Explorar aoAbrirLivro={abrirLivro} buscaInicial={buscaGlobal} />,
    comunidades: <Comunidades />,
    biblioteca: <Biblioteca aoAbrirLivro={abrirLivro} />,
    conquistas: <Conquistas />,
    pessoas: <Pessoas aoAbrirPerfil={abrirPerfil} />,
    livro: <LivroDetalhe livro={livroSelecionado} aoAbrirLivro={abrirLivro} aoAbrirPerfil={abrirPerfil} />,
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
        <PageErrorBoundary key={paginaAtual}><Suspense fallback={<div className="pagina-carregando" aria-label="Carregando página"><span className="loading-spinner" /></div>}>{paginas[paginaAtual] ?? paginas.inicio}</Suspense></PageErrorBoundary>
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
