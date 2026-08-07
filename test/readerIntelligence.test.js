import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCompatibility, calculateDailyPace } from '../src/lib/readerIntelligence.js';

test('compatibilidade explica livros e gêneros compartilhados', () => {
  const mine = [{ book_id: '1', rating: 5, book: { genre: 'Fantasia' } }];
  const theirs = [{ book_id: '1', rating: 5, book: { genre: 'Fantasia' } }];
  assert.deepEqual(calculateCompatibility(mine, theirs), { score: 100, commonBooks: 1, sharedGenres: ['Fantasia'] });
});

test('ritmo nunca recomenda menos de um dia', () => {
  const result = calculateDailyPace(300, '2026-08-07', new Date('2026-08-08T12:00:00Z'));
  assert.deepEqual(result, { days: 1, pagesPerDay: 300 });
});
