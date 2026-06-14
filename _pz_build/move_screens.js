// Переносит скриншоты готовых страниц (Рис 10–18) из раздела 2.2 в новый
// раздел «2.3 Разработка интерфейса», «Отладку» делает 2.4. Точечно, по XML.
const AdmZip = require('adm-zip');
const DOCX = 'C:/Users/safik/Desktop/Сафиканов диплом 12.docx';
const zip = new AdmZip(DOCX);
let doc = zip.getEntry('word/document.xml').getData().toString('utf8');

const CAPTIONS = [
  'Рисунок 10 – Главная страница приложения',
  'Рисунок 11 – Страница каталога',
  'Рисунок 12 – Страница карточки товара',
  'Рисунок 13 – Страница корзины',
  'Рисунок 14 – Страница оформления заказа',
  'Рисунок 15 – Страница авторизации',
  'Рисунок 16 – Личный кабинет пользователя',
  'Рисунок 17 – Раздел сравнения товаров',
  'Рисунок 18 – Панель администратора',
];

// границы реального (не самозакрытого) абзаца, содержащего idx
function paraBounds(idx) {
  const end = doc.indexOf('</w:p>', idx) + 6;
  let pos = idx;
  while (true) {
    pos = doc.lastIndexOf('<w:p', pos - 1);
    if (pos < 0) return null;
    const a = doc[pos + 4];
    if (a !== '>' && a !== ' ') continue;        // <w:pPr>, <w:pStyle> и т.п.
    const te = doc.indexOf('>', pos);
    if (doc[te - 1] === '/') continue;            // самозакрытый <w:p/>
    return { start: pos, end };
  }
}

// 1) извлекаем 9 абзацев-скриншотов из ОРИГИНАЛА
const blocks = [];
for (const cap of CAPTIONS) {
  const i = doc.indexOf(cap);
  if (i < 0) throw new Error('Не найдена подпись: ' + cap);
  if (doc.indexOf(cap, i + cap.length) >= 0) throw new Error('Подпись не уникальна: ' + cap);
  const b = paraBounds(i);
  const xml = doc.slice(b.start, b.end);
  if (!/<w:drawing/.test(xml)) throw new Error('В абзаце нет изображения: ' + cap);
  blocks.push(xml);
}
console.log('Извлечено абзацев-скриншотов:', blocks.length);

// 2) удаляем их из документа
for (const xml of blocks) {
  const before = doc.length;
  doc = doc.replace(xml, '');
  if (doc.length !== before - xml.length) throw new Error('Удаление не удалось (не уникально?)');
}

// 3) новый раздел
const headPara = '<w:p><w:pPr><w:pStyle w:val="3011"/></w:pPr>' +
  '<w:bookmarkStart w:id="990" w:name="_Toc_intf12"/>' +
  '<w:r><w:t>2.3 Разработка интерфейса программного продукта</w:t></w:r>' +
  '<w:bookmarkEnd w:id="990"/></w:p>';
const introPara = '<w:p><w:pPr><w:spacing w:line="360" w:lineRule="auto"/><w:ind w:firstLine="709"/><w:jc w:val="both"/></w:pPr>' +
  '<w:r><w:t xml:space="preserve">После реализации описанных компонентов приложение приобрело законченный вид. ' +
  'Ниже приведены основные страницы готового приложения.</w:t></w:r></w:p>';
const newSection = headPara + introPara + blocks.join('');

// 4) вставляем перед телом-заголовком «2.3 Отладка…» и переименовываем его в 2.4
const OTL = '<w:p w14:paraId="51B78481" w14:textId="07564FD4" w:rsidR="0001129F" w:rsidRDefault="0001129F" w:rsidP="00D55EBB"><w:pPr><w:pStyle w:val="3011"/></w:pPr><w:bookmarkStart w:id="8" w:name="_Toc231431215"/><w:r><w:t>2.3 Отладка программного продукта</w:t></w:r><w:bookmarkEnd w:id="8"/></w:p>';
if (doc.indexOf(OTL) < 0) throw new Error('Тело-заголовок «2.3 Отладка» не найден');
doc = doc.replace(OTL, newSection + OTL);

// 5) переименование «2.3 Отладка…» -> «2.4 Отладка…» (тело + содержание)
const n = doc.split('<w:t>2.3 Отладка программного продукта</w:t>').length - 1;
doc = doc.split('<w:t>2.3 Отладка программного продукта</w:t>').join('<w:t>2.4 Отладка программного продукта</w:t>');
console.log('Переименовано «2.3 Отладка» -> «2.4 Отладка»:', n, 'шт. (тело + содержание)');

zip.updateFile('word/document.xml', Buffer.from(doc, 'utf8'));
zip.writeZip(DOCX);
console.log('OK: 9 скриншотов перенесены в новый раздел «2.3 Разработка интерфейса», «Отладка» -> 2.4');
