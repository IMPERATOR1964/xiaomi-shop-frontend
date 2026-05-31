# 🚀 Деплой фронта на 176.12.70.208 — актуальная шпаргалка

> Все команды выполняются на сервере по SSH под root.

---

## ОБЫЧНЫЙ ДЕПЛОЙ (полный пересбор)

```bash
ssh root@176.12.70.208
cd /root/xiaomi-shop/xiaomi-shop

# 1. Удалить старый фронтенд
rm -rf frontend

# 2. Свежий клон из репозитория
git clone https://github.com/IMPERATOR1964/xiaomi-shop-frontend.git frontend

# 3. Положить Dockerfile (multi-stage build: node → nginx)
cat > frontend/Dockerfile << 'EOF'
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# 4. Положить nginx.conf — НОВАЯ ВЕРСИЯ с /uploads, multipart-лимитами и кешем
cat > frontend/nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # ⚠️ ВАЖНО: лимит тела запроса.
    # Фото товара до 8 МБ × до 10 шт батчем + аватар + фото отзывов.
    # Дефолтный 1m не пропустит даже одну фотку.
    client_max_body_size 50M;

    # Таймауты для долгих multipart-загрузок
    proxy_connect_timeout 60s;
    proxy_send_timeout    120s;
    proxy_read_timeout    120s;

    # GZIP — сильно ускоряет загрузку JS/CSS
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/javascript
               application/javascript application/json
               application/xml application/rss+xml image/svg+xml;

    # === Прокси на бэк ===

    # REST API
    location /api/ {
        proxy_pass         http://backend:8080/api/;
        proxy_set_header   Host               $host;
        proxy_set_header   X-Real-IP          $remote_addr;
        proxy_set_header   X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto  $scheme;
    }

    # Загруженные файлы (фото товаров, аватары, фото отзывов)
    location /uploads/ {
        proxy_pass         http://backend:8080/uploads/;
        proxy_set_header   Host               $host;
        proxy_set_header   X-Forwarded-For    $proxy_add_x_forwarded_for;
        # Картинки кешируем в браузере на 7 дней
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Swagger UI / OpenAPI
    location /swagger-ui {
        proxy_pass http://backend:8080/swagger-ui;
        proxy_set_header Host $host;
    }
    location /api-docs {
        proxy_pass http://backend:8080/api-docs;
        proxy_set_header Host $host;
    }

    # Actuator (мониторинг / health)
    location /actuator/ {
        proxy_pass http://backend:8080/actuator/;
        proxy_set_header Host $host;
    }

    # === SPA ===

    # Любой неизвестный путь → index.html (React Router сам разрулит)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Агрессивный кеш статики на 30 дней
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 5. Убрать Dockerfile и nginx.conf из .dockerignore,
#    чтобы COPY . . в Dockerfile их подхватил
sed -i '/^Dockerfile$/d; /^nginx.conf$/d' frontend/.dockerignore

# 6. Пересобрать и поднять фронт-контейнер
docker compose up -d --build frontend

# 7. Проверка что всё ОК
docker compose ps
docker compose logs --tail 30 frontend
```

После этого открой `http://176.12.70.208/` — должна загрузиться главная страница.

---

## БЫСТРАЯ ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ

```bash
# Возвращает 200, отдаёт HTML главной
curl -I http://localhost/

# Бэк через прокси — 200 если бэк жив
curl -I http://localhost/api/categories

# Любой файл из /uploads (если есть загруженные)
curl -I http://localhost/uploads/avatars/some-file.jpg

# Логи фронта в реальном времени
docker compose logs -f frontend
```

---

## ОБНОВЛЕНИЕ БЕЗ ПЕРЕСОЗДАНИЯ Dockerfile/nginx.conf

Если конфиги уже на месте и нужно подтянуть только новый код из git:

```bash
cd /root/xiaomi-shop/xiaomi-shop/frontend
git pull
cd ..
docker compose up -d --build frontend
```

---

## ОТКАТ К ПРЕДЫДУЩЕЙ ВЕРСИИ

```bash
cd /root/xiaomi-shop/xiaomi-shop/frontend
git log --oneline | head -5      # посмотреть последние коммиты
git checkout <commit-hash>        # откатиться на конкретный
cd ..
docker compose up -d --build frontend
```

---

## ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### `502 Bad Gateway` при запросе `/api/*`
Бэк не запущен или Docker network не настроен:
```bash
docker compose ps                  # frontend и backend должны быть up
docker compose logs backend --tail 50
docker compose restart backend
```

### При загрузке фото — `413 Request Entity Too Large`
В nginx не применился `client_max_body_size`. Проверь файл:
```bash
docker compose exec frontend cat /etc/nginx/conf.d/default.conf | grep client_max
```
Если строки нет — пересобери: `docker compose up -d --build frontend`.

### Фото загрузились, но не отображаются (404 на `/uploads/...`)
Бэк не отдаёт `/uploads/` либо файлы лежат не там, где ждёт фронт.
Проверь:
```bash
docker compose exec backend ls -la /uploads/products
curl http://localhost:8080/uploads/products/0000001.jpg   # напрямую через бэк
```

### Фронт собрался, но в браузере «белый экран»
Кеш браузера держит старый JS. Открой DevTools → Network → Disable cache → F5. Или Ctrl+Shift+R.

### Полный пересбор с очисткой docker-кеша
```bash
docker compose down frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

## ЧТО ИЗМЕНИЛОСЬ ПО СРАВНЕНИЮ С ПРОШЛОЙ ВЕРСИЕЙ

| Было | Стало | Почему |
|---|---|---|
| Только `/api/*` проксировался | **Добавлен `/uploads/*`** | Бэк теперь хранит фото товаров, аватары и фото отзывов как файлы |
| `client_max_body_size` = 1M (дефолт) | **50M** | Загрузка фото товара до 8 МБ × до 10 шт + аватары + фото отзывов |
| Без `proxy_*_timeout` | **60/120/120 с** | Долгие multipart-загрузки на медленном канале |
| Без gzip | **Включен gzip** | JS-бандл ~350 КБ → ~100 КБ после сжатия |
| Без `/actuator/` | **Добавлен** | Для health-check и мониторинга бэка через фронт-домен |
| Кеш только для базовых форматов | **+ webp, woff, ttf, eot** | Новые форматы шрифтов и изображений |
| Без `X-Forwarded-Proto` | **Добавлен** | Бэк правильно различает http/https при генерации ссылок в письмах |

---

## ENV-ПЕРЕМЕННЫЕ

На проде они не нужны — фронт собирается с дефолтным `VITE_API_URL=/api`, nginx сам проксирует на `backend:8080`. Файл `.env` создавать **не нужно**.

Если хочешь явно зафиксировать — создай `frontend/.env.production` перед сборкой:
```
VITE_API_URL=/api
```

---

## ПОСЛЕ ДЕПЛОЯ — ПРОВЕРОЧНЫЙ ЧЕК-ЛИСТ

- [ ] `http://176.12.70.208/` — открывается главная страница
- [ ] `/catalog` — категории и товары грузятся
- [ ] `/login` — можно войти
- [ ] `/register` → ввести код → подтвердить email (без бага «истекло»)
- [ ] Корзина: добавить → перейти на checkout → оформить
- [ ] Админка `/admin` — открывается если ROLE_ADMIN, отдаёт 403 для обычного юзера
- [ ] Создание товара → загрузка нескольких фото → они отображаются в каталоге
- [ ] Аватар в профиле → загрузить → видно после F5
- [ ] Отзыв с фото → создать → фото отображаются у отзыва
