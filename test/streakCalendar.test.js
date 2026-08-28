import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMonthlyStreakCalendar, calculateReadingStreak } from '../src/lib/readerIntelligence.js';

test('proteções preservam a ofensiva em dias sem leitura', () => {
  const sessions = [{ occurred_on: '2026-08-26' }, { occurred_on: '2026-08-28' }];
  const protections = [{ protected_on: '2026-08-27' }];
  assert.equal(calculateReadingStreak(sessions, new Date('2026-08-28T12:00:00'), protections), 3);
});

test('calendário distingue leitura, proteção, falta e futuro', () => {
  const calendar = buildMonthlyStreakCalendar(
    [{ occurred_on: '2026-08-01' }],
    [{ protected_on: '2026-08-02' }],
    new Date('2026-08-01T12:00:00'),
    new Date('2026-08-03T12:00:00'),
  );
  assert.equal(calendar.days[0].status, 'read');
  assert.equal(calendar.days[1].status, 'protected');
  assert.equal(calendar.days[2].status, 'missed');
  assert.equal(calendar.days[3].status, 'future');
});
