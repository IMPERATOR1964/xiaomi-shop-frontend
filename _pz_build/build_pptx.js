const pptxgen = require('pptxgenjs');
const fs = require('fs');
const p = new pptxgen();
p.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
p.author = 'Сафиканов Д.Ю.';
p.title = 'Защита дипломного проекта Voltix';

const W = 13.33, H = 7.5;
const NAVY = '12233A', NAVY2 = '1C3A5E', ORANGE = 'FF6900', ORANGE_D = 'E05500';
const TEXT = '2A2D31', MUTE = '6B7280', BG = 'FFFFFF', SOFT = 'F4F6F9', LINE = 'E3E7EC';
const HF = 'Trebuchet MS', BFACE = 'Calibri';
const shadow = () => ({ type: 'outer', color: '8A93A0', blur: 8, offset: 3, angle: 135, opacity: 0.25 });

// заголовок контент-слайда: оранжевый чип с номером + заголовок
function head(s, num, title) {
  s.background = { color: BG };
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 0.5, w: 0.75, h: 0.75, rectRadius: 0.12, fill: { color: ORANGE } });
  s.addText(String(num), { x: 0.6, y: 0.5, w: 0.75, h: 0.75, align: 'center', valign: 'middle', color: 'FFFFFF', bold: true, fontSize: 28, fontFace: HF });
  s.addText(title, { x: 1.55, y: 0.5, w: 11.2, h: 0.75, align: 'left', valign: 'middle', color: NAVY, bold: true, fontSize: 27, fontFace: HF });
}
function bullets(s, items, opt = {}) {
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: { code: '2022', indent: 16 }, color: TEXT, breakLine: true, paraSpaceAfter: 9 } })),
    Object.assign({ x: 0.7, y: 1.7, w: 6.3, h: 5.2, fontSize: 16.5, fontFace: BFACE, valign: 'top' }, opt));
}
// карточка
function card(s, x, y, w, h, fill) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill || 'FFFFFF' }, line: { color: LINE, width: 1 }, shadow: shadow() });
}

// ---------- 1. ТИТУЛ ----------
let s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: ORANGE } });
s.addShape(p.shapes.OVAL, { x: 11.0, y: -1.6, w: 4.2, h: 4.2, fill: { color: NAVY2 } });
s.addText('ДИПЛОМНЫЙ ПРОЕКТ', { x: 0.9, y: 0.9, w: 10, h: 0.5, color: ORANGE, bold: true, fontSize: 15, charSpacing: 3, fontFace: HF });
s.addText('РАЗРАБОТКА КЛИЕНТСКОЙ ЧАСТИ ВЕБ-САЙТА «VOLTIX» ДЛЯ ПРОДАЖИ СМАРТФОНОВ XIAOMI И АКСЕССУАРОВ',
  { x: 0.9, y: 1.55, w: 10.0, h: 2.6, color: 'FFFFFF', bold: true, fontSize: 29, fontFace: HF, lineSpacingMultiple: 1.05 });
s.addText('Одностраничное веб-приложение интернет-магазина на React и Vite',
  { x: 0.9, y: 4.2, w: 11, h: 0.6, color: 'CAD5E2', italic: true, fontSize: 17, fontFace: BFACE });
s.addShape(p.shapes.LINE, { x: 0.95, y: 5.25, w: 6.5, h: 0, line: { color: '33506F', width: 1.5 } });
s.addText([
  { text: 'Выполнил: ', options: { bold: true } }, { text: 'Сафиканов Д.Ю., группа 22-ПР-30Д', options: { breakLine: true } },
  { text: 'Руководитель: ', options: { bold: true } }, { text: 'Шелковникова О.Е.', options: { breakLine: true } },
  { text: 'Специальность 09.02.07 «Информационные системы и программирование» · 2026', options: {} },
], { x: 0.9, y: 5.5, w: 11, h: 1.4, color: 'E8EDF3', fontSize: 15, fontFace: BFACE, lineSpacingMultiple: 1.25 });

