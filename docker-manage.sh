#!/bin/bash

# MedConnect Docker Management Script
# Usage: ./docker-manage.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_env() {
    if [ ! -f .env ]; then
        print_error "File .env không tồn tại!"
        print_info "Đang tạo từ .env.example..."
        cp .env.example .env
        print_warn "Vui lòng cập nhật thông tin trong file .env trước khi tiếp tục"
        exit 1
    fi
}

# Commands
case "$1" in
    start)
        print_info "Khởi động MedConnect (Production Mode)..."
        check_env
        docker-compose up -d
        print_info "Đợi services khởi động..."
        sleep 10
        docker-compose ps
        print_info "✅ Ứng dụng đã sẵn sàng!"
        print_info "Frontend: http://localhost:3000"
        print_info "Backend: http://localhost:8080"
        ;;
    
    dev)
        print_info "Khởi động MedConnect (Development Mode)..."
        check_env
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
        ;;
    
    stop)
        print_info "Dừng tất cả services..."
        docker-compose down
        print_info "✅ Đã dừng!"
        ;;
    
    restart)
        print_info "Khởi động lại services..."
        docker-compose restart
        print_info "✅ Đã khởi động lại!"
        ;;
    
    logs)
        if [ -z "$2" ]; then
            docker-compose logs -f
        else
            docker-compose logs -f "$2"
        fi
        ;;
    
    status)
        print_info "Trạng thái services:"
        docker-compose ps
        echo ""
        print_info "Health checks:"
        echo "Backend: $(curl -s http://localhost:8080/actuator/health | grep -o '"status":"[^"]*"' || echo 'DOWN')"
        echo "Frontend: $(curl -s http://localhost:3000/api/health | grep -o '"status":"[^"]*"' || echo 'DOWN')"
        ;;
    
    build)
        print_info "Building images..."
        if [ -z "$2" ]; then
            docker-compose build --no-cache
        else
            docker-compose build --no-cache "$2"
        fi
        print_info "✅ Build hoàn tất!"
        ;;
    
    clean)
        print_warn "⚠️  Điều này sẽ XÓA tất cả containers, volumes và data!"
        read -p "Bạn có chắc chắn? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            print_info "Dừng và xóa containers..."
            docker-compose down -v --remove-orphans
            print_info "Xóa images..."
            docker rmi $(docker images 'g1-se1961*' -q) 2>/dev/null || true
            print_info "✅ Đã dọn dẹp!"
        else
            print_info "Đã hủy"
        fi
        ;;
    
    backup-db)
        print_info "Backup database..."
        timestamp=$(date +%Y%m%d_%H%M%S)
        docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
            -S localhost -U sa -P "${DB_SA_PASSWORD:-MedConnect@2024}" \
            -Q "BACKUP DATABASE MedConnect TO DISK='/var/opt/mssql/data/MedConnect_${timestamp}.bak'" -C
        print_info "✅ Backup hoàn tất: MedConnect_${timestamp}.bak"
        ;;
    
    restore-db)
        if [ -z "$2" ]; then
            print_error "Vui lòng chỉ định file backup: ./docker-manage.sh restore-db <filename>"
            exit 1
        fi
        print_warn "⚠️  Điều này sẽ GHI ĐÈ database hiện tại!"
        read -p "Bạn có chắc chắn? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            print_info "Restore database từ $2..."
            docker-compose exec -T db /opt/mssql-tools18/bin/sqlcmd \
                -S localhost -U sa -P "${DB_SA_PASSWORD:-MedConnect@2024}" \
                -Q "RESTORE DATABASE MedConnect FROM DISK='/var/opt/mssql/data/$2' WITH REPLACE" -C
            print_info "✅ Restore hoàn tất!"
        else
            print_info "Đã hủy"
        fi
        ;;
    
    shell)
        service=${2:-be}
        print_info "Mở shell trong container $service..."
        docker-compose exec "$service" sh
        ;;
    
    prod)
        print_info "Khởi động với Caddy reverse proxy (Production + SSL)..."
        check_env
        docker-compose --profile production up -d
        print_info "✅ Production mode với Caddy đã sẵn sàng!"
        ;;
    
    health)
        print_info "Kiểm tra health checks..."
        echo ""
        echo "Backend:"
        curl -s http://localhost:8080/actuator/health | python3 -m json.tool || echo "Backend DOWN"
        echo ""
        echo "Frontend:"
        curl -s http://localhost:3000/api/health | python3 -m json.tool || echo "Frontend DOWN"
        ;;
    
    *)
        echo "MedConnect Docker Management Script"
        echo ""
        echo "Usage: ./docker-manage.sh [command] [options]"
        echo ""
        echo "Commands:"
        echo "  start           Khởi động ứng dụng (production mode)"
        echo "  dev             Khởi động ứng dụng (development mode)"
        echo "  prod            Khởi động với Caddy reverse proxy"
        echo "  stop            Dừng tất cả services"
        echo "  restart         Khởi động lại services"
        echo "  logs [service]  Xem logs (tất cả hoặc service cụ thể)"
        echo "  status          Hiển thị trạng thái services"
        echo "  build [service] Build images (tất cả hoặc service cụ thể)"
        echo "  clean           Xóa tất cả containers, volumes và images"
        echo "  backup-db       Backup database"
        echo "  restore-db <f>  Restore database từ file backup"
        echo "  shell [service] Mở shell trong container (mặc định: be)"
        echo "  health          Kiểm tra health của services"
        echo ""
        echo "Examples:"
        echo "  ./docker-manage.sh start"
        echo "  ./docker-manage.sh logs be"
        echo "  ./docker-manage.sh build fe"
        echo "  ./docker-manage.sh shell db"
        ;;
esac
