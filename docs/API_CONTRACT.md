# API-контракт — Recipes (`recipool-back`)

Документ виведено безпосередньо з коду сервера. Признач для звірки фронтенду з беком.
Базовий URL нижче позначено як `{{base}}` (наприклад, `http://localhost:3000`).

---

## 0. Найважливіше для фронта (прочитати першим)

Тут зібрані «підводні камені» — місця, де фронт найчастіше ламається.

### 0.1. Авторизація — через httpOnly-cookie, а НЕ через `Authorization` заголовок

- Після `register` / `login` бек ставить **три httpOnly-cookie**: `accessToken` (15 хв), `refreshToken` (24 год), `sessionId` (24 год).
- Ці cookie **недоступні з JS** (`document.cookie` їх не бачить). Токенів у тілі відповіді **немає** — не намагайся їх звідти діставати.
- **Кожен** запит до приватних ендпоінтів має надсилати cookie:
  - `fetch`: `credentials: 'include'`
  - `axios`: `withCredentials: true` (краще виставити глобально)
- Це стосується і самих `login`/`register` — інакше браузер не збереже cookie.

### 0.2. CORS

- Бек працює з `credentials: true`. Origin фронта **має бути** у змінній `FRONTEND_URL` на сервері (список через кому).
- При `credentials: 'include'` сервер не може віддавати `Access-Control-Allow-Origin: *` — тому origin мусить бути в білому списку явно. Якщо фронта немає у `FRONTEND_URL`, запити впадуть на CORS.

### 0.3. Префікси шляхів НЕузгоджені ⚠️

| Група        | Префікс   | Приклад                 |
| ------------ | --------- | ----------------------- |
| auth         | **немає** | `POST /auth/login`      |
| users        | **немає** | `GET /users/current`    |
| recipes      | `/api`    | `GET /api/recipes`      |
| categories   | `/api`    | `GET /api/categories`   |
| ingredients  | `/api`    | `GET /api/ingredients`  |

`auth` і `users` — **без** `/api`. Решта — **з** `/api`. Не можна тримати єдиний `baseURL` з `/api` для всього.

### 0.4. Формати відповідей НЕузгоджені ⚠️

Різні ендпоінти повертають дані в різних «обгортках». Немає єдиного `{ status, message, data }`:

| Ендпоінт                        | Форма відповіді                                                        |
| ------------------------------- | ---------------------------------------------------------------------- |
| `register` / `login`            | сам об'єкт користувача (без обгортки)                                   |
| `GET /users/current`            | сам об'єкт користувача (без обгортки)                                   |
| `GET /auth/session`             | `{ authenticated, user }`                                              |
| `GET /api/recipes`              | `{ page, perPage, totalRecipes, totalPages, recipes }`                 |
| `GET /api/my/recipes`           | `{ page, perPage, totalRecipes, totalPages, recipes }`                 |
| `GET /api/recipes/favorites`    | `{ status, message, page, perPage, totalFavorites, totalPages, recipes }` ← `totalFavorites`, не `totalRecipes` |
| `GET /api/recipes/:id`          | `{ status, message, data }`                                            |
| `POST /api/recipes`             | сам об'єкт рецепта (без обгортки)                                       |
| `POST /api/recipes/:id/favorite`| `{ status, message, data: [масив id улюблених] }`                     |
| `DELETE /api/recipes/:id/favorite` | `{ status, message, data: { recipeId } }`                          |
| `GET /api/categories`           | масив                                                                   |
| `GET /api/ingredients`          | масив                                                                   |

### 0.5. Два різні формати помилок ⚠️

