# Glamping Backend — Implementation Plan

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Frontend Compatibility Mapping](#2-frontend-compatibility-mapping)
3. [Prisma Schema](#3-prisma-schema)
4. [Phase 0: Infrastructure](#4-phase-0-infrastructure)
5. [Phase 1: Core & Auth](#5-phase-1-core--auth)
6. [Phase 2: Domain Modules](#6-phase-2-domain-modules)
7. [Phase 3: WebSocket Gateway](#7-phase-3-websocket-gateway)
8. [Phase 4: Polish & Docker](#8-phase-4-polish--docker)
9. [API Endpoint Reference](#9-api-endpoint-reference)
10. [WebSocket Event Reference](#10-websocket-event-reference)

---

## 1. Architecture Overview

```
glamping-backend/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── .eslintignore
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── all-exceptions.filter.ts
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── permissions.guard.ts
│   │   │   └── device.guard.ts
│   │   ├── decorators/
│   │   │   ├── require-permissions.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── pipes/
│   │   │   └── dynamic-schema-validation.pipe.ts
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   ├── config/
│   │   └── config.validation.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── dto/
│   ├── houses/
│   │   ├── houses.module.ts
│   │   ├── houses.controller.ts
│   │   ├── houses.service.ts
│   │   └── dto/
│   ├── tickets/
│   │   ├── tickets.module.ts
│   │   ├── tickets.controller.ts
│   │   ├── tickets.service.ts
│   │   └── dto/
│   ├── menu/
│   │   ├── menu.module.ts
│   │   ├── menu.controller.ts
│   │   ├── menu.service.ts
│   │   └── dto/
│   ├── services-catalog/
│   │   ├── services-catalog.module.ts
│   │   ├── services-catalog.controller.ts
│   │   ├── services-catalog.service.ts
│   │   └── dto/
│   ├── messages/
│   │   ├── messages.module.ts
│   │   ├── messages.controller.ts
│   │   └── messages.service.ts
│   ├── transfers/
│   │   ├── transfers.module.ts
│   │   ├── transfers.controller.ts
│   │   └── transfers.service.ts
│   ├── info/
│   │   ├── info.module.ts
│   │   ├── info.controller.ts
│   │   └── info.service.ts
│   └── gateway/
│       ├── gateway.module.ts
│       └── gateway.service.ts
```

**Tech stack**: NestJS 10+, Prisma 5+, PostgreSQL 15+, Docker, JWT (passport-jwt), Socket.IO, AJV, Helmet, class-validator.

---

## 2. Frontend Compatibility Mapping

The frontend (`packages/api`, `packages/types`) defines contracts the backend must satisfy. Key naming divergences from `doc.txt`:

| Backend spec (doc.txt) | Frontend type | Resolution |
|---|---|---|
| `tasks` table | `Ticket` interface | Name the REST entity `tickets`, keep internal table as `tickets` (not `tasks`) |
| `houses` + `guest_sessions` (2 tables) | Flat `House` object | Join at query time; return flat object from `/api/houses` |
| `services.json_schema` (dynamic AJV) | Fixed `ServiceFieldConfig` object | Store as JSONB; frontend reads `fields` as structured object, not raw JSON Schema |
| `is_available` boolean | `hidden` boolean | Map: `hidden = !is_available`. Column name in DB: `hidden` |
| — (missing) | `showPrice` boolean | Add `show_price` column to `menu_items` |
| — (missing) | `translations` JSON | Add `translations` JSONB column to `menu_items` and `services` |
| — (missing) | `TransferDestination` entity | Add `transfer_destinations` table |
| `meal_types` + time windows | `MenuCategory` enum | Simplify: `category` enum on `menu_items` instead of separate `meal_types` table |
| `food_order_items` (FK to tasks) | `TicketItem[]` inline in ticket | Store items as JSONB array on `tickets.items` — matches frontend shape directly |
| `chat_messages.sender_type` (GUEST/STAFF) | `MessageSender` union type | Store as string: `'guest' | 'admin' | 'cook' | 'cleaning' | 'driver'` |
| `settings` key-value table | `GlampInfo` typed object | Use `settings` table with known keys: `wifi_name`, `wifi_password`, `rules`, `description`, `phone`, `services_text` |

---

## 3. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum HouseStatus {
  occupied
  vacant
}

enum TicketType {
  food
  transfer
  cleaning
  towels
  minibar
  gates
  custom
}

enum TicketStatus {
  new
  accepted
  in_progress
  done
  archived
}

enum MenuCategory {
  breakfast
  lunch
  dinner
  minibar
}

enum AssignedRole {
  cook
  cleaning
  driver
  admin
}

model House {
  id           String        @id @default(cuid())
  number       Int           @unique
  status       HouseStatus   @default(vacant)
  deviceToken  String?       @unique @map("device_token")
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  sessions     GuestSession[]
  tickets      Ticket[]
  messages     ChatMessage[]

  @@map("houses")
}

model GuestSession {
  id           String    @id @default(cuid())
  houseId      String    @map("house_id")
  guestCount   Int?      @map("guest_count")
  lang         String    @default("ru")
  checkInAt    DateTime? @map("check_in_at")
  checkOutAt   DateTime? @map("check_out_at")
  isActive     Boolean   @default(true) @map("is_active")
  createdAt    DateTime  @default(now()) @map("created_at")

  house        House     @relation(fields: [houseId], references: [id])
  tickets      Ticket[]
  messages     ChatMessage[]

  @@index([houseId, isActive])
  @@map("guest_sessions")
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  permissions String[] // JSON array stored as String[]
  createdAt   DateTime @default(now()) @map("created_at")

  users       User[]

  @@map("roles")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  name          String
  roleId        String   @map("role_id")
  refreshToken  String?  @map("refresh_token")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  role          Role     @relation(fields: [roleId], references: [id])

  @@map("users")
}

model Ticket {
  id           String       @id @default(cuid())
  houseId      String       @map("house_id")
  sessionId    String?      @map("session_id")
  type         TicketType
  status       TicketStatus @default(new)
  sentAt       DateTime     @default(now()) @map("sent_at")
  desiredAt    DateTime?    @map("desired_at")
  description  String?
  geo          String?
  assignedTo   AssignedRole? @map("assigned_to")
  location     String?      // ServiceLocation: 'cabin' | 'terrace' | 'gazebo'
  guestCount   Int?         @map("guest_count")
  items        Json?        // TicketItem[] stored as JSON
  priceFix     Int?         @map("price_fix")
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  house        House        @relation(fields: [houseId], references: [id])
  session      GuestSession? @relation(fields: [sessionId], references: [id])

  @@index([houseId])
  @@index([status])
  @@index([assignedTo])
  @@map("tickets")
}

model MenuItem {
  id          String       @id @default(cuid())
  name        String
  description String?
  category    MenuCategory
  price       Int          // Price in minor units (kopecks/cents)
  hidden      Boolean      @default(false)
  showPrice   Boolean      @default(true) @map("show_price")
  translations Json?       // Translations type as JSON
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  @@map("menu_items")
}

model Service {
  id          String   @id @default(cuid())
  name        String
  price       String?  // Display price string, e.g. "от 500₽"
  icon        String?
  active      Boolean  @default(true)
  assignedTo  AssignedRole @map("assigned_to")
  fields      Json     // ServiceFieldConfig as JSON
  items       Json?    // ServiceItem[] as JSON
  jsonSchema  Json?    @map("json_schema") // Future: AJV dynamic schema
  translations Json?   // Translations as JSON
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("services")
}

model TransferDestination {
  id        String @id @default(cuid())
  name      String
  km        Float
  price     Int    // Price in minor units
  createdAt DateTime @default(now()) @map("created_at")

  @@map("transfer_destinations")
}

model ChatMessage {
  id         String   @id @default(cuid())
  houseId    String   @map("house_id")
  sessionId  String?  @map("session_id")
  sender     String   // 'guest' | 'admin' | AssignedRole value
  text       String
  timestamp  DateTime @default(now())
  read       Boolean  @default(false)
  createdAt  DateTime @default(now()) @map("created_at")

  house      House         @relation(fields: [houseId], references: [id])
  session    GuestSession? @relation(fields: [sessionId], references: [id])

  @@index([houseId])
  @@map("chat_messages")
}

model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value String

  @@map("settings")
}
```

### Mapping to frontend `House` flat object

The frontend expects a flat `House` with `status`, `guestCount`, `lang`, `checkInAt`. The backend must JOIN `houses` with the active `guest_session` at query time:

```typescript
// In houses.service.ts
async findAll(): Promise<House[]> {
  const houses = await this.prisma.house.findMany({
    include: {
      sessions: { where: { isActive: true }, take: 1 }
    }
  });
  return houses.map(h => ({
    id: h.id,
    number: h.number,
    status: h.status,
    guestCount: h.sessions[0]?.guestCount ?? undefined,
    lang: (h.sessions[0]?.lang ?? 'ru') as Lang,
    checkInAt: h.sessions[0]?.checkInAt?.toISOString() ?? undefined,
  }));
}
```

---

## 4. Phase 0: Infrastructure

### 4.1 Project scaffolding

```bash
# Initialize NestJS project
npx @nestjs/cli new glamping-backend --package-manager npm --skip-git
cd glamping-backend

# Install dependencies
npm install prisma @prisma/client @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt argon2
npm install @nestjs/platform-socket.io @nestjs/websockets @socket.io/redis-adapter
npm install class-validator class-transformer @nestjs/swagger swagger-ui-express
npm install helmet joi ajv
npm install -D @types/passport-jwt @types/argon2 @types/helmet
npm install -D eslint-config-prettier prettier husky lint-staged

# Initialize Prisma
npx prisma init
```

### 4.2 Files to create in Phase 0

| File | Purpose |
|---|---|
| `docker-compose.yml` | PostgreSQL 15 + pgAdmin containers |
| `.env.example` | Template with DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, REFRESH_EXPIRES_IN |
| `src/main.ts` | Bootstrap with Helmet, CORS, ValidationPipe, global filters/interceptors, Swagger at `/api/docs` |
| `src/app.module.ts` | Root module importing ConfigModule (Joi validation), PrismaModule, all domain modules, GatewayModule |
| `src/config/config.validation.ts` | Joi schema for env vars |
| `src/common/prisma/prisma.service.ts` | PrismaService extending PrismaClient with `enableShutdownHooks` |
| `src/common/prisma/prisma.module.ts` | Global module exporting PrismaService |
| `src/common/filters/all-exceptions.filter.ts` | Maps HttpException and unknown errors to `{ success, statusCode, timestamp, path, error }` |
| `src/common/interceptors/response.interceptor.ts` | Wraps successful responses in `{ success: true, data, timestamp }` |
| `src/common/interceptors/logging.interceptor.ts` | Logs method, path, IP, execution time in ms |
| `src/health.controller.ts` | `HEAD /health` returning 200 OK |
| `.eslintignore` | Add `node_modules`, `dist`, `prisma/generated` |
| `tsconfig.build.json` | Exclude `node_modules`, `test`, `dist` |

### 4.3 docker-compose.yml

```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: glamping
      POSTGRES_USER: glamping
      POSTGRES_PASSWORD: glamping_secret
    volumes:
      - pgdata:/var/lib/postgresql/data
  pgadmin:
    image: dpage/pgadmin4
    ports: ["5050:80"]
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@glamping.com
      PGADMIN_DEFAULT_PASSWORD: admin
volumes:
  pgdata:
```

### 4.4 main.ts bootstrap

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.enableCors({ origin: config.get('FRONTEND_URL', '*'), credentials: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(), new LoggingInterceptor());

  app.setGlobalPrefix('api');

  const doc = new SwaggerModuleBuilder()
    .setTitle('Glamping API')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, doc);

  await app.listen(config.get('PORT', 3000));
}
bootstrap();
```

---

## 5. Phase 1: Core & Auth

### 5.1 AuthModule

**Files**: `src/auth/auth.module.ts`, `auth.controller.ts`, `auth.service.ts`, `jwt.strategy.ts`, `dto/login.dto.ts`, `dto/refresh.dto.ts`

**Endpoints**:
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | None | Email + password → access + refresh tokens |
| POST | `/api/auth/refresh` | None | Refresh token → new access token |
| GET | `/api/auth/me` | JWT | Current user profile |

**JwtStrategy**: Extracts JWT from `Authorization: Bearer <token>`, validates, attaches `{ id, email, roleId, role: { permissions } }` to `request.user`.

**Guards**:
- `JwtAuthGuard` — extends `AuthGuard('jwt')`, applied globally or per-controller
- `PermissionsGuard` — uses `Reflector` to read `@RequirePermissions(...)` metadata, checks `request.user.role.permissions` intersection
- `DeviceGuard` — reads `X-Device-Token` header, looks up `houses` by `device_token`, loads active `guest_session`, attaches `{ house, session }` to request

### 5.2 Seed script (prisma/seed.ts)

Creates via `upsert`:
- 1 admin role with permissions: `['manage_users', 'manage_houses', 'manage_services', 'manage_menu', 'view_tickets', 'manage_tickets', 'manage_chat']`
- 1 default admin user: `admin@glamping.com` / `admin123` (argon2 hashed)
- 6 houses (numbers 1–6)
- 12 menu items matching frontend mocks
- 2 services matching frontend mocks
- 5 transfer destinations matching frontend mocks
- Default settings: `wifi_name`, `wifi_password`, `rules`, `description`, `phone`, `services_text`
- 5 sample chat messages
- 7 sample tickets

### 5.3 HousesModule

**Files**: `src/houses/houses.module.ts`, `houses.controller.ts`, `houses.service.ts`, `dto/check-in.dto.ts`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/houses` | Device or JWT | Returns `House[]` (flattened with active session data) |
| PUT | `/api/houses/:id/checkin` | JWT | Creates `GuestSession`, sets `house.status = occupied` |
| PUT | `/api/houses/:id/checkout` | JWT | Sets `isActive = false`, archives open tickets, sets `house.status = vacant` |

**Key logic — checkout transaction**:
```typescript
async checkout(houseId: string) {
  return this.prisma.$transaction(async (tx) => {
    const session = await tx.guestSession.findFirst({
      where: { houseId, isActive: true }
    });
    if (!session) throw new BadRequestException('No active session');

    await tx.ticket.updateMany({
      where: { sessionId: session.id, status: { in: ['new', 'accepted', 'in_progress'] } },
      data: { status: 'archived' }
    });

    await tx.guestSession.update({
      where: { id: session.id },
      data: { isActive: false, checkOutAt: new Date() }
    });

    await tx.house.update({
      where: { id: houseId },
      data: { status: 'vacant' }
    });
  });
}
```

---

## 6. Phase 2: Domain Modules

### 6.1 TicketsModule

**Files**: `src/tickets/tickets.module.ts`, `tickets.controller.ts`, `tickets.service.ts`, `dto/create-ticket.dto.ts`, `dto/update-ticket.dto.ts`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tickets` | Device or JWT | List tickets; filter by houseId (device) or status/assignedTo (JWT) |
| POST | `/api/tickets` | Device | Create ticket from kiosk; `items` stored as JSON |
| PATCH | `/api/tickets/:id` | JWT | Update status or assignedTo |
| PATCH | `/api/tickets/:id/archive` | JWT | Set status to `archived` |

**Frontend `Ticket` mapping**:
```typescript
// Prisma result → frontend Ticket
function toTicket(t: TicketRecord): Ticket {
  return {
    id: t.id,
    houseId: t.houseId,
    type: t.type,
    status: t.status,
    sentAt: t.sentAt.toISOString(),
    desiredAt: t.desiredAt?.toISOString(),
    description: t.description,
    geo: t.geo,
    assignedTo: t.assignedTo,
    items: (t.items as TicketItem[] | null) ?? undefined,
    location: t.location as ServiceLocation | undefined,
    guestCount: t.guestCount,
  };
}
```

### 6.2 MenuModule

**Files**: `src/menu/menu.module.ts`, `menu.controller.ts`, `menu.service.ts`, `dto/create-menu-item.dto.ts`, `dto/update-menu-item.dto.ts`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/menu` | Device or JWT | Returns `MenuItem[]`; device only gets non-hidden items |
| POST | `/api/menu` | JWT | Create menu item |
| PUT | `/api/menu/:id` | JWT | Update menu item |
| DELETE | `/api/menu/:id` | JWT | Delete menu item |

**Note on `translations`**: Stored as JSONB, returned as-is. The `Translations` type is `Partial<Record<'ru'|'en'|'zh', { name: string; description?: string }>>`.

### 6.3 ServicesCatalogModule

Named `ServicesCatalogModule` to avoid collision with NestJS internal `ServicesModule`.

**Files**: `src/services-catalog/services-catalog.module.ts`, `services-catalog.controller.ts`, `services-catalog.service.ts`, `dto/create-service.dto.ts`, `dto/update-service.dto.ts`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/services` | Device or JWT | Returns `Service[]`; device only gets active services |
| POST | `/api/services` | JWT | Create service |
| PUT | `/api/services/:id` | JWT | Update service |
| DELETE | `/api/services/:id` | JWT | Delete service |

**`fields` column**: Stored as JSONB matching `ServiceFieldConfig` shape:
```json
{
  "desiredAt": { "enabled": true, "label": "Желаемое время" },
  "location": { "enabled": true, "label": "Локация" },
  "catalog": { "enabled": false },
  "geo": { "enabled": false },
  "guestCount": { "enabled": true, "label": "Кол-во гостей" },
  "comment": { "enabled": true, "label": "Комментарий" }
}
```

### 6.4 TransfersModule

**Files**: `src/transfers/transfers.module.ts`, `transfers.controller.ts`, `transfers.service.ts`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/transfers` | Device or JWT | Returns `TransferDestination[]` |

### 6.5 MessagesModule

**Files**: `src/messages/messages.module.ts`, `messages.controller.ts`, `messages.service.ts`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/messages` | Device or JWT | Returns messages for a house (query param `houseId`) |
| PATCH | `/api/messages/:id/read` | JWT | Mark message as read |

### 6.6 InfoModule

**Files**: `src/info/info.module.ts`, `info.controller.ts`, `info.service.ts`, `dto/update-info.dto.ts`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/info` | Device or JWT | Returns `GlampInfo` object assembled from `settings` rows |
| PUT | `/api/info` | JWT | Update settings |

**`GlampInfo` assembly**:
```typescript
async getInfo(): Promise<GlampInfo> {
  const rows = await this.prisma.setting.findMany();
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    phone: map.phone ?? '',
    wifiName: map.wifi_name ?? '',
    wifiPassword: map.wifi_password ?? '',
    rules: map.rules ?? '',
    description: map.description ?? '',
    servicesText: map.services_text ?? '',
  };
}
```

---

## 7. Phase 3: WebSocket Gateway

### 7.1 GatewayModule

**Files**: `src/gateway/gateway.module.ts`, `src/gateway/gateway.service.ts`

Uses Socket.IO (via `@nestjs/platform-socket.io`). The gateway is the central nervous system — it handles all 21 event types defined in `packages/api/src/wsEvents.ts`.

### 7.2 Event handling

| Client event (wire name) | Handler logic | Server broadcast event |
|---|---|---|
| `client:connect` | Register socket to room based on role (admin) or houseId (kiosk) | `server:connection:status` |
| `client:ticket:create` | Validate payload, create ticket in DB, emit to admin room | `server:ticket:created` |
| `client:ticket:update` | Update ticket status/assignedTo in DB, emit to relevant house + admin rooms | `server:ticket:updated` |
| `client:ticket:archive` | Set ticket status to `archived`, emit to admin room | `server:ticket:archived` |
| `client:message:save` | Save message to DB, emit to admin room (or specific house room if admin sends) | `server:message:received` |
| `client:message:read` | Mark messages as read in DB, emit read receipts | `server:message:read:update` |
| `client:gate:request` | Emit gate alert to all admin sockets | `server:gate:alert` |
| `client:gate:response` | Emit gate response to specific house room | `server:gate:response:sent` |

**Internal broadcasts** (triggered from REST services via EventEmitter or direct gateway injection):
| Trigger | Server event |
|---|---|
| House status changed (check-in/out) | `server:house:updated` |
| Menu item created/updated/deleted | `server:menu:updated` |
| Service created/updated/deleted | `server:services:updated` |
| Info settings updated | `server:info:updated` |

### 7.3 Room strategy

- **Admin room**: `admins` — all admin-role sockets join on connect
- **House rooms**: `house:<houseId>` — kiosk sockets join on connect using their device token

```typescript
@WebSocketGateway({ cors: { origin: '*' } })
export class GatewayService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const role = client.handshake.auth?.role;
    const houseId = client.handshake.auth?.houseId;
    if (role === 'admin') client.join('admins');
    if (houseId) client.join(`house:${houseId}`);
    client.emit('server:connection:status', { connected: true });
  }

  // Broadcast to admins
  broadcastToAdmins(event: string, payload: unknown) {
    this.server.to('admins').emit(event, payload);
  }

  // Send to specific house
  sendToHouse(houseId: string, event: string, payload: unknown) {
    this.server.to(`house:${houseId}`).emit(event, payload);
  }
}
```

### 7.4 Integration with REST

REST controllers inject `GatewayService` via `@Inject(GatewayService)`. After DB mutations, they call broadcast methods:

```typescript
// In tickets.service.ts
async createTicket(dto: CreateTicketDto) {
  const ticket = await this.prisma.ticket.create({ data: ... });
  this.gateway.broadcastToAdmins('server:ticket:created', toTicket(ticket));
  return ticket;
}
```

---

## 8. Phase 4: Polish & Docker

### 8.1 Dockerfile (multi-stage)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

### 8.2 docker-compose.yml (production)

Add `backend` service:

```yaml
  backend:
    build: .
    ports: ["3000:3000"]
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://glamping:glamping_secret@db:5432/glamping
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 15m
      REFRESH_EXPIRES_IN: 7d
      FRONTEND_URL: http://localhost:5173
```

### 8.3 Graceful shutdown

In `main.ts`:
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ... setup
  app.enableShutdownHooks();
  await app.listen(port);
}
```

`PrismaService` already calls `$disconnect()` via `enableShutdownHooks()`.

---

## 9. API Endpoint Reference

Complete list of all REST endpoints the frontend will consume:

| # | Method | Path | Auth | Request body | Response |
|---|---|---|---|---|---|
| 1 | HEAD | `/health` | None | — | 200 OK |
| 2 | POST | `/api/auth/login` | None | `{ email, password }` | `{ accessToken, refreshToken }` |
| 3 | POST | `/api/auth/refresh` | None | `{ refreshToken }` | `{ accessToken }` |
| 4 | GET | `/api/auth/me` | JWT | — | `{ id, email, name, role }` |
| 5 | GET | `/api/houses` | Device or JWT | — | `House[]` |
| 6 | PUT | `/api/houses/:id/checkin` | JWT | `{ guestCount, lang }` | `House` |
| 7 | PUT | `/api/houses/:id/checkout` | JWT | — | `House` |
| 8 | GET | `/api/tickets` | Device or JWT | Query: `houseId?`, `status?`, `assignedTo?` | `Ticket[]` |
| 9 | POST | `/api/tickets` | Device | `CreateTicketDto` | `Ticket` |
| 10 | PATCH | `/api/tickets/:id` | JWT | `{ status?, assignedTo? }` | `Ticket` |
| 11 | PATCH | `/api/tickets/:id/archive` | JWT | — | `Ticket` |
| 12 | GET | `/api/menu` | Device or JWT | — | `MenuItem[]` |
| 13 | POST | `/api/menu` | JWT | `CreateMenuItemDto` | `MenuItem` |
| 14 | PUT | `/api/menu/:id` | JWT | `UpdateMenuItemDto` | `MenuItem` |
| 15 | DELETE | `/api/menu/:id` | JWT | — | 204 |
| 16 | GET | `/api/services` | Device or JWT | — | `Service[]` |
| 17 | POST | `/api/services` | JWT | `CreateServiceDto` | `Service` |
| 18 | PUT | `/api/services/:id` | JWT | `UpdateServiceDto` | `Service` |
| 19 | DELETE | `/api/services/:id` | JWT | — | 204 |
| 20 | GET | `/api/transfers` | Device or JWT | — | `TransferDestination[]` |
| 21 | GET | `/api/messages` | Device or JWT | Query: `houseId` | `Message[]` |
| 22 | PATCH | `/api/messages/:id/read` | JWT | — | `Message` |
| 23 | GET | `/api/info` | Device or JWT | — | `GlampInfo` |
| 24 | PUT | `/api/info` | JWT | `UpdateInfoDto` | `GlampInfo` |

---

## 10. WebSocket Event Reference

### Client → Server

| Event | Wire name | Payload |
|---|---|---|
| CONNECT | `client:connect` | — (auth via handshake) |
| TICKET_CREATE | `client:ticket:create` | `{ houseId, type, items?, location?, geo?, desiredAt?, description? }` |
| TICKET_UPDATE | `client:ticket:update` | `{ ticketId, status, assignedTo? }` |
| TICKET_ARCHIVE | `client:ticket:archive` | `{ ticketId }` |
| MESSAGE_SEND | `client:message:send` | `{ houseId, text }` |
| MESSAGE_READ | `client:message:read` | `{ messageId }` |
| GATE_REQUEST | `client:gate:request` | `{ houseId }` |
| GATE_RESPONSE | `client:gate:response` | `{ ticketId, approved }` |

### Server → Client

| Event | Wire name | Payload |
|---|---|---|
| TICKET_CREATED | `server:ticket:created` | `Ticket` |
| TICKET_UPDATED | `server:ticket:updated` | `Ticket` |
| TICKET_ARCHIVED | `server:ticket:archived` | `{ ticketId }` |
| MESSAGE_RECEIVED | `server:message:received` | `Message` |
| MESSAGE_READ_UPDATE | `server:message:read:update` | `{ messageId, read: true }` |
| GATE_ALERT | `server:gate:alert` | `{ houseId, houseNumber }` |
| GATE_RESPONSE_SENT | `server:gate:response:sent` | `{ ticketId, approved }` |
| HOUSE_UPDATED | `server:house:updated` | `House` |
| MENU_UPDATED | `server:menu:updated` | `MenuItem[]` |
| SERVICES_UPDATED | `server:services:updated` | `Service[]` |
| INFO_UPDATED | `server:info:updated` | `GlampInfo` |
| CONNECTION_STATUS | `server:connection:status` | `{ connected: boolean }` |

---

## Implementation Order Summary

| Phase | Est. time | Deliverables |
|---|---|---|
| **0 — Infrastructure** | 1–2 days | Project scaffold, Docker, Prisma schema + migration, global pipes/filters/interceptors, health endpoint, seed script |
| **1 — Core & Auth** | 2–3 days | AuthModule (login/refresh/me), JWT strategy, DeviceGuard, HousesModule (CRUD + check-in/out), seed with admin user |
| **2 — Domain Modules** | 3–4 days | TicketsModule, MenuModule, ServicesCatalogModule, TransfersModule, MessagesModule, InfoModule — all with REST CRUD |
| **3 — WebSocket** | 2–3 days | GatewayService with all 21 events, room management, integration with REST services for broadcasts |
| **4 — Polish** | 1–2 days | Dockerfile, production docker-compose, Swagger docs, error handling refinement, CORS testing |
| **Total** | **9–14 days** | Fully functional backend compatible with frontend |

---

## Key Design Decisions

1. **`items` as JSONB on tickets** — Avoids a separate `food_order_items` table. The frontend sends and expects `TicketItem[]` inline. Prisma's `Json` type handles serialization transparently.

2. **`fields` as JSONB on services** — Rather than building a full AJV pipeline now, store `ServiceFieldConfig` as structured JSON. AJV support can be layered on later when dynamic admin-defined schemas are needed.

3. **Flat `House` response** — The two-table model (`houses` + `guest_sessions`) is preserved for data integrity, but the service layer flattens the join so the frontend gets exactly what it expects.

4. **`settings` table for info** — Key-value pairs avoid a rigid schema for content that changes frequently (wifi password, rules text, etc.).

5. **Socket.IO over raw WebSocket** — The frontend's `useWebSocket.ts` uses `socket.io-client` patterns (connect/reconnect). NestJS `@nestjs/platform-socket.io` provides this natively.

6. **`ServicesCatalogModule` naming** — Avoids naming collision with NestJS internals and makes the module's purpose explicit.
