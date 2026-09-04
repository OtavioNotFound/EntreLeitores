import { useEffect, useState } from 'react';
import { ArrowBackOutlined as BackIcon, AutoStoriesOutlined as ReaderIcon } from '@mui/icons-material';
import EmptyState from '../components/EmptyState.jsx';
import ReadingExperience from '../components/ReadingExperience.jsx';
import ReadingNotebook from '../components/ReadingNotebook.jsx';
import { useToast } from '../components/Toast.jsx';
import { getBookById, getBookReadingFiles } from '../services/social.js';

export default function ReadingMode({ bookId, initialBook, onBack, onBookLoaded }) {
  const toast = useToast();
  const [book, setBook] = useState(initialBook?.id === bookId ? initialBook : null);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(Number(initialBook?.progress) || 0);
  const [notebookPage, setNotebookPage] = useState(1);
  const [notebookRevision, setNotebookRevision] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([getBookById(bookId), getBookReadingFiles(bookId)])
      .then(([loadedBook, readingFiles]) => { const completeBook = { ...loadedBook, ...(initialBook?.id === bookId ? initialBook : {}) }; setBook(completeBook); setFiles(readingFiles); onBookLoaded?.(completeBook); })
      .catch((error) => toast(error.message))
      .finally(() => setLoading(false));
  }, [bookId, toast, initialBook?.id, onBookLoaded]);

  if (loading) return <section className="pagina ativa modo-leitura-pagina"><div className="skeleton-card skeleton-card--alto" /></section>;
  if (!bookId || !book) return <section className="pagina ativa modo-leitura-pagina"><EmptyState icon={<ReaderIcon />} title="Leitura indisponível" description="Abra novamente o livro pela sua estante ou pelo catálogo." /></section>;

  return <section className="pagina ativa modo-leitura-pagina">
    <header className="modo-leitura__cabecalho"><button type="button" className="btn-secundario" onClick={onBack}><BackIcon fontSize="small" />Voltar ao livro</button><div><span>LEITOR</span><h1>{book.title}</h1><p>{book.author}</p></div></header>
    <ReadingExperience key={book.id} bookId={book.id} bookTitle={book.title} files={files} pageFromNotebook={notebookPage} onAnnotationSaved={() => setNotebookRevision((value) => value + 1)} onProgressChange={setProgress} />
    <ReadingNotebook bookId={book.id} currentProgress={progress} onGoToPage={setNotebookPage} revision={notebookRevision} />
  </section>;
}
