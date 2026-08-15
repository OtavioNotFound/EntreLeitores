import { useState } from 'react';
import { Close as CloseIcon, ExpandLess as ExpandIcon, MusicNote as MusicIcon, OpenInNew as OpenIcon, Remove as MinimizeIcon } from '@mui/icons-material';
import { youtubeEmbedUrl } from '../lib/youtube.js';

export default function GlobalMusicPlayer({ url, onRemove }) {
  const [minimizado, setMinimizado] = useState(false);
  const embedUrl = youtubeEmbedUrl(url);
  if (!embedUrl) return null;

  return <aside className={`player-global${minimizado ? ' minimizado' : ''}`} aria-label="Player da trilha de leitura">
    <header><span><MusicIcon fontSize="small" /></span><strong>Trilha de leitura</strong><a href={url} target="_blank" rel="noreferrer" aria-label="Abrir no YouTube"><OpenIcon fontSize="small" /></a><button onClick={() => setMinimizado((valor) => !valor)} aria-label={minimizado ? 'Expandir player' : 'Minimizar player'}>{minimizado ? <ExpandIcon /> : <MinimizeIcon />}</button><button onClick={onRemove} aria-label="Remover trilha"><CloseIcon /></button></header>
    <div className="player-global__video"><iframe src={embedUrl} title="Player permanente da trilha de leitura" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
  </aside>;
}
