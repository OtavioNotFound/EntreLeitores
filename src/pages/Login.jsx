import { useState } from 'react';
import { useToast } from '../components/Toast.jsx';
import { MenuBook as BookIcon } from '@mui/icons-material';

export default function Login({ aoLogar }) {
  const mostrarToast = useToast();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  function validarEmail(valor) {
    if (!valor.trim()) return 'Informe seu e-mail.';
    if (!valor.includes('@')) return 'O e-mail precisa conter um "@".';
    return '';
  }

  function aoEnviar(evento) {
    evento.preventDefault();

    const mensagemErroEmail = validarEmail(email);
    const mensagemErroSenha = senha.trim() ? '' : 'Informe sua senha.';

    setErroEmail(mensagemErroEmail);
    setErroSenha(mensagemErroSenha);

    if (mensagemErroEmail || mensagemErroSenha) {
      mostrarToast('Verifique os dados informados.');
      return;
    }

    mostrarToast(`Bem-vindo(a) de volta, ${email.split('@')[0]}!`);
    aoLogar({ email });
  }

  return (
    <div className="login-tela">
      <div className="login-tela__marca">
        <div className="login-tela__decor login-tela__decor--1" />
        <div className="login-tela__decor login-tela__decor--2" />

        <div className="login-tela__logo">
          <div className="sidebar__logo-icone"><BookIcon /></div>
          <span className="sidebar__logo-texto">Entre Leitores</span>
        </div>

        <h1 className="login-tela__frase">
          Onde histórias encontram leitores.
        </h1>
        <p className="login-tela__subfrase">
          Descubra livros, participe de comunidades e acompanhe suas leituras favoritas em um só lugar.
        </p>
      </div>

      <div className="login-tela__form-coluna">
        <form className="login-card" onSubmit={aoEnviar} noValidate>
          <h2 className="login-card__titulo">Entrar</h2>
          <p className="login-card__subtitulo">Acesse sua conta para continuar lendo.</p>

          <div className="campo-grupo">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="text"
              placeholder="voce@exemplo.com"
              className={erroEmail ? 'campo-erro' : ''}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (erroEmail) setErroEmail('');
              }}
              onBlur={() => setErroEmail(validarEmail(email))}
            />
            {erroEmail && <span className="mensagem-erro">{erroEmail}</span>}
          </div>

          <div className="campo-grupo">
            <label htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              type="password"
              placeholder="Sua senha"
              className={erroSenha ? 'campo-erro' : ''}
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                if (erroSenha) setErroSenha('');
              }}
            />
            {erroSenha && <span className="mensagem-erro">{erroSenha}</span>}
          </div>

          <div className="login-card__opcoes">
            <label className="login-card__lembrar">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
              />
              Lembrar de mim
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); mostrarToast('Recuperação de senha em breve!'); }}>
              Esqueceu a senha?
            </a>
          </div>

          <button type="submit" className="btn-primario btn-full">Entrar</button>

          <p className="login-card__rodape">
            Ainda não tem conta?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); mostrarToast('Cadastro em breve!'); }}>
              Criar conta
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
