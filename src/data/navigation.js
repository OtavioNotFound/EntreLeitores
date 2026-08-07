import {
  Home as HomeIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  MenuBook as BookIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

export const itensMenu = [
  { pagina: 'inicio', icone: HomeIcon, label: 'Início' },
  { pagina: 'explorar', icone: SearchIcon, label: 'Explorar' },
  { pagina: 'comunidades', icone: GroupIcon, label: 'Clubes' },
  { pagina: 'biblioteca', icone: BookIcon, label: 'Estante' },
  { pagina: 'notificacoes', icone: NotificationsIcon, label: 'Notificações' },
  { pagina: 'perfil', icone: PersonIcon, label: 'Perfil' },
];

export const abasBiblioteca = [
  { categoria: 'todos', label: 'Todos' },
  { categoria: 'lendo', label: 'Lendo' },
  { categoria: 'quero-ler', label: 'Quero ler' },
  { categoria: 'lidos', label: 'Lidos' },
  { categoria: 'favoritos', label: 'Favoritos' },
  { categoria: 'abandonados', label: 'Abandonados' },
];
