import { useCallback, useEffect, useState } from 'react';
import { DeleteOutlined as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';
import { deleteReadingNote, getReadingNotes, saveReadingNote } from '../services/social.js';

const kindLabels={highlight:'Destaque',reflection:'Reflexão',question:'Pergunta',vocabulary:'Vocabulário'};

export default function ReadingNotebook({bookId,currentProgress=0}){
  const {user}=useAuth(); const toast=useToast(); const [notes,setNotes]=useState([]); const [search,setSearch]=useState(''); const [open,setOpen]=useState(false);
  const [form,setForm]=useState({kind:'reflection',content:'',progress:currentProgress,pageNumber:'',chapter:''});
  const load=useCallback(()=>getReadingNotes(user.id,bookId,search).then(setNotes).catch((error)=>toast(error.message)),[user.id,bookId,search,toast]);
  useEffect(()=>{const timer=setTimeout(load,200);return()=>clearTimeout(timer)},[load]);
  async function submit(event){event.preventDefault();try{await saveReadingNote(user.id,bookId,{...form,progress:Number(form.progress)});setForm({...form,content:'',pageNumber:'',chapter:''});setOpen(false);load();toast('Nota guardada no seu caderno privado.')}catch(error){toast(error.message)}}
  async function remove(id){try{await deleteReadingNote(user.id,id);setNotes((items)=>items.filter((item)=>item.id!==id));}catch(error){toast(error.message)}}
  return <section className="caderno-leitura widget"><header><div><h2>Meu caderno privado</h2><p>Destaques e pensamentos visíveis somente para você.</p></div><button className="btn-secundario" onClick={()=>setOpen(!open)}>{open?'Cancelar':'+ Nova nota'}</button></header>
    {open&&<form onSubmit={submit}><select value={form.kind} onChange={(e)=>setForm({...form,kind:e.target.value})}>{Object.entries(kindLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><textarea required maxLength={2000} value={form.content} onChange={(e)=>setForm({...form,content:e.target.value})} placeholder="O que você quer guardar desta leitura?"/><label>Progresso<input type="number" min="0" max="100" value={form.progress} onChange={(e)=>setForm({...form,progress:e.target.value})}/>%</label><input type="number" min="1" value={form.pageNumber} onChange={(e)=>setForm({...form,pageNumber:e.target.value})} placeholder="Página"/><input maxLength={100} value={form.chapter} onChange={(e)=>setForm({...form,chapter:e.target.value})} placeholder="Capítulo"/><button className="btn-primario">Guardar</button></form>}
    <div className="caderno-leitura__busca"><SearchIcon fontSize="small"/><input aria-label="Buscar no caderno" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar nas suas notas..."/></div>
    <div className="caderno-leitura__lista">{notes.length?notes.map((note)=><article key={note.id}><span>{kindLabels[note.kind]}</span><p>{note.content}</p><small>{note.progress!=null?`${note.progress}%`:''}{note.page_number?` · pág. ${note.page_number}`:''}{note.chapter?` · ${note.chapter}`:''}</small><button aria-label="Excluir nota" onClick={()=>remove(note.id)}><DeleteIcon fontSize="small"/></button></article>):<p className="estado-vazio__texto">Seu caderno ainda está vazio.</p>}</div>
  </section>;
}
