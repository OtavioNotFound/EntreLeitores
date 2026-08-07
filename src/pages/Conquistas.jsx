import { useEffect, useState } from 'react';
import AchievementsPanel from '../components/AchievementsPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { getAchievementMetrics } from '../services/social.js';

export default function Conquistas(){
  const {user}=useAuth();const toast=useToast();const [metrics,setMetrics]=useState(null);
  useEffect(()=>{getAchievementMetrics(user.id).then(setMetrics).catch((error)=>toast(error.message));},[user.id]);
  return <section className="pagina ativa" id="pagina-conquistas"><div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Conquistas</h1><p className="pagina-cabecalho__sub">Celebre sua trajetória sem transformar leitura em competição.</p></div></div>{metrics?<AchievementsPanel metrics={metrics}/>:<div className="skeleton-card skeleton-card--alto"/>}</section>;
}
