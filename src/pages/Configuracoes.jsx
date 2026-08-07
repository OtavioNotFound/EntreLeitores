import { useAuth } from '../context/AuthContext.jsx';
import { CheckCircle as CheckIcon } from '@mui/icons-material';

export default function Configuracoes({ alternarTema }) {
  const { user } = useAuth();
  return (
    <section className="pagina ativa" id="pagina-configuracoes">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Configurações</h1><p className="pagina-cabecalho__sub">Preferências locais e informações da sua conta.</p></div></div>
      <div className="widget configuracoes-card">
        <div className="configuracao-linha"><span><strong>Aparência</strong><small>Alternar entre tema claro e escuro</small></span><button className="btn-secundario" onClick={alternarTema}>Alternar tema</button></div>
        <div className="configuracao-linha"><span><strong>E-mail da conta</strong><small>{user.email}</small></span></div>
        <div className="configuracao-linha"><span><strong>Sincronização</strong><small>Seus dados são armazenados no Supabase</small></span><span className="status-ok"><CheckIcon fontSize="small" /> Ativa</span></div>
      </div>
    </section>
  );
}
