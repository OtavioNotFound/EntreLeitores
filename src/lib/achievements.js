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

  // A especificação pede 40 marcos e determina que equivalentes existentes não sejam duplicados.
  { id:'shelf_5', title:'Primeira Estante', description:'Adicione 5 livros à sua estante.', metric:'shelfBooks', target:5, icon:'bookshelf', difficulty:'simple', xp:50 },
  { id:'shelf_25', title:'Pequena Biblioteca', description:'Adicione 25 livros à sua estante.', metric:'shelfBooks', target:25, icon:'bookshelf', difficulty:'medium', xp:125 },
  { id:'shelf_50', title:'Biblioteca Crescente', description:'Adicione 50 livros à sua estante.', metric:'shelfBooks', target:50, icon:'bookshelf', difficulty:'difficult', xp:300 },
  { id:'reading_nights_3', title:'Leitor Noturno', description:'Registre sessões reais de leitura à noite em 3 dias diferentes.', metric:'nightReadingDays', target:3, icon:'night', difficulty:'medium', xp:125 },
  { id:'reading_mornings_3', title:'Leitor Matinal', description:'Registre sessões reais de leitura pela manhã em 3 dias diferentes.', metric:'morningReadingDays', target:3, icon:'morning', difficulty:'medium', xp:125 },
  { id:'finished_5', title:'Livro Finalizado', description:'Conclua 5 livros.', metric:'finishedBooks', target:5, icon:'book', difficulty:'medium', xp:125 },
  { id:'finished_10', title:'Leitor Constante', description:'Conclua 10 livros.', metric:'finishedBooks', target:10, icon:'book', difficulty:'difficult', xp:300 },
  { id:'marathon_5_30', title:'Maratona Literária', description:'Conclua 5 livros em um período de 30 dias.', metric:'marathonFinished30', target:5, icon:'marathon', difficulty:'difficult', xp:300 },
  { id:'reading_days_7', title:'Uma Página de Cada Vez', description:'Leia em 7 dias diferentes, sem exigir sequência.', metric:'readingDays', target:7, icon:'pages', difficulty:'simple', xp:50 },
  { id:'first_highlight', title:'Primeira Marca', description:'Destaque um trecho no leitor pela primeira vez.', metric:'highlights', target:1, icon:'highlight', difficulty:'simple', xp:50 },
  { id:'highlight_colors_3', title:'Colecionador de Cores', description:'Use 3 cores diferentes em marcações.', metric:'highlightColors', target:3, icon:'palette', difficulty:'medium', xp:125 },
  { id:'first_annotation', title:'Primeiro Pensamento', description:'Crie sua primeira anotação durante uma leitura.', metric:'annotations', target:1, icon:'journal', difficulty:'simple', xp:50 },
  { id:'annotations_25', title:'Ideias Guardadas', description:'Crie 25 anotações durante suas leituras.', metric:'annotations', target:25, icon:'idea', difficulty:'difficult', xp:300 },
  { id:'quotes_10', title:'Guardião de Trechos', description:'Salve 10 citações ou trechos.', metric:'citations', target:10, icon:'highlight', difficulty:'medium', xp:125 },
  { id:'quotes_25', title:'Colecionador de Citações', description:'Salve 25 citações ou trechos.', metric:'citations', target:25, icon:'quote', difficulty:'difficult', xp:300 },
  { id:'reader_modes_3', title:'Leitura Personalizada', description:'Use pelo menos 3 modos de leitura diferentes.', metric:'readingModes', target:3, icon:'palette', difficulty:'medium', xp:125 },
  { id:'font_adjusted', title:'Olhar Atento', description:'Altere o tamanho da visualização durante uma leitura.', metric:'fontAdjustments', target:1, icon:'search', difficulty:'simple', xp:50 },
  { id:'margin_adjusted', title:'Leitura Confortável', description:'Ajuste ou fixe as margens durante uma leitura.', metric:'marginAdjustments', target:1, icon:'margin', difficulty:'simple', xp:50 },
  { id:'private_pdf_1', title:'Meu Primeiro Arquivo', description:'Adicione seu primeiro PDF privado à estante.', metric:'privateBooks', target:1, icon:'file', difficulty:'simple', xp:50 },
  { id:'private_pdf_5', title:'Arquivista Pessoal', description:'Adicione 5 materiais privados à estante.', metric:'privateBooks', target:5, icon:'archive', difficulty:'medium', xp:125 },
  { id:'private_pdf_10', title:'Coleção Particular', description:'Adicione 10 materiais privados à estante.', metric:'privateBooks', target:10, icon:'bookshelf', difficulty:'difficult', xp:300 },
  { id:'page_jump', title:'Explorador de Páginas', description:'Use a navegação direta para ir a uma página específica.', metric:'pageJumps', target:1, icon:'compass', difficulty:'simple', xp:50 },
  { id:'page_overview', title:'Visão Geral', description:'Abra a visualização de todas as páginas de um livro.', metric:'pageOverviews', target:1, icon:'map', difficulty:'simple', xp:50 },
  { id:'progress_25', title:'Primeiros Passos', description:'Chegue a 25% de progresso em um livro.', metric:'maxProgress', target:25, icon:'rocket', difficulty:'simple', xp:50 },
  { id:'progress_50', title:'Meio do Caminho', description:'Chegue a 50% de progresso em um livro.', metric:'maxProgress', target:50, icon:'marathon', difficulty:'medium', xp:125 },
  { id:'progress_90', title:'Quase Lá', description:'Chegue a 90% de progresso em um livro.', metric:'maxProgress', target:90, icon:'mountain', difficulty:'difficult', xp:300 },
  { id:'reading_resume', title:'Nunca Perdido', description:'Retorne ao leitor e continue da última página salva.', metric:'readingResumes', target:1, icon:'save', difficulty:'medium', xp:125 },
  { id:'genres_3', title:'Viajante Literário', description:'Conclua livros de 3 gêneros diferentes.', metric:'genres', target:3, icon:'genres', difficulty:'simple', xp:50 },
  { id:'genres_5', title:'Leitor Versátil', description:'Conclua livros de 5 gêneros diferentes.', metric:'genres', target:5, icon:'palette', difficulty:'medium', xp:125 },
  { id:'genres_8', title:'Colecionador de Mundos', description:'Conclua livros de 8 gêneros diferentes.', metric:'genres', target:8, icon:'worlds', difficulty:'difficult', xp:300 },
  { id:'new_genre', title:'Fora da Zona de Conforto', description:'Conclua um livro de um novo gênero depois da sua primeira leitura.', metric:'newGenres', target:1, icon:'shuffle', difficulty:'medium', xp:125 },
  { id:'first_debate', title:'Primeiro Debate', description:'Faça um comentário e receba uma interação em resposta.', metric:'discussionReplies', target:1, icon:'discussion', difficulty:'medium', xp:125 },
  { id:'post_likes_10', title:'Publicação Popular', description:'Receba 10 curtidas em uma única publicação.', metric:'maxPostLikes', target:10, icon:'heart', difficulty:'medium', xp:125 },
  { id:'post_likes_25', title:'Post em Destaque', description:'Receba 25 curtidas em uma única publicação.', metric:'maxPostLikes', target:25, icon:'star', difficulty:'difficult', xp:300 },
  { id:'unique_interactors_5', title:'Círculo de Leitores', description:'Interaja com 5 leitores diferentes.', metric:'uniqueInteractors', target:5, icon:'community', difficulty:'medium', xp:125 },
  { id:'recommendation_post', title:'Recomendação Literária', description:'Crie uma publicação associada a um livro recomendado.', metric:'recommendations', target:1, icon:'recommend', difficulty:'simple', xp:50 },
  { id:'achievements_10', title:'Colecionador de Conquistas', description:'Desbloqueie 10 conquistas diferentes.', metric:'unlockedAchievements', target:10, icon:'trophy', difficulty:'difficult', xp:300 },
];

