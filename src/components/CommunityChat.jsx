import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DeleteOutlined as DeleteIcon,
  ForumOutlined as ForumIcon,
  SendRounded as SendIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';
import {
  deleteCommunityMessage,
  getCommunityMessages,
  sendCommunityMessage,
  subscribeCommunityMessages,
} from '../services/social.js';

export default function CommunityChat({ club }) {
  const { user, profile } = useAuth();
  const mostrarToast = useToast();
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef(null);

  const carregar = useCallback(async ({ silencioso = false } = {}) => {
    if (!silencioso) setCarregando(true);
    try {
      setMensagens(await getCommunityMessages(club.id));
    } catch (error) {
      mostrarToast(error.message);
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }, [club.id, mostrarToast]);

  useEffect(() => {
    carregar();
    const cancelar = subscribeCommunityMessages(club.id, () => carregar({ silencioso: true }));
    return cancelar;
  }, [carregar]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [mensagens.length]);

  async function enviar(evento) {
    evento.preventDefault();
    const content = texto.trim();
    if (!content || enviando) return;

    setEnviando(true);
    try {
      await sendCommunityMessage(user.id, club.id, content);
      setTexto('');
      await carregar({ silencioso: true });
    } catch (error) {
      mostrarToast(error.message);
    } finally {
      setEnviando(false);
    }
  }

  async function apagar(mensagem) {
    if (!window.confirm('Apagar esta mensagem da comunidade?')) return;
    try {
      await deleteCommunityMessage(user.id, mensagem.id);
      setMensagens((atuais) => atuais.filter((item) => item.id !== mensagem.id));
      mostrarToast('Mensagem apagada.');
    } catch (error) {
      mostrarToast(error.message);
    }
  }

  const nomeAtual = profile?.display_name || user.email?.split('@')[0] || 'Leitor';

  return (
    <section className="chat-comunidade" aria-label={`Conversa do clube ${club.name}`}>
      <header className="chat-comunidade__topo">
        <span className="chat-comunidade__icone"><ForumIcon /></span>
        <span>
          <strong>{club.name}</strong>
          <small><i /> Conversa ao vivo entre membros</small>
        </span>
      </header>

      <div className="chat-comunidade__mensagens" aria-live="polite">
        {carregando ? (
          <div className="chat-comunidade__carregando"><span className="loading-spinner" /> Carregando conversa...</div>
        ) : mensagens.length ? mensagens.map((mensagem) => {
          const propria = mensagem.author_id === user.id;
          const autor = mensagem.author?.display_name || (propria ? nomeAtual : 'Leitor');
          return (
            <article className={`mensagem-chat${propria ? ' mensagem-chat--propria' : ''}`} key={mensagem.id}>
              <span className="avatar sm avatar--placeholder" aria-hidden="true">{autor.charAt(0).toUpperCase()}</span>
              <div className="mensagem-chat__conteudo">
                <div className="mensagem-chat__meta">
                  <strong>{propria ? 'Você' : autor}</strong>
                  <time dateTime={mensagem.created_at}>{mensagem.tempo}</time>
                  {propria && (
                    <button className="btn-icone-perigo" aria-label="Apagar mensagem" title="Apagar mensagem" onClick={() => apagar(mensagem)}>
                      <DeleteIcon fontSize="small" />
                    </button>
                  )}
                </div>
                <p>{mensagem.content}</p>
              </div>
            </article>
          );
        }) : (
          <div className="chat-comunidade__vazio">
            <ForumIcon />
            <strong>A conversa começa com você</strong>
            <span>Compartilhe uma leitura, uma pergunta ou uma indicação.</span>
          </div>
        )}
        <div ref={fimRef} />
      </div>

      <form className="chat-comunidade__form" onSubmit={enviar}>
        <textarea
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter' && !evento.shiftKey) {
              evento.preventDefault();
              evento.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Escreva para a comunidade..."
          maxLength={1200}
          rows={2}
          aria-label="Nova mensagem"
        />
        <div>
          <small>{texto.length}/1200 · Enter envia, Shift+Enter quebra a linha</small>
          <button className="btn-primario chat-comunidade__enviar" disabled={!texto.trim() || enviando}>
            <SendIcon fontSize="small" /> {enviando ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </section>
  );
}
