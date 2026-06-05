// Удаляет любые блоки содержания между первой «Содержание» и «Введение»
// и вставляет одно статичное оглавление (без полей). Прочее не трогается.
const fs = require('fs');
const AdmZip = require('adm-zip');
const DOCX = 'C:/Users/safik/Desktop/Сафиканов ПЗ Voltix.docx';

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
const entry = (text, page, lvl) => {
  const ind = lvl === 2 ? '<w:ind w:left="480"/>' : '';
  return `<w:p><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9355"/></w:tabs>` +
    `<w:spacing w:line="360" w:lineRule="auto"/>${ind}</w:pPr>` +
    `<w:r><w:t xml:space="preserve">${esc(text)}</w:t></w:r><w:r><w:tab/></w:r>` +
    `<w:r><w:t>${page}</w:t></w:r></w:p>`;
};
const staticTOC =
  '<w:p><w:pPr><w:spacing w:after="240" w:line="360" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>' +
  '<w:r><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t>Содержание</w:t></w:r></w:p>' +
  ENTRIES.map(e => entry(e[0], e[1], e[2])).join('') +
  '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

const zip = new AdmZip(DOCX);
const read = (n) => zip.getEntry(n).getData().toString('utf8');
let doc = read('word/document.xml');

// начало абзаца, содержащего idx (поддержка <w:p> и <w:p ...>)
const paraStart = (idx) => Math.max(doc.lastIndexOf('<w:p>', idx), doc.lastIndexOf('<w:p ', idx));
// абзац-заголовок: его текст == text
function headingParaStart(text) {
  let from = 0;
  while (true) {
    const i = doc.indexOf(text, from);
    if (i < 0) return -1;
    const ps = paraStart(i);
    const pe = doc.indexOf('</w:p>', i);
    if (ps >= 0 && pe >= 0) {
      const seg = doc.slice(ps, pe);
      const plain = [...seg.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]).join('').trim();
      if (plain === text) return ps;
    }
    from = i + text.length;
  }
}

const vv = headingParaStart('Введение');
if (vv < 0) throw new Error('«Введение» не найдено');

// первая «Содержание» где угодно до «Введение»
let sodIdx = doc.indexOf('Содержание');
let removeFrom = vv;
if (sodIdx >= 0 && sodIdx < vv) removeFrom = paraStart(sodIdx);

doc = doc.slice(0, removeFrom) + staticTOC + doc.slice(vv);
zip.updateFile('word/document.xml', Buffer.from(doc, 'utf8'));

// убираем автообновление полей (полей в содержании больше нет)
let setn = read('word/settings.xml');
if (/<w:updateFields[^>]*\/>/.test(setn)) {
  setn = setn.replace(/<w:updateFields[^>]*\/>/, '');
  zip.updateFile('word/settings.xml', Buffer.from(setn, 'utf8'));
}

zip.writeZip(DOCX);
console.log('OK: вставлено одно статичное содержание из', ENTRIES.length, 'строк');
