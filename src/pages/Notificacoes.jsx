import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRelativeTime, getNotifications, markNotificationsRead } from '../services/social.js';
import { NotificationsNone as NotificationsIcon } from '@mui/icons-material';

function texto(item) {
  const nome = item.actor?.display_name || 'Alguém';
  if (item.type === 'follow') return `${nome} começou a seguir você.`;
  if (item.type === 'like') return `${nome} curtiu sua publicação.`;
  if (item.type === 'comment') return `${nome} comentou na sua publicação.`;
  if (item.type === 'loan_request') return `${nome} pediu um livro seu emprestado.`;
  if (item.type === 'loan_accepted') return `${nome} aceitou seu pedido de empréstimo.`;
  if (item.type === 'loan_declined') return `${nome} respondeu ao seu pedido de empréstimo.`;
  if (item.type === 'prompt_vote') return `${nome} apoiou sua pergunta no clube.`;
  if (item.type === 'event') return 'Há uma atualização em um evento.';
  return 'Há uma atualização em um dos seus clubes.';
}

export default function Notificacoes() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getNotifications(user.id).then(async (data) => { setItems(data); await markNotificationsRead(user.id); }).catch(console.error).finally(() => setLoading(false));
  }, [user.id]);

  return (
    <section className="pagina ativa" id="pagina-notificacoes">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Notificações</h1><p className="pagina-cabecalho__sub">Interações reais com seu perfil e suas publicações.</p></div></div>
      {loading ? <div className="skeleton-card" /> : items.length ? <div className="widget notificacoes-lista">{items.map((item) => (
        <div className={`notificacao${item.read_at ? '' : ' nao-lida'}`} key={item.id}>
          {item.actor?.avatar_url ? <img className="avatar" src={item.actor.avatar_url} alt="" /> : <span className="avatar avatar--placeholder">{item.actor?.display_name?.charAt(0) || '•'}</span>}
          <div><p>{texto(item)}</p><span>{formatRelativeTime(item.created_at)}</span></div>
        </div>
      ))}</div> : <EmptyState icon={<NotificationsIcon />} title="Tudo tranquilo por aqui" description="Curtidas, comentários e novos seguidores aparecerão nesta página." />}
    </section>
  );
}
