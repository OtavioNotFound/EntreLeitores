import {
  Home as HomeIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  MenuBook as BookIcon,
  Forum as ForumIcon,
  Favorite as FavoriteIcon,
  EmojiEvents as TrophyIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Headphones as HeadphonesIcon,
  ShoppingCart as ShoppingCartIcon,
  PlayArrow as PlayIcon,
  SendSharp as SendSharpIcon,
  Edit as EditIcon,
  AutoAwesome as SparkIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';

// Dados fictícios extraídos do index.html original — usados para popular os componentes React.
export const postsIniciais = [
  {
    id: 'post-1',
    autor: 'Mariana Souza',
    usuario: '@mariana.s',
    tempo: 'há 23 min',
    avatar: '/img/assets/avatar-1.svg',
    tag: { texto: 'Resenha', classe: 'post__tag--resenha' },
    texto: 'Acabei de terminar "O Alquimista" pela terceira vez e cada releitura me traz uma nova perspectiva. A jornada de Santiago é um espelho da nossa própria busca por significado. Altamente recomendo para quem ainda não leu! ✨',
    livro: { titulo: 'O Alquimista', autor: 'Paulo Coelho' },
    curtidas: 142,
    comentarios: 38,
  },
  {
    id: 'post-2',
    autor: 'Rafael Lima',
    usuario: '@rafaellima',
    tempo: 'há 1h',
    avatar: '/img/assets/avatar-2.svg',
    tag: { texto: 'Citação', classe: 'post__tag--citacao' },
    texto: '"Não chores porque acabou, sorri porque aconteceu." — Clarice Lispector em A Hora da Estrela. Essa frase me acompanha em cada livro que termino. Que escritora incrível! 💙',
    curtidas: 97,
    comentarios: 16,
  },
  {
    id: 'post-3',
    autor: 'Clube Ficção Científica',
    usuario: '@clube.ficcao',
    tempo: 'há 3h',
    avatar: '/img/assets/avatar-3.svg',
    tag: { texto: 'Enquete', classe: 'post__tag--enquete' },
    texto: 'Qual universo distópico vocês achariam mais assustador de viver? Vamos discutir no encontro de sexta! 🚀',
    curtidas: 64,
    comentarios: 52,
  },
];

export const plataformas = [
  { icone: HeadphonesIcon, titulo: 'Kindle', sub: 'Sua biblioteca Amazon' },
  { icone: ShoppingCartIcon, titulo: 'Amazon', sub: 'Comprar novos livros' },
  { icone: PlayIcon, titulo: 'Google Play Livros', sub: 'Sincronizar leituras' },
];

export const ranking = [
  { numero: 1, titulo: 'Flores para Algernon', autor: 'Daniel Keyes', comentarios: 312 },
  { numero: 2, titulo: 'O Nome do Vento', autor: 'Patrick Rothfuss', comentarios: 278 },
  { numero: 3, titulo: 'Sapiens', autor: 'Yuval Noah Harari', comentarios: 241 },
];

export const livrosExplorar = [
  { id: 'duna', capaIcon: BookIcon, titulo: 'Duna', autor: 'Frank Herbert', nota: '★ 4.8' },
  { id: '1984', capaIcon: BookIcon, titulo: '1984', autor: 'George Orwell', nota: '★ 4.9' },
  { id: 'sapiens', capaIcon: BookIcon, titulo: 'Sapiens', autor: 'Yuval Noah Harari', nota: '★ 4.7' },
  { id: 'nome-vento', capaIcon: BookIcon, titulo: 'O Nome do Vento', autor: 'Patrick Rothfuss', nota: '★ 4.9' },
  { id: 'hora-estrela', capaIcon: BookIcon, titulo: 'A Hora da Estrela', autor: 'Clarice Lispector', nota: '★ 4.6' },
  { id: 'algernon', capaIcon: BookIcon, titulo: 'Flores para Algernon', autor: 'Daniel Keyes', nota: '★ 4.8' },
];

export const comunidades = [
  { icone: BookIcon, cor: 'azul', membros: '1.240 membros', titulo: 'Clube Ficção Científica', desc: 'Discussões semanais sobre distopias, space opera e ficção especulativa.' },
  { icone: EditIcon, cor: 'amarelo', membros: '856 membros', titulo: 'Clássicos Brasileiros', desc: 'De Machado de Assis a Clarice Lispector, um clube dedicado à literatura nacional.' },
  { icone: SparkIcon, cor: 'azul', membros: '2.310 membros', titulo: 'Fantasia Épica', desc: 'Sagas, reinos e magia — para fãs de mundos construídos com riqueza de detalhes.' },
];

export const biblioteca = [
  { id: 'metamorfose', titulo: 'A Metamorfose', autor: 'Franz Kafka', capaIcon: BookIcon, status: 'lendo', progresso: 68 },
  { id: 'duna', titulo: 'Duna', autor: 'Frank Herbert', capaIcon: BookIcon, status: 'lendo', progresso: 32 },
  { id: 'alquimista', titulo: 'O Alquimista', autor: 'Paulo Coelho', capaIcon: BookIcon, status: 'lidos', nota: '★ 5.0' },
  { id: 'sapiens', titulo: 'Sapiens', autor: 'Yuval Noah Harari', capaIcon: BookIcon, status: 'quero-ler' },
  { id: 'hora-estrela', titulo: 'A Hora da Estrela', autor: 'Clarice Lispector', capaIcon: BookIcon, status: 'favoritos', nota: '★ 4.9' },
  { id: 'guerra-paz', titulo: 'Guerra e Paz', autor: 'Liev Tolstói', capaIcon: BookIcon, status: 'abandonados' },
];

export const abasBiblioteca = [
  { categoria: 'todos', label: 'Todos' },
  { categoria: 'lendo', label: 'Lendo' },
  { categoria: 'quero-ler', label: 'Quero Ler' },
  { categoria: 'lidos', label: 'Lidos' },
  { categoria: 'favoritos', label: 'Favoritos' },
  { categoria: 'abandonados', label: 'Abandonados' },
  { categoria: 'colecoes', label: 'Coleções' },
];

export const lojasLivroDetalhe = [
  { icone: ShoppingCartIcon, titulo: 'Amazon', sub: 'R$ 34,90' },
  { icone: HeadphonesIcon, titulo: 'Kindle', sub: 'R$ 19,90' },
  { icone: PlayIcon, titulo: 'Google Play Livros', sub: 'R$ 22,90' },
  { icone: BookIcon, titulo: 'Bibliotecas parceiras', sub: 'Empréstimo grátis' },
];

export const discussoes = [
  { avatar: '/img/assets/avatar-3.svg', autor: 'Clube Ficção Científica', meta: '42 respostas', texto: 'Qual o melhor plot twist da ficção científica? Defenda seu voto! 🚀' },
  { avatar: '/img/assets/avatar-2.svg', autor: 'Rafael Lima', meta: '17 respostas', texto: 'Alguém mais acha que o final de "1984" deveria ter sido diferente?' },
];

export const conquistas = [
  { icone: TrophyIcon, titulo: 'Leitor Voraz' },
  { icone: FireIcon, titulo: 'Sequência de 30 dias' },
  { icone: BookIcon, titulo: '10 gêneros lidos' },
  { icone: EditIcon, titulo: 'Primeira resenha' },
];

export const eventos = [
  { data: 'Sexta-feira, 19h', titulo: 'Encontro Clube Ficção Científica', dataIcon: BookIcon },
  { data: 'Sábado, 10h', titulo: 'Sarau de poesia — Clássicos BR', dataIcon: BookIcon },
];

export const notificacoes = [
  { icone: FavoriteIcon, texto: 'Mariana Souza curtiu sua resenha', tempo: 'há 23 min', destaque: 'Mariana Souza' },
  { icone: ForumIcon, texto: 'Rafael Lima comentou na sua citação', tempo: 'há 1h', destaque: 'Rafael Lima' },
  { icone: TrophyIcon, texto: 'Você desbloqueou a conquista "Leitor Voraz"', tempo: 'há 5h', destaque: null },
];

export const mensagens = [
  { avatar: '/img/assets/avatar-1.svg', texto: 'Já terminou o livro?', destaque: 'Rafael Lima:', tempo: 'há 12 min' },
  { avatar: '/img/assets/avatar-2.svg', texto: 'Novo encontro marcado', destaque: 'Clube Ficção:', tempo: 'há 2h' },
];

export const graficoBarras = [40, 65, 50, 85, 60, 95];

export const estatisticasPerfil = [
  { label: 'Livros', valor: 87 },
  { label: 'Seguidores', valor: 1240 },
  { label: 'Seguindo', valor: 312 },
  { label: 'Posts', valor: 98 },
];

export const dashboardPerfil = [
  { legenda: 'Livros lidos', titulo: '24' },
  { legenda: 'Páginas', titulo: '6.482' },
  { legenda: 'Horas de leitura', titulo: '142h' },
  { legenda: 'Sequência atual', titulo: '30 dias', tituloIcon: FireIcon }
];

export const abasPerfil = [
  { painel: 'dashboard', label: 'Dashboard' },
  { painel: 'conquistas', label: 'Conquistas' },
  { painel: 'posts', label: 'Posts' },
];

export const itensMenu = [
  { pagina: 'inicio', icone: HomeIcon, label: 'Início' },
  { pagina: 'explorar', icone: SearchIcon, label: 'Explorar' },
  { pagina: 'comunidades', icone: GroupIcon, label: 'Comunidades' },
  { pagina: 'biblioteca', icone: BookIcon, label: 'Biblioteca' },
  { pagina: 'discussoes', icone: ForumIcon, label: 'Discussões' },
  { pagina: 'resenhas', icone: SendSharpIcon, label: 'Resenhas' },
  { pagina: 'favoritos', icone: FavoriteIcon, label: 'Favoritos' },
  { pagina: 'desafios', icone: TrophyIcon, label: 'Desafios' },
  { pagina: 'eventos', icone: BookIcon, label: 'Eventos' },
  { pagina: 'notificacoes', icone: NotificationsIcon, label: 'Notificações', contador: 4 },
  { pagina: 'perfil', icone: PersonIcon, label: 'Perfil' },
  { pagina: 'configuracoes', icone: SettingsIcon, label: 'Configurações' },
];

export const canais = [
  { nome: '# geral', contador: 12 },
  { nome: '# leituras-atuais', contador: 5 },
  { nome: '# indicações', contador: 23 },
  { nome: '# citações', contador: 8 },
  { nome: '# autores', contador: 3 },
  { nome: '# eventos', contador: 1 },
];

export const linksHeader = [
  { pagina: 'biblioteca', label: 'Biblioteca' },
  { pagina: 'comunidades', label: 'Clube do Livro' },
  { pagina: 'discussoes', label: 'Discussões' },
  { pagina: 'biblioteca', label: 'Estante' },
  { pagina: 'explorar', label: 'Conteúdos' },
];
