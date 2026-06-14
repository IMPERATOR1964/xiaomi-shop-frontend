const AdmZip=require('adm-zip');
const zip=new AdmZip('C:/Users/safik/Desktop/Сафиканов диплом 12.docx');
const doc=zip.getEntry('word/document.xml').getData().toString('utf8');
function txt(p){return [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(x=>x[1]).join('');}
const paras=[];let re=/<w:p\b[\s\S]*?<\/w:p>/g,m;
while((m=re.exec(doc))){paras.push({xml:m[0],text:txt(m[0]).trim(),img:/<w:drawing|<a:blip/.test(m[0])});}
for(let i=258;i<=268;i++){const p=paras[i];console.log('#'+i+(p.img?' [IMG]':'      ')+' len='+p.xml.length+' | '+p.text.slice(0,70));}
