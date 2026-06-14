const AdmZip=require('adm-zip');
const DOCX='C:/Users/safik/Desktop/Сафиканов диплом 12.docx';
const zip=new AdmZip(DOCX);
let doc=zip.getEntry('word/document.xml').getData().toString('utf8');
const OLD='выполнения курсового проекта';
const n=doc.split(OLD).length-1;
if(n!==1){console.log('вхождений:',n,'— пропускаю');process.exit(0);}
doc=doc.replace(OLD,'выполнения дипломного проекта');
zip.updateFile('word/document.xml',Buffer.from(doc,'utf8'));
zip.writeZip(DOCX);
console.log('OK: курсового -> дипломного');
