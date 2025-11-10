# MedConnect - Docker Setup Guide

## 📋 Mục lục
- [Giới thiệu](#giới-thiệu)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cấu trúc Docker](#cấu-trúc-docker)
- [Cài đặt](#cài-đặt)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Môi trường Development](#môi-trường-development)
- [Môi trường Production](#môi-trường-production)
- [Quản lý](#quản-lý)
- [Troubleshooting](#troubleshooting)

## 🎯 Giới thiệu

Dự án MedConnect được container hóa với Docker, bao gồm:
- **Backend**: Spring Boot (Java 21) với Maven
- **Frontend**: Next.js 15 (Node 20)
- **Database**: MS SQL Server 2022
- **Reverse Proxy**: Caddy (cho production)

## 💻 Yêu cầu hệ thống

### Phần mềm cần thiết:
- Docker Engine 20.10+ hoặc Docker Desktop
- Docker Compose 2.0+
- Ít nhất 4GB RAM khả dụng
- 10GB dung lượng đĩa trống

### Kiểm tra phiên bản:
```bash
docker --version
docker-compose --version
```

## 🏗️ Cấu trúc Docker

```
.
├── docker-compose.yml              # Cấu hình production
├── docker-compose.dev.yml          # Override cho development
├── .env.example                    # Template biến môi trường
├── .dockerignore                   # Loại trừ file khỏi Docker context
├── Caddyfile                       # Cấu hình Caddy reverse proxy
├── medconnect-be/
│   ├── Dockerfile                  # Multi-stage build cho Spring Boot
│   └── .dockerignore
└── medconnect-fe/
    ├── Dockerfile                  # Multi-stage build cho Next.js
    └── .dockerignore
```

## 🚀 Cài đặt

### 1. Clone dự án
```bash
git clone <repository-url>
cd g1-se1961-nj-swp391-fal25
```

### 2. Tạo file .env
```bash
cp .env.example .env
```

### 3. Chỉnh sửa file .env
Mở file `.env` và điền các thông tin:

```bash
# Database
DB_SA_PASSWORD=YourStrongPassword@2024
DB_USER=sa
DB_PASSWORD=YourStrongPassword@2024

# Firebase (bắt buộc)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
# ... các biến Firebase khác

# Cloudinary (bắt buộc cho upload ảnh)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional services
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key
RESEND_API_KEY=your-resend-key
AGORA_APP_ID=your-agora-app-id
```

## 🎮 Chạy ứng dụng

### Production Mode (Khuyến nghị)

#### Khởi động tất cả services:
```bash
docker-compose up -d
```

#### Khởi động với Caddy reverse proxy (với SSL):
```bash
docker-compose --profile production up -d
```

#### Kiểm tra logs:
```bash
# Tất cả services
docker-compose logs -f

# Chỉ backend
docker-compose logs -f be

# Chỉ frontend
docker-compose logs -f fe

# Chỉ database
docker-compose logs -f db
```

#### Truy cập ứng dụng:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:1433
- **Health Checks**:
  - Backend: http://localhost:8080/actuator/health
  - Frontend: http://localhost:3000/api/health

### Development Mode

Để chạy ở chế độ development với hot reload:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

**Lưu ý**: Ở mode development:
- Source code được mount vào container
- Backend tự động reload khi code thay đổi
- Frontend chạy với `npm run dev`
- Có mock data được tự động import

## 🏭 Môi trường Production

### Build images riêng lẻ:

```bash
# Build backend
docker build -t medconnect-be:latest ./medconnect-be

# Build frontend
docker build -t medconnect-fe:latest ./medconnect-fe
```

### Deploy với Caddy (SSL tự động):

1. Đảm bảo domain của bạn trỏ về server
2. Cập nhật `Caddyfile` với domain của bạn
3. Chạy với profile production:

```bash
docker-compose --profile production up -d
```

Caddy sẽ tự động:
- Lấy SSL certificate từ Let's Encrypt
- Redirect HTTP sang HTTPS
- Làm reverse proxy cho frontend và backend

### Environment Variables cho Production:

```bash
# App URLs
APP_BASE_URL=https://medconnects.app
NEXT_PUBLIC_API_URL=https://api.medconnects.app

# VNPay Payment (production)
VNPAY_PAY_URL=https://pay.vnpay.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://medconnects.app/thanh-toan/ket-qua
VNPAY_IPN_URL=https://api.medconnects.app/api/payment/vnpay/ipn
```

## 🔧 Quản lý

### Dừng services:
```bash
docker-compose down
```

### Dừng và xóa volumes (data sẽ mất):
```bash
docker-compose down -v
```

### Rebuild images:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Xem trạng thái:
```bash
docker-compose ps
```

### Exec vào container:
```bash
# Backend
docker-compose exec be sh

# Frontend
docker-compose exec fe sh

# Database
docker-compose exec db bash
```

### Kết nối SQL Server:
```bash
docker-compose exec db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "MedConnect@2024" -C
```

### Backup Database:
```bash
docker-compose exec db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "MedConnect@2024" \
  -Q "BACKUP DATABASE MedConnect TO DISK='/var/opt/mssql/backup/MedConnect.bak'" -C
```

### Restore Database:
```bash
docker-compose exec db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "MedConnect@2024" \
  -Q "RESTORE DATABASE MedConnect FROM DISK='/var/opt/mssql/backup/MedConnect.bak' WITH REPLACE" -C
```

## 🐛 Troubleshooting

### Backend không kết nối được database:

1. Kiểm tra database đã healthy:
```bash
docker-compose ps db
```

2. Kiểm tra logs database:
```bash
docker-compose logs db
```

3. Test connection từ backend:
```bash
docker-compose exec be sh
# Trong container, kiểm tra biến môi trường
env | grep DB
```

### Frontend không gọi được API:

1. Kiểm tra biến môi trường `NEXT_PUBLIC_API_URL`:
```bash
docker-compose exec fe sh
env | grep NEXT_PUBLIC_API_URL
```

2. Trong development mode, đảm bảo sử dụng `http://localhost:8080`
3. Trong production, sử dụng domain hoặc `http://be:8080`

### SQL Server không start:

1. Kiểm tra password đủ mạnh (ít nhất 8 ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt)
2. Kiểm tra RAM đủ (SQL Server cần ít nhất 2GB)
3. Xem logs chi tiết:
```bash
docker-compose logs db | tail -100
```

### Port đã được sử dụng:

```bash
# Kiểm tra port nào đang chạy
lsof -i :8080  # Backend
lsof -i :3000  # Frontend
lsof -i :1433  # Database

# Hoặc dừng service đang chạy
# Hoặc đổi port trong docker-compose.yml
```

### Container bị restart liên tục:

```bash
# Xem logs để tìm lỗi
docker-compose logs -f [service-name]

# Kiểm tra health check
docker inspect medconnect-be | grep -A 10 Health
```

### Clean up toàn bộ:

```bash
# Dừng và xóa tất cả
docker-compose down -v --remove-orphans

# Xóa images
docker rmi $(docker images 'medconnect*' -q)

# Xóa volumes không sử dụng
docker volume prune

# Build lại từ đầu
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Monitoring & Logs

### Health Checks:
```bash
# Backend health
curl http://localhost:8080/actuator/health

# Frontend health
curl http://localhost:3000/api/health
```

### Xem resource usage:
```bash
docker stats
```

### Export logs:
```bash
docker-compose logs --no-color > logs.txt
```

## 🔐 Security Best Practices

1. **Không commit file .env** vào git
2. **Thay đổi mật khẩu mặc định** của database
3. **Sử dụng secrets** cho production (Docker Swarm/Kubernetes)
4. **Giới hạn port expose** trong production
5. **Thường xuyên update** base images
6. **Chạy containers** với non-root user (đã config sẵn)

## 📝 Notes

- SQL Server container cần ~2GB RAM để chạy ổn định
- First startup có thể mất 1-2 phút để database init
- Backend sẽ tự động tạo tables khi start lần đầu (JPA auto-ddl)
- Frontend build có thể mất 5-10 phút tùy máy
- Volumes được persist data giữa các lần restart

## 🆘 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra health checks
3. Xem phần Troubleshooting ở trên
4. Liên hệ team qua Gitlab issues

---

**Happy Dockerizing! 🐳**
