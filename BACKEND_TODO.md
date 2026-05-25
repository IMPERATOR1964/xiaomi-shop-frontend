# Что нужно сделать на бэке (по итогам последних правок фронта)

> Фронт уже шлёт/ожидает все нижеперечисленные данные. До тех пор пока бэк
> их не отдаёт — соответствующая фича работает в «деградировавшем» режиме
> (например: галерея сохраняется только до перезагрузки страницы, аватар
> лежит в localStorage и т.п.).

---

## 1. Галерея товара — до 10 фото

**Сейчас**: `Product.imageUrl: String`, эндпоинт `POST /admin/products/{id}/image`
принимает **один** файл и перезаписывает `imageUrl`. Фронт умеет выбрать
до 10 файлов и слать их по очереди — но в БД остаётся только последний.

**Нужно**:
- В entity `Product` добавить `List<String> imageUrls` (или отдельную таблицу
  `product_images(id, product_id, url, position)`).
- В `ProductResponse` добавить `imageUrls: List<String>` рядом с `imageUrl`
  (для обратной совместимости `imageUrl` = первая из массива).
- Новый эндпоинт:
  ```
  POST /api/admin/products/{id}/images
  Content-Type: multipart/form-data
  body: files[] (до 10 файлов, каждый до 8 МБ)
  → 200 ProductResponse
  ```
- Желательно эндпоинт для смены порядка / выбора главной:
  ```
  PUT /api/admin/products/{id}/images/order
  body: { urls: ["url1", "url2", ...] }
  ```
- `DELETE /api/admin/products/{id}/images/{imageId}` — удаление одного из галереи.

Когда бэк это сделает — в `MultiImageUploader.jsx` я просто заменю цикл
последовательной загрузки на один batch-запрос.

---

## 2. Фото к отзывам

**Сейчас**: `ReviewRequest = { rating, title, comment }`. Фронт уже отправляет
поле `photos: string[]` (до 5 data-URL), но бэк его игнорирует.

**Нужно**:
- В `ReviewRequest.java` добавить `List<String> photos` (опционально, max 5).
- В `Review` entity — таблица `review_photos(review_id, url, position)` или
  JSON-колонка.
- В `ReviewResponse` добавить `photos: List<String>`.
- Эндпоинт для прикреплённых фоток к отзыву через multipart:
  ```
  POST /api/products/{productId}/reviews
  Content-Type: multipart/form-data
  части: review (JSON), photos[] (multipart files)
  → 201 ReviewResponse
  ```
  ИЛИ оставить текущий JSON-эндпоинт и принимать в `photos` массив
  data-URL/base64 (фронт уже шлёт именно так).

---

## 3. Аватар пользователя

**Сейчас**: фронт сохраняет аватар как `data:` URL в `localStorage` через
`updateUser({ avatarUrl })`. Между устройствами не синхронизируется.

**Нужно**:
- Эндпоинт для загрузки:
  ```
  POST /api/users/me/avatar
  Content-Type: multipart/form-data
  body: file (PNG/JPG/WebP, до 1 МБ)
  → 200 { avatarUrl: "/uploads/avatars/123.jpg" }
  ```
- Эндпоинт удаления: `DELETE /api/users/me/avatar` → 204.
- В `UserResponse` (или в `AuthResponse`/`/me`) возвращать поле `avatarUrl`.
- Желательно: на регистрации/логине отдавать `avatarUrl` если уже есть.

Когда появится — `ProfilePage.jsx` перестанет писать в localStorage и
будет вызывать новый эндпоинт.

---

## 4. Создание категории — товары и каталог

**Проблема пользователя**: «При создании категории в неё нельзя добавить
товар, её нет и не ту в каталоге».

Сейчас фронт после `POST /admin/categories` сразу делает `reload()` через
`GET /api/categories` — новая категория появляется в селектах формы товара
и в каталоге. Но **при добавлении товара в новую категорию** бэк, видимо,
не даёт сохранить, потому что в категории нет обязательных атрибутов (EAV).

**Нужно**:
- При `POST /admin/categories` либо принимать дополнительное поле
  `defaultAttributes: List<AttributeRequest>` (создать атрибуты вместе с
  категорией), либо разрешать создавать товар в любой категории без
  обязательных атрибутов.
- В `GET /api/categories` возвращать **все** активные категории, даже
  пустые — сейчас фронт ожидает что новая категория появится в каталоге
  сразу после создания, до добавления товаров.
