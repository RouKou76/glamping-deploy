# Glamping Backend — Функционал

## Обзор

Бэкенд для системы управления глэмпингом. Технологический стек: NestJS, PostgreSQL, Prisma ORM, Socket.IO.

**URL сервера:** `http://localhost:3000`
**Swagger документация:** `http://localhost:3000/api/docs`

---

## Структура проекта

```
glamping-backend/
├── docker-compose.yml        # PostgreSQL + pgAdmin
├── prisma/
│   ├── schema.prisma         # Модели данных
│   ├── seed.ts               # Начальные данные
│   └── migrations/           # Миграции
├── src/
│   ├── auth/                 # Аутентификация
│   ├── houses/               # Домики
│   ├── tickets/              # Заявки
│   ├── menu/                 # Меню ресторана
│   ├── services-catalog/     # Каталог услуг
│   ├── messages/             # Чат
│   ├── transfers/            # Трансфер
│   ├── info/                 # Настройки
│   ├── gateway/              # WebSocket
│   └── common/               # Guards, Filters, Prisma
└── .env                      # Конфигурация
```

---

## Модели данных

### House (Домики)
| Поле | Тип | Описание |
|---|---|---|
| id | String | Уникальный идентификатор |
| number | Int | Номер домика (уникальный) |
| status | HouseStatus | occupied / vacant |
| deviceToken | String? | Токен для гостевого планшета |

### GuestSession (Сессии проживания)
| Поле | Тип | Описание |
|---|---|---|
| id | String | Уникальный идентификатор |
| houseId | String | Ссылка на домик |
| guestCount | Int? | Количество гостей |
| lang | String | Язык планшета (ru/en/zh) |
| checkInAt | DateTime? | Время заселения |
| checkOutAt | DateTime? | Время выселения |
| isActive | Boolean | Активна ли сессия |

### User (Пользователи)
| Поле | Тип | Описание |
|---|---|---|
| id | String | Уникальный идентификатор |
| email | String | Email (уникальный) |
| passwordHash | String | Хэш пароля (Argon2) |
| name | String | Имя |
| roleId | String | Роль |
| refreshToken | String? | Refresh токен JWT |

### Ticket (Заявки)
| Поле | Тип | Описание |
|---|---|---|
| id | String | Уникальный идентификатор |
| houseId | String | Домик |
| sessionId | String? | Сессия |
| type | TicketType | food/transfer/cleaning/towels/minibar/gates/custom |
| status | TicketStatus | new/accepted/in_progress/done/archived |
| sentAt | DateTime | Время создания |
| desiredAt | DateTime? | Желаемое время |
| description | String? | Описание |
| geo | String? | Адрес (для трансфера) |
| assignedTo | AssignedRole? | Исполнитель |
| location | String? | Локация (cabin/terrace/gazebo) |
| guestCount | Int? | Количество персон |
| items | Json? | Позиции заказа (JSON) |
| priceFix | Int? | Зафиксированная цена |

### MenuItem (Блюда меню)
| Поле | Тип | Описание |
|---|---|---|
| id | String | Уникальный идентификатор |
| name | String | Название |
| description | String? | Описание |
| category | MenuCategory | breakfast/lunch/dinner/minibar |
| price | Int | Цена (в копейках) |
| hidden | Boolean | Скрыто ли |
| showPrice | Boolean | Показывать ли цену |

### Service (Услуги)
| Поле | Тип | Описание |
|---|---|---|
| id | String | Уникальный идентификатор |
| name | String | Название |
| price | String? | Текстовое описание цены |
| icon | String? | Иконка |
| active | Boolean | Активна ли |
| assignedTo | AssignedRole | Исполнитель |
| fields | Json | Конфигурация полей формы |
| items | Json? | Позиции каталога |

### TransferDestination (Направления трансфера)
| Поле | Тип | Описание |
|---|---|---|
| id | String | Уникальный идентификатор |
| name | String | Название направления |
| km | Float | Расстояние |
| price | Int | Цена |

### ChatMessage (Сообщения чата)
| Поле | Тип | Описание |
|---|---|---|
| id | String | Уникальный идентификатор |
| houseId | String | Домик |
| sessionId | String? | Сессия |
| sender | String | Отправитель (GUEST/STAFF) |
| text | String | Текст сообщения |
| timestamp | DateTime | Время |
| read | Boolean | Прочитано ли |

### Setting (Настройки)
| Поле | Тип | Описание |
|---|---|---|
| id | String | Уникальный идентификатор |
| key | String | Ключ (уникальный) |
| value | String | Значение |

---

## REST API Эндпоинты

### Auth — Аутентификация

| Метод | Путь | Описание | Авторизация |
|---|---|---|---|
| POST | `/api/auth/login` | Вход в систему | Нет |
| POST | `/api/auth/refresh` | Обновление токенов | Нет |
| GET | `/api/auth/me` | Текущий пользователь | JWT |

