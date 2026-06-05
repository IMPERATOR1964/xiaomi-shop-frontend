// Вставляет поле «Содержание» (TOC) перед «Введение» и включает
// автообновление полей. Документ не пересобирается, прочее не меняется.
const fs = require('fs');
const AdmZip = require('adm-zip');
const DOCX = 'C:/Users/safik/Desktop/Сафиканов ПЗ Voltix.docx';

const zip = new AdmZip(DOCX);
const read = (n) => zip.getEntry(n).getData().toString('utf8');

// --- settings.xml: автообновление полей при открытии ---
let setn = read('word/settings.xml');
if (!/<w:updateFields/.test(setn)) {
  setn = setn.replace(/(<w:settings\b[^>]*>)/, '$1<w:updateFields w:val="true"/>');
  zip.updateFile('word/settings.xml', Buffer.from(setn, 'utf8'));
}

// --- document.xml: блок содержания перед «Введение» ---
let doc = read('word/document.xml');

const toc =
  '<w:p><w:pPr><w:spacing w:after="240" w:line="360" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>' +
  '<w:r><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t>Содержание</w:t></w:r></w:p>' +
  '<w:p><w:pPr><w:spacing w:line="360" w:lineRule="auto"/></w:pPr>' +
  '<w:r><w:fldChar w:fldCharType="begin"/></w:r>' +
  '<w:r><w:instrText xml:space="preserve"> TOC \\o "1-2" \\h \\z \\u </w:instrText></w:r>' +
  '<w:r><w:fldChar w:fldCharType="separate"/></w:r>' +
  '<w:r><w:rPr><w:i/></w:rPr><w:t xml:space="preserve">Чтобы собрать оглавление: щёлкните по этой строке и нажмите F9 (Обновить поле).</w:t></w:r>' +
  '<w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>' +
  '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

// найти абзац-заголовок «Введение» (его текст == "Введение")
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

const at = headingStart('Введение');
if (at < 0) throw new Error('Абзац «Введение» не найден');
doc = doc.slice(0, at) + toc + doc.slice(at);
zip.updateFile('word/document.xml', Buffer.from(doc, 'utf8'));

zip.writeZip(DOCX);
console.log('OK: поле содержания вставлено перед «Введение», автообновление включено');
