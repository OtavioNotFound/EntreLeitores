import { useEffect, useRef, useState } from 'react';
import { Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';
import { getDirectMessages, sendDirectMessage } from '../services/social.js';

export default function ProfileConversation({ person }) {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef(null);

  useEffect(() => {
    getDirectMessages(user.id, person.id).then(setMensagens).catch((error) => mostrarToast(error.message));
  }, [user.id, person.id]);
  useEffect(() => { fimRef.current?.scrollIntoView({ behavior:'smooth', block:'nearest' }); }, [mensagens.length]);

  async function enviar(evento) {
    evento.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    try { const nova = await sendDirectMessage(user.id, person.id, texto); setMensagens((atuais) => [...atuais, nova]); setTexto(''); }
    catch (error) { mostrarToast(error.message); }
    finally { setEnviando(false); }
  }

  return <section className="conversa-perfil widget" aria-label={`Conversa com ${person.display_name}`}>
    <header><div><strong>Conversa com {person.display_name}</strong><small>Mensagens privadas entre vocês</small></div></header>
    <div className="conversa-perfil__mensagens">{mensagens.length ? mensagens.map((mensagem) => <div key={mensagem.id} className={`conversa-perfil__mensagem${mensagem.sender_id === user.id ? ' propria' : ''}`}><p>{mensagem.content}</p><time>{new Date(mensagem.created_at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</time></div>) : <p className="conversa-perfil__vazia">Comece a conversa falando sobre uma leitura em comum.</p>}<span ref={fimRef}/></div>
    <form onSubmit={enviar}><input aria-label={`Mensagem para ${person.display_name}`} maxLength={2000} value={texto} onChange={(e)=>setTexto(e.target.value)} placeholder="Escreva uma mensagem..."/><button className="btn-primario" disabled={!texto.trim()||enviando} aria-label="Enviar mensagem"><SendIcon fontSize="small"/></button></form>
  </section>;
}
