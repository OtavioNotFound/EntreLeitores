import test from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENTS, calculateAchievements, calculateReaderRank } from '../src/lib/achievements.js';

test('mantém as quatro conquistas do projeto original',()=>{
  assert.deepEqual(ACHIEVEMENTS.slice(0,4).map((item)=>item.title),['Leitor Voraz','Sequência de 30 dias','10 gêneros lidos','Primeira resenha']);
});

test('limita progresso e desbloqueia apenas ao atingir a meta',()=>{
  const result=calculateAchievements({finishedBooks:30,streak:12});
  assert.equal(result[0].unlocked,true);assert.equal(result[0].percent,100);
  assert.equal(result[1].unlocked,false);assert.equal(result[1].percent,40);
});

test('inclui os novos marcos sem duplicar ids ou conquistas equivalentes',()=>{
  assert.equal(ACHIEVEMENTS.length,52);
  assert.equal(new Set(ACHIEVEMENTS.map((item)=>item.id)).size,ACHIEVEMENTS.length);
  assert.equal(ACHIEVEMENTS.filter((item)=>item.metric==='rereads'&&item.target===1).length,1);
  assert.equal(ACHIEVEMENTS.filter((item)=>item.metric==='notes'&&item.target===10).length,1);
});

test('colecionador considera conquistas calculadas e persistidas',()=>{
  const persisted=ACHIEVEMENTS.slice(0,9).map((item)=>item.id);
  const result=calculateAchievements({unlockedAchievementIds:persisted,highlights:1});
  const collector=result.find((item)=>item.id==='achievements_10');
  assert.equal(collector.current,10);
  assert.equal(collector.unlocked,true);
});

test('rank evolui pelos limites configuráveis e aceita ajuste manual',()=>{
  assert.equal(calculateReaderRank(499).current.key,'explorer');
  assert.equal(calculateReaderRank(500).current.key,'debater');
  const custom=calculateReaderRank(50,{explorer:10,debater:20,connector:30,curator:40,legend:50});
  assert.equal(custom.current.key,'legend');
  const manual=calculateReaderRank(10000,undefined,'visitor');
  assert.equal(manual.current.key,'visitor');
  assert.equal(manual.manual,true);
});
