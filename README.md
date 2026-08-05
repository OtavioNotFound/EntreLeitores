# Entre Leitores — versão React

Conversão do site original (HTML + CSS + JavaScript puro) do repositório
[jobbsoon/entre-leitores](https://github.com/jobbsoon/entre-leitores) para
**React + Vite**.

## O que mudou

Toda a lógica que antes estava em `js/app.js`, `sidebar.js`, `feed.js`,
`perfil.js`, `livros.js`, `modal.js`, `storage.js` e `utils.js` foi
reescrita em componentes e hooks do React:

| Original (JS puro)              | Agora (React)                                   |
|----------------------------------|--------------------------------------------------|
| `Sidebar` (módulo IIFE)          | `src/components/Sidebar.jsx` + estado no `App.jsx` |
| `App.iniciarDropdown`            | `src/components/Header.jsx` (`useState` + `useClickOutside`) |
| `App.iniciarTema` / `Storage`    | `src/hooks/useLocalStorage.js` (persiste no localStorage) |
| `Feed.alternarCurtida/Salvar`    | `src/components/Post.jsx` (`useConjuntoStorage`) |
| `Feed.criarNovoPost`             | `src/components/Compositor.jsx` + estado em `Inicio.jsx` |
| `Perfil.animarContador`          | `src/components/AnimatedNumber.jsx` |
| `Toast.mostrar` / `Modal`        | `src/components/Toast.jsx` (Context Provider) |
| Navegação entre `<section class="pagina">` | Roteamento simples por estado (`paginaAtual`) em `App.jsx`, com uma página React em `src/pages/*` para cada seção |

Todo o CSS original (`css/*.css`) foi mantido sem alterações — está em
`src/css/`. Os avatares SVG estão em `public/img/assets/`.

## Como rodar

```bash
npm install
npm run dev       # ambiente de desenvolvimento (http://localhost:5173)
npm run build     # gera a versão de produção em dist/
npm run preview   # serve a build de produção localmente
```

## Estrutura

```
src/
  App.jsx                 # estado global: página atual, tema, sidebar
  main.jsx                # ponto de entrada, importa os CSS
  components/
    Sidebar.jsx
    Header.jsx
    Post.jsx
    Compositor.jsx
    AnimatedNumber.jsx
    Toast.jsx
  pages/
    Inicio.jsx, Explorar.jsx, Comunidades.jsx, Biblioteca.jsx,
    LivroDetalhe.jsx, Discussoes.jsx, Resenhas.jsx, Favoritos.jsx,
    Desafios.jsx, Eventos.jsx, Notificacoes.jsx, Perfil.jsx,
    Configuracoes.jsx
  hooks/
    useLocalStorage.js     # substitui Storage.definir/obter
    useClickOutside.js     # substitui fecharAoClicarFora
  data/
    mockData.js            # todo o conteúdo fictício (posts, livros, etc.)
  css/                      # os mesmos arquivos .css do projeto original
```

## Funcionalidades preservadas

- Alternar tema claro/escuro (persistido)
- Recolher/expandir sidebar e menu mobile (persistido)
- Navegação entre todas as páginas, com destaque do item ativo na sidebar e no header
- Dropdowns de mensagens, notificações e perfil (fecham ao clicar fora)
- Curtir e salvar posts (persistido por post)
- Compositor de posts com abas (Publicar/Resenha/Citação/Enquete) e publicação de novos posts no topo do feed
- Filtros do feed, abas da biblioteca (com busca) e abas do perfil
- Contadores animados e gráfico de barras do dashboard do perfil
- Sistema de notificações "toast"