**POST /api/auth/login**
```json
// Request
{ "email": "admin@glamping.com", "password": "admin123" }

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": "...", "email": "...", "name": "...", "role": {...} }
  }
}
```

---

### Houses — Домики

| Метод | Путь | Описание | Авторизация |
|---|---|---|---|
| GET | `/api/houses` | Список домиков | Нет |
| PUT | `/api/houses/:id/checkin` | Заселение | JWT |
| PUT | `/api/houses/:id/checkout` | Выселение | JWT |

**GET /api/houses**
```json
{
  "success": true,
  "data": [
    { "id": "...", "number": 1, "status": "vacant", "lang": "ru" },
    { "id": "...", "number": 2, "status": "occupied", "guestCount": 2, "lang": "en", "checkInAt": "..." }
  ]
}
```

**PUT /api/houses/:id/checkin**
```json
// Request
{ "guestCount": 2, "lang": "ru" }

// Response
{ "success": true, "data": { "id": "...", "number": 1, "status": "occupied", "guestCount": 2, "lang": "ru", "checkInAt": "..." } }
```

---

### Tickets — Заявки

| Метод | Путь | Описание | Авторизация |
|---|---|---|---|
| GET | `/api/tickets` | Список заявок | Нет |
| POST | `/api/tickets` | Создание заявки | Нет |
| PATCH | `/api/tickets/:id` | Обновление заявки | JWT |

**Фильтрация (Query Params):**
- `houseId` — по домику
- `status` — по статусу (new/accepted/in_progress/done/archived)
- `assignedTo` — по исполнителю (cook/cleaning/driver/admin)

**POST /api/tickets**
```json
// Request
{
  "houseId": "...",
  "type": "food",
  "items": [{ "menuItemId": "...", "name": "Борщ", "price": 420, "quantity": 2 }],
  "location": "cabin",
  "desiredAt": "2026-07-09T12:00:00Z"
}

// Response
{ "success": true, "data": { "id": "...", "houseId": "...", "type": "food", "status": "new", ... } }
```

**PATCH /api/tickets/:id**
```json
// Request
{ "status": "accepted", "assignedTo": "cook" }

// Response
{ "success": true, "data": { "id": "...", "status": "accepted", "assignedTo": "cook", ... } }
```

---

### Menu — Меню ресторана

| Метод | Путь | Описание | Авторизация |
|---|---|---|---|
| GET | `/api/menu` | Список блюд | Нет |
| POST | `/api/menu` | Добавление блюда | JWT |
| PUT | `/api/menu/:id` | Обновление блюда | JWT |
| DELETE | `/api/menu/:id` | Удаление блюда | JWT |

**GET /api/menu**
- Query param `showHidden=true` — показать скрытые блюда

```json
{
  "success": true,
  "data": [
    { "id": "...", "name": "Сырники", "category": "breakfast", "price": 450, "isAvailable": true }
  ]
}
```

---

### Services — Услуги

| Метод | Путь | Описание | Авторизация |
|---|---|---|---|
| GET | `/api/services` | Список услуг | Нет |
| POST | `/api/services` | Добавление услуги | JWT |
| PUT | `/api/services/:id` | Обновление услуги | JWT |
| DELETE | `/api/services/:id` | Удаление услуги | JWT |

**GET /api/services**
- Query param `showInactive=true` — показать неактивные услуги

```json
{
  "success": true,
  "data": [
    { "id": "...", "name": "Русская баня", "priceInfo": "3 000 ₽ / час", "icon": "🛁", "active": true, "assignedTo": "admin" }
  ]
}
```

---

### Messages — Чат

| Метод | Путь | Описание | Авторизация |
|---|---|---|---|
| GET | `/api/messages` | История чата | Нет |
| PATCH | `/api/messages/:id/read` | Пометка как прочитанного | JWT |

**GET /api/messages?houseId=...**
```json
{
  "success": true,
  "data": [
    { "id": "...", "houseId": "...", "sender": "GUEST", "text": "Добрый день!", "timestamp": "...", "read": true }
  ]
}
```

---

### Transfers — Трансфер

| Метод | Путь | Описание | Авторизация |
|---|---|---|---|
| GET | `/api/transfers` | Направления трансфера | Нет |

```json
{
  "success": true,
  "data": [
    { "id": "...", "name": "Суздаль", "km": 45, "price": 700 }
  ]
}
```

---

### Info — Настройки

| Метод | Путь | Описание | Авторизация |
|---|---|---|---|
| GET | `/api/info` | Получение настроек | Нет |
| PUT | `/api/info` | Обновление настроек | JWT |

