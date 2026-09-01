import { useEffect, useMemo, useState } from 'react';
import { AutoStoriesOutlined as ReaderIcon, FormatSizeOutlined as FontIcon, LockOutlined as LockIcon, PaletteOutlined as PaletteIcon } from '@mui/icons-material';
import { getReadingFileUrl } from '../services/social.js';
import { useToast } from './Toast.jsx';

const themes = [{ id:'day', label:'Dia' }, { id:'night', label:'Noite' }, { id:'contrast', label:'Alto contraste' }, { id:'sepia', label:'Sépia' }];

export default function ReadingExperience({ bookId, files, pageFromNotebook }) {
  const toast = useToast();
  const storageKey = `reader-settings:${bookId}`;
  const [settings, setSettings] = useState(() => {
    try { return { theme:'day', direction:'vertical', fontSize:18, margin:42, marginLocked:false, page:1, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; }
    catch { return { theme:'day', direction:'vertical', fontSize:18, margin:42, marginLocked:false, page:1 }; }
  });
  const [activeFileId, setActiveFileId] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const activeFile = useMemo(() => files.find((file) => file.id === activeFileId) || files[0], [files, activeFileId]);

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(settings)); }, [settings, storageKey]);
  useEffect(() => { if (pageFromNotebook) setSettings((current) => ({ ...current, page:Number(pageFromNotebook) })); }, [pageFromNotebook]);
  useEffect(() => { if (!activeFile) { setActiveUrl(''); return; } getReadingFileUrl(activeFile.file_path).then(setActiveUrl).catch((error) => toast(error.message)); }, [activeFile?.id]);

  function update(key, value) { setSettings((current) => ({ ...current, [key]:value })); }
  return <section className={`experiencia-leitura experiencia-leitura--${settings.theme} experiencia-leitura--${settings.direction} widget`}><header><span><ReaderIcon /></span><div><h2>Experiência de leitura</h2><p>Escolha o visual e marque páginas enquanto lê.</p></div></header><div className="experiencia-leitura__controles"><label><PaletteIcon fontSize="small" />Tema<select value={settings.theme} onChange={(e) => update('theme', e.target.value)}>{themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.label}</option>)}</select></label><label>Orientação<select value={settings.direction} onChange={(e) => update('direction', e.target.value)}><option value="vertical">Vertical</option><option value="horizontal">Horizontal</option></select></label><label><FontIcon fontSize="small" />Fonte<input type="range" min="14" max="26" value={settings.fontSize} onChange={(e) => update('fontSize', Number(e.target.value))} /></label><label>Margens<input type="range" min="18" max="80" value={settings.margin} disabled={settings.marginLocked} onChange={(e) => update('margin', Number(e.target.value))} /></label><button className={`experiencia-leitura__lock${settings.marginLocked ? ' ativa' : ''}`} onClick={() => update('marginLocked', !settings.marginLocked)}><LockIcon fontSize="small" />{settings.marginLocked ? 'Margens fixas' : 'Fixar margens'}</button></div><div className="experiencia-leitura__pagina"><label>Página<input type="number" min="1" value={settings.page} onChange={(e) => update('page', Math.max(1, Number(e.target.value) || 1))} /></label><small>Notas com página podem levar você direto para este marcador.</small></div>{files.length ? <><div className="experiencia-leitura__arquivo"><label>Material<select value={activeFile?.id || ''} onChange={(e) => setActiveFileId(e.target.value)}>{files.map((file) => <option key={file.id} value={file.id}>{file.file_name}</option>)}</select></label></div>{activeFile?.file_type === 'pdf' && activeUrl ? <iframe title={`Leitura de ${activeFile.file_name}`} src={`${activeUrl}#page=${settings.page}`} style={{ '--reader-font-size':`${settings.fontSize}px`, '--reader-margin':`${settings.margin}px` }} /> : <div className="experiencia-leitura__aviso">Este material abre em seu aplicativo compatível. Os controles de visual, marcador e caderno continuam disponíveis aqui.</div>}</> : <div className="experiencia-leitura__aviso">Quando houver material autorizado para este livro, ele aparecerá aqui. Você já pode definir tema, margens e seus marcadores.</div>}</section>;
}
