# Voltix — Магазин Xiaomi

Интернет-магазин смартфонов и аксессуаров Xiaomi.  
Сделано на **Vite + React + React Router**.

## 📁 Структура проекта

```
voltix/
├── index.html                    ← Точка входа HTML
├── package.json                  ← Зависимости
├── vite.config.js                ← Конфиг Vite
├── src/
│   ├── main.jsx                  ← Инициализация React
│   ├── App.jsx                   ← Роутинг (все маршруты)
│   │
│   ├── pages/                    ← СТРАНИЦЫ (каждая = свой URL)
│   │   ├── HomePage.jsx          ← /
│   │   ├── CatalogPage.jsx       ← /catalog, /catalog/:category
│   │   ├── ProductPage.jsx       ← /product/:id
│   │   ├── CartPage.jsx          ← /cart
│   │   ├── LoginPage.jsx         ← /login
│   │   ├── RegisterPage.jsx      ← /register
│   │   └── ProfilePage.jsx       ← /profile
│   │
│   ├── components/               ← Переиспользуемые компоненты
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── ProductCard.jsx
│   │
│   ├── context/                  ← Глобальное состояние
│   │   ├── ThemeContext.jsx       ← Светлая / тёмная тема
│   │   ├── CartContext.jsx        ← Корзина
│   │   └── AuthContext.jsx        ← Авторизация
│   │
│   ├── data/
│   │   └── products.js           ← Данные товаров (потом заменить API)
│   │
│   └── styles/                   ← CSS файлы
│       ├── global.css            ← Переменные, reset, кнопки
│       ├── header.css
│       ├── footer.css
│       ├── home.css
│       ├── catalog.css
│       ├── product-card.css
│       ├── product.css
│       ├── cart.css
│       └── auth.css
```

## 🚀 Как запустить

### 1. Установи Node.js
Скачай с https://nodejs.org (версия 18+), установи.

### 2. Открой терминал в папке проекта
```bash
cd путь/к/voltix
```

### 3. Установи зависимости
```bash
npm install
```

### 4. Запусти сайт
```bash
npm run dev
```

Откроется в браузере по адресу **http://localhost:3000**

## 🔧 Когда подключишь бэкенд

Замени данные в `src/data/products.js` на запросы к API:
```js
// Вместо массива PRODUCTS:
const response = await fetch('/api/products');
const products = await response.json();
```

Замени мок авторизации в `LoginPage.jsx` / `RegisterPage.jsx` на реальные запросы:
```js
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
```
