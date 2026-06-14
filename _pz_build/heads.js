const AdmZip=require('adm-zip');
const zip=new AdmZip('C:/Users/safik/Desktop/Сафиканов диплом 12.docx');
const doc=zip.getEntry('word/document.xml').getData().toString('utf8');
// надёжный поиск телесного заголовка по точному тексту
function findExact(text){
  const out=[];let from=0,i;
  while((i=doc.indexOf(text,from))>=0){
    // конец абзаца
    const end=doc.indexOf('</w:p>',i);
    // начало абзаца (не самозакрытого)
    let pos=i;while(true){pos=doc.lastIndexOf('<w:p',pos-1);if(pos<0){pos=-1;break;}const a=doc[pos+4];if(a!=='>'&&a!==' ')continue;const te=doc.indexOf('>',pos);if(doc[te-1]==='/')continue;break;}
    const seg=doc.slice(pos,end);
    const plain=[...seg.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(x=>x[1]).join('').trim();
    out.push({i,pos,end,plain,style:(seg.match(/<w:pStyle w:val="([^"]+)"/)||[])[1]});
    from=i+text.length;
  }
  return out;
}
for(const h of ['2.2 Разработка программного продукта','2.3 Отладка программного продукта','3 Эксплуатационная часть']){
  console.log('=== "'+h+'" ===');
  findExact(h).forEach(r=>console.log('  pos='+r.pos+' style='+r.style+' plain="'+r.plain.slice(0,55)+'"'));
}
