// Генерация детальных схем-чертежей трёх макетов интерфейса (grayscale blueprint).
const fs = require('fs');
const sharp = require('sharp');

const W = 940, H = 600;
const FILL = '#E9EAEC';      // светлая заливка блоков
const FILL2 = '#F4F5F6';     // совсем светлая
const LINE = '#8A9099';      // линии/контуры
const TEXT = '#2A2D31';      // текст
const MUTE = '#9AA0A6';      // приглушённый текст

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function rect(x, y, w, h, { fill = FILL, stroke = LINE, rx = 5, sw = 1, dash = '' } = {}) {
  const d = dash ? ` stroke-dasharray="${dash}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${d}/>`;
}
function line(x1, y1, x2, y2, { stroke = LINE, sw = 1 } = {}) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"/>`;
}
function text(x, y, s, { size = 13, fill = TEXT, anchor = 'start', weight = 'normal' } = {}) {
  return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
}
// Детальная карточка товара
function card(x, y, w, h, price) {
  let s = rect(x, y, w, h, { fill: '#FFFFFF' });
  const imgH = h - 96;
  s += rect(x + 10, y + 10, w - 20, imgH, { fill: FILL });
  s += line(x + 10, y + 10, x + w - 10, y + 10 + imgH, { stroke: LINE });
  s += line(x + w - 10, y + 10, x + 10, y + 10 + imgH, { stroke: LINE });
  s += text(x + w / 2, y + 12 + imgH / 2, 'фото', { anchor: 'middle', fill: MUTE, size: 12 });
  s += text(x + 12, y + h - 70, 'Смартфон Xiaomi', { size: 12, fill: TEXT });
  s += text(x + 12, y + h - 54, '12/256 ГБ', { size: 11, fill: MUTE });
  s += text(x + 12, y + h - 34, price, { size: 14, fill: TEXT, weight: 'bold' });
  s += rect(x + 12, y + h - 26, w - 24, 20, { fill: FILL2, stroke: TEXT, rx: 5 });
  s += text(x + w / 2, y + h - 12, 'В корзину', { anchor: 'middle', size: 11, fill: TEXT });
  return s;
}
function frame(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
    + rect(0, 0, W, H, { fill: '#FFFFFF', stroke: LINE, rx: 0, sw: 2 })
    + inner + `</svg>`;
}
const CATS = ['Смартфоны', 'Чехлы', 'Зарядки', 'Повербанки', 'Наушники', 'Стёкла', 'Часы', 'Планшеты'];
const PRICES = ['74 990 ₽', '89 990 ₽', '34 990 ₽', '19 990 ₽', '119 990 ₽', '12 990 ₽', '24 990 ₽', '49 990 ₽'];

// ---- Макет 1: боковое меню категорий слева ----
function mockup1() {
  let s = '';
  s += rect(170, 20, 750, 42); s += text(186, 46, 'Поиск по каталогу Xiaomi…', { fill: MUTE });
  s += `<circle cx="898" cy="41" r="11" fill="none" stroke="${LINE}"/>`;
  s += rect(20, 20, 132, 560); s += text(36, 46, 'Категории', { size: 14, weight: 'bold' });
  s += line(20, 56, 152, 56, { stroke: LINE });
  CATS.forEach((c, i) => { s += text(36, 84 + i * 32, c, { size: 12, fill: TEXT }); s += line(36, 92 + i * 32, 136, 92 + i * 32, { stroke: '#D5D8DC' }); });
  const x0 = 170, y0 = 78, cw = 235, ch = 240, gx = 8, gy = 12;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++)
    s += card(x0 + c * (cw + gx), y0 + r * (ch + gy), cw, ch, PRICES[r * 3 + c]);
  return frame(s);
}

// ---- Макет 2: комбинированная навигация (перегружен) ----
function mockup2() {
  let s = '';
  s += rect(20, 18, 900, 40, { fill: FILL2 });
  ['Главная', 'Каталог', 'Акции', 'Бренды', 'Доставка', 'Контакты'].forEach((t, i) => s += text(40 + i * 95, 43, t, { size: 12 }));
  s += rect(720, 24, 180, 28, { fill: '#FFFFFF' }); s += text(734, 43, 'Поиск…', { size: 12, fill: MUTE });
  s += rect(20, 70, 160, 510); s += text(36, 96, 'Меню', { size: 13, weight: 'bold' });
  s += line(20, 106, 180, 106, { stroke: LINE });
  CATS.forEach((c, i) => { s += text(36, 134 + i * 40, c, { size: 12 }); s += line(36, 142 + i * 40, 164, 142 + i * 40, { stroke: '#D5D8DC' }); });
  s += rect(196, 70, 724, 78, { fill: FILL }); s += text(216, 100, 'Рекламный баннер', { weight: 'bold' }); s += text(216, 124, 'Скидки до 30% на аксессуары', { size: 12, fill: MUTE });
  const x0 = 196, y0 = 162, cw = 228, ch = 196, gx = 12, gy = 14;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++)
    s += card(x0 + c * (cw + gx), y0 + r * (ch + gy), cw, ch, PRICES[r * 3 + c]);
  return frame(s);
}

// ---- Макет 3: верхний хедер (выбран) ----
function mockup3() {
  let s = '';
  s += rect(20, 18, 900, 54, { fill: '#FFFFFF' });
  s += rect(40, 30, 100, 30, { fill: FILL, stroke: TEXT }); s += text(90, 50, 'Voltix', { anchor: 'middle', weight: 'bold', size: 16 });
  s += rect(160, 30, 96, 30, { fill: FILL2 }); s += text(208, 50, 'Каталог', { anchor: 'middle', size: 12 });
  s += rect(272, 30, 420, 30, { fill: FILL2 }); s += text(288, 50, 'Поиск товаров…', { size: 12, fill: MUTE });
  ['♡', '🛒', '👤'].forEach((t, i) => { s += `<circle cx="${740 + i * 55}" cy="45" r="16" fill="${FILL2}" stroke="${LINE}"/>`; s += text(740 + i * 55, 50, t, { anchor: 'middle', size: 13 }); });
  ['Смартфоны', 'Чехлы', 'Зарядки', 'Наушники', 'Часы', 'Планшеты'].forEach((t, i) => { s += rect(40 + i * 145, 88, 132, 28, { fill: FILL2, rx: 14 }); s += text(40 + i * 145 + 66, 107, t, { anchor: 'middle', size: 12 }); });
  const x0 = 40, y0 = 132, cw = 205, ch = 218, gx = 12, gy = 14;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++)
    s += card(x0 + c * (cw + gx), y0 + r * (ch + gy), cw, ch, PRICES[r * 4 + c]);
  return frame(s);
}

fs.mkdirSync('img', { recursive: true });
const jobs = [['img/mockup1.png', mockup1()], ['img/mockup2.png', mockup2()], ['img/mockup3.png', mockup3()]];
Promise.all(jobs.map(([p, svg]) => sharp(Buffer.from(svg)).png().toFile(p)))
  .then(() => console.log('mockups generated:', jobs.map(j => j[0]).join(', ')))
  .catch((e) => { console.error(e); process.exit(1); });
