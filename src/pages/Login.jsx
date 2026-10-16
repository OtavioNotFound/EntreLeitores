import { useState } from 'react';
import { useToast } from '../components/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { MenuBook as BookIcon } from '@mui/icons-material';

export default function Login() {
  const mostrarToast = useToast();
  const { signIn, signUp } = useAuth();
  const [modo, setModo] = useState('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro('');
    if (!email.includes('@') || senha.length < 6) {
      setErro('Informe um e-mail válido e uma senha com pelo menos 6 caracteres.');
      return;
    }
    if (modo === 'cadastro' && (!nome.trim() || usuario.trim().length < 3)) {
      setErro('Informe seu nome e um nome de usuário com pelo menos 3 caracteres.');
      return;
    }

    setEnviando(true);
    try {
      if (modo === 'entrar') {
        await signIn(email, senha);
        mostrarToast('Bem-vindo(a) de volta!');
      } else {
        const data = await signUp({ email, password: senha, displayName: nome.trim(), username: usuario.trim().toLowerCase() });
        if (!data.session) mostrarToast('Confira seu e-mail para confirmar o cadastro.');
        else mostrarToast('Conta criada com sucesso!');
      }
    } catch (error) {
      const mensagens = {
        'Invalid login credentials': 'E-mail ou senha incorretos.',
        'User already registered': 'Este e-mail já está cadastrado.',
      };
      setErro(mensagens[error.message] || error.message || 'Não foi possível continuar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-tela">
      <div className="login-tela__marca">
        <div className="login-tela__logo">
          <div className="sidebar__logo-icone"><BookIcon /></div>
          <span className="sidebar__logo-texto">Entre Leitores</span>
        </div>
        <div className="login-tela__convite">
          <h1 className="login-tela__frase">Ler é só<br />o começo.</h1>
          <p className="login-tela__subfrase">O livro acaba. A conversa continua.<br />Encontre sua turma entre uma página e outra.</p>
        </div>
        <div className="login-estante" aria-hidden="true">
          <div className="login-estante__livro login-estante__livro--roxo"><span>Entre páginas</span><small>uma descoberta</small></div>
          <div className="login-estante__livro login-estante__livro--papel"><span>Entre<br />histórias.</span><BookIcon className="login-estante__marca" /><small>um novo olhar</small></div>
          <div className="login-estante__livro login-estante__livro--amarelo"><small>Entre Leitores</small><span>Sempre cabe<br />mais uma<br />conversa.</span><BookIcon /></div>
        </div>
        <p className="login-tela__assinatura">Sua estante. Seus encontros. Seu canto.</p>
      </div>

      <div className="login-tela__form-coluna">
        <form className="login-card" onSubmit={aoEnviar} noValidate>
          <h2 className="login-card__titulo">{modo === 'entrar' ? 'Bom ter você aqui.' : 'Puxe uma cadeira.'}</h2>
          <p className="login-card__subtitulo">{modo === 'entrar' ? 'Entre para continuar a conversa.' : 'Crie sua conta e encontre outros leitores.'}</p>

          {modo === 'cadastro' && (
            <>
              <div className="campo-grupo">
                <label htmlFor="cadastro-nome">Nome</label>
                <input id="cadastro-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como você quer ser chamado?" />
              </div>
              <div className="campo-grupo">
                <label htmlFor="cadastro-usuario">Usuário</label>
                <input id="cadastro-usuario" value={usuario} onChange={(e) => setUsuario(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))} placeholder="seu.usuario" />
              </div>
            </>
          )}

          <div className="campo-grupo">
            <label htmlFor="login-email">E-mail</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" autoComplete="email" />
          </div>
          <div className="campo-grupo">
            <label htmlFor="login-senha">Senha</label>
            <input id="login-senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo de 6 caracteres" autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} />
          </div>

          {erro && <div className="login-card__erro" role="alert">{erro}</div>}
          <button type="submit" className="btn-primario btn-full" disabled={enviando}>{enviando ? 'Aguarde...' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}</button>
          <p className="login-card__rodape">
            {modo === 'entrar' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
            <button type="button" className="link-button" onClick={() => { setModo(modo === 'entrar' ? 'cadastro' : 'entrar'); setErro(''); }}>
              {modo === 'entrar' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
