.PHONY: help start stop restart logs build clean dev prod status health backup restore shell

# Default target
.DEFAULT_GOAL := help

# Load environment variables
include .env
export

help: ## Hiển thị help
	@echo "MedConnect Docker Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

start: ## Khởi động ứng dụng (production)
	@echo "🚀 Khởi động MedConnect..."
	docker-compose up -d
	@echo "✅ Đang chạy tại:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8080"

dev: ## Khởi động ứng dụng (development mode với hot reload)
	@echo "🔧 Khởi động Development Mode..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

prod: ## Khởi động với Caddy reverse proxy (SSL)
	@echo "🌐 Khởi động Production với Caddy..."
	docker-compose --profile production up -d

stop: ## Dừng tất cả services
	@echo "⏹️  Dừng services..."
	docker-compose down

restart: ## Khởi động lại services
	@echo "🔄 Khởi động lại..."
	docker-compose restart

logs: ## Xem logs của tất cả services
	docker-compose logs -f

logs-be: ## Xem logs của backend
	docker-compose logs -f be

logs-fe: ## Xem logs của frontend
	docker-compose logs -f fe

logs-db: ## Xem logs của database
	docker-compose logs -f db

status: ## Hiển thị trạng thái các services
	@echo "📊 Trạng thái Services:"
	@docker-compose ps
	@echo ""
	@echo "🏥 Health Checks:"
	@curl -s http://localhost:8080/actuator/health 2>/dev/null | grep -o '"status":"[^"]*"' || echo "Backend: DOWN"
	@curl -s http://localhost:3000/api/health 2>/dev/null | grep -o '"status":"[^"]*"' || echo "Frontend: DOWN"

health: ## Kiểm tra health chi tiết
	@echo "Backend Health:"
	@curl -s http://localhost:8080/actuator/health | python3 -m json.tool || echo "DOWN"
	@echo ""
	@echo "Frontend Health:"
	@curl -s http://localhost:3000/api/health | python3 -m json.tool || echo "DOWN"

build: ## Build tất cả images
	@echo "🏗️  Building images..."
	docker-compose build --no-cache

build-be: ## Build backend image
	@echo "🏗️  Building backend..."
	docker-compose build --no-cache be

build-fe: ## Build frontend image
	@echo "🏗️  Building frontend..."
	docker-compose build --no-cache fe

clean: ## Xóa tất cả containers, volumes và images
	@echo "⚠️  Cleaning up..."
	docker-compose down -v --remove-orphans
	@docker rmi $$(docker images 'g1-se1961*' -q) 2>/dev/null || true
	@echo "✅ Cleaned!"

backup: ## Backup database
	@echo "💾 Backing up database..."
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
		-S localhost -U sa -P "$(DB_SA_PASSWORD)" \
		-Q "BACKUP DATABASE MedConnect TO DISK='/var/opt/mssql/data/MedConnect_$$timestamp.bak'" -C
	@echo "✅ Backup completed!"

shell-be: ## Mở shell trong backend container
	docker-compose exec be sh

shell-fe: ## Mở shell trong frontend container
	docker-compose exec fe sh

shell-db: ## Mở shell trong database container
	docker-compose exec db bash

db-connect: ## Kết nối SQL Server CLI
	docker-compose exec db /opt/mssql-tools18/bin/sqlcmd \
		-S localhost -U sa -P "$(DB_SA_PASSWORD)" -C

ps: ## Hiển thị containers đang chạy
	docker-compose ps

top: ## Hiển thị resource usage
	docker stats

init: ## Khởi tạo môi trường lần đầu
	@if [ ! -f .env ]; then \
		echo "📋 Tạo file .env từ template..."; \
		cp .env.example .env; \
		echo "⚠️  Vui lòng cập nhật thông tin trong .env"; \
	else \
		echo "✅ File .env đã tồn tại"; \
	fi

setup: init build start ## Setup và khởi động lần đầu
	@echo "✅ Setup hoàn tất!"