// ---------- 2. АКТУАЛЬНОСТЬ ----------
s = p.addSlide(); head(s, 1, 'Актуальность темы');
bullets(s, [
  'Электронная коммерция стала неотъемлемой частью современной торговли.',
  'Покупатели всё чаще выбирают технику онлайн с любого устройства.',
  'Качество интернет-магазина во многом определяется его клиентской частью (фронтендом).',
  'Неудобный или медленный интерфейс приводит к потере покупателей.',
  'Современный фронтенд должен быть адаптивным, быстрым и удобным.',
]);
const acts = [['Рост', 'онлайн-покупок техники'], ['Удобство', 'влияет на конверсию'], ['Мобильность', 'покупки с телефона и планшета']];
acts.forEach((a, i) => {
  const y = 1.8 + i * 1.65;
  card(s, 7.4, y, 5.3, 1.45, 'FFFFFF');
  s.addText(a[0], { x: 7.7, y: y + 0.18, w: 4.8, h: 0.5, color: ORANGE, bold: true, fontSize: 20, fontFace: HF });
  s.addText(a[1], { x: 7.7, y: y + 0.72, w: 4.8, h: 0.5, color: TEXT, fontSize: 15, fontFace: BFACE });
});

// ---------- 3. ЦЕЛЬ И ЗАДАЧИ ----------
s = p.addSlide(); head(s, 2, 'Цель и задачи проекта');
card(s, 0.7, 1.65, 12, 1.2, 'FFF1E6');
s.addText('Цель', { x: 0.95, y: 1.78, w: 2, h: 0.4, color: ORANGE_D, bold: true, fontSize: 15, fontFace: HF });
s.addText('Разработка удобного, адаптивного и быстрого фронтенда, обеспечивающего комфортный процесс выбора и покупки техники Xiaomi.',
  { x: 0.95, y: 2.16, w: 11.5, h: 0.6, color: TEXT, fontSize: 15.5, fontFace: BFACE });
s.addText('Задачи:', { x: 0.7, y: 3.1, w: 6, h: 0.4, color: NAVY, bold: true, fontSize: 17, fontFace: HF });
const tasks = [
  'проанализировать предметную область и сформулировать требования;',
  'рассмотреть аналоги, выявить их достоинства и недостатки;',
  'обосновать выбор средств разработки клиентской части;',
  'спроектировать интерфейс и реализовать функционал;',
  'выполнить тестирование готового программного продукта.',
];
s.addText(tasks.map(t => ({ text: t, options: { bullet: { type: 'number' }, color: TEXT, breakLine: true, paraSpaceAfter: 9 } })),
  { x: 0.9, y: 3.55, w: 11.6, h: 3.2, fontSize: 16.5, fontFace: BFACE, valign: 'top' });

// ---------- 4. ОБЪЕКТ И ПОСТАНОВКА ----------
s = p.addSlide(); head(s, 3, 'Объект разработки и постановка задачи');
bullets(s, [
  'Объект — фронтенд-часть (клиентская часть) интернет-магазина смартфонов и аксессуаров Xiaomi «Voltix».',
  'Приложение построено как одностраничное (SPA).',
  'Серверная часть в рамках проекта не разрабатывается.',
  'Фронтенд получает данные от сервера по REST API, отображает их и реализует логику взаимодействия.',
  'Авторизация пользователей — на основе маркеров JWT.',
]);
card(s, 7.4, 1.8, 5.3, 4.7, 'FFFFFF');
s.addText('Что реализует фронтенд', { x: 7.7, y: 2.0, w: 4.8, h: 0.45, color: NAVY, bold: true, fontSize: 16, fontFace: HF });
s.addText(['отображение каталога и карточек товаров', 'корзину и оформление заказа', 'личный кабинет и историю заказов',
  'избранное и сравнение товаров', 'отзывы и рейтинги', 'панель администратора'].map(t => ({ text: t, options: { bullet: { code: '2022' }, color: TEXT, breakLine: true, paraSpaceAfter: 8 } })),
  { x: 7.7, y: 2.5, w: 4.8, h: 3.8, fontSize: 14.5, fontFace: BFACE, valign: 'top' });

