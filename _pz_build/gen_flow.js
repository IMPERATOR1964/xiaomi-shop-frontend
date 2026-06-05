// Блок-схема алгоритма работы приложения «Voltix» (grayscale).
const fs = require('fs');
const sharp = require('sharp');

const W = 740, H = 770;
const FILL = '#EEF1F4', DEC = '#E4E8EC', LINE = '#5A6168', TXT = '#1F2429';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function txt(x, y, s, { size = 15, w = 'normal' } = {}) {
  return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${w}" fill="${TXT}" text-anchor="middle">${esc(s)}</text>`;
}
function rrect(cx, cy, w, h, s) { // терминатор (овал-таблетка)
  return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.5"/>` + txt(cx, cy + 5, s);
}
function proc(cx, cy, w, h, s) { // процесс
  return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="4" fill="${FILL}" stroke="${LINE}" stroke-width="1.5"/>` + txt(cx, cy + 5, s);
}
function dec(cx, cy, w, h, s) { // решение (ромб)
  const p = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`;
  return `<polygon points="${p}" fill="${DEC}" stroke="${LINE}" stroke-width="1.5"/>` + txt(cx, cy + 5, s);
}
function arrow(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${LINE}" stroke-width="1.5" marker-end="url(#ah)"/>`;
}
function poly(points) { // ломаная со стрелкой
  const d = points.map(p => p.join(',')).join(' ');
  return `<polyline points="${d}" fill="none" stroke="${LINE}" stroke-width="1.5" marker-end="url(#ah)"/>`;
}

const cx = 250, bw = 300, bh = 46;
const nodes = [
  ['term', 26,  'Начало'],
  ['proc', 92,  'Запуск приложения, загрузка SPA'],
  ['proc', 158, 'Главная страница'],
  ['proc', 224, 'Каталог: фильтрация, поиск'],
  ['proc', 290, 'Карточка товара'],
  ['proc', 356, 'Добавление товара в корзину'],
];
let svg = '';
nodes.forEach(([t, y, s]) => { svg += (t === 'term' ? rrect(cx, y, 180, 42, s) : proc(cx, y, bw, bh, s)); });
// вертикальные стрелки между первыми блоками
[26, 92, 158, 224, 290].forEach((y, i) => { const ny = nodes[i + 1][1]; svg += arrow(cx, y + (i === 0 ? 21 : bh / 2), cx, ny - bh / 2); });

// решение
const decCy = 446;
svg += dec(cx, decCy, 210, 92, 'Авторизован?');
svg += arrow(cx, 356 + bh / 2, cx, decCy - 46); // корзина -> решение

// процесс оформления и далее
const Hy = 566, Iy = 632, Jy = 698;
svg += proc(cx, Hy, bw, bh, 'Оформление заказа');
svg += proc(cx, Iy, bw, bh, 'Отправка на сервер (REST API)');
svg += rrect(cx, Jy, 180, 42, 'Конец');
svg += arrow(cx, decCy + 46, cx, Hy - bh / 2);   // Да
svg += arrow(cx, Hy + bh / 2, cx, Iy - bh / 2);
svg += arrow(cx, Iy + bh / 2, cx, Jy - 21);
svg += txt(cx + 16, decCy + 64, 'Да', { size: 13 });

// правая ветка: Нет -> Вход/регистрация -> назад к оформлению
const Kcx = 590, Kcy = decCy;
svg += proc(Kcx, Kcy, 220, 46, 'Вход / регистрация');
svg += arrow(cx + 105, decCy, Kcx - 110, Kcy);   // решение -> вход
svg += txt((cx + 105 + Kcx - 110) / 2, decCy - 8, 'Нет', { size: 13 });
svg += poly([[Kcx, Kcy + 23], [Kcx, Hy], [cx + bw / 2, Hy]]); // вход -> вниз -> в оформление

const full =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
  `<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">` +
  `<path d="M0,0 L7,3 L0,6 Z" fill="${LINE}"/></marker></defs>` +
  `<rect width="${W}" height="${H}" fill="#FFFFFF"/>` + svg + `</svg>`;

sharp(Buffer.from(full)).png().toFile('img/flowchart.png')
  .then(() => console.log('flowchart generated'))
  .catch(e => { console.error(e); process.exit(1); });
