import test from 'node:test';
import assert from 'node:assert/strict';
import { matchingWarnings, warningConfidence } from '../src/lib/bookSafety.js';

test('modo de cuidado respeita categorias e intensidade escolhidas', () => {
  const warnings=[{category:'luto',severity:3},{category:'violencia',severity:1},{category:'drogas',severity:3}];
  assert.deepEqual(matchingWarnings(warnings,{categories:['luto','violencia'],minimum_severity:2}),[warnings[0]]);
});

test('consenso de alertas cresce com confirmações independentes', () => {
  assert.equal(warningConfidence(1),'relato individual');
  assert.equal(warningConfidence(3),'confirmado por leitores');
  assert.equal(warningConfidence(5),'alto consenso');
});
