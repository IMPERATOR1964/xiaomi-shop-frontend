// Заменяет блок «Содержание» на готовое оглавление с видимыми строками
// (разделы + номера страниц) внутри живого поля TOC. Прочее не трогается.
const fs = require('fs');
const AdmZip = require('adm-zip');
const DOCX = 'C:/Users/safik/Desktop/Сафиканов ПЗ Voltix.docx';

// [текст, страница(ориентир.), уровень]
const ENTRIES = [
  ['Введение', '3', 1],
  ['1 Техническое задание', '4', 1],
  ['1.1 Анализ и характеристика проектируемой задачи', '4', 2],
  ['1.2 Анализ и характеристики аналогичного программного обеспечения', '6', 2],
  ['1.3 Обзор современных средств разработки ПО и выбор программной среды реализации задачи', '10', 2],
  ['2 Рабочий проект (практическая реализация)', '13', 1],
  ['2.1 Разработка алгоритма работы программного продукта', '13', 2],
  ['2.2 Разработка программного продукта', '16', 2],
  ['2.3 Отладка программного продукта', '47', 2],
  ['3 Сопровождение и документирование', '50', 1],
  ['3.1 Требование к аппаратному и программному обеспечению', '50', 2],
  ['3.2 Тестирование программного продукта', '51', 2],
  ['Заключение', '54', 1],
  ['Список использованных источников', '55', 1],
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function entry(text, page, lvl, first, last) {
  const ind = lvl === 2 ? '<w:ind w:left="480"/>' : '';
  let runs = '';
  if (first) {
    runs += '<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
      + '<w:r><w:instrText xml:space="preserve"> TOC \\o "1-2" \\h \\z \\u </w:instrText></w:r>'
      + '<w:r><w:fldChar w:fldCharType="separate"/></w:r>';
  }
  runs += `<w:r><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`
    + '<w:r><w:tab/></w:r>'
    + `<w:r><w:t>${page}</w:t></w:r>`;
  if (last) runs += '<w:r><w:fldChar w:fldCharType="end"/></w:r>';
  return `<w:p><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9355"/></w:tabs>`
    + `<w:spacing w:line="360" w:lineRule="auto"/>${ind}</w:pPr>${runs}</w:p>`;
}

const heading =
  '<w:p><w:pPr><w:spacing w:after="240" w:line="360" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>' +
  '<w:r><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t>Содержание</w:t></w:r></w:p>';
const entriesXml = ENTRIES.map((e, i) =>
  entry(e[0], e[1], e[2], i === 0, i === ENTRIES.length - 1)).join('');
const pageBreak = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
const tocBlock = heading + entriesXml + pageBreak;

const zip = new AdmZip(DOCX);
const read = (n) => zip.getEntry(n).getData().toString('utf8');
let doc = read('word/document.xml');

function headingStart(text) {
  let from = 0;
  while (true) {
    const i = doc.indexOf(text, from);
    if (i < 0) return -1;
    const ps = doc.lastIndexOf('<w:p ', i);
    const pe = doc.indexOf('</w:p>', i);
    if (ps >= 0 && pe >= 0) {
      const seg = doc.slice(ps, pe);
      const plain = [...seg.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]).join('').trim();
      if (plain === text) return ps;
    }
    from = i + text.length;
  }
}

const vv = headingStart('Введение');
if (vv < 0) throw new Error('«Введение» не найдено');
const sod = headingStart('Содержание');

if (sod >= 0 && sod < vv) {
  // удаляем старый блок содержания (всё между «Содержание» и «Введение»)
  doc = doc.slice(0, sod) + tocBlock + doc.slice(vv);
  console.log('Старый блок содержания заменён.');
} else {
  doc = doc.slice(0, vv) + tocBlock + doc.slice(vv);
  console.log('Содержание вставлено.');
}
zip.updateFile('word/document.xml', Buffer.from(doc, 'utf8'));

// гарантируем автообновление полей
let setn = read('word/settings.xml');
if (!/<w:updateFields/.test(setn)) {
  setn = setn.replace(/(<w:settings\b[^>]*>)/, '$1<w:updateFields w:val="true"/>');
  zip.updateFile('word/settings.xml', Buffer.from(setn, 'utf8'));
}

zip.writeZip(DOCX);
console.log('OK: содержание из', ENTRIES.length, 'строк вставлено.');
