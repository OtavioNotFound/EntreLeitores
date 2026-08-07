import { useState } from 'react';
import { CheckCircle as CheckIcon, DeleteForeverOutlined as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { exportUserData, importGoodreadsBooks } from '../services/social.js';
import { parseGoodreadsCsv } from '../lib/goodreadsImport.js';
import SafetyPreferences from '../components/SafetyPreferences.jsx';

export default function Configuracoes({ alternarTema }) {
  const { user, deleteAccount } = useAuth();
  const mostrarToast = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const [confirmacao, setConfirmacao] = useState('');
  const [apagando, setApagando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState('');

  async function exportar() {
    setExportando(true);
    try { const data = await exportUserData(user.id); const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href=url; link.download=`entre-leitores-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(url); mostrarToast('Seus dados foram exportados.'); }
    catch (error) { mostrarToast(error.message); } finally { setExportando(false); }
  }

  async function importarGoodreads(evento) {
    const file = evento.target.files?.[0]; if (!file) return;
    try { const books = parseGoodreadsCsv(await file.text()); if (!books.length) throw new Error('Nenhum livro encontrado no arquivo.'); setImportando(`0/${books.length}`); const result = await importGoodreadsBooks(user.id, books, (done,total) => setImportando(`${done}/${total}`)); mostrarToast(`${result.imported + result.reused} livros processados${result.errors.length ? `; ${result.errors.length} com erro` : ''}.`); }
    catch (error) { mostrarToast(error.message); } finally { setImportando(''); evento.target.value=''; }
  }

  async function apagarConta() {
    if (confirmacao !== 'EXCLUIR' || apagando) return;
    setApagando(true);
    try {
      await deleteAccount();
    } catch (error) {
      mostrarToast(error.message);
      setApagando(false);
    }
  }

  return (
    <section className="pagina ativa" id="pagina-configuracoes">
      <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Configurações</h1><p className="pagina-cabecalho__sub">Preferências locais e informações da sua conta.</p></div></div>
      <div className="widget configuracoes-card">
        <div className="configuracao-linha"><span><strong>Aparência</strong><small>Alternar entre tema claro e escuro</small></span><button className="btn-secundario" onClick={alternarTema}>Alternar tema</button></div>
        <div className="configuracao-linha"><span><strong>E-mail da conta</strong><small>{user.email}</small></span></div>
        <div className="configuracao-linha"><span><strong>Sincronização</strong><small>Seus dados são armazenados no Supabase</small></span><span className="status-ok"><CheckIcon fontSize="small" /> Ativa</span></div>
        <div className="configuracao-linha"><span><strong>Seus dados pertencem a você</strong><small>Baixe perfil, estante, sessões, posts e interações em JSON</small></span><button className="btn-secundario" disabled={exportando} onClick={exportar}>{exportando ? 'Preparando...' : 'Exportar dados'}</button></div>
        <div className="configuracao-linha"><span><strong>Migrar do Goodreads</strong><small>Importe o CSV exportado pelo Goodreads, preservando estante e avaliações</small></span><label className="btn-secundario importacao-arquivo">{importando ? `Importando ${importando}` : 'Escolher CSV'}<input type="file" accept=".csv,text/csv" disabled={Boolean(importando)} onChange={importarGoodreads}/></label></div>
      </div>

      <SafetyPreferences />
      <section className="zona-perigo" aria-labelledby="zona-perigo-titulo">
        <div>
          <span className="zona-perigo__icone"><DeleteIcon /></span>
          <span><h2 id="zona-perigo-titulo">Excluir conta</h2><p>Apaga permanentemente seu perfil, posts, mensagens, clubes e estante.</p></span>
        </div>
        {!confirmando ? (
          <button className="btn-perigo" onClick={() => setConfirmando(true)}>Excluir minha conta</button>
        ) : (
          <div className="zona-perigo__confirmacao">
            <label>Digite <strong>EXCLUIR</strong> para confirmar<input value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} autoComplete="off" /></label>
            <div><button className="btn-secundario" onClick={() => { setConfirmando(false); setConfirmacao(''); }}>Cancelar</button><button className="btn-perigo" disabled={confirmacao !== 'EXCLUIR' || apagando} onClick={apagarConta}>{apagando ? 'Excluindo...' : 'Excluir definitivamente'}</button></div>
          </div>
        )}
      </section>
    </section>
  );
}
