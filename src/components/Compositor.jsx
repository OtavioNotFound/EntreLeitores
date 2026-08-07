import { useState } from 'react';
import { useToast } from './Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Create as CreateIcon, RateReview as RateReviewIcon, FormatQuote as FormatQuoteIcon, Poll as PollIcon } from '@mui/icons-material';

const abas = [
  { chave: 'publicacao', label: 'Publicar', Icone: CreateIcon, placeholder: 'O que você está lendo ou pensando?' },
  { chave: 'resenha', label: 'Resenha', Icone: RateReviewIcon, placeholder: 'Escreva sua resenha sobre uma leitura...' },
  { chave: 'citacao', label: 'Citação', Icone: FormatQuoteIcon, placeholder: 'Compartilhe uma citação e dê o devido crédito...' },
  { chave: 'enquete', label: 'Enquete', Icone: PollIcon, placeholder: 'Faça uma pergunta para a comunidade...' },
];

export default function Compositor({ aoPublicar }) {
  const mostrarToast = useToast();
  const { profile } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('publicacao');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const placeholder = abas.find((aba) => aba.chave === abaAtiva)?.placeholder;

  async function publicar() {
    const content = texto.trim();
    if (!content) return mostrarToast('Escreva algo antes de publicar.');
    setEnviando(true);
    try {
      await aoPublicar({ content, type: abaAtiva });
      setTexto('');
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
      <div className="compositor__rodape compositor__rodape--direita">
        <button className="btn-primario" onClick={publicar} disabled={enviando}>{enviando ? 'Publicando...' : 'Publicar'}</button>
      </div>
    </div>
  );
}
