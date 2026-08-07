import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';
import { getBookLendingOffers, getLoanDashboard, requestBookLoan, respondLoanRequest, saveLendingOffer, updateLoanStatus } from '../services/social.js';

const statusLabel = { pending:'Aguardando resposta', accepted:'Aceito', declined:'Recusado', cancelled:'Cancelado', borrowed:'Com o leitor', returned:'Devolvido' };

export default function TrustedLending({ book, isOwned = false }) {
  const { user } = useAuth(); const toast = useToast();
  const [offers,setOffers]=useState([]); const [open,setOpen]=useState(false); const [busy,setBusy]=useState(false);
  const [form,setForm]=useState({city:'',notes:'',audience:'followers'});
  const load=()=>getBookLendingOffers(book.id).then(setOffers).catch((error)=>toast(error.message));
  useEffect(load,[book.id]);
  async function publish(event){event.preventDefault();setBusy(true);try{await saveLendingOffer(user.id,book.id,form);await load();setOpen(false);toast('Livro disponível para empréstimo. Só sua cidade será exibida.');}catch(error){toast(error.message)}finally{setBusy(false)}}
  async function request(offer){const message=window.prompt('Escreva uma mensagem curta para o dono (opcional):','Olá! Gostaria de ler este livro.');if(message===null)return;setBusy(true);try{await requestBookLoan(user.id,offer.id,message);await load();toast('Pedido enviado. Combine a entrega somente após o aceite.');}catch(error){toast(error.message)}finally{setBusy(false)}}
  const mine=offers.find((item)=>item.owner_id===user.id);
  return <section className="emprestimos widget">
    <header><div><h2>Passa adiante</h2><p>Empréstimos físicos entre leitores, com aceite, prazo e devolução. Endereços nunca são publicados.</p></div>{isOwned&&<button className="btn-secundario" onClick={()=>setOpen(!open)}>{mine?'Editar oferta':'+ Emprestar meu exemplar'}</button>}</header>
    {open&&<form onSubmit={publish}><input required minLength="2" maxLength="80" value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})} placeholder="Sua cidade"/><select value={form.audience} onChange={(e)=>setForm({...form,audience:e.target.value})}><option value="followers">Só seguidores</option><option value="everyone">Todos os leitores</option></select><input maxLength="280" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Condição ou preferência para entrega"/><button className="btn-primario" disabled={busy}>Publicar com privacidade</button></form>}
    <div className="emprestimos__lista">{offers.filter((offer)=>offer.owner_id!==user.id).map((offer)=>{const request=offer.loan_requests?.find((item)=>item.borrower_id===user.id);return <article key={offer.id}><div><strong>{offer.owner?.display_name||`@${offer.owner?.username}`}</strong><small>{offer.city} · {offer.audience==='followers'?'rede de confiança':'comunidade'}</small>{offer.notes&&<p>{offer.notes}</p>}</div><button className="btn-secundario" disabled={busy||Boolean(request)} onClick={()=>request(offer)}>{request?statusLabel[request.status]:'Pedir emprestado'}</button></article>})}{!offers.length&&<small>Nenhum exemplar disponível ainda.</small>}</div>
  </section>;
}

export function LoanDashboard(){
  const {user}=useAuth();const toast=useToast();const [data,setData]=useState({incoming:[],outgoing:[]});const [loading,setLoading]=useState(true);
  const load=()=>getLoanDashboard(user.id).then(setData).catch((error)=>toast(error.message)).finally(()=>setLoading(false));
  useEffect(load,[user.id]);
  async function respond(id,accept){let due=null;if(accept){due=window.prompt('Data sugerida para devolução (AAAA-MM-DD):',new Date(Date.now()+21*86400000).toISOString().slice(0,10));if(!due)return}try{await respondLoanRequest(id,accept,due);await load();toast(accept?'Empréstimo aceito.':'Pedido recusado.')}catch(error){toast(error.message)}}
  async function move(id,status){try{await updateLoanStatus(id,status);await load();toast(status==='returned'?'Devolução confirmada. Obrigado por circular histórias!':'Entrega registrada.')}catch(error){toast(error.message)}}
  const activeIncoming=data.incoming.filter((item)=>!['declined','cancelled','returned'].includes(item.status));const activeOutgoing=data.outgoing.filter((item)=>!['declined','cancelled','returned'].includes(item.status));
  if(loading)return null;if(!activeIncoming.length&&!activeOutgoing.length)return null;
  return <section className="painel-emprestimos widget"><header><div><strong>Passa adiante</strong><small>Gerencie empréstimos sem expor dados pessoais.</small></div><span>{activeIncoming.length+activeOutgoing.length} em andamento</span></header><div className="painel-emprestimos__colunas"><div><h3>Pedidos recebidos</h3>{activeIncoming.map((item)=><article key={item.id}><div><strong>{item.offer?.book?.title}</strong><small>{item.borrower?.display_name} · {statusLabel[item.status]}{item.due_at?` · até ${new Date(`${item.due_at}T12:00`).toLocaleDateString('pt-BR')}`:''}</small></div><nav>{item.status==='pending'&&<><button onClick={()=>respond(item.id,true)}>Aceitar</button><button onClick={()=>respond(item.id,false)}>Recusar</button></>}{item.status==='accepted'&&<button onClick={()=>move(item.id,'borrowed')}>Marcar entregue</button>}{item.status==='borrowed'&&<button onClick={()=>move(item.id,'returned')}>Confirmar devolução</button>}</nav></article>)}</div><div><h3>Meus pedidos</h3>{activeOutgoing.map((item)=><article key={item.id}><div><strong>{item.offer?.book?.title}</strong><small>{item.offer?.owner?.display_name} · {statusLabel[item.status]}{item.due_at?` · até ${new Date(`${item.due_at}T12:00`).toLocaleDateString('pt-BR')}`:''}</small></div>{['accepted','borrowed'].includes(item.status)&&<button onClick={()=>move(item.id,'returned')}>Confirmar devolução</button>}</article>)}</div></div></section>
}
