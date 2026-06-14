const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  LevelFormat, BorderStyle, Header, Footer, PageNumber,
} = require('docx');

const ACCENT = '0A7E3D';   // зелёный Voltix
const DARK   = '1A1A1A';
const MUTED  = '666666';

// ── helpers ────────────────────────────────────────────────
const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });

function P(runs, opts = {}) {
  const children = (Array.isArray(runs) ? runs : [runs]).map(r =>
    typeof r === 'string' ? new TextRun(r) : new TextRun(r));
  return new Paragraph({ spacing: { after: 120, line: 276 }, children, ...opts });
}

// inline markup: **bold**, `code`
function rich(text) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(new TextRun(text.slice(last, m.index)));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(new TextRun({ text: tok.slice(2, -2), bold: true }));
    else out.push(new TextRun({ text: tok.slice(1, -1), font: 'Consolas', color: ACCENT, size: 21 }));
    last = re.lastIndex;
  }
  if (last < text.length) out.push(new TextRun(text.slice(last)));
  return new Paragraph({ spacing: { after: 120, line: 276 }, children: out });
}

function bullet(text, level = 0) {
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const out = [];
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(new TextRun(text.slice(last, m.index)));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(new TextRun({ text: tok.slice(2, -2), bold: true }));
    else out.push(new TextRun({ text: tok.slice(1, -1), font: 'Consolas', color: ACCENT, size: 21 }));
    last = re.lastIndex;
  }
  if (last < text.length) out.push(new TextRun(text.slice(last)));
  return new Paragraph({
    numbering: { reference: 'bullets', level },
    spacing: { after: 80, line: 276 },
    children: out,
  });
}

function quote(text) {
  return new Paragraph({
    spacing: { after: 140, before: 60, line: 276 },
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 12 } },
    children: [new TextRun({ text, italics: true, color: DARK })],
  });
}

