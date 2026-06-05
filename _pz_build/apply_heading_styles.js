// Применяет стили «heading 1/2» к заголовкам разделов в существующем docx
// и переопределяет их вид под Times New Roman 14 пт, жирный, чёрный.
// Документ не пересобирается; прочее содержимое и фото не затрагиваются.
const fs = require('fs');
const AdmZip = require('adm-zip');
const DOCX = 'C:/Users/safik/Desktop/Сафиканов ПЗ Voltix.docx';

const H1 = [
  'Введение',
  '1 Техническое задание',
  '2 Рабочий проект (практическая реализация)',
  '3 Сопровождение и документирование',
  'Заключение',
  'Список использованных источников',
];
const H2 = [
  '1.1 Анализ и характеристика проектируемой задачи',
  '1.2 Анализ и характеристики аналогичного программного обеспечения',
  '1.3 Обзор современных средств разработки ПО и выбор программной среды реализации задачи',
  '2.1 Разработка алгоритма работы программного продукта',
  '2.2 Разработка программного продукта',
  '2.3 Отладка программного продукта',
  '3.1 Требование к аппаратному и программному обеспечению',
  '3.2 Тестирование программного продукта',
];

const styleDef = (id, lvl) =>
  `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="heading ${id}"/>` +
  `<w:basedOn w:val="a"/><w:next w:val="a"/><w:uiPriority w:val="9"/><w:qFormat/>` +
  `<w:pPr><w:keepNext/><w:outlineLvl w:val="${lvl}"/></w:pPr>` +
  `<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>` +
  `<w:b/><w:color w:val="000000"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>`;

const zip = new AdmZip(DOCX);
const read = (n) => zip.getEntry(n).getData().toString('utf8');

// --- styles.xml: переопределяем стили 1 и 2 ---
let st = read('word/styles.xml');
st = st.replace(/<w:style w:type="paragraph" w:styleId="1">[\s\S]*?<\/w:style>/, styleDef('1', '0'));
st = st.replace(/<w:style w:type="paragraph" w:styleId="2">[\s\S]*?<\/w:style>/, styleDef('2', '1'));
zip.updateFile('word/styles.xml', Buffer.from(st, 'utf8'));

// --- document.xml: применяем pStyle к абзацам-заголовкам ---
let doc = read('word/document.xml');

function applyStyle(text, styleId) {
  let from = 0;
  while (true) {
    const i = doc.indexOf(text, from);
    if (i < 0) { console.log('  ! не найден:', text.slice(0, 30)); return false; }
    const ps = doc.lastIndexOf('<w:p ', i);
    const pe = doc.indexOf('</w:p>', i);
    if (ps >= 0 && pe >= 0) {
      const seg = doc.slice(ps, pe);
      const plain = [...seg.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]).join('').trim();
      if (plain === text.trim()) {
        const pprOpen = doc.indexOf('<w:pPr>', ps);
        if (pprOpen >= 0 && pprOpen < pe) {
          doc = doc.slice(0, pprOpen + 7) + `<w:pStyle w:val="${styleId}"/>` + doc.slice(pprOpen + 7);
        } else {
          // нет pPr — добавим сразу после открытия абзаца
          const tagEnd = doc.indexOf('>', ps);
          doc = doc.slice(0, tagEnd + 1) + `<w:pPr><w:pStyle w:val="${styleId}"/></w:pPr>` + doc.slice(tagEnd + 1);
        }
        return true;
      }
    }
    from = i + text.length;
  }
}

let ok = 0;
H1.forEach(t => { if (applyStyle(t, '1')) ok++; });
H2.forEach(t => { if (applyStyle(t, '2')) ok++; });
zip.updateFile('word/document.xml', Buffer.from(doc, 'utf8'));

zip.writeZip(DOCX);
console.log(`Готово: применено стилей к заголовкам — ${ok} из ${H1.length + H2.length}`);