// ---------- 5. АНАЛИЗ АНАЛОГОВ ----------
s = p.addSlide(); head(s, 4, 'Анализ аналогичных решений');
const analogs = ['Mi.ru', 'DNS', 'OZON', 'М.Видео', 'Wildberries'];
analogs.forEach((a, i) => {
  const x = 0.7 + i * 2.46;
  card(s, x, 1.75, 2.25, 1.5, 'FFFFFF');
  s.addText(a, { x, y: 1.75, w: 2.25, h: 1.5, align: 'center', valign: 'middle', color: NAVY, bold: true, fontSize: 18, fontFace: HF });
});
card(s, 0.7, 3.55, 12, 2.9, 'F4F6F9');
s.addText('Выводы анализа', { x: 1.0, y: 3.75, w: 11, h: 0.45, color: ORANGE_D, bold: true, fontSize: 16, fontFace: HF });
s.addText([
  'Большинство магазинов предоставляют схожий набор функций: каталог, фильтры, карточки, корзину, личный кабинет.',
  'Общие недостатки: перегруженность интерфейса рекламой и усложнённая навигация по большому каталогу.',
  'В «Voltix» учтены удачные решения (гибкие фильтры, отзывы, сравнение) и сделан простой, быстрый, не перегруженный интерфейс.',
].map(t => ({ text: t, options: { bullet: { code: '2022' }, color: TEXT, breakLine: true, paraSpaceAfter: 8 } })),
  { x: 1.0, y: 4.25, w: 11.4, h: 2.0, fontSize: 15.5, fontFace: BFACE, valign: 'top' });

// ---------- 6. ВЫБОР СРЕДСТВ ----------
s = p.addSlide(); head(s, 5, 'Выбор средств разработки');
const tech = ['JavaScript', 'React', 'React Router', 'Vite', 'REST API (fetch)', 'JWT', 'Контексты React', 'VS Code'];
tech.forEach((t, i) => {
  const col = i % 4, row = Math.floor(i / 4);
  const x = 0.7 + col * 3.05, y = 1.75 + row * 1.0;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.85, h: 0.8, rectRadius: 0.1, fill: { color: NAVY }, line: { color: NAVY, width: 1 } });
  s.addText(t, { x, y, w: 2.85, h: 0.8, align: 'center', valign: 'middle', color: 'FFFFFF', bold: true, fontSize: 15, fontFace: HF });
});
s.addText('Обоснование выбора:', { x: 0.7, y: 4.0, w: 11, h: 0.4, color: NAVY, bold: true, fontSize: 17, fontFace: HF });
s.addText([
  'SPA обеспечивает быстрый отклик и плавную навигацию без перезагрузки страниц;',
  'React — компонентный подход, высокая производительность и обширная экосистема;',
  'Vite — мгновенный запуск и быстрая пересборка проекта;',
  'для проекта такого объёма достаточно возможностей JavaScript, средства распространены и хорошо документированы.',
].map(t => ({ text: t, options: { bullet: { code: '2022' }, color: TEXT, breakLine: true, paraSpaceAfter: 7 } })),
  { x: 0.9, y: 4.45, w: 11.8, h: 2.6, fontSize: 15.5, fontFace: BFACE, valign: 'top' });

