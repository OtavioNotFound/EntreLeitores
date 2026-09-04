import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { AutoStoriesOutlined as ReaderIcon, BookmarkAddOutlined as BookmarkIcon, ChevronLeft, ChevronRight, FormatSizeOutlined as FontIcon, GridViewOutlined as GridIcon, LockOutlined as LockIcon, PaletteOutlined as PaletteIcon, SettingsOutlined as SettingsIcon, StickyNote2Outlined as NoteIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { getReadingFileUrl, recordReaderEvent, saveAutomaticReadingProgress, saveReadingNote } from '../services/social.js';
import { useToast } from './Toast.jsx';
import PdfPageCanvas from './PdfPageCanvas.jsx';

GlobalWorkerOptions.workerSrc = workerUrl;
const themes = [{ id:'day', label:'Dia' }, { id:'night', label:'Noite' }, { id:'contrast', label:'Noite contrastada' }, { id:'sepia', label:'Sépia' }, { id:'sepiaContrast', label:'Sépia contrastada' }, { id:'custom', label:'Personalizado' }];
const markerColors = [
  { id:'yellow', label:'Amarelo', hex:'#fde047' },
  { id:'green', label:'Verde', hex:'#86efac' },
  { id:'blue', label:'Azul', hex:'#93c5fd' },
  { id:'purple', label:'Roxo', hex:'#c4b5fd' },
  { id:'red', label:'Vermelho', hex:'#fca5a5' },
  { id:'orange', label:'Laranja', hex:'#fdba74' },
];
const defaults = { theme:'day', direction:'horizontal', fontSize:18, margin:42, marginLocked:false, page:1, customBackground:'#f8fafc', customText:'#1e1b4b' };

export default function ReadingExperience({ bookId, bookTitle, files, pageFromNotebook, onAnnotationSaved, onProgressChange }) {
  const { user } = useAuth();
  const toast = useToast();
  const storageKey = `reader-settings:${bookId}`;
  const [settings, setSettings] = useState(() => { try { return { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; } catch { return defaults; } });
  const [activeFileId, setActiveFileId] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [pdf, setPdf] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showPages, setShowPages] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState({ quote:'', content:'', color:'yellow' });
  const [selection, setSelection] = useState(null);
  const saveTimer = useRef(null);
  const pdfContainer = useRef(null);
  const didTrackResume = useRef(false);
  const activeFile = useMemo(() => files.find((file) => file.id === activeFileId) || files[0], [files, activeFileId]);
  const page = Math.max(1, Math.min(totalPages || 1, Number(settings.page) || 1));
  const progress = totalPages ? Math.round((page / totalPages) * 100) : 0;
  const scale = Math.max(.85, Math.min(1.8, settings.fontSize / 15));

  const track = useCallback((type, value = null) => {
    if (user?.id) recordReaderEvent(user.id, bookId, type, value).catch(() => {});
  }, [bookId, user?.id]);
  const update = useCallback((key, value, eventType = null) => {
    setSettings((current) => ({ ...current, [key]:value }));
    if (eventType) track(eventType, value);
  }, [track]);

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(settings)); }, [settings, storageKey]);
  useEffect(() => {
    if (!didTrackResume.current && Number(settings.page) > 1) { didTrackResume.current = true; track('resume', settings.page); }
  }, [settings.page, track]);
  useEffect(() => { if (pageFromNotebook) setSettings((current) => ({ ...current, page:Number(pageFromNotebook) })); }, [pageFromNotebook]);
  useEffect(() => {
    if (!activeFile) { setActiveUrl(''); return; }
    getReadingFileUrl(activeFile.file_path).then(setActiveUrl).catch((error) => toast(error.message));
  }, [activeFile?.id, toast]);
  useEffect(() => {
    if (!activeUrl || activeFile?.file_type !== 'pdf') { setPdf(null); setTotalPages(0); return undefined; }
    let cancelled = false;
    setLoadingPdf(true); setPdf(null); setTotalPages(0);
    const task = getDocument(activeUrl);
    task.promise.then((document) => { if (!cancelled) { setPdf(document); setTotalPages(document.numPages); } })
      .catch(() => { if (!cancelled) toast('Não foi possível carregar este PDF no leitor.'); })
      .finally(() => { if (!cancelled) setLoadingPdf(false); });
    return () => { cancelled = true; task.destroy(); };
  }, [activeUrl, activeFile?.file_type, toast]);
  useEffect(() => {
    if (!totalPages || !user?.id) return undefined;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { saveAutomaticReadingProgress(user.id, bookId, progress).then(() => onProgressChange?.(progress)).catch(() => {}); }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [bookId, page, progress, totalPages, user?.id, onProgressChange]);
  useEffect(() => () => clearTimeout(saveTimer.current), []);
  useEffect(() => {
    if (settings.direction !== 'horizontal') return undefined;
    const keydown = (event) => {
      if (event.target.matches('input, textarea, select')) return;
      if (event.key === 'ArrowLeft') setSettings((value) => ({ ...value, page:Math.max(1, Number(value.page) - 1) }));
      if (event.key === 'ArrowRight') setSettings((value) => ({ ...value, page:Math.min(totalPages || 1, Number(value.page) + 1) }));
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [settings.direction, totalPages]);

  const goToPage = (nextPage, direct = false) => {
    const target = Math.max(1, Math.min(totalPages || 1, Number(nextPage) || 1));
    update('page', target);
    setSelection(null);
    if (direct) track('page_jump', target);
  };
  const nearbyPages = settings.direction === 'vertical' ? [page - 1, page, page + 1].filter((item) => item >= 1 && item <= totalPages) : [page];

  function captureSelection() {
    const selected = window.getSelection();
    if (!selected || selected.isCollapsed || !selected.rangeCount || !pdfContainer.current) { setSelection(null); return; }
    const range = selected.getRangeAt(0);
    const node = range.commonAncestorContainer.nodeType === Node.TEXT_NODE ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer;
    const textLayer = node?.closest?.('.textLayer');
    if (!textLayer || !pdfContainer.current.contains(textLayer)) { setSelection(null); return; }
    const text = selected.toString().replace(/\s+/g, ' ').trim().slice(0, 1200);
    if (!text) { setSelection(null); return; }
    const rect = range.getBoundingClientRect();
    const containerRect = pdfContainer.current.getBoundingClientRect();
    setSelection({ text, page:Number(textLayer.closest('[data-page]')?.dataset.page || page), left:rect.left - containerRect.left + pdfContainer.current.scrollLeft + rect.width / 2, top:rect.top - containerRect.top + pdfContainer.current.scrollTop - 48 });
  }

  async function persistNote(kind, content, color, targetPage = page) {
    await saveReadingNote(user.id, bookId, { kind, content, progress, pageNumber:targetPage, color });
    onAnnotationSaved?.();
  }
  async function saveHighlight(color) {
    if (!selection?.text) return;
    try {
      await persistNote('highlight', selection.text, color, selection.page);
      window.getSelection()?.removeAllRanges();
      setSelection(null);
      toast('Trecho marcado e guardado no caderno.');
    } catch (error) { toast(error.message); }
  }
  function annotateSelection() {
    if (!selection?.text) return;
    setNote({ quote:selection.text, content:'', color:'yellow' });
    setShowNote(true);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }
  async function saveAnnotation(event) {
    event.preventDefault();
    const quote = note.quote.trim();
    const content = [quote && `“${quote}”`, note.content.trim()].filter(Boolean).join('\n');
    if (!content) return toast('Escreva um trecho ou uma anotação.');
    try {
      await persistNote(quote ? 'citation' : 'reflection', content, note.color);
      setNote({ quote:'', content:'', color:'yellow' }); setShowNote(false);
      toast('Guardado no seu caderno privado.');
    } catch (error) { toast(error.message); }
  }
  async function favoritePage() {
    try { await persistNote('favorite', `Página favorita de ${bookTitle || 'este livro'}.`, 'yellow'); toast(`Página ${page} adicionada aos favoritos.`); }
    catch (error) { toast(error.message); }
  }

  const pdfStyle = settings.theme === 'custom'
    ? { '--reader-background':settings.customBackground, '--reader-text':settings.customText, '--reader-margin':`${settings.margin}px` }
    : { '--reader-margin':`${settings.margin}px` };

  return <section className={`experiencia-leitura experiencia-leitura--${settings.direction} widget`}>
    <header><span><ReaderIcon /></span><div><h2>Experiência de leitura</h2><p>Selecione qualquer trecho do PDF para marcar ou anotar. Página e preferências são salvas automaticamente.</p></div></header>
    <div className="experiencia-leitura__controles">
      <label><PaletteIcon fontSize="small" />Tema<select value={settings.theme} onChange={(event) => update('theme', event.target.value, 'theme')}>{themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.label}</option>)}</select></label>
      <label>Modo<select value={settings.direction} onChange={(event) => update('direction', event.target.value)}><option value="vertical">Rolagem vertical</option><option value="horizontal">Página a página</option></select></label>
      <label><FontIcon fontSize="small" />Visualização<input aria-label="Tamanho da visualização" type="range" min="14" max="27" value={settings.fontSize} onChange={(event) => update('fontSize', Number(event.target.value), 'font')} /></label>
      <label>Margens<input aria-label="Margens" type="range" min="0" max="80" value={settings.margin} disabled={settings.marginLocked} onChange={(event) => update('margin', Number(event.target.value), 'margin')} /></label>
      <button type="button" className={`experiencia-leitura__lock${settings.marginLocked ? ' ativa' : ''}`} onClick={() => update('marginLocked', !settings.marginLocked, 'margin')}><LockIcon fontSize="small" />{settings.marginLocked ? 'Margens fixas' : 'Fixar margens'}</button>
      <button type="button" className="experiencia-leitura__icon" title="Abrir anotações" onClick={() => setShowNote((value) => !value)}><NoteIcon fontSize="small" /></button>
      <button type="button" className="experiencia-leitura__icon" title="Favoritar esta página" onClick={favoritePage}><BookmarkIcon fontSize="small" /></button>
    </div>
    {settings.theme === 'custom' && <div className="experiencia-leitura__cores"><label>Fundo<input type="color" value={settings.customBackground} onChange={(event) => update('customBackground', event.target.value)} /></label><label>Texto<input type="color" value={settings.customText} onChange={(event) => update('customText', event.target.value)} /></label></div>}
    {showNote && <form className="experiencia-leitura__anotacao" onSubmit={saveAnnotation}><strong>Nova marcação na página {page}</strong><input value={note.quote} maxLength={1200} onChange={(event) => setNote({ ...note, quote:event.target.value })} placeholder="Trecho ou citação (opcional)" /><textarea value={note.content} maxLength={1800} onChange={(event) => setNote({ ...note, content:event.target.value })} placeholder="Sua anotação" /><label>Cor<select value={note.color} onChange={(event) => setNote({ ...note, color:event.target.value })}>{markerColors.map((color) => <option key={color.id} value={color.id}>{color.label}</option>)}</select></label><button className="btn-primario">Guardar no caderno</button></form>}
    <div className="experiencia-leitura__arquivo"><label>Material<select value={activeFile?.id || ''} onChange={(event) => setActiveFileId(event.target.value)}><option value="">{files.length ? 'Escolha um material' : 'Nenhum material enviado'}</option>{files.map((file) => <option key={file.id} value={file.id}>{file.file_name}</option>)}</select></label></div>
    {activeFile?.file_type === 'pdf' && activeUrl ? <>
      <div ref={pdfContainer} onMouseUp={captureSelection} className={`experiencia-leitura__pdf experiencia-leitura__pdf--${settings.theme}`} style={pdfStyle} aria-busy={loadingPdf}>
        {loadingPdf ? <div className="experiencia-leitura__aviso">Carregando o PDF…</div> : nearbyPages.map((item) => <div className="experiencia-leitura__folha" key={item}><PdfPageCanvas document={pdf} page={item} scale={scale} /><small>Página {item}</small></div>)}
        {selection && <div className="marcacao-flutuante" style={{ left:selection.left, top:selection.top }} onMouseDown={(event) => event.preventDefault()}><button type="button" onClick={annotateSelection}><NoteIcon fontSize="small" />Anotar</button><span>{markerColors.map((color) => <button key={color.id} type="button" className={`marcacao-cor marcacao-cor--${color.id}`} style={{ '--marker-color':color.hex }} title={`Marcar em ${color.label.toLowerCase()}`} aria-label={`Marcar em ${color.label.toLowerCase()}`} onClick={() => saveHighlight(color.id)} />)}</span></div>}
      </div>
      <div className="experiencia-leitura__pagina"><button type="button" className="experiencia-leitura__nav" disabled={page <= 1} onClick={() => goToPage(page - 1)}><ChevronLeft />Anterior</button><label>Ir para página<input type="number" min="1" max={totalPages || undefined} value={page} onChange={(event) => goToPage(event.target.value, true)} /></label><strong>{totalPages ? `Página ${page} de ${totalPages}` : 'Carregando páginas...'}</strong><button type="button" className="experiencia-leitura__nav" disabled={!totalPages || page >= totalPages} onClick={() => goToPage(page + 1)}>Próxima<ChevronRight /></button><button type="button" className="experiencia-leitura__grid-btn" onClick={() => { setShowPages((value) => !value); track('page_overview', page); }}><GridIcon fontSize="small" />Todas as páginas</button></div>
      <div className="experiencia-leitura__progresso"><span style={{ width:`${progress}%` }} /><small>{progress}% lido</small></div>
      {showPages && <div className="experiencia-leitura__miniaturas" aria-label="Todas as páginas">{Array.from({ length:totalPages }, (_, index) => <button type="button" className={page === index + 1 ? 'ativa' : ''} key={index} onClick={() => { goToPage(index + 1, true); setShowPages(false); }}><span>{index + 1}</span></button>)}</div>}
    </> : activeFile ? <div className="experiencia-leitura__aviso">Este material usa um formato compatível com outro aplicativo. Envie um PDF para ler aqui no Entre Leitores.</div> : <div className="experiencia-leitura__aviso">Quando houver material autorizado para este livro, ele aparecerá aqui.</div>}
    <footer><SettingsIcon fontSize="small" /> Preferências salvas automaticamente para este livro.</footer>
  </section>;
}
