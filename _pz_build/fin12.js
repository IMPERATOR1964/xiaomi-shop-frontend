const AdmZip=require('adm-zip');
const zip=new AdmZip('C:/Users/safik/Desktop/Сафиканов диплом 12.docx');
const s=zip.getEntry('word/document.xml').getData().toString('utf8');
console.log('ЗАГЛАВНЫЙ титул:', s.includes('РАЗРАБОТКА КЛИЕНТСКОЙ ЧАСТИ ВЕБ-САЙТА «VOLTIX»'));
console.log('осталось «курсов»:', (s.match(/курсов/g)||[]).length);
console.log('«дипломного проекта»:', s.includes('выполнения дипломного проекта'));
console.log('изображений:', (s.match(/<a:blip/g)||[]).length);
console.log('w:p баланс:', (s.match(/<w:p[ >]/g)||[]).length, (s.match(/<\/w:p>/g)||[]).length);
