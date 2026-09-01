import {
  Home as HomeIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  MenuBook as BookIcon,
  AutoStories as StreakIcon,
  AdminPanelSettings as AdminIcon,
  WorkspacePremium as OwnerIcon,
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';

export const itensMenu = [
  { pagina: 'inicio', icone: HomeIcon, label: 'Início' },
  { pagina: 'explorar', icone: SearchIcon, label: 'Explorar' },
  { pagina: 'comunidades', icone: GroupIcon, label: 'Clubes' },
  { pagina: 'biblioteca', icone: BookIcon, label: 'Estante' },
  { pagina: 'ofensiva', icone: StreakIcon, label: 'Ofensiva de livros' },
  { pagina: 'conquistas', icone: TrophyIcon, label: 'Conquistas' },
  { pagina: 'administracao', icone: AdminIcon, label: 'Administração', adminOnly: true },
  { pagina: 'dono', icone: OwnerIcon, label: 'Área do dono', ownerOnly: true },
  { pagina: 'perfil', icone: PersonIcon, label: 'Perfil' },
];

export const abasBiblioteca = [
  { categoria: 'todos', label: 'Todos' },
  { categoria: 'lendo', label: 'Lendo' },
  { categoria: 'pausados', label: 'Pausados' },
  { categoria: 'quero-ler', label: 'Quero ler' },
  { categoria: 'lidos', label: 'Lidos' },
  { categoria: 'favoritos', label: 'Favoritos' },
  { categoria: 'abandonados', label: 'Abandonados' },
];
