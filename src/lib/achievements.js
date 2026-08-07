export const ACHIEVEMENTS = [
  { id:'avid_reader', title:'Leitor Voraz', description:'Conclua 25 livros.', metric:'finishedBooks', target:25, icon:'trophy' },
  { id:'streak_30', title:'Sequência de 30 dias', description:'Leia em 30 dias consecutivos.', metric:'streak', target:30, icon:'fire' },
  { id:'genres_10', title:'10 gêneros lidos', description:'Conclua livros de 10 gêneros diferentes.', metric:'genres', target:10, icon:'genres' },
  { id:'first_review', title:'Primeira resenha', description:'Publique sua primeira resenha.', metric:'reviews', target:1, icon:'review' },
  { id:'first_finish', title:'Primeira jornada', description:'Conclua seu primeiro livro.', metric:'finishedBooks', target:1, icon:'book' },
  { id:'thousand_pages', title:'Mil páginas depois', description:'Registre 1.000 páginas de leitura.', metric:'pages', target:1000, icon:'pages' },
  { id:'active_voice', title:'Voz ativa', description:'Compartilhe 10 publicações.', metric:'posts', target:10, icon:'voice' },
  { id:'private_journal', title:'Caderno cheio', description:'Guarde 10 notas privadas.', metric:'notes', target:10, icon:'journal' },
  { id:'rereader', title:'Outra perspectiva', description:'Inicie sua primeira releitura.', metric:'rereads', target:1, icon:'reread' },
  { id:'community', title:'Em boa companhia', description:'Participe de 3 clubes.', metric:'clubs', target:3, icon:'community' },
  { id:'circulation', title:'História em circulação', description:'Conclua um empréstimo entre leitores.', metric:'returnedLoans', target:1, icon:'lending' },
  { id:'gentle_return', title:'No meu próprio ritmo', description:'Retome uma leitura depois de uma pausa.', metric:'resumedPauses', target:1, icon:'pause' },
];

export function calculateAchievements(metrics={}){
  return ACHIEVEMENTS.map((achievement)=>{
    const current=Math.max(0,Number(metrics[achievement.metric]||0));
    return {...achievement,current,unlocked:current>=achievement.target,percent:Math.min(100,Math.round((current/achievement.target)*100))};
  });
}
