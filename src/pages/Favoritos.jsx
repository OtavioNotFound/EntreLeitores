import { MenuBook as BookIcon } from '@mui/icons-material';

export default function Favoritos() {
  return (
    <section className="pagina ativa" id="pagina-favoritos">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Favoritos</h1><p className="pagina-cabecalho__sub">Posts e livros que você salvou.</p></div></div>
      <div className="biblioteca__grid">
        <div className="livro-card">
          <div className="livro-card__capa"><BookIcon /></div>
          <div className="livro-card__corpo"><div className="livro-card__titulo">A Hora da Estrela</div><div className="livro-card__autor">Clarice Lispector</div></div>
        </div>
      </div>
    </section>
  );
}
