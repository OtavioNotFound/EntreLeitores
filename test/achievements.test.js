import test from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENTS, calculateAchievements } from '../src/lib/achievements.js';

test('mantém as quatro conquistas do projeto original',()=>{
  assert.deepEqual(ACHIEVEMENTS.slice(0,4).map((item)=>item.title),['Leitor Voraz','Sequência de 30 dias','10 gêneros lidos','Primeira resenha']);
});

test('limita progresso e desbloqueia apenas ao atingir a meta',()=>{
  const result=calculateAchievements({finishedBooks:30,streak:12});
  assert.equal(result[0].unlocked,true);assert.equal(result[0].percent,100);
  assert.equal(result[1].unlocked,false);assert.equal(result[1].percent,40);
});
