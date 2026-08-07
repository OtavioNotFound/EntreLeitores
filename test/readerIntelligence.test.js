import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWeeklyActivity, calculateCompatibility, calculateDailyPace, calculateGentleGoal, calculateReadingStreak, summarizeSessions } from '../src/lib/readerIntelligence.js';
import { parseGoodreadsCsv } from '../src/lib/goodreadsImport.js';

test('compatibilidade explica livros e gêneros compartilhados', () => {
  const mine = [{ book_id: '1', rating: 5, book: { genre: 'Fantasia' } }];
  const theirs = [{ book_id: '1', rating: 5, book: { genre: 'Fantasia' } }];
  assert.deepEqual(calculateCompatibility(mine, theirs), { score: 100, commonBooks: 1, sharedGenres: ['Fantasia'] });
});

test('ritmo nunca recomenda menos de um dia', () => {
  const result = calculateDailyPace(300, '2026-08-07', new Date('2026-08-08T12:00:00Z'));
  assert.deepEqual(result, { days: 1, pagesPerDay: 300 });
});

test('sequência aceita hoje e dias consecutivos', () => {
  const sessions = [{ occurred_on:'2026-08-07' },{ occurred_on:'2026-08-06' },{ occurred_on:'2026-08-05' }];
  assert.equal(calculateReadingStreak(sessions, new Date('2026-08-07T12:00:00Z')), 3);
});

test('resumo agrega páginas, minutos e dias únicos', () => {
  const result = summarizeSessions([{occurred_on:'2026-08-07',pages_read:20,minutes_read:10},{occurred_on:'2026-08-07',pages_read:5,minutes_read:null}]);
  assert.equal(result.pages,25); assert.equal(result.minutes,10); assert.equal(result.days.size,1);
});

test('importa CSV do Goodreads com vírgulas e aspas', () => {
  const csv = 'Title,Author,ISBN13,My Rating,Exclusive Shelf,Date Read\n"Livro, com vírgula","Autora ""Nome""",9781234567890,5,read,2026/08/01';
  assert.deepEqual(parseGoodreadsCsv(csv), [{ title:'Livro, com vírgula', author:'Autora "Nome"', isbn:'9781234567890', rating:5, status:'lidos', finishedAt:'2026/08/01' }]);
});

test('atividade semanal preenche dias sem leitura', () => {
  const week = buildWeeklyActivity([{occurred_on:'2026-08-07',pages_read:12,minutes_read:5}], new Date('2026-08-07T12:00:00Z'));
  assert.equal(week.length,7); assert.equal(week.at(-1).pages,12); assert.equal(week[0].pages,0);
});

test('meta gentil sugere apenas o necessário nos dias restantes', () => {
  const result=calculateGentleGoal({metric:'minutes',target:100,starts_on:'2026-08-01',ends_on:'2026-08-10'},[{occurred_on:'2026-08-07',minutes_read:40}],new Date('2026-08-07T12:00:00'));
  assert.equal(result.progress,40); assert.equal(result.dailySuggestion,15); assert.equal(result.percent,40);
});
