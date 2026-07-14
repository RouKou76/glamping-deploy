.PHONY: help dev build start stop logs seed migrate

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	docker compose up -d
	@echo "Waiting for PostgreSQL..."
	@sleep 3
	npx prisma migrate dev
	npm run prisma:seed
	npm run start:dev

build: ## Build for production
	npm run build

start: ## Start production server
	npx prisma migrate deploy
	node dist/main.js

stop: ## Stop all containers
	docker compose down

logs: ## View logs
	docker compose logs -f

seed: ## Seed database
	npm run prisma:seed

migrate: ## Run migrations
	npx prisma migrate deploy

studio: ## Open Prisma Studio
	npx prisma studio

test: ## Run tests
	npm run test

lint: ## Run linter
	npm run lint

docker-build: ## Build production Docker images
	docker compose -f docker-compose.prod.yml build

docker-up: ## Start production containers
	docker compose -f docker-compose.prod.yml up -d

docker-down: ## Stop production containers
	docker compose -f docker-compose.prod.yml down

docker-logs: ## View production logs
	docker compose -f docker-compose.prod.yml logs -f