**GET /api/info**
```json
{
  "success": true,
  "data": {
    "phone": "+7 (999) 123-45-67",
    "wifiName": "Glamp_Guest",
    "wifiPassword": "forest2026",
    "rules": "• Тихий час с 23:00 до 8:00",
    "description": "Добро пожаловать в наш глэмпинг!",
    "servicesText": "Мы предоставляем: питание, трансфер, уборку..."
  }
}
```

---

### Health — Healthcheck

| Метод | Путь | Описание | Авторизация |
|---|---|---|---|
| HEAD | `/api/health` | Проверка работоспособности | Нет |

---

## WebSocket (Socket.IO)

**URL:** `ws://localhost:3000`

### Подключение
```javascript
const socket = io('http://localhost:3000', {
  auth: { role: 'admin' }  // или { houseId: '...' }
});
```

### Client → Server события

| Событие | Payload | Описание |
|---|---|---|
| `client:connect` | — | Подключение |
| `client:ticket:create` | `{ houseId, type, items?, location?, geo?, desiredAt?, description? }` | Создание заявки |
| `client:ticket:update` | `{ ticketId, status, assignedTo? }` | Обновление заявки |
| `client:ticket:archive` | `{ ticketId }` | Архивация заявки |
| `client:message:send` | `{ houseId, text }` | Отправка сообщения |
| `client:message:read` | `{ messageId }` | Пометка прочтения |
| `client:gate:request` | `{ houseId }` | Запрос открытия ворот |
| `client:gate:response` | `{ ticketId, approved }` | Ответ на запрос ворот |

### Server → Client события

| Событие | Payload | Описание |
|---|---|---|
| `server:connection:status` | `{ connected: true }` | Статус подключения |
| `server:ticket:created` | Ticket object | Новая заявка |
| `server:ticket:updated` | Ticket object | Заявка обновлена |
| `server:ticket:archived` | `{ ticketId }` | Заявка архивирована |
| `server:message:received` | Message object | Новое сообщение |
| `server:message:read:update` | `{ messageId, read: true }` | Сообщение прочитано |
| `server:gate:alert` | `{ houseId, houseNumber }` | Тревога (запрос ворот) |
| `server:gate:response:sent` | `{ ticketId, approved }` | Ответ на запрос ворот |
| `server:house:updated` | House object | Домик обновлён |
| `server:menu:updated` | MenuItem[] | Меню обновлено |
| `server:services:updated` | Service[] | Услуги обновлены |
| `server:info:updated` | Settings object | Настройки обновлены |

---

## Аутентификация

### JWT (для персонала)
- Access Token: 15 минут
- Refresh Token: 7 дней
- Алгоритм: HS256
- Хранение паролей: Argon2

### Device Token (для планшетов)
- Токен хранится в таблице `houses.device_token`
- Передаётся в заголовке `X-Device-Token`

### RBAC Роли
| Роль | Права |
|---|---|
| admin | manage_users, manage_houses, manage_services, manage_menu, view_tickets, manage_tickets, manage_chat |
| cook | view_tickets |
| cleaning | view_tickets |
| driver | view_tickets |

---

## Seed-данные

### Домики
- Домик №1–6 (vacant)

### Меню (12 блюд)
**Завтрак:** Сырники (450₽), Овсяная каша (320₽), Яичница с беконом (380₽)
**Обед:** Борщ (420₽), Паста карбонара (550₽), Греческий салат (380₽)
**Ужин:** Стейк из форели (890₽), Утиная грудка (950₽)
**Мини-бар:** Кока-кола (150₽), Вода (120₽), Пиво (320₽), Чипсы (180₽)

### Услуги
- Русская баня (3 000 ₽/час)
- Прокат велосипедов (500 ₽/час)

### Направления трансфера
- Суздаль (45 км, 700₽)
- Южа (62 км, 1000₽)
- Лух (80 км, 1000₽)
- Иваново (95 км, 1000₽)
- Владимир (70 км, 1000₽)

### Настройки
- Телефон: +7 (999) 123-45-67
- Wi-Fi: Glamp_Guest / forest2026
- Правила, описание, текст услуг

### Пользователь
- **Email:** admin@glamping.com
- **Пароль:** admin123

---

## Конфигурация (.env)

```env
DATABASE_URL="postgresql://glamping:glamping_secret@localhost:5433/glamping?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
REFRESH_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

---

## Docker Сервисы

| Сервис | Образ | Порт | Описание |
|---|---|---|---|
| PostgreSQL | postgres:15-alpine | 5433 | База данных |
| pgAdmin | dpage/pgadmin4 | 5050 | Веб-интерфейс PostgreSQL |

---

## Запуск

```bash
# 1. Запустить Docker
docker-compose up -d

# 2. Применить миграции
npx prisma migrate dev --name init

# 3. Заполнить данные
npm run prisma:seed

# 4. Запустить сервер
npm run start:dev
```
