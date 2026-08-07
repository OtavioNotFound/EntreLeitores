import {
  AutoStoriesRounded, CampaignRounded, CategoryRounded, EditNoteRounded, EmojiEventsRounded,
  GroupsRounded, LocalFireDepartmentRounded, MenuBookRounded, RateReviewRounded, ReplayRounded,
  SpaRounded, VolunteerActivismRounded,
} from '@mui/icons-material';
import { calculateAchievements } from '../lib/achievements.js';

const icons={trophy:EmojiEventsRounded,fire:LocalFireDepartmentRounded,genres:CategoryRounded,review:RateReviewRounded,book:MenuBookRounded,pages:AutoStoriesRounded,voice:CampaignRounded,journal:EditNoteRounded,reread:ReplayRounded,community:GroupsRounded,lending:VolunteerActivismRounded,pause:SpaRounded};

export default function AchievementsPanel({metrics}){
  const achievements=calculateAchievements(metrics);const unlocked=achievements.filter((item)=>item.unlocked).length;
  return <section className="conquistas-painel"><header className="conquistas-resumo widget"><div><strong>{unlocked} de {achievements.length} conquistas</strong><small>Marcos calculados a partir da sua atividade real.</small></div><div className="conquistas-resumo__barra"><span style={{width:`${Math.round(unlocked/achievements.length*100)}%`}}/></div></header><div className="conquistas-grid">{achievements.map((achievement)=>{const Icon=icons[achievement.icon]||EmojiEventsRounded;return <article className={`conquista${achievement.unlocked?' desbloqueada':' bloqueada'}`} key={achievement.id}><div className="conquista__icone"><Icon/></div><div className="conquista__titulo">{achievement.title}</div><p>{achievement.description}</p><div className="conquista__progresso"><span style={{width:`${achievement.percent}%`}}/></div><small>{achievement.unlocked?'Desbloqueada':`${achievement.current} / ${achievement.target}`}</small></article>})}</div></section>;
}
