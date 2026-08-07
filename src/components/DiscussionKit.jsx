import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';
import { createClubPrompt, getClubReading, getSafeClubPrompts, toggleClubPromptVote } from '../services/social.js';

export default function DiscussionKit({club}){
  const {user}=useAuth();const toast=useToast();const [reading,setReading]=useState(null);const [prompts,setPrompts]=useState([]);const [open,setOpen]=useState(false);const [form,setForm]=useState({question:'',progress:0});const [busy,setBusy]=useState(false);
  async function load(){try{const active=await getClubReading(club.id);setReading(active);setPrompts(active?await getSafeClubPrompts(club.id,active.book_id):[]);}catch(error){toast(error.message)}}
  useEffect(()=>{load();},[club.id]);
  async function submit(event){event.preventDefault();setBusy(true);try{await createClubPrompt(user.id,club.id,reading.book_id,form.question,form.progress);setForm({question:'',progress:0});setOpen(false);await load();toast('Pergunta colocada no pote sem spoilers.');}catch(error){toast(error.message)}finally{setBusy(false)}}
  async function vote(id){try{await toggleClubPromptVote(id);await load();}catch(error){toast(error.message)}}
  if(!reading)return null;
  return <section className="pote-perguntas widget"><header><div><strong>Pote de perguntas</strong><small>{reading.book?.title} · perguntas liberadas conforme seu progresso</small></div><button className="btn-secundario" onClick={()=>setOpen(!open)}>{open?'Cancelar':'+ Nova pergunta'}</button></header>
    {open&&<form onSubmit={submit}><textarea required minLength="5" maxLength="500" value={form.question} onChange={(e)=>setForm({...form,question:e.target.value})} placeholder="Que pergunta renderia uma boa conversa?"/><label>Liberar após <input type="number" min="0" max="100" value={form.progress} onChange={(e)=>setForm({...form,progress:e.target.value})}/>%</label><button className="btn-primario" disabled={busy}>Colocar no pote</button></form>}
    <div className="pote-perguntas__lista">{prompts.map((prompt)=><article className={prompt.locked?'bloqueada':''} key={prompt.id}><button className="pote-perguntas__voto" disabled={prompt.locked} onClick={()=>vote(prompt.id)} aria-label="Apoiar pergunta"><span>▲</span>{prompt.votes}</button><div>{prompt.locked?<><strong>Pergunta protegida</strong><p>Será liberada quando você chegar a {prompt.spoiler_progress}%.</p></>:<><strong>{prompt.question}</strong><p>{prompt.author_name} · segura após {prompt.spoiler_progress}%</p></>}</div></article>)}{!prompts.length&&<small>O pote está vazio. Adicione a primeira pergunta para o encontro.</small>}</div>
  </section>;
}