- В `GET /api/products/filter-options?categoryId=...` для новой пустой
  категории должен корректно отдавать пустой набор фильтров (а не 500).
- (Желательно) `POST /api/admin/categories/{id}/attributes` — отдельный
  эндпоинт для добавления атрибутов в категорию уже после её создания.

---

## 5. Order status: PAID → DELIVERED

**Сейчас**: фронт расширил `ADMIN_TRANSITIONS`:
- `PAID → [SHIPPED, DELIVERED, CANCELLED]`
- `SHIPPED → [DELIVERED, CANCELLED]`

Нужно проверить что бэк `OrderStatus.canTransitionTo()` разрешает:
- `PAID → DELIVERED` (для случая самовывоза, без отдельного `SHIPPED`)
- `SHIPPED → CANCELLED` (для возвратов уже отправленного)

Если сейчас разрешено только `PAID → SHIPPED → DELIVERED` — расширить.

---

## 6. Категория «pendingVerification» / удаление аккаунта

Шпаргалка по `/verification-status` от бэка уже реализована на фронте.
Дополнительно нужно убедиться:

- `verification_required_until` приходит и в `AuthResponse` после `/register`,
  и в `VerificationStatusResponse` — да, сейчас так.
- `verificationCodeValidUntil` отдаётся только когда код актуальный
  (`secondsUntilCodeExpires > 0`). Когда код истёк — поле может быть `null`.
- При запросе `/verification-status?email=` для НЕсуществующего email бэк
  отдаёт заглушку `{ exists: true, secondsUntilDeletion: 0 }` — да, ок,
  фронт обрабатывает это как «регистрация истекла».

---

## 7. Корзина — мелочи

Фронт исправлен (флаг `voltix-cart-merged` в sessionStorage, явная очистка
localStorage в `clearCart`). От бэка нужно только:

- `DELETE /api/cart` должен возвращать **204 No Content**, **не** 200. Если
  ответ с body — фронт продолжит работать, но лучше следовать REST.
- `POST /api/cart/items` при `productId` несуществующего товара — отдавать
  **404**, не 500.

---

## 8. Email-верификация: resend rate-limit

Бэк говорит «60 сек между письмами, иначе 429». Фронт обрабатывает это
корректно через тост «Слишком часто — подождите 60 секунд». Тут ничего
делать не нужно, просто проверить что заголовок `Retry-After` отдаётся
(не обязательно, но хорошим тоном).

---

## 9. AdminDashboardResponse — без revenue

Пользователь убрал плашку «Выручка» с дашборда. Бэк может продолжать
отдавать поле `totalRevenue` — фронт его просто не использует. Удалять
на бэке не обязательно.

---

## 10. Соответствие текущих контрактов

Эти эндпоинты фронт уже использует и **они работают** (просто фиксирую,
чтобы при рефакторе на бэке их случайно не сломать):

| Метод | Путь | Где |
|---|---|---|
| POST  | `/api/auth/register` | RegisterPage |
| POST  | `/api/auth/login` | LoginPage |
| POST  | `/api/auth/verify-email` `{email, code}` | VerifyEmailPage |
| POST  | `/api/auth/resend-verification?email=` (query!) | VerifyEmail / ResetPassword |
| GET   | `/api/auth/verification-status?email=` | VerifyEmailPage (таймеры) |
| POST  | `/api/auth/forgot-password` `{email}` | ForgotPasswordPage |
| POST  | `/api/auth/reset-password` `{email, code, newPassword}` (camelCase!) | ResetPasswordPage |
| GET   | `/api/products` (paged) | каталог |
| POST  | `/api/products/filter` | каталог, рекомендации, hero |
| GET   | `/api/products/search?q=` | поиск в админке |
| GET   | `/api/products/{id}` | страница товара |
| GET   | `/api/products/{id}/similar?limit=` | «Похожие товары» |
| GET   | `/api/products/{id}/share` | кнопка «Поделиться» |
| GET   | `/api/products/{id}/reviews` | отзывы |
| POST  | `/api/products/{id}/reviews` | создание отзыва |
| GET   | `/api/products/{id}/reviews/summary` | средний рейтинг |
| POST  | `/api/products` (ADMIN) | создание товара |
| PUT   | `/api/products/{id}` (ADMIN) | редактирование |
| DELETE| `/api/products/{id}` (ADMIN) | soft delete |
| POST  | `/api/products/{id}/restore` (ADMIN) | восстановление |
| POST  | `/api/admin/products/{id}/image` (multipart) | загрузка фото |
| DELETE| `/api/admin/products/{id}/image` | удаление фото |
| GET   | `/api/categories` | каталог, селекты |
| POST  | `/api/admin/categories` `{name, description?}` | создание |
| PUT   | `/api/admin/categories/{id}` | переименование |
| DELETE| `/api/admin/categories/{id}` | удаление |
| GET   | `/api/cart` | корзина |
| POST  | `/api/cart/items` `{productId, quantity}` | добавление |
| PUT   | `/api/cart/items/{id}?quantity=` | изменение qty |
| DELETE| `/api/cart/items/{id}` | удаление позиции |
| DELETE| `/api/cart` | полная очистка |
| POST  | `/api/orders/checkout` `{deliveryAddress, contactPhone, customerNotes}` | оформление |
| GET   | `/api/orders` (paged) | список заказов юзера |
| GET   | `/api/orders/{id}` | детали заказа |
| POST  | `/api/orders/{id}/cancel` | отмена юзером |
| GET   | `/api/orders/admin?status=` | список всех заказов (ADMIN) |
| PATCH | `/api/orders/{id}/status` `{status}` | смена статуса (ADMIN) |
| GET   | `/api/wishlist` (paged) | избранное |
| POST  | `/api/wishlist/{productId}` | добавление |
| DELETE| `/api/wishlist/{productId}` | удаление |
| GET   | `/api/admin/stats/dashboard` | сводка |

