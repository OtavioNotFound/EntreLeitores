import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';
import { getBookSafety, saveBookWarning } from '../services/social.js';
import { matchingWarnings, WARNING_CATEGORIES, WARNING_LABELS, warningConfidence } from '../lib/bookSafety.js';

export default function BookSafety({bookId}){
  const {user}=useAuth();const toast=useToast();const [data,setData]=useState({warnings:[],preferences:{categories:[],minimum_severity:2,blur_sensitive:true}});const [open,setOpen]=useState(false);const [busy,setBusy]=useState(false);const [form,setForm]=useState({category:'violencia',severity:2,details:''});
  const load=()=>getBookSafety(user.id,bookId).then(setData).catch((error)=>toast(error.message));
  useEffect(load,[bookId,user.id]);
  async function submit(event){event.preventDefault();setBusy(true);try{await saveBookWarning(user.id,bookId,form);await load();setOpen(false);setForm({...form,details:''});toast('Aviso registrado sem revelar sua identidade.');}catch(error){toast(error.message)}finally{setBusy(false)}}
  const matches=matchingWarnings(data.warnings,data.preferences);
  return <section className={`seguranca-leitura widget${matches.length&&data.preferences.blur_sensitive?' seguranca-leitura--alerta':''}`}>
    <header><div><h2>Antes de ler</h2><p>Avisos construídos por consenso. Eles informam temas sensíveis sem resumir a história.</p></div><button className="btn-secundario" onClick={()=>setOpen(!open)}>{open?'Cancelar':'+ Contribuir'}</button></header>
    {matches.length>0&&<div className="seguranca-leitura__personalizado"><strong>Este livro toca em temas que você prefere evitar</strong><span>{matches.map((item)=>WARNING_LABELS[item.category]).join(' · ')}</span></div>}
    {open&&<form onSubmit={submit}><select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>{WARNING_CATEGORIES.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select><select value={form.severity} onChange={(e)=>setForm({...form,severity:e.target.value})}><option value="1">Leve</option><option value="2">Moderado</option><option value="3">Intenso</option></select><input maxLength="280" value={form.details} onChange={(e)=>setForm({...form,details:e.target.value})} placeholder="Contexto opcional, sem spoilers"/><button className="btn-primario" disabled={busy}>Registrar aviso</button></form>}
    <div className="seguranca-leitura__avisos">{data.warnings.map((warning)=><details key={warning.category}><summary><span>{WARNING_LABELS[warning.category]||warning.category}</span><small>{warningConfidence(Number(warning.votes))} · intensidade {warning.severity}/3</small></summary>{warning.details?.length>0&&<p>{warning.details.slice(0,3).join(' · ')}</p>}</details>)}{!data.warnings.length&&<small>Nenhum tema sensível foi sinalizado pela comunidade.</small>}</div>
  </section>;
}
