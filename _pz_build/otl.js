const AdmZip=require('adm-zip');
const zip=new AdmZip('C:/Users/safik/Desktop/Сафиканов диплом 12.docx');
const doc=zip.getEntry('word/document.xml').getData().toString('utf8');
function paraAt(pos){const end=doc.indexOf('</w:p>',pos)+6;return doc.slice(pos,end);}
// тело-заголовок отладки
console.log('=== ТЕЛО 2.3 Отладка (pos 1625909) ===');
console.log(paraAt(1625909));
console.log('\n=== TOC 2.3 Отладка (pos 33634) ===');
console.log(paraAt(33634));
console.log('\n=== TOC 2.2 (pos 31786) — для вставки новой строки после неё ===');
console.log(paraAt(31786).slice(0,500));
