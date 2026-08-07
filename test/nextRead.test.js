import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseNextReads } from '../src/lib/nextRead.js';

test('escolha contextual prioriza intenção, formato e livros disponíveis',()=>{
  const books=[
    {id:'1',title:'Fantasia curta',genre:'Fantasia',page_count:210,status:'quero-ler',format:'fisico',source:'proprio',tags:[]},
    {id:'2',title:'Tratado longo',genre:'História',page_count:800,status:'quero-ler',format:'ebook',tags:[]},
    {id:'3',title:'Já lido',genre:'Fantasia',page_count:100,status:'lidos',format:'fisico',tags:[]},
  ];
  const result=chooseNextReads(books,{minutes:15,intent:'aventurar',format:'fisico'});
  assert.equal(result[0].id,'1');assert.equal(result.some((book)=>book.id==='3'),false);assert.ok(result[0].matchReasons.length);
});

test('livro pausado usa apenas páginas restantes',()=>{
  const [result]=chooseNextReads([{id:'1',title:'Retorno',page_count:400,progress:50,status:'pausados',tags:[]}],{minutes:15});
  assert.match(result.matchReasons.join(' '),/200 páginas restantes/);
});
