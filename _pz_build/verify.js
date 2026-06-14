const AdmZip=require('adm-zip');
const zip=new AdmZip('C:/Users/safik/Desktop/Сафиканов диплом 12.docx');
const doc=zip.getEntry('word/document.xml').getData().toString('utf8');
console.log('изображений:', (doc.match(/<a:blip/g)||[]).length);
console.log('«2.3 Разработка интерфейса»:', doc.includes('2.3 Разработка интерфейса программного продукта'));
console.log('«2.4 Отладка»:', (doc.match(/2\.4 Отладка программного продукта/g)||[]).length, 'шт');
console.log('«2.3 Отладка» осталось:', (doc.match(/2\.3 Отладка программного продукта/g)||[]).length);
// порядок: новый раздел ПОСЛЕ последнего листинга 2.2, перед отладкой
const intf=doc.indexOf('2.3 Разработка интерфейса программного продукта',doc.indexOf('PAGEREF')); // тело, не TOC
const bodyIntf=doc.lastIndexOf('2.3 Разработка интерфейса программного продукта');
const r10=doc.indexOf('Рисунок 10 – Главная');
const otl=doc.indexOf('<w:t>2.4 Отладка программного продукта</w:t>',1000000);
console.log('тело 2.3 интерфейс idx:',bodyIntf,'| Рис10 idx:',r10,'| отладка(тело) idx:',otl);
console.log('порядок интерфейс<Рис10<отладка:', bodyIntf<r10 && r10<otl);
// баланс
console.log('w:p баланс:', (doc.match(/<w:p[ >]/g)||[]).length, (doc.match(/<\/w:p>/g)||[]).length);
console.log('w:drawing баланс:', (doc.match(/<w:drawing>/g)||[]).length, (doc.match(/<\/w:drawing>/g)||[]).length);
