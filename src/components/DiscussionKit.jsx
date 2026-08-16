import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';
import { createClubPrompt, deleteClubPrompt, getClubReading, getSafeClubPrompts, toggleClubPromptVote, updateClubPrompt } from '../services/social.js';
import { DeleteOutlined as DeleteIcon, EditOutlined as EditIcon } from '@mui/icons-material';

export default function DiscussionKit({club}){
  const {user}=useAuth();const toast=useToast();const [reading,setReading]=useState(null);const [prompts,setPrompts]=useState([]);const [open,setOpen]=useState(false);const [editingId,setEditingId]=useState(null);const [form,setForm]=useState({question:'',progress:0});const [busy,setBusy]=useState(false);
  async function load(){try{const active=await getClubReading(club.id);setReading(active);setPrompts(active?await getSafeClubPrompts(club.id,active.book_id):[]);}catch(error){toast(error.message)}}
  useEffect(()=>{load();},[club.id]);
  function fecharFormulario(){setOpen(false);setEditingId(null);setForm({question:'',progress:0});}
  function editar(prompt){setEditingId(prompt.id);setForm({question:prompt.question,progress:prompt.spoiler_progress});setOpen(true);}
  async function submit(event){event.preventDefault();setBusy(true);try{if(editingId){await updateClubPrompt(user.id,editingId,form.question,form.progress);toast('Pergunta atualizada.');}else{await createClubPrompt(user.id,club.id,reading.book_id,form.question,form.progress);toast('Pergunta colocada no pote sem spoilers.');}fecharFormulario();await load();}catch(error){toast(error.message)}finally{setBusy(false)}}
  async function excluir(prompt){if(!window.confirm('Excluir esta pergunta do clube?'))return;setBusy(true);try{await deleteClubPrompt(user.id,prompt.id);await load();toast('Pergunta excluída.');}catch(error){toast(error.message)}finally{setBusy(false)}}
  async function vote(id){try{await toggleClubPromptVote(id);await load();}catch(error){toast(error.message)}}
  if(!reading)return null;
  return <section className="pote-perguntas widget"><header><div><strong>Perguntas do clube</strong><small>{reading.book?.title} · perguntas liberadas conforme seu progresso</small></div><button className="btn-secundario" onClick={()=>open?fecharFormulario():setOpen(true)}>{open?'Cancelar':'+ Nova pergunta'}</button></header>
    {open&&<form onSubmit={submit}><textarea required minLength="5" maxLength="500" value={form.question} onChange={(e)=>setForm({...form,question:e.target.value})} placeholder="Que pergunta renderia uma boa conversa?"/><label>Liberar após <input type="number" min="0" max="100" value={form.progress} onChange={(e)=>setForm({...form,progress:e.target.value})}/>%</label><button className="btn-primario" disabled={busy}>{editingId?'Salvar edição':'Publicar pergunta'}</button></form>}
    <div className="pote-perguntas__lista">{prompts.map((prompt)=><article className={prompt.locked?'bloqueada':''} key={prompt.id}><button className="pote-perguntas__voto" disabled={prompt.locked} onClick={()=>vote(prompt.id)} aria-label="Apoiar pergunta"><span>▲</span>{prompt.votes}</button><div>{prompt.locked?<><strong>Pergunta protegida</strong><p>Será liberada quando você chegar a {prompt.spoiler_progress}%.</p></>:<><strong>{prompt.question}</strong><p>{prompt.author_name} · segura após {prompt.spoiler_progress}%</p></>}</div>{prompt.author_id===user.id&&<div className="pote-perguntas__acoes"><button type="button" onClick={()=>editar(prompt)} aria-label="Editar pergunta"><EditIcon fontSize="small"/> Editar</button><button type="button" className="perigo" onClick={()=>excluir(prompt)} aria-label="Excluir pergunta"><DeleteIcon fontSize="small"/> Excluir</button></div>}</article>)}{!prompts.length&&<small>O espaço de perguntas está vazio. Adicione a primeira pergunta para o encontro.</small>}</div>
  </section>;
}