---

---

## 🚨 КРИТИЧНЫЕ БАГИ КОРЗИНЫ (по жалобам пользователя)

### Симптомы
1. **«Нажать на крестик — ничего не происходит»** — товар не удаляется из корзины админа.
2. **«Очистить корзину» — пропали в UI, но при F5 возвращаются** — DELETE /api/cart висит в `pending` (видно в DevTools Network).

### Что нужно проверить на бэке

#### А. CartItemResponse — расширить поля
Сейчас:
```java
public class CartItemResponse {
  Long id; Long productId; String productName; String productSku;
  BigDecimal unitPrice; Integer quantity; BigDecimal lineTotal; Integer stockQuantity;
}
```
**Добавить**:
- `String imageUrl` — главное фото товара (фронт сейчас делает отдельный `productsApi.byId()` для каждого item — медленно)
- `String categoryName` / `Long categoryId` — для отображения категории/иконки

#### Б. DELETE /api/cart висит в pending
На последнем скриншоте `cart` (DELETE) в статусе `(pending)`. Фронт ждёт, бэк не отвечает. Скорее всего:
1. **Race condition / dead lock** в `cartService.clear()` — возможно `@Transactional` цепляется за другую сессию.
2. **Принципиально другая ошибка** — например, попытка удалить из корзины, которая ссылается на soft-deleted товар (`isActive=false`).
3. **N+1 lazy fetch** на 100+ записях — клиент таймаутит.

Проверить логи `voltix-backend` в момент клика «Очистить». Если нет даже `INFO Clearing cart for user X` — значит запрос не дошёл до контроллера (фильтры безопасности зависли).

#### В. DELETE /api/cart/items/{productId}
**По спецификации**: `DELETE /api/cart/items/{productId}` → возвращает `CartResponse` (200) с обновлённой корзиной.

Если на бэке этот метод тоже падает или ничего не делает — отсюда «нажал крестик, ничего не происходит». Проверить:
- `CartService.removeItem(username, productId)` — реально ли коммитит транзакцию
- Возвращает ли он свежий `CartResponse` (а не закэшированный)
- Аналогичная проверка для soft-deleted товара

#### Г. Фронт-фиксы (уже применены)
- В адаптере читается `unitPrice` (не `price`) → цены больше не «0 ₽»
- На кнопках удаления показывается loading-индикатор
- При ошибке корзины — выпадает тост (раньше ошибки молча проглатывались)
- Фото товара корзины дозагружается через `productsApi.byId` и кешируется

---

## Приоритеты

**P0 (без этого фича не работает):**
- Атрибуты в новых категориях / возможность добавить товар в новую категорию (#4)

**P1 (фича работает в урезанном виде):**
- Галерея товара до 10 фото (#1)
- Аватар пользователя (#3)

**P2 (мелкие улучшения, не блокирует):**
- Фото к отзывам (#2)
- `PAID → DELIVERED` транзишн (#5) — проверить, возможно уже работает

Если что-то непонятно по контрактам — фронтовый код шлёт всё в виде, описанном
в `src/api/*.js` файлах, можно подсмотреть точные имена полей.
