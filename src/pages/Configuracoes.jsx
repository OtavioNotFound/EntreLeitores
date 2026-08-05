import { useToast } from '../components/Toast.jsx';

export default function Configuracoes({ alternarTema }) {
  const mostrarToast = useToast();

  return (
    <section className="pagina ativa" id="pagina-configuracoes">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Configurações</h1></div></div>
      <div className="widget" style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Tema escuro</span>
          <button className="btn-secundario" onClick={alternarTema}>Alternar</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Notificações por e-mail</span>
          <button className="btn-secundario" onClick={() => mostrarToast('Preferências de e-mail em breve!')}>Gerenciar</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Privacidade do perfil</span>
          <button className="btn-secundario" onClick={() => mostrarToast('Preferências de privacidade em breve!')}>Gerenciar</button>
        </div>
      </div>
    </section>
  );
}
