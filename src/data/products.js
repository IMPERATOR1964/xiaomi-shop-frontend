export const CATEGORIES = [
  { id: 'all',         label: 'Все товары',  icon: '⚡' },
  { id: 'smartphones', label: 'Смартфоны',   icon: '📱' },
  { id: 'cases',       label: 'Чехлы',       icon: '🛡️' },
  { id: 'glass',       label: 'Стёкла',      icon: '🔲' },
  { id: 'earphones',   label: 'Наушники',    icon: '🎧' },
];

export const PRODUCTS = [
  {
    id: 1,
    name: "Xiaomi 14 Ultra",
    category: "smartphones",
    price: 89990,
    oldPrice: 99990,
    badge: "new",
    image: "📱",
    shortDesc: "Флагман с камерой Leica, Snapdragon 8 Gen 3",
    desc: "Xiaomi 14 Ultra — абсолютный флагман с камерой, разработанной совместно с Leica. 50 МП основная камера с 1-дюймовым сенсором, AMOLED 2K дисплей 120 Гц, процессор Snapdragon 8 Gen 3.",
    specs: { "Процессор": "Snapdragon 8 Gen 3", "Дисплей": "6.73\" AMOLED 2K", "Память": "512 ГБ", "Батарея": "5000 мАч", "Камера": "50 МП Leica", "Зарядка": "90 Вт" }
  },
  {
    id: 2,
    name: "Xiaomi 14",
    category: "smartphones",
    price: 59990,
    oldPrice: null,
    badge: "hit",
    image: "📱",
    shortDesc: "Компактный флагман, камера Leica, 120 Гц",
    desc: "Xiaomi 14 — компактный флагман с тройной камерой Leica, 6.36\" AMOLED дисплей, Snapdragon 8 Gen 3 и быстрая зарядка 90 Вт.",
    specs: { "Процессор": "Snapdragon 8 Gen 3", "Дисплей": "6.36\" AMOLED", "Память": "256 ГБ", "Батарея": "4610 мАч", "Камера": "50 МП Leica", "Зарядка": "90 Вт" }
  },
  {
    id: 3,
    name: "Redmi Note 13 Pro+",
    category: "smartphones",
    price: 32990,
    oldPrice: 36990,
    badge: "sale",
    image: "📱",
    shortDesc: "200 МП камера, AMOLED 120 Гц, зарядка 120 Вт",
    desc: "Redmi Note 13 Pro+ — мощный смартфон среднего класса с 200 МП камерой, 6.67\" AMOLED экраном 120 Гц.",
    specs: { "Процессор": "Dimensity 7200", "Дисплей": "6.67\" AMOLED", "Память": "256 ГБ", "Батарея": "5000 мАч", "Камера": "200 МП", "Зарядка": "120 Вт" }
  },
  {
    id: 4,
    name: "Redmi Note 13",
    category: "smartphones",
    price: 18990,
    oldPrice: null,
    badge: null,
    image: "📱",
    shortDesc: "AMOLED дисплей, 108 МП, зарядка 33 Вт",
    desc: "Redmi Note 13 — доступный смартфон с AMOLED дисплеем, 108 МП камерой и чистым Android.",
    specs: { "Процессор": "Snapdragon 685", "Дисплей": "6.67\" AMOLED", "Память": "128 ГБ", "Батарея": "5000 мАч", "Камера": "108 МП", "Зарядка": "33 Вт" }
  },
  {
    id: 5,
    name: "POCO X6 Pro",
    category: "smartphones",
    price: 29990,
    oldPrice: null,
    badge: "hit",
    image: "📱",
    shortDesc: "Dimensity 8300, AMOLED 120 Гц, 67 Вт",
    desc: "POCO X6 Pro — производительный смартфон для гейминга и повседневных задач.",
    specs: { "Процессор": "Dimensity 8300", "Дисплей": "6.67\" AMOLED", "Память": "256 ГБ", "Батарея": "5000 мАч", "Камера": "64 МП", "Зарядка": "67 Вт" }
  },
  {
    id: 6,
    name: "Xiaomi 13T Pro",
    category: "smartphones",
    price: 49990,
    oldPrice: 54990,
    badge: "sale",
    image: "📱",
    shortDesc: "Dimensity 9200+, камера Leica, 120 Вт",
    desc: "Xiaomi 13T Pro — флагман с камерой Leica и ультрабыстрой зарядкой 120 Вт.",
    specs: { "Процессор": "Dimensity 9200+", "Дисплей": "6.67\" AMOLED 144 Гц", "Память": "512 ГБ", "Батарея": "5000 мАч", "Камера": "50 МП Leica", "Зарядка": "120 Вт" }
  },
  {
    id: 7,
    name: "Чехол Xiaomi 14 Кожаный",
    category: "cases",
    price: 2490,
    oldPrice: null,
    badge: null,
    image: "🛡️",
    shortDesc: "Натуральная кожа, мягкая подкладка",
    desc: "Элегантный кожаный чехол для Xiaomi 14. Натуральная кожа высшего качества.",
    specs: { "Материал": "Натуральная кожа", "Совместимость": "Xiaomi 14", "Цвет": "Чёрный", "Тип": "Накладка" }
  },
  {
    id: 8,
    name: "Чехол Redmi Note 13 Силиконовый",
    category: "cases",
    price: 990,
    oldPrice: null,
    badge: "hit",
    image: "🛡️",
    shortDesc: "Мягкий силикон, защита камеры",
    desc: "Прозрачный силиконовый чехол с усиленными углами и защитой модуля камеры.",
    specs: { "Материал": "Силикон TPU", "Совместимость": "Redmi Note 13", "Цвет": "Прозрачный", "Тип": "Противоударный" }
  },
  {
    id: 9,
    name: "Чехол POCO X6 Pro Carbon",
    category: "cases",
    price: 1490,
    oldPrice: 1890,
    badge: "sale",
    image: "🛡️",
    shortDesc: "Карбоновая текстура, матовое покрытие",
    desc: "Стильный чехол с карбоновой текстурой и матовым покрытием.",
    specs: { "Материал": "Поликарбонат", "Совместимость": "POCO X6 Pro", "Цвет": "Чёрный карбон", "Тип": "Матовый" }
  },
  {
    id: 10,
    name: "Чехол-книжка Xiaomi 14 Ultra",
    category: "cases",
    price: 2990,
    oldPrice: null,
    badge: "new",
    image: "🛡️",
    shortDesc: "Книжка с отделением для карт",
    desc: "Чехол-книжка премиум класса с кармашками для карт и функцией подставки.",
    specs: { "Материал": "Эко-кожа", "Совместимость": "Xiaomi 14 Ultra", "Цвет": "Тёмно-синий", "Тип": "Книжка" }
  },
  {
    id: 11,
    name: "Защитное стекло Xiaomi 14 9H",
    category: "glass",
    price: 790,
    oldPrice: null,
    badge: null,
    image: "🔲",
    shortDesc: "Полное покрытие, олеофобное",
    desc: "Защитное стекло с полным приклеиванием, твёрдость 9H и олеофобное покрытие.",
    specs: { "Твёрдость": "9H", "Совместимость": "Xiaomi 14", "Тип": "2.5D", "Покрытие": "Олеофобное" }
  },
  {
    id: 12,
    name: "Стекло камеры Xiaomi 14 Ultra",
    category: "glass",
    price: 590,
    oldPrice: null,
    badge: null,
    image: "🔲",
    shortDesc: "Защита блока камеры, сапфировое",
    desc: "Сапфировое защитное стекло для модуля камеры Xiaomi 14 Ultra.",
    specs: { "Тип": "Сапфировое", "Совместимость": "Xiaomi 14 Ultra", "Назначение": "Камера", "Прозрачность": "HD" }
  },
  {
    id: 13,
    name: "Антишпион стекло Redmi Note 13",
    category: "glass",
    price: 1190,
    oldPrice: 1490,
    badge: "sale",
    image: "🔲",
    shortDesc: "Приватный фильтр, 9H защита",
    desc: "Защитное стекло с приватным фильтром — изображение видно только спереди.",
    specs: { "Твёрдость": "9H", "Совместимость": "Redmi Note 13", "Тип": "Privacy", "Покрытие": "Антишпион" }
  },
  {
    id: 14,
    name: "Xiaomi Buds 5 Pro",
    category: "earphones",
    price: 12990,
    oldPrice: null,
    badge: "new",
    image: "🎧",
    shortDesc: "ANC 52 дБ, LDAC, 38 часов",
    desc: "Xiaomi Buds 5 Pro — флагманские TWS наушники с ANC до 52 дБ и поддержкой LDAC.",
    specs: { "Шумоподавление": "ANC 52 дБ", "Кодек": "LDAC", "Автономность": "38 часов", "Защита": "IP54" }
  },
  {
    id: 15,
    name: "Redmi Buds 5",
    category: "earphones",
    price: 3490,
    oldPrice: 4290,
    badge: "hit",
    image: "🎧",
    shortDesc: "ANC 46 дБ, 40 часов, Bluetooth 5.3",
    desc: "Redmi Buds 5 — отличные TWS наушники с ANC и длительной автономностью.",
    specs: { "Шумоподавление": "ANC 46 дБ", "Bluetooth": "5.3", "Автономность": "40 часов", "Защита": "IPX4" }
  },
  {
    id: 16,
    name: "Xiaomi FlipBuds Pro",
    category: "earphones",
    price: 8990,
    oldPrice: null,
    badge: null,
    image: "🎧",
    shortDesc: "ANC, aptX Adaptive, 3 микрофона",
    desc: "Xiaomi FlipBuds Pro — наушники премиум класса с aptX Adaptive и тройной системой микрофонов.",
    specs: { "Кодек": "aptX Adaptive", "Шумоподавление": "ANC", "Автономность": "28 часов", "Микрофоны": "3 шт." }
  },
  {
    id: 17,
    name: "Redmi Buds 4 Lite",
    category: "earphones",
    price: 1990,
    oldPrice: null,
    badge: null,
    image: "🎧",
    shortDesc: "Лёгкие, 20 часов, Bluetooth 5.3",
    desc: "Бюджетные и лёгкие TWS наушники с хорошим звуком.",
    specs: { "Bluetooth": "5.3", "Автономность": "20 часов", "Защита": "IPX2", "Вес": "4.5 г" }
  },
];

export const formatPrice = (price) => {
  return price.toLocaleString('ru-RU') + ' ₽';
};
