export const ACHIEVEMENTS = [
  { id:'avid_reader', title:'Leitor Voraz', description:'Conclua 25 livros.', metric:'finishedBooks', target:25, icon:'trophy', difficulty:'difficult', xp:300 },
  { id:'streak_30', title:'Sequência de 30 dias', description:'Leia ou use uma proteção em 30 dias consecutivos.', metric:'streak', target:30, icon:'fire', difficulty:'difficult', xp:300 },
  { id:'genres_10', title:'10 gêneros lidos', description:'Conclua livros de 10 gêneros diferentes.', metric:'genres', target:10, icon:'genres', difficulty:'difficult', xp:300 },
  { id:'first_review', title:'Primeira resenha', description:'Publique sua primeira resenha.', metric:'reviews', target:1, icon:'review', difficulty:'simple', xp:50 },
  { id:'first_finish', title:'Primeira Jornada', description:'Conclua seu primeiro livro.', metric:'finishedBooks', target:1, icon:'book', difficulty:'simple', xp:50 },
  { id:'first_friend', title:'Primeiro Amigo Leitor', description:'Conquiste seu primeiro seguidor.', metric:'followers', target:1, icon:'community', difficulty:'simple', xp:50 },
  { id:'thousand_pages', title:'Mil Páginas Depois', description:'Registre 1.000 páginas de leitura.', metric:'pages', target:1000, icon:'pages', difficulty:'medium', xp:125 },
  { id:'active_voice', title:'Voz Ativa', description:'Compartilhe 10 publicações.', metric:'posts', target:10, icon:'voice', difficulty:'medium', xp:125 },
  { id:'private_journal', title:'Caderno Cheio', description:'Guarde 10 notas privadas.', metric:'notes', target:10, icon:'journal', difficulty:'medium', xp:125 },
  { id:'community', title:'Em Boa Companhia', description:'Participe de 3 clubes.', metric:'clubs', target:3, icon:'community', difficulty:'medium', xp:125 },
  { id:'circulation', title:'História em Circulação', description:'Conclua um empréstimo entre leitores.', metric:'returnedLoans', target:1, icon:'lending', difficulty:'difficult', xp:300 },
  { id:'rereader', title:'Outra Perspectiva', description:'Inicie sua primeira releitura.', metric:'rereads', target:1, icon:'reread', difficulty:'medium', xp:125 },
  { id:'gentle_return', title:'No Meu Próprio Ritmo', description:'Retome uma leitura depois de uma pausa.', metric:'resumedPauses', target:1, icon:'pause', difficulty:'medium', xp:125 },
  { id:'night_owl', title:'Coruja Literária', description:'Publique ou registre uma leitura depois das 22h.', metric:'nightActions', target:1, icon:'fire', difficulty:'secret', xp:500, secret:true },
  { id:'beloved_reader', title:'Leitor Querido', description:'Receba 50 curtidas nas suas publicações.', metric:'likesReceived', target:50, icon:'trophy', difficulty:'secret', xp:500, secret:true },
];

export const difficultyLabels = { simple:'Simples', medium:'Médio', difficult:'Difícil', secret:'Secreto' };

export function calculateAchievements(metrics = {}) {
  return ACHIEVEMENTS.map((achievement) => {
    const current = Math.max(0, Number(metrics[achievement.metric] || 0));
    return { ...achievement, current, unlocked: current >= achievement.target, percent: Math.min(100, Math.round((current / achievement.target) * 100)) };
  });
}
