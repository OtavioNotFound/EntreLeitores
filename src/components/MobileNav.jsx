import { itensMenu } from '../data/navigation.js';

const paginasMobile = ['inicio', 'explorar', 'comunidades', 'biblioteca', 'perfil'];
const itensMobile = paginasMobile.map((pagina) => itensMenu.find((item) => item.pagina === pagina));

export default function MobileNav({ paginaAtual, irParaPagina }) {
  return (
    <nav className="mobile-nav" aria-label="Atalhos de navegação">
      {itensMobile.map(({ pagina, label, icone: Icone }) => (
        <button key={pagina} aria-current={paginaAtual === pagina ? 'page' : undefined} onClick={() => irParaPagina(pagina)}>
          <Icone fontSize="small" /><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