// ---------- 7. АРХИТЕКТУРА ----------
s = p.addSlide(); head(s, 6, 'Структура и архитектура приложения');
const arch = [['Страницы', 'разделы, связанные с маршрутами'], ['Компоненты', 'повторно используемые элементы'], ['Контексты', 'разделяемое состояние'], ['Слой API', 'модули обращения к серверу']];
arch.forEach((a, i) => {
  const x = 0.7 + i * 3.05;
  card(s, x, 1.8, 2.85, 1.9, 'FFFFFF');
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: x + 0.25, y: 2.05, w: 0.55, h: 0.55, rectRadius: 0.27, fill: { color: ORANGE } });
  s.addText(String(i + 1), { x: x + 0.25, y: 2.05, w: 0.55, h: 0.55, align: 'center', valign: 'middle', color: 'FFFFFF', bold: true, fontSize: 16, fontFace: HF });
  s.addText(a[0], { x: x + 0.25, y: 2.7, w: 2.4, h: 0.4, color: NAVY, bold: true, fontSize: 16, fontFace: HF });
  s.addText(a[1], { x: x + 0.25, y: 3.1, w: 2.4, h: 0.5, color: MUTE, fontSize: 12.5, fontFace: BFACE });
});
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 4.3, w: 11.9, h: 0.85, rectRadius: 0.1, fill: { color: NAVY } });
s.addText('Взаимодействие с серверной частью по REST API (запросы через fetch, JWT в заголовке Authorization)',
  { x: 0.7, y: 4.3, w: 11.9, h: 0.85, align: 'center', valign: 'middle', color: 'FFFFFF', fontSize: 15, fontFace: BFACE });
s.addText('Разделяемое состояние (корзина, авторизация, тема, избранное, сравнение) вынесено в контексты React и доступно из любого компонента.',
  { x: 0.7, y: 5.45, w: 11.9, h: 1.0, color: TEXT, fontSize: 15, fontFace: BFACE, valign: 'top' });

// ---------- 8. АЛГОРИТМ ----------
s = p.addSlide(); head(s, 7, 'Алгоритм работы приложения');
bullets(s, [
  'Запуск приложения и загрузка SPA, отображение главной страницы.',
  'Просмотр каталога: фильтрация, сортировка, поиск товаров.',
  'Открытие карточки товара и добавление в корзину.',
  'Оформление заказа доступно только авторизованному пользователю.',
  'Для сотрудников — доступ к панели администратора по роли.',
  'Все данные запрашиваются у сервера по REST API.',
], { w: 6.4 });
if (fs.existsSync('img/flowchart.png')) {
  const w = 4.55, h = w * 770 / 740;
  s.addImage({ path: 'img/flowchart.png', x: 8.0, y: 1.55, w, h: Math.min(h, 5.4) });
} else {
  card(s, 8.0, 1.6, 4.6, 5.2, 'F4F6F9');
}

// ---------- 9. ИНТЕРФЕЙС ----------
s = p.addSlide(); head(s, 8, 'Пользовательский интерфейс');
bullets(s, [
  'Современный стиль, акцентный цвет — оранжевый, шрифт без засечек.',
  'Товары — в виде карточек с изображением, ценой и кнопкой.',
  'Верхнее меню: логотип, каталог, поиск, корзина, избранное, профиль.',
  'Светлая и тёмная темы оформления.',
  'Адаптивная вёрстка: ПК, планшет, мобильный телефон.',
], { w: 5.7 });
// две рамки-заглушки под скриншоты
const frames = [['Главная страница', 6.85], ['Каталог / карточка товара', 9.85]];
frames.forEach(([cap, x]) => {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 1.75, w: 2.85, h: 3.4, rectRadius: 0.06, fill: { color: SOFT }, line: { color: ORANGE, width: 1.5, dashType: 'dash' } });
  s.addText('Скриншот', { x, y: 3.0, w: 2.85, h: 0.5, align: 'center', color: MUTE, italic: true, fontSize: 13, fontFace: BFACE });
  s.addText(cap, { x, y: 5.25, w: 2.85, h: 0.4, align: 'center', color: TEXT, fontSize: 12.5, fontFace: BFACE });
});
s.addText('(вставьте реальные скриншоты страниц)', { x: 6.85, y: 5.75, w: 5.85, h: 0.4, align: 'center', color: MUTE, italic: true, fontSize: 12, fontFace: BFACE });

