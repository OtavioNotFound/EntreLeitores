import { useState } from 'react';
import { useToast } from './Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Create as CreateIcon, FormatQuote as FormatQuoteIcon, Poll as PollIcon } from '@mui/icons-material';

const abas = [
  { chave: 'publicacao', label: 'Publicar', Icone: CreateIcon, placeholder: 'O que você está lendo ou pensando?' },
  { chave: 'citacao', label: 'Citação', Icone: FormatQuoteIcon, placeholder: 'Compartilhe uma citação e dê o devido crédito...' },
  { chave: 'enquete', label: 'Enquete', Icone: PollIcon, placeholder: 'Faça uma pergunta para a comunidade...' },
];

export default function Compositor({ aoPublicar, bookId = null, showSpoilerControls = false }) {
  const mostrarToast = useToast();
  const { profile } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('publicacao');
  const [texto, setTexto] = useState('');
  const [opcoes, setOpcoes] = useState(['', '']);
  const [spoilerProgress, setSpoilerProgress] = useState('');
  const [spoilerChapter, setSpoilerChapter] = useState('');
  const [enviando, setEnviando] = useState(false);
  const placeholder = abas.find((aba) => aba.chave === abaAtiva)?.placeholder;

  async function publicar() {
    const content = texto.trim();
    if (!content) return mostrarToast('Escreva algo antes de publicar.');
    if (abaAtiva === 'enquete' && opcoes.filter((opcao) => opcao.trim()).length < 2) return mostrarToast('Adicione pelo menos duas opções.');
    setEnviando(true);
    try {
      await aoPublicar({ content, type: abaAtiva, bookId, pollOptions: abaAtiva === 'enquete' ? opcoes : [], spoilerProgress: spoilerProgress === '' ? null : Number(spoilerProgress), spoilerChapter: spoilerChapter.trim() || null });
      setTexto('');
      setOpcoes(['', '']);
      setSpoilerProgress(''); setSpoilerChapter('');
      mostrarToast('Publicado com sucesso!');
    } catch (error) {
      mostrarToast(error.message || 'Não foi possível publicar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="compositor">
      <div className="compositor__abas">
        {abas.map(({ chave, label, Icone }) => (
          <button key={chave} className={`compositor__aba${abaAtiva === chave ? ' ativa' : ''}`} onClick={() => setAbaAtiva(chave)}>
            <Icone fontSize="small" /> {label}
          </button>
        ))}
      </div>
      <div className="compositor__corpo">
        {profile?.avatar_url ? <img className="avatar" src={profile.avatar_url} alt="" /> : <span className="avatar avatar--placeholder">{profile?.display_name?.charAt(0) || 'L'}</span>}
        <textarea className="compositor__campo" rows="2" placeholder={placeholder} value={texto} onChange={(e) => setTexto(e.target.value)} />
      </div>
      {abaAtiva === 'enquete' && <div className="compositor__opcoes">
        {opcoes.map((opcao, index) => <input key={index} maxLength={120} value={opcao} placeholder={`Opção ${index + 1}`} aria-label={`Opção ${index + 1} da enquete`} onChange={(e) => setOpcoes((atuais) => atuais.map((item, i) => i === index ? e.target.value : item))} />)}
        {opcoes.length < 6 && <button type="button" className="btn-texto" onClick={() => setOpcoes((atuais) => [...atuais, ''])}>+ Adicionar opção</button>}
      </div>}
      {showSpoilerControls && <div className="compositor__spoiler">
        <label>Discussão segura até <input type="number" min="0" max="100" value={spoilerProgress} onChange={(e) => setSpoilerProgress(e.target.value)} placeholder="% do livro" /></label>
        <input aria-label="Capítulo da discussão" maxLength={80} value={spoilerChapter} onChange={(e) => setSpoilerChapter(e.target.value)} placeholder="Capítulo (opcional)" />
      </div>}
      <div className="compositor__rodape compositor__rodape--direita">
        <button className="btn-primario" onClick={publicar} disabled={enviando}>{enviando ? 'Publicando...' : 'Publicar'}</button>
      </div>
    </div>
  );
}
