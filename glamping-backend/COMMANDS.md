# Шпаргалка команд

## Docker

```bash
# Показать запущенные контейнеры
docker ps

# Показать все контейнеры (включая остановленные)
docker ps -a

# Показать статус в формате таблицы
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Запустить все контейнеры (из docker-compose.yml)
docker-compose up -d

# Остановить все контейнеры
docker-compose down

# Перезапустить контейнеры
docker-compose restart

# Просмотр логов всех контейнеров
docker-compose logs

# Просмотр логов конкретного контейнера
docker-compose logs db
docker-compose logs pgadmin

# Логи в реальном времени
docker-compose logs -f

# Проверить健康check контейнера
docker inspect --format='{{.State.Health.Status}}' glamping-backend-db-1
```

## PostgreSQL (через Docker)

```bash
# Подключиться к PostgreSQL через psql
docker exec -it glamping-backend-db-1 psql -U glamping -d glamping

# Показать все таблицы
\dt

# Показать структуру таблицы
\d houses

# Показать данные из таблицы
SELECT * FROM houses;

# Показать количество записей
SELECT COUNT(*) FROM tickets;

# Выйти из psql
\q
```

## NestJS сервер

```bash
# Запустить в режиме разработки (с авто-перезагрузкой)
npm run start:dev

# Запустить в продакшн режиме
npm run start:prod

# Остановить сервер
Ctrl+C

# Собрать проект
npm run build

# Проверить, работает ли сервер
curl http://localhost:3000/api/houses

# Проверить healthcheck
curl -I http://localhost:3000/api/health
```

## Prisma

```bash
# Применить миграции
npx prisma migrate dev

# Создать новую миграцию
npx prisma migrate dev --name init

# Применить миграции в продакшне
npx prisma migrate deploy

# Заполнить базу seed-данными
npm run prisma:seed

# Генерировать Prisma клиент
npx prisma generate

# Открыть Prisma Studio (визуальный интерфейс)
npx prisma studio

# Сбросить базу данных
npx prisma migrate reset
```

## Мониторинг процессов

```bash
# Показать все процессы node
ps aux | grep node

# Показать процессы на порту 3000
ss -tlnp | grep 3000

# Показать все слушающие порты
ss -tlnp

# Показать порты PostgreSQL
ss -tlnp | grep 5433

# Показать порты pgAdmin
ss -tlnp | grep 5050

# Убить процесс по порту
kill $(lsof -t -i:3000)

# Убить все процессы nest
pkill -f "nest start"
```

## Тестирование API

```bash
# Получить дома
curl http://localhost:3000/api/houses | python3 -m json.tool

# Получить меню
curl http://localhost:3000/api/menu | python3 -m json.tool

# Получить услуги
curl http://localhost:3000/api/services | python3 -m json.tool

# Получить настройки
curl http://localhost:3000/api/info | python3 -m json.tool

# Получить направления трансфера
curl http://localhost:3000/api/transfers | python3 -m json.tool

# Войти в систему
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@glamping.com","password":"admin123"}' | python3 -m json.tool

# Создать заявку
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"houseId":"...","type":"cleaning"}' | python3 -m json.tool

# Получить заявки по домику
curl "http://localhost:3000/api/tickets?houseId=..." | python3 -m json.tool

# Получить сообщения чата
curl "http://localhost:3000/api/messages?houseId=..." | python3 -m json.tool
```

## Полезные ссылки

| Сервис | URL |
|---|---|
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |
| pgAdmin | http://localhost:5050 |
| PostgreSQL | localhost:5433 |

## Данные для входа

| Сервис | Логин | Пароль |
|---|---|---|
| pgAdmin | admin@glamping.com | admin |
| API | admin@glamping.com | admin123 |
| PostgreSQL | glamping | glamping_secret |