// ---------- 10. ФУНКЦИОНАЛ ----------
s = p.addSlide(); head(s, 9, 'Реализованный функционал');
const feats = ['Каталог: категории, фильтры, сортировка, поиск', 'Карточка товара: характеристики, выбор памяти/цвета',
  'Корзина и оформление заказа', 'Регистрация, авторизация, личный кабинет', 'История заказов и их статусы',
  'Избранное и сравнение товаров', 'Отзывы с оценкой и средний рейтинг', 'Рекомендации и недавно просмотренные',
  'Светлая и тёмная темы, адаптивность', 'Панель администратора'];
feats.forEach((f, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.7 + col * 6.15, y = 1.75 + row * 1.02;
  card(s, x, y, 5.9, 0.85, 'FFFFFF');
  s.addShape(p.shapes.OVAL, { x: x + 0.2, y: y + 0.22, w: 0.42, h: 0.42, fill: { color: ORANGE } });
  s.addText('✓', { x: x + 0.2, y: y + 0.22, w: 0.42, h: 0.42, align: 'center', valign: 'middle', color: 'FFFFFF', bold: true, fontSize: 15, fontFace: BFACE });
  s.addText(f, { x: x + 0.8, y, w: 5.0, h: 0.85, valign: 'middle', color: TEXT, fontSize: 13.5, fontFace: BFACE });
});

// ---------- 11. АДМИНКА ----------
s = p.addSlide(); head(s, 10, 'Панель администратора и доступ');
bullets(s, [
  'Отдельная панель управления для сотрудников магазина.',
  'Добавление, редактирование и удаление товаров и категорий.',
  'Загрузка фотографий товаров.',
  'Просмотр заказов и изменение их статусов.',
  'Разграничение прав по ролям: администратор и модератор.',
  'Защита маршрутов панели: доступ только при наличии нужной роли в JWT.',
], { w: 6.4 });
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 8.0, y: 1.75, w: 4.6, h: 3.7, rectRadius: 0.06, fill: { color: SOFT }, line: { color: ORANGE, width: 1.5, dashType: 'dash' } });
s.addText('Скриншот', { x: 8.0, y: 3.3, w: 4.6, h: 0.5, align: 'center', color: MUTE, italic: true, fontSize: 13, fontFace: BFACE });
s.addText('Панель администратора', { x: 8.0, y: 5.55, w: 4.6, h: 0.4, align: 'center', color: TEXT, fontSize: 13, fontFace: BFACE });

// ---------- 12. ТЕСТИРОВАНИЕ ----------
s = p.addSlide(); head(s, 11, 'Тестирование программного продукта');
const stats = [['13', 'сценариев проверено'], ['100%', 'пройдено успешно'], ['5', 'браузеров']];
stats.forEach((st, i) => {
  const x = 0.7 + i * 4.05;
  card(s, x, 1.75, 3.8, 1.7, 'FFFFFF');
  s.addText(st[0], { x, y: 1.85, w: 3.8, h: 0.85, align: 'center', color: ORANGE, bold: true, fontSize: 40, fontFace: HF });
  s.addText(st[1], { x, y: 2.75, w: 3.8, h: 0.5, align: 'center', color: TEXT, fontSize: 14, fontFace: BFACE });
});
s.addText('Подходы и результаты:', { x: 0.7, y: 3.8, w: 11, h: 0.4, color: NAVY, bold: true, fontSize: 17, fontFace: HF });
s.addText([
  'Ручное функциональное тестирование основных сценариев (регистрация, каталог, корзина, заказы и др.).',
  'Проверка адаптивности и кроссбраузерности, граничных случаев и поведения при ошибках сервера.',
  'Выявленные проблемы (валидация телефона, автозаполнение адреса, защита от дублей заказа) устранены.',
].map(t => ({ text: t, options: { bullet: { code: '2022' }, color: TEXT, breakLine: true, paraSpaceAfter: 8 } })),
  { x: 0.9, y: 4.25, w: 11.8, h: 2.4, fontSize: 15.5, fontFace: BFACE, valign: 'top' });

