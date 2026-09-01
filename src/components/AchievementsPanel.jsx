import { useEffect, useMemo, useState } from 'react';
import {
  AutoStoriesRounded, CampaignRounded, CategoryRounded, EditNoteRounded, EmojiEventsRounded,
  GroupsRounded, LocalFireDepartmentRounded, MenuBookRounded, RateReviewRounded, ReplayRounded,
  SpaRounded, VolunteerActivismRounded,
} from '@mui/icons-material';
import { calculateAchievements, difficultyLabels } from '../lib/achievements.js';

const icons={trophy:EmojiEventsRounded,fire:LocalFireDepartmentRounded,genres:CategoryRounded,review:RateReviewRounded,book:MenuBookRounded,pages:AutoStoriesRounded,voice:CampaignRounded,journal:EditNoteRounded,reread:ReplayRounded,community:GroupsRounded,lending:VolunteerActivismRounded,pause:SpaRounded};

export default function AchievementsPanel({metrics}){
  const achievements = useMemo(() => calculateAchievements(metrics), [metrics]);
  const [newAchievement, setNewAchievement] = useState(null);
  const unlocked = achievements.filter((item) => item.unlocked).length;
  const xp = achievements.filter((item) => item.unlocked).reduce((total, item) => total + item.xp, 0);
  useEffect(() => {
    const key = 'entreleitores:achievements-seen';
    const seen = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
    const newest = achievements.find((item) => item.unlocked && !seen.has(item.id));
    if (newest) { setNewAchievement(newest); localStorage.setItem(key, JSON.stringify([...seen, newest.id])); }
  }, [achievements]);
  return <section className="conquistas-painel">{newAchievement && <div className={`conquista-celebracao conquista-celebracao--${newAchievement.difficulty}`} role="status"><EmojiEventsRounded/><div><strong>Conquista desbloqueada!</strong><span>{newAchievement.title} · +{newAchievement.xp} XP</span></div><button onClick={() => setNewAchievement(null)} aria-label="Fechar celebração">×</button></div>}<header className="conquistas-resumo widget"><div><strong>{unlocked} de {achievements.length} conquistas</strong><small>{xp} XP conquistados na sua jornada.</small></div><div className="conquistas-resumo__barra"><span style={{width:`${Math.round(unlocked/achievements.length*100)}%`}}/></div></header><div className="conquistas-grid">{achievements.map((achievement)=>{const Icon=icons[achievement.icon]||EmojiEventsRounded;const hidden=achievement.secret&&!achievement.unlocked;return <article className={`conquista conquista--${achievement.difficulty}${achievement.unlocked?' desbloqueada':' bloqueada'}`} key={achievement.id}><div className="conquista__icone"><Icon/></div><span className="conquista__dificuldade">{difficultyLabels[achievement.difficulty]}</span><div className="conquista__titulo">{hidden?'Conquista secreta':achievement.title}</div><p>{hidden?'Continue explorando o Entre Leitores para revelar este marco.':achievement.description}</p><div className="conquista__progresso"><span style={{width:`${achievement.percent}%`}}/></div><small>{achievement.unlocked?`Desbloqueada · +${achievement.xp} XP`:`${achievement.current} / ${achievement.target}`}</small></article>})}</div></section>;
}
