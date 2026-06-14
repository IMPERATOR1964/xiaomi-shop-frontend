// Добавляет версии браузеров в пункт 3.1 (прямо в существующем файле).
const AdmZip = require('adm-zip');
const DOCX = 'C:/Users/safik/Desktop/Сафиканов диплом.docx';

const OLD = '<w:r><w:t xml:space="preserve">браузер: актуальная версия одного из современных браузеров (Google </w:t></w:r><w:proofErr w:type="spellStart"/><w:r><w:t>Chrome</w:t></w:r><w:proofErr w:type="spellEnd"/><w:r><w:t>, Mozilla Firefox, Microsoft Edge, Opera или Safari) с поддержкой JavaScript;</w:t></w:r>';

const NEW = '<w:r><w:t xml:space="preserve">браузер: актуальная версия одного из современных браузеров с поддержкой JavaScript – Google Chrome версии 90 и выше, Mozilla Firefox версии 88 и выше, Microsoft Edge версии 90 и выше, Opera версии 76 и выше или Apple Safari версии 14 и выше;</w:t></w:r>';

const zip = new AdmZip(DOCX);
let doc = zip.getEntry('word/document.xml').getData().toString('utf8');

const n = doc.split(OLD).length - 1;
if (n !== 1) throw new Error('Ожидал 1 вхождение браузерного пункта, найдено: ' + n);

doc = doc.replace(OLD, NEW);
zip.updateFile('word/document.xml', Buffer.from(doc, 'utf8'));
zip.writeZip(DOCX);
console.log('OK: версии браузеров добавлены в пункт 3.1');