function divider() {
  return new Paragraph({
    spacing: { after: 160, before: 40 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC', space: 1 } },
    children: [new TextRun('')],
  });
}

// ── content ────────────────────────────────────────────────
const body = [];

// Титул
body.push(new Paragraph({
  spacing: { after: 60 },
  children: [new TextRun({ text: 'VOLTIX', bold: true, size: 56, color: ACCENT })],
}));
body.push(new Paragraph({
  spacing: { after: 40 },
  children: [new TextRun({ text: 'Шпаргалка для защиты проекта', bold: true, size: 32, color: DARK })],
}));
body.push(new Paragraph({
  spacing: { after: 240 },
  children: [new TextRun({ text: 'Интернет-магазин техники Xiaomi · React + Vite SPA', size: 24, color: MUTED })],
}));
body.push(quote('Текст для устного рассказа при показе сайта. Идёшь по страницам — на каждой говоришь «что это» и «как реализовано». Технические термины выделены жирным, чтобы было что назвать комиссии.'));
body.push(divider());

// 0
body.push(H1('0. Общее про проект (вступление, 30 секунд)'));
body.push(quote('«Voltix — это интернет-магазин техники Xiaomi. Это одностраничное приложение (SPA): при переходах страница не перезагружается, меняется только содержимое — за счёт этого работает быстро.»'));
body.push(rich('**Стек, который можно назвать:**'));
body.push(bullet('**React 18** — библиотека для построения интерфейса из компонентов.'));
body.push(bullet('**Vite** — сборщик и dev-сервер (быстрый запуск и горячая перезагрузка).'));
body.push(bullet('**React Router 6** — маршрутизация между страницами без перезагрузки.'));
body.push(bullet('Состояние приложения — на **React Context** (без Redux), данные с сервера — через **fetch + REST API**.'));
body.push(bullet('Фронтенд и бэкенд разделены: фронт обращается к серверу по адресу `/api`.'));
body.push(rich('**Структура проекта (что где лежит):**'));
body.push(bullet('`src/pages/` — страницы (главная, каталог, корзина, оформление и т.д.).'));
body.push(bullet('`src/components/` — переиспользуемые блоки (шапка, карточка товара, отзывы…).'));
body.push(bullet('`src/context/` — глобальное состояние (корзина, авторизация, избранное…).'));
body.push(bullet('`src/api/` — слой обращения к серверу (по одному файлу на сущность).'));
body.push(bullet('`src/styles/` — стили, по одному CSS-файлу на раздел.'));
body.push(divider());

// 1
body.push(H1('1. Каркас приложения (показать один раз)'));
body.push(quote('«Всё приложение собирается в App.jsx. Сверху — шапка (Header), снизу — подвал (Footer), а посередине меняется контент в зависимости от адреса. За выбор страницы по адресу отвечает роутер.»'));
body.push(rich('Можно показать `src/App.jsx` и сказать:'));
body.push(bullet('`/` → главная, `/catalog` → каталог, `/product/:id` → карточка товара, `/cart` → корзина и т.д.'));
body.push(bullet('Раздел `/admin` — это **админка**, доступ только у роли ADMIN/MODERATOR.'));
body.push(rich('«Все глобальные данные подключаются в `main.jsx` через **провайдеры контекста** — это обёртки, которые дают любой странице доступ к корзине, пользователю, избранному и теме оформления.»'));
body.push(divider());

// 2
body.push(H1('2. Главная страница (HomePage.jsx)'));
body.push(quote('«Это главная страница. Сверху — hero-блок (баннер) с заголовком и кнопками в каталог. Справа в баннере — карточка “Топ предложение”: туда автоматически подставляется самый дорогой товар магазина.»'));
body.push(rich('**Как реализовано (по коду):**'));
body.push(bullet('При загрузке делается **три параллельных запроса** к серверу (через `Promise.all`): популярные товары, новинки и самый дорогой товар для баннера.'));
body.push(bullet('Пока данные грузятся — показываются **скелетоны** (серые заглушки-карточки), чтобы не было пустого экрана.'));
body.push(bullet('Если пользователь **авторизован** — заголовок и текст меняются на персональные («С возвращением, имя!»), и появляется блок **«Рекомендуем вам»**.'));
body.push(bullet('**Рекомендации** считаются на фронте: берётся история просмотров и избранное, определяется самая частая категория, и из неё подгружаются популярные товары, исключая уже виденные.'));
body.push(bullet('Ниже — блоки **«Вы недавно смотрели»**, **«Популярные товары»** и **«Новинки»**.'));
body.push(quote('Фраза для комиссии: «Главная адаптируется под пользователя — для гостя один контент, для залогиненного — персональные рекомендации на основе его поведения.»'));
body.push(divider());

// 3
body.push(H1('3. Каталог (CatalogPage.jsx) и фильтр (CatalogFilter.jsx)'));
body.push(quote('«Это каталог. Слева/сверху — фильтры: по категории, цене, сортировке. Товары подгружаются с сервера с учётом выбранных фильтров.»'));
body.push(rich('**Как реализовано:**'));
body.push(bullet('Категория берётся прямо из адреса (`/catalog/smartphones`) — это **параметр маршрута**.'));
body.push(bullet('Фильтр и сортировка уходят в запрос к серверу как **query-параметры**, сервер возвращает уже отфильтрованную и постраничную выдачу (**пагинация**).'));
body.push(bullet('Каждый товар — это **компонент `ProductCard`**, один и тот же на всех страницах (переиспользование).'));
body.push(divider());

// 4
body.push(H1('4. Карточка товара (ProductPage.jsx)'));
body.push(quote('«Это страница товара. Здесь: галерея фото (лайтбокс — увеличение по клику), цена, кнопка “В корзину”, выбор вариантов (цвет/память), отзывы и похожие товары.»'));
body.push(rich('**Как реализовано:**'));
body.push(bullet('Товар грузится по **id из адреса** (`/product/:id`).'));
body.push(bullet('**Отзывы** — отдельный блок `ProductReviews` со звёздами и фото от покупателей.'));
body.push(bullet('**Похожие товары** (`SimilarProducts`) — подбираются по категории.'));
body.push(bullet('Просмотр товара записывается в **историю просмотров** (для рекомендаций на главной).'));
body.push(bullet('Есть кнопки **«В избранное»** и **«Сравнить»**.'));
body.push(divider());

// 5
body.push(H1('5. Корзина (CartPage.jsx + CartContext.jsx) — сильное место'));
body.push(quote('«Это корзина. Главная особенность — она работает и для гостя, и для залогиненного.»'));
body.push(rich('**Как реализовано (здесь нетривиальная логика, стоит подчеркнуть):**'));
body.push(bullet('**Гость**: корзина хранится в браузере в **localStorage**. Не теряется при перезагрузке.'));
body.push(bullet('**Авторизованный**: корзина хранится **на сервере** (`/api/cart`), привязана к аккаунту — видна с любого устройства.'));
body.push(bullet('При **входе в аккаунт** гостевая корзина **сливается** (merge) с серверной — товары не теряются. Слияние происходит **только при реальном входе**, а не при каждой перезагрузке — иначе удалённые товары «воскресали» бы. Это отдельно решённая проблема.'));
body.push(bullet('Количество и сумма (`cartCount`, `cartTotal`) считаются автоматически и сразу видны в шапке.'));
body.push(quote('Фраза: «Корзина — это пример работы с двумя источниками данных: локальное хранилище для гостя и сервер для пользователя, с аккуратным слиянием при входе.»'));
body.push(divider());

// 6
body.push(H1('6. Оформление заказа (CheckoutPage.jsx)'));
body.push(quote('«Это оформление заказа: адрес доставки, способ получения, подтверждение. После оформления заказ уходит на сервер и появляется в разделе “Мои заказы”.»'));
body.push(rich('**Как реализовано:**'));
body.push(bullet('Форма с **валидацией** полей.'));
body.push(bullet('Последний адрес запоминается (`utils/lastAddress.js`), чтобы не вводить заново.'));
body.push(bullet('После успешной отправки — переход на страницу заказа.'));
body.push(divider());

// 7
body.push(H1('7. Заказы (OrdersPage.jsx, OrderDetailPage.jsx)'));
body.push(rich('«Раздел **“Мои заказы”** — список оформленных заказов со статусами, по клику — детали заказа: состав, сумма, статус доставки.» Доступен только авторизованному пользователю.'));
body.push(divider());

// 8
body.push(H1('8. Авторизация (Login/Register + AuthContext.jsx) — второе сильное место'));
body.push(quote('«Это регистрация и вход. Реализована полноценная авторизация с подтверждением почты и восстановлением пароля.»'));
body.push(rich('**Как реализовано:**'));
body.push(bullet('Вход возвращает **JWT-токен**, который хранится в браузере и подставляется в каждый запрос к серверу в заголовке `Authorization` (это делает `api/client.js` автоматически).'));
body.push(bullet('Из токена на фронте **читаются роли** пользователя (USER / ADMIN / MODERATOR) — по ним решается, показывать ли админку.'));
body.push(bullet('Полный цикл: **регистрация → подтверждение e-mail по коду → вход**, плюс **«забыли пароль»** со сбросом по коду на почту.'));
body.push(bullet('`AuthContext` хранит текущего пользователя и даёт всему приложению флаги `isAuthenticated`, `isAdmin` и т.д.'));
body.push(quote('Фраза: «Авторизация построена на JWT — сервер выдаёт токен, фронт хранит его и по нему определяет права доступа.»'));
body.push(divider());

// 9
body.push(H1('9. Избранное и Сравнение (FavoritesPage, ComparePage)'));
body.push(bullet('**Избранное** — список понравившихся товаров (сердечко на карточке).'));
body.push(bullet('**Сравнение** — таблица характеристик нескольких товаров рядом, чтобы выбрать.'));
body.push(bullet('Оба — на отдельных контекстах, состояние сохраняется между страницами.'));
body.push(divider());

// 10
body.push(H1('10. Профиль (ProfilePage.jsx)'));
body.push(rich('«**Личный кабинет**: данные пользователя, смена имени, адреса, история заказов.»'));
body.push(divider());

// 11
body.push(H1('11. Админка (pages/admin/)'));
body.push(quote('«Это панель администратора — закрытая часть для управления магазином.»'));
body.push(rich('**Как реализовано:**'));
body.push(bullet('Доступ защищён **по роли** из токена (`AdminGuard` / проверка в `AdminLayout`): обычный пользователь сюда не попадёт.'));
body.push(bullet('Разделы: **товары** (создание/редактирование с загрузкой фото), **категории**, **заказы**.'));
body.push(bullet('Форма товара — с **загрузчиком изображений** (`ImageUploader` / `MultiImageUploader`).'));
body.push(divider());

// 12
body.push(H1('12. Сквозные мелочи, которые приятно назвать'));
body.push(bullet('**Тёмная/светлая тема** (`ThemeContext`) — переключатель, выбор запоминается.'));
body.push(bullet('**Уведомления (тосты)** (`ToastContext`) — всплывающие сообщения «Товар добавлен» и т.п.'));
body.push(bullet('**Адаптивность** — вёрстка подстраивается под телефон и десктоп.'));
body.push(bullet('**Состояния загрузки и ошибок** (`UiStates.jsx`) — скелетоны, пустые состояния, ошибки.'));
body.push(bullet('**Уведомление о cookie**, **поделиться товаром**, **поиск с подсказками** (`SearchDropdown`).'));
body.push(bullet('Единый **слой API** (`src/api/`) — все запросы к серверу в одном месте, с обработкой ошибок и понятными сообщениями («Требуется вход», «Доступ запрещён» и т.д.).'));
body.push(divider());

// FAQ
body.push(H1('Если спросят «почему так сделано» — короткие ответы'));
body.push(bullet('**Почему React?** — компонентный подход, переиспользование (одна карточка товара везде), быстрый отзывчивый интерфейс без перезагрузок.'));
body.push(bullet('**Почему Context, а не Redux?** — приложение среднего размера, контекста достаточно, меньше лишнего кода.'));
body.push(bullet('**Почему JWT?** — стандарт для разделённого фронта и бэка; токен не требует хранить сессию на сервере, в нём уже зашиты роли.'));
body.push(bullet('**Почему фронт и бэк раздельно?** — их можно разрабатывать и разворачивать независимо; фронт общается с сервером только по REST API.'));
body.push(divider());

// Маршрут показа
body.push(H2('Минимальный маршрут показа (если время ограничено)'));
body.push(bullet('Главная'));
body.push(bullet('Каталог + фильтр'));
body.push(bullet('Карточка товара'));
body.push(bullet('Добавить в корзину'));
body.push(bullet('Корзина'));
body.push(bullet('Вход / регистрация'));
body.push(bullet('Оформление заказа'));
body.push(bullet('Заглянуть в админку'));

// ── document ───────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 23 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: ACCENT },
        paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD', space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 25, bold: true, font: 'Arial', color: DARK },
        paragraph: { spacing: { before: 160, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 280 } } } },
      ] },
    ],
  },
  sections: [{
    properties: { page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 1280, right: 1280, bottom: 1280, left: 1280 },
    } },
    footers: { default: new Footer({ children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Voltix · шпаргалка для защиты   —   стр. ', size: 18, color: MUTED }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, color: MUTED }),
      ],
    })] }) },
    children: body,
  }],
});

const out = 'C:\\Users\\safik\\Desktop\\Voltix_Шпаргалка_защита.docx';
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(out, buf); console.log('OK ->', out); });