// ---------- 13. ТРЕБОВАНИЯ К ПО ----------
s = p.addSlide(); head(s, 12, 'Требования к аппаратному и программному обеспечению');
const req = [['Устройство', 'ПК, ноутбук, планшет или смартфон с современным браузером'],
  ['Браузер', 'Chrome 90+, Firefox 88+, Edge 90+, Opera 76+ или Safari 14+ с поддержкой JavaScript'],
  ['Интернет', 'подключение к сети для загрузки приложения и обмена данными с сервером']];
req.forEach((r, i) => {
  const y = 1.8 + i * 1.55;
  card(s, 0.7, y, 12, 1.35, 'FFFFFF');
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.95, y: y + 0.28, w: 2.6, h: 0.8, rectRadius: 0.1, fill: { color: NAVY } });
  s.addText(r[0], { x: 0.95, y: y + 0.28, w: 2.6, h: 0.8, align: 'center', valign: 'middle', color: 'FFFFFF', bold: true, fontSize: 16, fontFace: HF });
  s.addText(r[1], { x: 3.85, y, w: 8.6, h: 1.35, valign: 'middle', color: TEXT, fontSize: 15.5, fontFace: BFACE });
});
s.addText('Приложение не требует установки и нетребовательно к ресурсам устройства.',
  { x: 0.7, y: 6.55, w: 12, h: 0.4, color: MUTE, italic: true, fontSize: 14, fontFace: BFACE });

// ---------- 14. РАЗВИТИЕ ----------
s = p.addSlide(); head(s, 13, 'Возможности дальнейшего развития');
const dev = ['Подключение онлайн-оплаты заказов', 'Уведомления об изменении статуса заказа',
  'Расширение персонализации и рекомендаций', 'Интеграция с внешними сервисами доставки'];
dev.forEach((d, i) => {
  const y = 1.85 + i * 1.2;
  card(s, 0.7, y, 12, 1.0, 'FFFFFF');
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.95, y: y + 0.2, w: 0.6, h: 0.6, rectRadius: 0.3, fill: { color: ORANGE } });
  s.addText(String(i + 1), { x: 0.95, y: y + 0.2, w: 0.6, h: 0.6, align: 'center', valign: 'middle', color: 'FFFFFF', bold: true, fontSize: 17, fontFace: HF });
  s.addText(d, { x: 1.8, y, w: 10.6, h: 1.0, valign: 'middle', color: TEXT, fontSize: 16.5, fontFace: BFACE });
});

// ---------- 15. ЗАКЛЮЧЕНИЕ ----------
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: ORANGE } });
s.addText('Заключение', { x: 0.9, y: 0.8, w: 11, h: 0.7, color: ORANGE, bold: true, fontSize: 22, fontFace: HF });
s.addText([
  'Разработана клиентская часть интернет-магазина техники Xiaomi «Voltix».',
  'Решены все поставленные задачи: анализ, выбор средств, проектирование, реализация и тестирование.',
  'Применены JavaScript, React, React Router и Vite; взаимодействие с сервером — по REST API.',
  'Реализованы каталог, корзина, заказы, личный кабинет, избранное, сравнение, отзывы и панель администратора.',
  'Приложение готово к подключению серверной части и практическому использованию.',
].map(t => ({ text: t, options: { bullet: { code: '2022', indent: 16 }, color: 'E8EDF3', breakLine: true, paraSpaceAfter: 11 } })),
  { x: 0.95, y: 1.7, w: 11.5, h: 3.7, fontSize: 16.5, fontFace: BFACE, valign: 'top' });
s.addText('Спасибо за внимание!', { x: 0.9, y: 5.7, w: 11.5, h: 1.0, color: 'FFFFFF', bold: true, fontSize: 34, fontFace: HF });

p.writeFile({ fileName: 'C:/Users/safik/Desktop/Сафиканов презентация Voltix.pptx' }).then(f => console.log('Saved:', f));
