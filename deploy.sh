#!/bin/bash
set -e

VPS="root@109.196.99.62"
REMOTE_DIR="/opt/glamping"

echo "==> Копирование файлов на VPS..."
rsync -avz --delete \
  glamping-backend/ $VPS:$REMOTE_DIR/glamping-backend/ \
  --exclude node_modules --exclude dist --exclude .git
rsync -avz --delete \
  glamping-frontend/ $VPS:$REMOTE_DIR/glamping-frontend/ \
  --exclude node_modules --exclude dist --exclude .git

echo "==> Настройка .env на VPS..."
ssh $VPS "cat > $REMOTE_DIR/glamping-backend/.env << 'EOF'
DATABASE_URL=postgresql://gen_user:jA-jsdT%2C%40obVQ3@192.168.0.4:5432/default_db
JWT_SECRET=glamp_prod_xK9m2vL8pQ3nW5jR7tY4uI6oA0sD2fG4hJ8kN1mP5qZ
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d
PORT=3000
FRONTEND_URL=http://109.196.99.62
EOF"

echo "==> Установка зависимостей на VPS..."
ssh $VPS "cd $REMOTE_DIR/glamping-backend && npm install && npx prisma generate && npx prisma migrate deploy"
ssh $VPS "cd $REMOTE_DIR/glamping-frontend && npm install"

echo "==> Готово! Запустите на VPS:"
echo "  cd /opt/glamping/glamping-backend && npm run start:dev"
echo "  cd /opt/glamping/glamping-frontend && npm run dev"
