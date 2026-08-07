import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';
import { getContentPreferences, saveContentPreferences } from '../services/social.js';
import { WARNING_CATEGORIES } from '../lib/bookSafety.js';

export default function SafetyPreferences(){
  const {user}=useAuth();const toast=useToast();const [preferences,setPreferences]=useState({categories:[],minimum_severity:2,blur_sensitive:true});const [busy,setBusy]=useState(false);
  useEffect(()=>{getContentPreferences(user.id).then(setPreferences).catch(()=>{});},[user.id]);
  function toggle(category){setPreferences((current)=>({...current,categories:current.categories.includes(category)?current.categories.filter((item)=>item!==category):[...current.categories,category]}));}
  async function save(){setBusy(true);try{setPreferences(await saveContentPreferences(user.id,preferences));toast('Preferências de cuidado salvas.');}catch(error){toast(error.message)}finally{setBusy(false)}}
  return <section className="widget preferencias-cuidado"><div><strong>Modo de cuidado</strong><small>Escolha temas sobre os quais você quer ser avisado antes de abrir um livro.</small></div><div className="preferencias-cuidado__categorias">{WARNING_CATEGORIES.slice(0,-1).map(([key,label])=><label key={key}><input type="checkbox" checked={preferences.categories.includes(key)} onChange={()=>toggle(key)}/><span>{label}</span></label>)}</div><div className="preferencias-cuidado__acoes"><label>Avisar a partir de <select value={preferences.minimum_severity} onChange={(e)=>setPreferences({...preferences,minimum_severity:Number(e.target.value)})}><option value="1">leve</option><option value="2">moderado</option><option value="3">intenso</option></select></label><label><input type="checkbox" checked={preferences.blur_sensitive} onChange={(e)=>setPreferences({...preferences,blur_sensitive:e.target.checked})}/> Destacar alertas compatíveis</label><button className="btn-secundario" disabled={busy} onClick={save}>{busy?'Salvando...':'Salvar preferências'}</button></div></section>;
}
