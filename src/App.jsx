import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';

import Inicio from './pages/Inicio.jsx';
import Explorar from './pages/Explorar.jsx';
import Comunidades from './pages/Comunidades.jsx';
import Biblioteca from './pages/Biblioteca.jsx';
import LivroDetalhe from './pages/LivroDetalhe.jsx';
import Discussoes from './pages/Discussoes.jsx';
import Resenhas from './pages/Resenhas.jsx';
import Favoritos from './pages/Favoritos.jsx';
import Desafios from './pages/Desafios.jsx';
import Eventos from './pages/Eventos.jsx';
import Notificacoes from './pages/Notificacoes.jsx';
import Perfil from './pages/Perfil.jsx';
import Configuracoes from './pages/Configuracoes.jsx';
import Login from './pages/Login.jsx';

function AppInterno() {
  const [autenticado, setAutenticado] = useLocalStorage('autenticado', false);
  const [paginaAtual, setPaginaAtual] = useLocalStorage('paginaAtual', 'inicio');
  const [sidebarRecolhida, setSidebarRecolhida] = useLocalStorage('sidebarRecolhida', false);
  const [temaEscuro, setTemaEscuro] = useLocalStorage('tema', 'claro');
  const [sidebarMobileAberta, setSidebarMobileAberta] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);

  const escuro = temaEscuro === 'escuro';

  // Aplica a classe de tema escuro no <body>, equivalente ao App.iniciarTema() original
  useEffect(() => {
    document.body.classList.toggle('tema-escuro', escuro);
  }, [escuro]);

  function aoLogar() {
    setAutenticado(true);
    setPaginaAtual('inicio');
  }

  function sair() {
    setAutenticado(false);
  }

  if (!autenticado) {
    return <Login aoLogar={aoLogar} />;
  }

  function irParaPagina(nomePagina) {
    setPaginaAtual(nomePagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.innerWidth <= 768) setSidebarMobileAberta(false);
  }

  function abrirLivro(livro) {
    setLivroSelecionado(livro);
    irParaPagina('livro');
  }

  function alternarTema() {
    setTemaEscuro(escuro ? 'claro' : 'escuro');
  }

  const paginas = {
    inicio: <Inicio aoAbrirLivro={abrirLivro} />,
    explorar: <Explorar aoAbrirLivro={abrirLivro} />,
    comunidades: <Comunidades />,
    biblioteca: <Biblioteca aoAbrirLivro={abrirLivro} />,
    livro: <LivroDetalhe livro={livroSelecionado} />,
    discussoes: <Discussoes />,
    resenhas: <Resenhas />,
    favoritos: <Favoritos />,
    desafios: <Desafios />,
    eventos: <Eventos />,
    notificacoes: <Notificacoes />,
    perfil: <Perfil />,
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
      />

      <Header
        paginaAtual={paginaAtual}
        irParaPagina={irParaPagina}
        abrirSidebarMobile={() => setSidebarMobileAberta(true)}
        temaEscuro={escuro}
        alternarTema={alternarTema}
        aoSair={sair}
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
      <AppInterno />
    </ToastProvider>
  );
}
