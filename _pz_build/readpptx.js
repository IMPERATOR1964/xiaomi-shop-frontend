const AdmZip=require('adm-zip');
const zip=new AdmZip('C:/Users/safik/Downloads/Voltix_Frontend_Development.pptx');
const slides=zip.getEntries().filter(e=>/ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
  .sort((a,b)=>(+a.entryName.match(/slide(\d+)/)[1])-(+b.entryName.match(/slide(\d+)/)[1]));
console.log('Слайдов:',slides.length);
slides.forEach((e,i)=>{
  const xml=e.getData().toString('utf8');
  const t=[...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m=>m[1]);
  console.log('\n===== Слайд '+(i+1)+' =====');
  console.log(t.join('\n'));
});
