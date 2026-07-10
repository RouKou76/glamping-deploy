# План изменений фронтенда под бэкенд (doc.txt)

## Цель
Адаптировать фронтенд (`glamping-frontend`) под ТЗ бэкенда из `doc.txt`. Бэкенд остаётся без изменений.

---

## 1. Переименование Ticket → Task

### packages/types/src/index.ts
- `TicketType` → `TaskType`
- `TicketStatus` → `TaskStatus`
- `TicketItem` → `TaskItem`
- `Ticket` → `Task`
- Статусы: убрать `accepted`, добавить `cancelled` (из ТЗ: `NEW`, `IN_PROGRESS`, `DONE`, `CANCELLED`)
- Поле `sentAt` → `created_at` (или оставить `sentAt` если бэкенд вернёт маппинг)

### packages/types/src/index.ts — изменения enum TicketStatus
```typescript
// БЫЛО:
type TicketStatus = 'new' | 'accepted' | 'in_progress' | 'done' | 'archived'

// СТАЛО (по ТЗ):
type TaskStatus = 'new' | 'in_progress' | 'done' | 'cancelled'
```

### Файлы для переименования:
- `packages/types/src/index.ts` — интерфейсы
- `packages/api/src/wsEvents.ts` — `TicketCreatePayload` → `TaskCreatePayload`, `TicketUpdatePayload` → `TaskUpdatePayload`
- `packages/utils/src/mocks/tickets.ts` → `tasks.ts`
- `apps/admin/src/pages/Tickets/` → `apps/admin/src/pages/Tasks/`
- `apps/guest/src/pages/Home/Home.tsx` — все ссылки на Ticket
- Все файлы, импортирующие Ticket-типы

---

## 2. House + GuestSession — вместо flat-объекта

### packages/types/src/index.ts
```typescript
// БЫЛО: один flat-объект
interface House { id: string; number: number; status: HouseStatus; guestCount?: number; lang: Lang; checkInAt?: string }

// СТАЛО: две отдельные сущности
interface House { id: string; number: number; status: HouseStatus; deviceToken?: string }

interface GuestSession {
  id: string
  houseId: string
  guestCount?: number
  lang: Lang
  checkInAt?: string
  checkOutAt?: string
  isActive: boolean
}
```

### Файлы для изменения:
- `packages/types/src/index.ts` — новый интерфейс GuestSession
- `packages/utils/src/mocks/houses.ts` — разделить на houses + guestSessions
- `apps/admin/src/pages/CheckIn/CheckIn.tsx` — загружать сессии отдельно
- `apps/admin/src/pages/Chats/Chats.tsx` — houseId + session context
- `apps/admin/src/pages/Tickets/Tickets.tsx` —houseId → task.houseId
- `apps/guest/src/contexts/GlampInfoContext.tsx` — загружать сессию по device_token

---

## 3. TaskStatus — убрать `accepted`, добавить `cancelled`

### packages/types/src/index.ts
```typescript
type TaskStatus = 'new' | 'in_progress' | 'done' | 'cancelled'
```

### apps/admin/src/pages/Tasks/Tickets.tsx (после переименования)
- Убрать фильтр `accepted`
- Убрать кнопку «Принять» (new → accepted)
- Изменить логику: new → in_progress → done → archived
- Добавить `cancelled` в UI

### apps/guest/src/hooks/useMealPeriod.ts
- Проверить использование TaskStatus

---

## 4. MenuItem — убрать `showPrice`, `translations`

### packages/types/src/index.ts
```typescript
// БЫЛО:
interface MenuItem { id: string; name: string; description?: string; category: MenuCategory; price: number; hidden: boolean; showPrice: boolean; translations?: Translations }

// СТАЛО (по ТЗ — нет showPrice и translations):
interface MenuItem { id: string; name: string; description?: string; category: MenuCategory; price: number; isAvailable: boolean }
```

### Изменения:
- `hidden` → `isAvailable` (инвертировать логику)
- Убрать `showPrice` и `translations`
- `packages/utils/src/mocks/menuItems.ts` — обновить моки
- `apps/admin/src/pages/Menu/Menu.tsx` — убрать toggle showPrice, заменить hidden → isAvailable

