// Точечная вставка блок-схемы (Рисунок 6) в существующий docx,
// без пересборки документа и без изменения прочего содержимого.
const fs = require('fs');
const AdmZip = require('adm-zip');
const sharp = require('sharp');

const DOCX = 'C:/Users/safik/Desktop/Сафиканов ПЗ Voltix.docx';
const IMG  = 'img/flowchart.png';

(async () => {
  const meta = await sharp(IMG).metadata();
  const pw = meta.width, ph = meta.height;
  const dispW = 470;                       // ширина показа, px
  const dispH = Math.round(dispW * ph / pw);
  const EMU = 9525;
  const cx = dispW * EMU, cy = dispH * EMU;

  const zip = new AdmZip(DOCX);
  const get = (n) => zip.getEntry(n).getData().toString('utf8');

  // --- media: следующий свободный image{N}.png ---
  const names = zip.getEntries().map(e => e.entryName);
  let max = 0;
  names.forEach(n => { const m = n.match(/word\/media\/image(\d+)\./); if (m) max = Math.max(max, +m[1]); });
  const imgName = `image${max + 1}.png`;
  zip.addFile(`word/media/${imgName}`, fs.readFileSync(IMG));

  // --- [Content_Types].xml: png default ---
  let ct = get('[Content_Types].xml');
  if (!/Extension="png"/.test(ct)) {
    ct = ct.replace('</Types>', '<Default Extension="png" ContentType="image/png"/></Types>');
    zip.updateFile('[Content_Types].xml', Buffer.from(ct, 'utf8'));
  }

  // --- relationships: уникальный rId ---
  let rels = get('word/_rels/document.xml.rels');
  let rmax = 0;
  [...rels.matchAll(/Id="rId(\d+)"/g)].forEach(m => rmax = Math.max(rmax, +m[1]));
  const rId = `rId${rmax + 1}`;
  rels = rels.replace('</Relationships>',
    `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${imgName}"/></Relationships>`);
  zip.updateFile('word/_rels/document.xml.rels', Buffer.from(rels, 'utf8'));

  // --- document.xml: заменить нужную заглушку на рисунок ---
  let doc = get('word/document.xml');
  const cap = doc.indexOf('Схема алгоритма');
  if (cap < 0) throw new Error('Подпись «Схема алгоритма» не найдена');
  const run = '<w:r><w:t>МЕСТО ДЛЯ РИСУНКА</w:t></w:r>';
  const phStart = doc.lastIndexOf(run, cap);
  if (phStart < 0) throw new Error('Заглушка перед Рисунком 6 не найдена');

  const drawing =
    '<w:r><w:drawing>' +
    `<wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0">` +
    `<wp:extent cx="${cx}" cy="${cy}"/>` +
    '<wp:effectExtent l="0" t="0" r="0" b="0"/>' +
    '<wp:docPr id="9001" name="Рисунок 6"/>' +
    '<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
    '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">' +
    '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
    '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
    '<pic:nvPicPr><pic:cNvPr id="9001" name="' + imgName + '"/><pic:cNvPicPr/></pic:nvPicPr>' +
    `<pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
    `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>` +
    '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>' +
    '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';

  doc = doc.slice(0, phStart) + drawing + doc.slice(phStart + run.length);
  zip.updateFile('word/document.xml', Buffer.from(doc, 'utf8'));

  zip.writeZip(DOCX);
  console.log(`OK: вставлен ${imgName} (${dispW}x${dispH}px), rId=${rId}`);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
