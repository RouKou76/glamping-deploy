# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/
RUN npm ci
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/apps/guest/dist /usr/share/nginx/html/guest
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html/admin
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