---

## 5. Service — ServiceFieldConfig → json_schema

### packages/types/src/index.ts
```typescript
// БЫЛО:
interface ServiceFieldConfig { desiredAt?: ServiceField; location?: ServiceField; catalog?: ServiceField; geo?: ServiceField; guestCount?: ServiceField; comment?: ServiceField }
interface Service { ... fields: ServiceFieldConfig; ... }

// СТАЛО (по ТЗ — json_schema для динамической валидации):
interface Service {
  id: string
  name: string
  requiresTime: boolean
  priceInfo?: string
  jsonSchema?: Record<string, unknown>  // JSON Schema для валидации details
  active: boolean
  assignedTo: AssignedRole
  translations?: Translations
}
```

### Изменения:
- Убрать `ServiceFieldConfig` и `ServiceField`
- Убрать `fields` из `Service`
- Добавить `requiresTime`, `priceInfo`, `jsonSchema`
- `apps/admin/src/pages/Services/Services.tsx` — переписать форму (убрать toggle полей, добавить JSON Schema редактор или упрощённый интерфейс)
- `apps/guest/src/pages/Home/Home.tsx` — убрать `buildServiceConfig`, генерировать форму из `jsonSchema`
- `packages/utils/src/mocks/services.ts` — обновить моки

---

## 6. Ticket/Task.items → отдельная таблица food_order_items

### packages/types/src/index.ts
```typescript
// БЫЛО: items как JSON в Ticket
interface Ticket { ... items?: TicketItem[]; ... }

// СТАЛО: items отдельно (или оставить JSON, но бэкенд хранит в food_order_items)
// Вариант А: бэкенд возвращает items встроенным (JOIN)
// Вариант Б: фронт загружает отдельно
// Рекомендация: оставить items в response, бэкенд делает JOIN
```

### Решение:
Оставить `items?: TaskItem[]` в интерфейсе `Task`, но переименовать `TicketItem` → `TaskItem`. Бэкенд будет возвращать данные из `food_order_items` через JOIN.

---

## 7. Message.sender_type — GUEST/STAFF вместо granular roles

### packages/types/src/index.ts
```typescript
// БЫЛО:
type MessageSender = 'guest' | 'admin' | AssignedRole  // guest | admin | cook | cleaning | driver

// СТАЛО (по ТЗ — sender_type: GUEST / STAFF):
type MessageSender = 'GUEST' | 'STAFF'
```

### Изменения:
- `packages/types/src/index.ts` — изменить тип
- `packages/utils/src/mocks/messages.ts` — обновить моки
- `apps/admin/src/pages/Chats/Chats.tsx` — заменить `sender === 'admin'` → `sender === 'STAFF'`
- `apps/guest/src/pages/Chat/Chat.tsx` — заменить `sender === 'guest'` → `sender === 'GUEST'`

---

## 8. Settings — загружать из API вместо localStorage

### packages/types/src/index.ts
```typescript
// Убрать GlampInfo из GlampInfoContext, загружать из API
interface Settings {
  phone: string
  wifiName: string
  wifiPassword: string
  rules: string
  description: string
  servicesText: string
}
```

### Изменения:
- `apps/guest/src/contexts/GlampInfoContext.tsx` — загружать из `GET /api/settings` вместо localStorage
- `apps/admin/src/pages/InfoEditor/InfoEditor.tsx` — сохранять через `PUT /api/settings`
- `packages/api/src/client.ts` — добавить эндпоинты для settings

---

## 9. Transfer — убрать TransferDestination, использовать API калькуляцию

### packages/types/src/index.ts
```typescript
// УБРАТЬ:
interface TransferDestination { id: string; name: string; km: number; price: number }

// Бэкенд рассчитывает цену через внешнее API (Яндекс/2GIS)
// Фронт отправляет только адрес, получает цену
```