export const difficultyLabels = { simple:'Simples', medium:'Médio', difficult:'Difícil', secret:'Secreto' };

export const DEFAULT_RANK_THRESHOLDS = { explorer:100, debater:500, connector:1500, curator:5000, legend:10000 };

export const READER_RANKS = [
  { key:'visitor', label:'Leitor Visitante', icon:'📄', threshold:0 },
  { key:'explorer', label:'Explorador de Páginas', icon:'📄📄' },
  { key:'debater', label:'Debatedor de Capítulos', icon:'📚' },
  { key:'connector', label:'Conectador de Histórias', icon:'📖' },
  { key:'curator', label:'Curador Literário', icon:'📘' },
  { key:'legend', label:'Lenda da Estante', icon:'📕' },
];

function metricValue(metrics, metric) {
  return Math.max(0, Number(metrics?.[metric] || 0));
}

export function calculateAchievements(metrics = {}) {
  const persisted = new Set(metrics.unlockedAchievementIds || []);
  const calculated = ACHIEVEMENTS.map((achievement) => {
    const current = metricValue(metrics, achievement.metric);
    const unlocked = persisted.has(achievement.id) || current >= achievement.target;
    return { ...achievement, current, unlocked, percent:unlocked ? 100 : Math.min(100, Math.round((current / achievement.target) * 100)) };
  });
  const unlockedWithoutCollector = calculated.filter((item) => item.id !== 'achievements_10' && item.unlocked).length;
  return calculated.map((achievement) => achievement.id === 'achievements_10' && !persisted.has(achievement.id)
    ? { ...achievement, current:unlockedWithoutCollector, unlocked:unlockedWithoutCollector >= achievement.target, percent:Math.min(100, Math.round((unlockedWithoutCollector / achievement.target) * 100)) }
    : achievement);
}

export function calculateReaderRank(xp = 0, thresholds = DEFAULT_RANK_THRESHOLDS, manualRank = null) {
  const normalized = { ...DEFAULT_RANK_THRESHOLDS, ...(thresholds || {}) };
  const ranked = READER_RANKS.map((rank) => ({ ...rank, threshold:rank.key === 'visitor' ? 0 : Math.max(0, Number(normalized[rank.key] ?? DEFAULT_RANK_THRESHOLDS[rank.key])) }));
  let index = manualRank ? ranked.findIndex((rank) => rank.key === manualRank) : -1;
  if (index < 0) index = ranked.reduce((current, rank, rankIndex) => Number(xp) >= rank.threshold ? rankIndex : current, 0);
  const current = ranked[index];
  const next = ranked[index + 1] || null;
  const base = current.threshold;
  const percent = next ? Math.max(0, Math.min(100, Math.round(((Number(xp) - base) / Math.max(1, next.threshold - base)) * 100))) : 100;
  return { current, next, percent, xp:Number(xp) || 0, manual:Boolean(manualRank), ranks:ranked };
}

export function getAchievementById(id) {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id) || null;
}
