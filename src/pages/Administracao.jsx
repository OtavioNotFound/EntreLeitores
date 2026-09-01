import { useEffect, useState } from 'react';
import { AdminPanelSettingsOutlined as AdminIcon, UploadFileOutlined as UploadIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { createBook, getBooks, uploadReadingFile } from '../services/social.js';

export default function Administracao() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', cover_url: '', genre: '', page_count: '' });
  const [selectedBook, setSelectedBook] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profile?.is_admin) getBooks('', 0, 100).then(setBooks).catch((error) => toast(error.message)); }, [profile?.is_admin]);
  if (!profile?.is_admin) return <section className="pagina ativa"><div className="admin-bloqueado widget"><AdminIcon /><h1>Área de administração</h1><p>Sua conta ainda não tem acesso administrativo. Um administrador do projeto pode liberar a função pelo painel do Supabase.</p></div></section>;

  async function addBook(event) {
    event.preventDefault(); setSaving(true);
    try {
      const book = await createBook(user.id, { ...form, title: form.title.trim(), author: form.author.trim(), cover_url: form.cover_url.trim() || null, genre: form.genre.trim() || null, page_count: Number(form.page_count) || null });
      setBooks((current) => [book, ...current]); setSelectedBook(book.id); setForm({ title: '', author: '', cover_url: '', genre: '', page_count: '' }); toast('Livro criado no catálogo.');
    } catch (error) { toast(error.message); } finally { setSaving(false); }
  }

  async function sendFile(event) {
    event.preventDefault(); if (!selectedBook || !file) return toast('Escolha o livro e o arquivo.'); setSaving(true);
    try { await uploadReadingFile(user.id, selectedBook, file); setFile(null); event.target.reset(); toast('Material de leitura enviado.'); }
    catch (error) { toast(error.message); } finally { setSaving(false); }
  }

  return <section className="pagina ativa admin-pagina"><div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Administração</h1><p className="pagina-cabecalho__sub">Cadastre títulos e materiais de leitura que você tem autorização para distribuir.</p></div></div><div className="admin-grid"><form className="widget livro-form" onSubmit={addBook}><h2>Novo livro</h2><label>Título<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Autor<input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></label><label>Gênero<input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} /></label><label>Páginas<input type="number" min="1" value={form.page_count} onChange={(e) => setForm({ ...form, page_count: e.target.value })} /></label><label>URL da capa<input type="url" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} /></label><button className="btn-primario" disabled={saving}>Criar livro</button></form><form className="widget admin-arquivo" onSubmit={sendFile}><UploadIcon /><h2>Material de leitura</h2><p>PDF ou EPUB de até 20 MB. Envie apenas conteúdo próprio, licenciado ou de domínio público.</p><label>Livro<select required value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)}><option value="">Escolha um livro</option>{books.map((book) => <option key={book.id} value={book.id}>{book.title} — {book.author}</option>)}</select></label><label>Arquivo<input required type="file" accept="application/pdf,.pdf,application/epub+zip,.epub" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label><button className="btn-primario" disabled={saving}>Enviar material</button></form></div></section>;
}
