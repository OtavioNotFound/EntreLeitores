import { useEffect, useState } from 'react';
import { PersonSearch as PersonSearchIcon } from '@mui/icons-material';
import EmptyState from '../components/EmptyState.jsx';
import { useToast } from '../components/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getProfileSuggestions, toggleFollow } from '../services/social.js';

export default function Pessoas({ aoAbrirPerfil }) {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [pessoas, setPessoas] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfileSuggestions(user.id, 60).then(setPessoas).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [user.id]);

  async function seguir(pessoa) {
    try {
      await toggleFollow(user.id, pessoa.id, false);
      setPessoas((atuais) => atuais.filter((item) => item.id !== pessoa.id));
      mostrarToast(`Agora você segue ${pessoa.display_name}`);
    } catch (error) { mostrarToast(error.message); }
  }

  const termo = busca.trim().toLocaleLowerCase('pt-BR');
  const filtradas = pessoas.filter((pessoa) => !termo || `${pessoa.display_name} ${pessoa.username} ${pessoa.bio || ''}`.toLocaleLowerCase('pt-BR').includes(termo));

  return <section className="pagina ativa pessoas-pagina">
    <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Conhecer pessoas</h1><p className="pagina-cabecalho__sub">Descubra leitores novos e encontre sua próxima boa conversa.</p></div></div>
    <label className="pessoas-busca"><span>Buscar pessoas</span><input type="search" placeholder="Nome, usuário ou interesse..." value={busca} onChange={(e) => setBusca(e.target.value)} /></label>
    {loading ? <div className="skeleton-card" /> : filtradas.length ? <div className="pessoas-grid">{filtradas.map((pessoa) => <article className="pessoa-card" key={pessoa.id}>
      <button className="pessoa-card__perfil" onClick={() => aoAbrirPerfil(pessoa.id)}>
        {pessoa.avatar_url ? <img className="avatar lg" src={pessoa.avatar_url} alt="" /> : <span className="avatar lg avatar--placeholder">{pessoa.display_name?.charAt(0) || 'L'}</span>}
        <strong>{pessoa.display_name}</strong><small>@{pessoa.username}</small>
      </button>
      <p>{pessoa.bio || 'Ainda está preparando sua apresentação literária.'}</p>
      {(pessoa.city || pessoa.state_code) && <span className="pessoa-card__local">{[pessoa.city, pessoa.state_code].filter(Boolean).join(' · ')}</span>}
      <button className="btn-seguir" onClick={() => seguir(pessoa)}>Seguir</button>
    </article>)}</div> : <EmptyState icon={<PersonSearchIcon />} title="Nenhum leitor novo por aqui" description={termo ? 'Tente buscar por outro nome ou interesse.' : 'Você já segue todas as pessoas disponíveis no momento.'} />}
  </section>;
}
