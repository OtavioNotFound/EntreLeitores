import { useEffect, useState } from 'react';
import AchievementsPanel from '../components/AchievementsPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { calculateAchievements } from '../lib/achievements.js';
import { getAchievementMetrics, getPlatformSettings, syncAutomaticAchievements, syncReaderRank } from '../services/social.js';

export default function Conquistas(){
  const {user,profile,refreshProfile}=useAuth();const toast=useToast();const [metrics,setMetrics]=useState(null);const [settings,setSettings]=useState(null);
  useEffect(()=>{let active=true;(async()=>{try{let [nextMetrics,nextSettings]=await Promise.all([getAchievementMetrics(user.id),getPlatformSettings()]);const calculated=calculateAchievements(nextMetrics);const inserted=await syncAutomaticAchievements(calculated);if(inserted)nextMetrics=await getAchievementMetrics(user.id);await syncReaderRank();await refreshProfile();if(active){setMetrics(nextMetrics);setSettings(nextSettings);}}catch(error){if(active)toast(error.message);}})();return()=>{active=false};},[user.id]);
  return <section className="pagina ativa" id="pagina-conquistas"><div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Conquistas</h1><p className="pagina-cabecalho__sub">Celebre sua trajetória sem transformar leitura em competição.</p></div></div>{metrics?<AchievementsPanel metrics={metrics} rankThresholds={settings?.rank_thresholds} readerRank={profile?.reader_rank} rankManual={profile?.rank_manual}/>:<div className="skeleton-card skeleton-card--alto"/>}</section>;
}
