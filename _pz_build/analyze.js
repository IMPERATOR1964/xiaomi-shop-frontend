const AdmZip=require('adm-zip');
const zip=new AdmZip('C:/Users/safik/Desktop/Сафиканов диплом 12.docx');
const doc=zip.getEntry('word/document.xml').getData().toString('utf8');
function txt(p){return [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(x=>x[1]).join('');}
// разбиваем на абзацы с позициями
const paras=[];
let re=/<w:p\b[\s\S]*?<\/w:p>/g,m;
while((m=re.exec(doc))){paras.push({start:m.index,end:re.lastIndex,xml:m[0],text:txt(m[0]).trim(),img:/<w:drawing|<a:blip/.test(m[0])});}
console.log('всего абзацев:',paras.length);
// ключевые заголовки
['2.2 Разработка','2.3 Отладка','3 Эксплуатационная','2.1 Разработка алгоритма'].forEach(h=>{
  const idx=paras.findIndex(p=>p.text.startsWith(h));
  console.log('["'+h+'"] абзац #'+idx+(idx>=0?' | "'+paras[idx].text.slice(0,50)+'"':''));
});
// все подписи рисунков 7..19 и их абзацы (+ предыдущий = картинка?)
console.log('--- подписи рисунков ---');
paras.forEach((p,i)=>{const mm=p.text.match(/^Рисунок (\d+) –/);if(mm){const prev=paras[i-1];console.log('#'+i+' Рис '+mm[1]+' | пред.абзац картинка:'+(prev&&prev.img)+' | "'+p.text.slice(0,45)+'"');}});
