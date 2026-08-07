const intentTerms={
  relaxar:['romance','humor','poesia','cozy','leve'],
  aventurar:['fantasia','aventura','ficção científica','sci-fi','distopia'],
  emocionar:['drama','romance','memórias','biografia'],
  aprender:['história','ciência','filosofia','negócios','biografia','não ficção'],
};

function normalize(value=''){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}

export function chooseNextReads(books=[],options={}){
  const minutes=Number(options.minutes||30);const targetPages=minutes<=15?220:minutes<=30?340:520;const terms=(intentTerms[options.intent]||[]).map(normalize);
  return books.filter((book)=>['quero-ler','pausados'].includes(book.status)).map((book)=>{
    const searchable=normalize(`${book.genre||''} ${(book.tags||[]).join(' ')}`);const remaining=Math.max(1,Math.round((Number(book.page_count)||320)*(1-(Number(book.progress)||0)/100)));let score=0;const reasons=[];
    const lengthFit=Math.max(0,4-Math.abs(remaining-targetPages)/120);score+=lengthFit;if(lengthFit>=3)reasons.push(`${remaining} páginas restantes combinam com seu momento`);
    if(options.format&&options.format!=='qualquer'&&book.format===options.format){score+=3;reasons.push(`está no formato ${book.format}`);}
    if(terms.some((term)=>searchable.includes(term))){score+=4;reasons.push(`combina com a intenção de ${options.intent}`);}
    if(book.status==='pausados'){score+=1.5;reasons.push(`retoma uma história já começada em ${book.progress||0}%`);}
    if(book.source==='proprio'){score+=1;reasons.push('já está no seu acervo');}
    return {...book,matchScore:Math.round(score*10),matchReasons:reasons.slice(0,2)};
  }).sort((a,b)=>b.matchScore-a.matchScore||String(a.title).localeCompare(String(b.title))).slice(0,3);
}
