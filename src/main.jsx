import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import PageErrorBoundary from './components/PageErrorBoundary.jsx';

import './css/style.css';
import './css/sidebar.css';
import './css/cards.css';
import './css/feed.css';
import './css/livros.css';
import './css/perfil.css';
import './css/login.css';
import './css/community.css';
import './css/responsivo.css';

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  try {
    const key='entreleitores:last-chunk-reload'; const last=Number(sessionStorage.getItem(key)||0); const now=Date.now();
    if(now-last>15000){sessionStorage.setItem(key,String(now));window.location.reload();}
  } catch { window.location.reload(); }
});

function showFatalRecovery(){
  window.setTimeout(()=>{
    const root=document.getElementById('root');
    if(!root||root.childElementCount)return;
    const recovery=document.createElement('div');recovery.className='recuperacao-fatal';
    const title=document.createElement('h1');title.textContent='O aplicativo precisa ser atualizado';
    const text=document.createElement('p');text.textContent='Seus dados estão seguros. Recarregue para abrir a versão mais recente.';
    const button=document.createElement('button');button.textContent='Recarregar agora';button.onclick=()=>window.location.reload();
    recovery.append(title,text,button);root.append(recovery);
  },0);
}
window.addEventListener('error',showFatalRecovery);
window.addEventListener('unhandledrejection',showFatalRecovery);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PageErrorBoundary><App /></PageErrorBoundary>
  </React.StrictMode>
);
