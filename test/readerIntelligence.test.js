import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCompatibility, calculateDailyPace, calculateReadingStreak, summarizeSessions } from '../src/lib/readerIntelligence.js';

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
