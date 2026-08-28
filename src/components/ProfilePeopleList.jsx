import { useEffect, useState } from 'react';
import { GroupOutlined as GroupIcon } from '@mui/icons-material';
import EmptyState from './EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';
import { getProfileConnections, toggleFollow } from '../services/social.js';

export default function ProfilePeopleList({ profileId, type, aoAbrirPerfil }) {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProfileConnections(profileId, user.id, type)
      .then(setPeople)
      .catch((error) => mostrarToast(error.message))
      .finally(() => setLoading(false));
  }, [profileId, type, user.id]);

  async function changeFollow(person) {
    try {
      const following = await toggleFollow(user.id, person.id, person.following);
      setPeople((current) => current.map((item) => item.id === person.id ? { ...item, following } : item));
      mostrarToast(following ? `Agora você segue ${person.display_name}` : `Você deixou de seguir ${person.display_name}`);
    } catch (error) { mostrarToast(error.message); }
  }

  if (loading) return <div className="skeleton-card" />;
  if (!people.length) return <EmptyState icon={<GroupIcon />} title={type === 'followers' ? 'Nenhum seguidor ainda' : 'Ainda não segue ninguém'} description={type === 'followers' ? 'Quando alguém seguir este perfil, aparecerá aqui.' : 'As pessoas seguidas por este perfil aparecerão aqui.'} />;

  return <div className="perfil-pessoas">
    {people.map((person) => <article className="perfil-pessoa" key={person.id}>
      <button className="perfil-pessoa__identidade" onClick={() => aoAbrirPerfil(person.id)}>
        {person.avatar_url ? <img className="avatar" src={person.avatar_url} alt="" /> : <span className="avatar avatar--placeholder">{person.display_name?.charAt(0) || 'L'}</span>}
        <span><strong>{person.display_name}</strong><small>@{person.username}</small></span>
      </button>
      {person.id !== user.id ? <button className={`btn-seguir${person.following ? ' seguindo' : ''}`} onClick={() => changeFollow(person)}>{person.following ? 'Seguindo' : 'Seguir'}</button> : <span className="perfil-pessoa__voce">Você</span>}
    </article>)}
  </div>;
}
