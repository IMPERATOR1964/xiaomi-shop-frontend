const AdmZip=require('adm-zip');
const zip=new AdmZip('C:/Users/safik/Desktop/Сафиканов диплом 12.docx');
const doc=zip.getEntry('word/document.xml').getData().toString('utf8');
const paras=[];let re=/<w:p\b[\s\S]*?<\/w:p>/g,m;
while((m=re.exec(doc))){paras.push(m[0]);}
const p=paras[267];
// структура: какие элементы
console.log('drawing:',/<w:drawing/.test(p),'| blip rId:',(p.match(/r:embed="([^"]+)"/)||[])[1]);
console.log('runs с текстом:');
[...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].forEach(x=>console.log('  "'+x[1]+'"'));
console.log('есть <w:br/> :',/<w:br/.test(p));
console.log('--- первые 400 симв ---');console.log(p.slice(0,400));
console.log('--- последние 300 ---');console.log(p.slice(-300));
