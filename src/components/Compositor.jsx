import { useState } from 'react';
import { useToast } from './Toast.jsx';

const abas = [
  { chave: 'publicar', label: '✎ Publicar', placeholder: 'O que você está lendo ou pensando?' },
  { chave: 'resenha', label: '✎ Resenha', placeholder: 'Escreva sua resenha sobre o livro...' },
  { chave: 'citacao', label: '〝 Citação', placeholder: 'Compartilhe uma citação marcante...' },
  { chave: 'enquete', label: '📊 Enquete', placeholder: 'Faça uma pergunta para a comunidade...' },
];

export default function Compositor({ aoPublicar }) {
  const mostrarToast = useToast();
  const [abaAtiva, setAbaAtiva] = useState('publicar');
  const [texto, setTexto] = useState('');

  const placeholder = abas.find((a) => a.chave === abaAtiva)?.placeholder;

  function publicar() {
    const valor = texto.trim();
    if (!valor) {
      mostrarToast('Escreva algo antes de publicar.');
      return;
    }
    aoPublicar(valor);
    setTexto('');
    mostrarToast('Publicado com sucesso!');
  }

  return (
    <div className="compositor">
      <div className="compositor__abas">
        {abas.map((aba) => (
          <button
            key={aba.chave}
            className={`compositor__aba${abaAtiva === aba.chave ? ' ativa' : ''}`}
            onClick={() => setAbaAtiva(aba.chave)}
          >
            {aba.label}
          </button>
        ))}
      </div>
      <div className="compositor__corpo">
        <img className="avatar" src="/img/assets/avatar-usuario.svg" alt="" />
        <textarea
          className="compositor__campo"
          rows="1"
          placeholder={placeholder}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>
      <div className="compositor__rodape">
        <div className="compositor__extras">
          <button className="compositor__extra-btn">📖 Adicionar livro</button>
          <button className="compositor__extra-btn"># Tag</button>
        </div>
        <button className="btn-primario" onClick={publicar}>Publicar</button>
      </div>
    </div>
  );
}