### Изменения:
- `packages/types/src/index.ts` — удалить `TransferDestination`
- `packages/utils/src/mocks/transferDestinations.ts` — удалить
- `apps/guest/src/pages/Home/Home.tsx` — в форме трансфера: ввод адреса → запрос к бэкенду для калькуляции цены
- `apps/admin/src/pages/Tasks/Tickets.tsx` — отображение geo без привязки к справочнику

---

## 10. Meal periods — загружать из API meal_types

### packages/types/src/index.ts
```typescript
// Добавить:
interface MealType {
  id: string
  name: string
  startTime: string  // "08:00"
  endTime: string    // "10:00"
}
```

### Изменения:
- `apps/guest/src/hooks/useMealPeriod.ts` — загружать слоты из `GET /api/meal-types` вместо хардкода
- `packages/utils/src/mocks/` — добавить mock mealTypes

---

## 11. Дополнительные изменения

### price_fix в задачах
- `packages/types/src/index.ts` — добавить `priceFix?: number` в `Task`

### Audit log (журнал аудита)
- В ТЗ提到: «Любое изменение статуса задачи триггерит запись в журнал аудита»
- Пока не реализовывать на фронте, но предусмотреть расширение

### WebSocket события
- `packages/api/src/wsEvents.ts` — проверить соответствие событий ТЗ
- Добавить `task:cancelled` событие (если нужно)

---

## Сводная таблица изменений по файлам

| Файл | Изменения |
|---|---|
| `packages/types/src/index.ts` | Ticket→Task, TaskStatus, House+GuestSession, MenuItem (убрать showPrice/translations), Service (json_schema), MessageSender, удалить TransferDestination, добавить MealType |
| `packages/api/src/wsEvents.ts` | Ticket→Task в payload-типах |
| `packages/api/src/client.ts` | Добавить эндпоинты settings, meal-types |
| `packages/utils/src/mocks/houses.ts` | Разделить на houses + guestSessions |
| `packages/utils/src/mocks/tickets.ts` → `tasks.ts` | Переименовать, обновить статусы |
| `packages/utils/src/mocks/menuItems.ts` | Убрать showPrice, hidden→isAvailable |
| `packages/utils/src/mocks/services.ts` | ServiceFieldConfig → jsonSchema |
| `packages/utils/src/mocks/messages.ts` | sender → GUEST/STAFF |
| `packages/utils/src/mocks/transferDestinations.ts` | Удалить |
| `packages/utils/src/mocks/mealTypes.ts` | Создать (или загружать из API) |
| `apps/admin/src/App.tsx` | Tickets → Tasks |
| `apps/admin/src/pages/Tickets/` → `Tasks/` | Переименовать директорию, обновить всё |
| `apps/admin/src/pages/Menu/Menu.tsx` | hidden→isAvailable, убрать showPrice |
| `apps/admin/src/pages/Services/Services.tsx` | Переписать форму под jsonSchema |
| `apps/admin/src/pages/CheckIn/CheckIn.tsx` | GuestSession отдельно |
| `apps/admin/src/pages/Chats/Chats.tsx` | sender → GUEST/STAFF |
| `apps/admin/src/pages/InfoEditor/InfoEditor.tsx` | Загружать/сохранять через API |
| `apps/guest/src/App.tsx` | Проверить импорты |
| `apps/guest/src/pages/Home/Home.tsx` | Task, transfer через API, ServiceFieldConfig→jsonSchema |
| `apps/guest/src/pages/Chat/Chat.tsx` | sender → GUEST/STAFF |
| `apps/guest/src/contexts/GlampInfoContext.tsx` | Загружать из API |
| `apps/guest/src/hooks/useMealPeriod.ts` | Загружать mealTypes из API |

---

## Порядок выполнения

1. **Типы** (`packages/types`) — основа, всё остальное зависит от этого
2. **Моки** (`packages/utils/mocks`) — обновить данные
3. **API клиент** (`packages/api`) — обновить эндпоинты
4. **Admin pages** — Tasks (переименование), Menu, Services, CheckIn, Chats, InfoEditor
5. **Guest pages** — Home, Chat, GlampInfoContext, useMealPeriod
6. **Тесты** — обновить existing tests (useMealPeriod.test.ts)
