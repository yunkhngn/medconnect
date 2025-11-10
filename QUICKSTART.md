# Quick Start Guide - Docker

## 🚀 Khởi động nhanh

### Bước 1: Chuẩn bị file .env
```bash
cp .env.example .env
# Sau đó chỉnh sửa file .env với thông tin của bạn
```

### Bước 2: Khởi động
```bash
# Sử dụng Makefile (khuyến nghị)
make start

# Hoặc sử dụng docker-compose trực tiếp
docker-compose up -d
```

### Bước 3: Kiểm tra
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- API Docs: http://localhost:8080/actuator

## 📝 Các lệnh thường dùng

### Với Makefile (dễ nhớ hơn):
```bash
make help          # Xem tất cả lệnh
make start         # Khởi động
make stop          # Dừng
make logs          # Xem logs
make status        # Xem trạng thái
make dev           # Chạy development mode
make build         # Build lại images
make clean         # Dọn dẹp tất cả
```

### Với Docker Compose:
```bash
docker-compose up -d              # Khởi động
docker-compose down               # Dừng
docker-compose logs -f            # Xem logs
docker-compose ps                 # Xem trạng thái
docker-compose restart            # Khởi động lại
```

### Với Script:
```bash
./docker-manage.sh start          # Khởi động
./docker-manage.sh stop           # Dừng
./docker-manage.sh logs           # Xem logs
./docker-manage.sh status         # Xem trạng thái
```

## 🔍 Troubleshooting nhanh

### Container không start được?
```bash
# Xem logs chi tiết
make logs

# Xem logs service cụ thể
docker-compose logs be
docker-compose logs fe
docker-compose logs db
```

### Database connection error?
```bash
# Kiểm tra database
docker-compose ps db

# Test connection
docker-compose exec db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "MedConnect@2024" -Q "SELECT 1" -C
```

### Port bị chiếm?
```bash
# Kiểm tra port
lsof -i :8080
lsof -i :3000
lsof -i :1433

# Đổi port trong docker-compose.yml
```

### Clean start lại từ đầu:
```bash
make clean
make build
make start
```

## 📚 Tài liệu đầy đủ

Xem file `DOCKER-README.md` để biết thêm chi tiết về:
- Cấu hình chi tiết
- Production deployment
- Backup & restore
- Security best practices
- Advanced troubleshooting

## 🆘 Cần trợ giúp?

1. Đọc `DOCKER-README.md`
2. Kiểm tra logs: `make logs`
3. Xem issues trên Gitlab
4. Liên hệ team

---
**Version:** 1.0.0  
**Last Updated:** 2024