- **Помилки застосунку** (`http-errors`) → `{ "message": "..." }` з відповідним статусом (400/401/404/413/500).
- **Помилки валідації** (celebrate/Joi) → інша форма:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Validation failed",
    "validation": {
      "body": { "source": "body", "keys": ["email"], "message": "\"email\" must be a valid email" }
    }
  }
  ```
  Фронт має вміти діставати текст помилки з обох форм.

### 0.6. Оновлення сесії

- `accessToken` живе лише **15 хвилин**. Після цього приватні запити віддають `401 "Access token expired"`.
- Рекомендований патерн на фронті: на `401` викликати `POST /auth/refresh` (він за cookie видасть нові токени) і повторити початковий запит. Якщо `refresh` теж дав `401` — вести на сторінку логіну.

---

## 1. Auth — `/auth`

### `POST /auth/register` — публічний

**Тіло** (`application/json`):
```json
{ "name": "Ivan", "email": "ivan@mail.com", "password": "12345678" }
```
Валідація: `name` ≤ 16; `email` — валідний, ≤ 128; `password` — 8–128 символів.

**200/201:** `201 Created`. Тіло — об'єкт користувача, ставляться cookie:
```json
{
  "_id": "665...", "name": "Ivan", "email": "ivan@mail.com",
  "avatar": "https://ac.goit.global/fullstack/react/default-avatar.jpg",
  "favorites": [], "createdAt": "...", "updatedAt": "...", "__v": 0
}
```
**Помилки:** `400 "Email already in use"`; `400` — валідація.

### `POST /auth/login` — публічний

**Тіло:** `{ "email": "...", "password": "..." }` (email ≤128; password 8–128).

**200:** об'єкт користувача (як вище) + оновлені cookie. Попередні сесії цього юзера видаляються.
**Помилки:** `401 "Invalid credentials"` (і на невідомий email, і на невірний пароль); `400` — валідація.

### `POST /auth/refresh` — публічний (за cookie)

Використовує cookie `sessionId` + `refreshToken`. Тіло не потрібне.
**200:** `{ "message": "Session refreshed" }` + нові cookie.
**Помилки:** `401 "Missing session credentials"` | `"Session not found"` | `"Session token expired"` (у останньому cookie очищаються).

### `GET /auth/session` — приватний

**200:** `{ "authenticated": true, "user": { ...об'єкт користувача... } }`
**Помилки:** `401` (див. розділ 5 — прошарок авторизації).

### `POST /auth/logout` — приватний

Видаляє сесію за cookie `sessionId`, чистить cookie.
**204 No Content** (порожнє тіло).

---

## 2. Users — `/users` (усі приватні)

### `GET /users/current`

**200:** сам об'єкт користувача (без обгортки), пароль не повертається.

### `PATCH /users/avatar`

**Тіло:** `multipart/form-data`, поле файлу — **`avatar`**.
**200:** `{ "url": "https://res.cloudinary.com/.../avatar.jpg" }`
**Помилки:** `400 "No file"` — якщо файл не надіслано.

---

## 3. Categories — `/api/categories`

### `GET /api/categories` — публічний

**200:** масив:
```json
[ { "_id": "652...", "name": "Beef" }, { "_id": "652...", "name": "Chicken" } ]
```

---

## 4. Ingredients — `/api/ingredients`

### `GET /api/ingredients` — публічний

**Query (необов'язкові):** `name` (мін. 3 символи — фільтр по назві, регістронезалежний).
`desc`, `img` — приймаються валідацією, але у фільтрі **не використовуються**.

**200:** масив:
```json
[ { "_id": "640c2dd963...", "name": "Squid", "desc": "...", "img": "https://..." } ]
```
> Увага: `_id` інгредієнта — **рядок** (не ObjectId).

---

## 5. Recipes — `/api/recipes`

### Прошарок авторизації (для приватних маршрутів)

Читає cookie `sessionId` + `accessToken`. Можливі `401`:
`"Missing session credentials"` | `"Session not found"` | `"Access token expired"` | `"User not found"`.

### `GET /api/recipes` — публічний (пошук + пагінація)

**Query:** `page` (≥1, деф. 1) · `perPage` (1–50, деф. 12) · `category` (по назві, регістронезалежно) · `ingredient` (по назві інгредієнта) · `keyword` (входження в `title`, регістронезалежно).

**200:**
```json
{
  "page": 1, "perPage": 12, "totalRecipes": 42, "totalPages": 4,
  "recipes": [
    {
      "_id": "...", "title": "...", "description": "...", "time": 40, "calories": 350,
      "category": "Beef", "instructions": "...", "image": "https://... | null",
      "owner": "665...",
      "ingredients": [ { "id": { "_id": "...", "name": "...", "img": "...", "desc": "..." }, "measure": "200g" } ],
      "createdAt": "...", "updatedAt": "...", "__v": 0
    }
  ]
}
```
> `ingredients[].id` тут **populate-нутий об'єкт** (name/img/desc), а `owner` — сирий id-рядок.

### `GET /api/recipes/:recipeId` — публічний

`recipeId` має бути валідним Mongo ObjectId, інакше `400 "Invalid id format"`.
**200:**
```json
{
  "status": 200, "message": "Recipe retrieved successfully",
  "data": {
    "...": "...поля рецепта...",
    "owner": { "_id": "...", "name": "...", "email": "...", "avatar": "..." },
    "ingredients": [ { "id": { "_id": "...", "name": "...", "img": "...", "desc": "..." }, "measure": "..." } ]
  }
}
```
> Тут `owner` **populate-нутий**. Форма відрізняється від списку!
**Помилки:** `404 "Recipe not found"`.

### `POST /api/recipes` — приватний (створення)

**Тіло:** `multipart/form-data`:

| Поле           | Тип                      | Правила                                                        |
| -------------- | ------------------------ | ------------------------------------------------------------- |
| `title`        | string                   | ≤ 64, required                                                |
| `description`  | string                   | ≤ 200, required                                               |
| `time`         | number                   | 1–360, required                                               |
| `calories`     | number                   | ціле 1–10000, optional                                        |
| `category`     | string                   | required; має **збігатися з `name` наявної категорії**        |
| `instructions` | string                   | ≤ 1200, required                                              |
| `ingredients`  | JSON-**рядок**           | масив об'єктів `{ "id": "...", "measure": "..." }`, 2–16 шт.; усі `id` мають існувати в колекції інгредієнтів |
| `image`        | file                     | optional; поле файлу — `image`                                |

> `ingredients` надсилається як **рядок** JSON (бо це `multipart/form-data`), напр. `'[{"id":"640c...","measure":"200g"},{"id":"640d...","measure":"1 pc"}]'`.

**201:** сам об'єкт створеного рецепта (без обгортки; `owner` — id, `ingredients` — сирі `{id, measure}`).
**Помилки:** `400 "Category not found"`; `400 "One or more ingredients not found"`; `400` — валідація; `401`.

### `GET /api/my/recipes` — приватний (власні рецепти)

**Query:** `page` (деф. 1) · `perPage` (1–50, деф. **10**).
**200:** `{ page, perPage, totalRecipes, totalPages, recipes }` — рецепти **без** populate (інгредієнти сирі).

### `GET /api/recipes/favorites` — приватний (улюблені)

**Query:** `page` (деф. 1) · `perPage` (1–50, деф. 12).
**200:**
```json
{ "status": 200, "message": "Favorite recipes retrieved successfully",
  "page": 1, "perPage": 12, "totalFavorites": 3, "totalPages": 1,
  "recipes": [ { "...рецепт з populate-нутими ingredients..." } ] }
```
> Поле лічильника — **`totalFavorites`**, не `totalRecipes`.

### `POST /api/recipes/:recipeId/favorite` — приватний (додати в улюблені)

**200:** `{ "status": 200, "message": "Recipe added to favorites", "data": ["665...", "665..."] }`
`data` — масив id улюблених рецептів (додавання ідемпотентне, через `$addToSet`).
**Помилки:** `404 "Recipe not found"`; `400 "Invalid id format"`; `401`.

### `DELETE /api/recipes/:recipeId/favorite` — приватний (прибрати з улюблених)

**200:** `{ "status": 200, "message": "Recipe removed from favorites", "data": { "recipeId": "665..." } }`
**Помилки:** `404 "Recipe not found"`; `400 "Invalid id format"`; `401`.

### `DELETE /api/recipes/:recipeId` — приватний (видалення власного рецепту)

Видалити рецепт може **лише його власник**.
Якщо рецепт був у списках улюблених інших користувачів — його автоматично прибирає з **усіх** таких списків, щоб не лишалось «мертвих» посилань.

**200:** `{ "status": 200, "message": "Recipe deleted successfully", "data": { "recipeId": "665..." } }`
**Помилки:** `404 "Recipe not found"`; `403 "You can only delete your own recipes"` (чужий рецепт); `400 "Invalid id format"`; `401`.

---

## 6. Ще не реалізовано

Наразі всі ендпоінти з ТЗ (включно з додатковим завданням) реалізовані.

---

## 7. Швидкий чек-лист для фронта

- [ ] `credentials: 'include'` / `withCredentials: true` на **всіх** запитах.
- [ ] Origin фронта доданий у `FRONTEND_URL` на сервері.
- [ ] `baseURL` не містить `/api` (бо `auth`/`users` без нього); `/api` дописується на рівні recipes/categories/ingredients.
- [ ] Обробка `401` → `POST /auth/refresh` → повтор запиту.
- [ ] Парсинг обох форматів помилок (`message` та `validation`).
- [ ] Створення рецепта — `FormData`, поле файлу `image`, `ingredients` — JSON-рядок.
- [ ] Врахувати різні обгортки відповідей (розділ 0.4).
