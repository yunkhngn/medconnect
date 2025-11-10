# MedConnect Docker Setup - Summary

## ✅ Đã tạo các file sau:

### 1. Docker Configuration Files
```
├── docker-compose.yml              # Production configuration
├── docker-compose.dev.yml          # Development override
├── .env.example                    # Environment variables template
├── .dockerignore                   # Root dockerignore
├── Caddyfile                       # (Đã có) Reverse proxy config
│
├── medconnect-be/
│   ├── Dockerfile                  # Multi-stage build cho Spring Boot
│   └── .dockerignore              # Backend specific ignore
│
└── medconnect-fe/
    ├── Dockerfile                  # Multi-stage build cho Next.js
    ├── .dockerignore              # Frontend specific ignore
    └── pages/api/health.js         # Health check endpoint
```

### 2. Management Tools
```
├── Makefile                        # Make commands (khuyến nghị)
├── docker-manage.sh                # Bash script quản lý
├── DOCKER-README.md               # Tài liệu đầy đủ
├── QUICKSTART.md                   # Hướng dẫn nhanh
└── .github/workflows/
    └── docker-build.yml           # CI/CD pipeline
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Caddy (Optional)                     │
│              Reverse Proxy + SSL                        │
│           :80, :443 → routes to services                │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐   ┌──────▼────────┐
│   Frontend   │   │    Backend    │
│   Next.js    │   │  Spring Boot  │
│   :3000      │   │    :8080      │
└──────────────┘   └───────┬───────┘
                           │
                    ┌──────▼────────┐
                    │   Database    │
                    │  SQL Server   │
                    │    :1433      │
                    └───────────────┘
```

## 📦 Services

### 1. Database (db)
- **Image**: `mcr.microsoft.com/mssql/server:2022-latest`
- **Port**: 1433
- **Credentials**: Xem trong `.env`
- **Volume**: `sqlserver_data` (persistent)
- **Health Check**: ✅ Enabled

### 2. Backend (be)
- **Base**: Java 21 (Eclipse Temurin)
- **Build**: Multi-stage với Maven
- **Port**: 8080
- **Health Check**: `/actuator/health`
- **Dependencies**: Đợi DB healthy

### 3. Frontend (fe)
- **Base**: Node 20 Alpine
- **Build**: Multi-stage với standalone output
- **Port**: 3000
- **Health Check**: `/api/health`
- **Dependencies**: Đợi Backend

### 4. Caddy (caddy) - Optional
- **Image**: `caddy:2-alpine`
- **Ports**: 80, 443
- **Profile**: `production`
- **SSL**: Auto Let's Encrypt

## 🚀 Cách sử dụng

### Khởi động nhanh:
```bash
# 1. Tạo file .env
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn

# 2. Khởi động (chọn 1 trong 3 cách)
make start                    # Cách 1: Makefile
./docker-manage.sh start      # Cách 2: Script
docker-compose up -d          # Cách 3: Docker Compose

# 3. Kiểm tra
make status                   # Hoặc
docker-compose ps
```

### Development Mode:
```bash
make dev
# Hoặc
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production với SSL:
```bash
make prod
# Hoặc
docker-compose --profile production up -d
```

## 🔑 Environment Variables quan trọng

### Database
```bash
DB_SA_PASSWORD=YourStrongPassword@2024
DB_USER=sa
DB_PASSWORD=YourStrongPassword@2024
```

### Firebase (Bắt buộc)
```bash
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
```

### Cloudinary (Bắt buộc cho upload ảnh)
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Optional Services
```bash
NEXT_PUBLIC_GEMINI_API_KEY=...    # Gemini AI
RESEND_API_KEY=...                # Email service
AGORA_APP_ID=...                  # Video call
VNPAY_TMN_CODE=...                # Payment
```

## 📊 Health Checks

```bash
# Backend
curl http://localhost:8080/actuator/health

# Frontend
curl http://localhost:3000/api/health

# Hoặc dùng
make health
```

## 🛠️ Common Tasks

### Xem logs:
```bash
make logs          # All services
make logs-be       # Backend only
make logs-fe       # Frontend only
make logs-db       # Database only
```

### Build lại:
```bash
make build         # All services
make build-be      # Backend only
make build-fe      # Frontend only
```

### Database operations:
```bash
make backup        # Backup DB
make db-connect    # Connect to DB CLI
make shell-db      # Shell into DB container
```

### Shell access:
```bash
make shell-be      # Backend container
make shell-fe      # Frontend container
make shell-db      # Database container
```

## 🔍 Troubleshooting

### Container không start:
```bash
make logs
docker-compose ps
```

### Database connection error:
```bash
# Kiểm tra DB health
docker-compose ps db

# Test connection
make db-connect
```

### Port conflict:
```bash
# Kiểm tra port đang dùng
lsof -i :8080
lsof -i :3000
lsof -i :1433
```

### Clean restart:
```bash
make clean
make build
make start
```

## 📝 Files nên ignore trong git

File `.gitignore` đã được cập nhật với:
```
.env
.env.local
.env.*
docker-compose.override.yml
cert/*.pem
cert/*.key
*.log
```

## 🔒 Security Notes

1. ✅ Containers chạy với non-root user
2. ✅ Multi-stage builds giảm attack surface
3. ✅ Health checks enabled
4. ✅ Environment variables không hardcode
5. ⚠️ Nhớ thay đổi password mặc định
6. ⚠️ Không commit file `.env`

## 📚 Documentation

- **Chi tiết đầy đủ**: Xem `DOCKER-README.md`
- **Quick start**: Xem `QUICKSTART.md`
- **CI/CD**: Xem `.github/workflows/docker-build.yml`

## 🎯 Next Steps

1. ✅ Tạo file `.env` từ `.env.example`
2. ✅ Cập nhật thông tin Firebase, Cloudinary
3. ✅ Chạy `make start` hoặc `docker-compose up -d`
4. ✅ Truy cập http://localhost:3000
5. ✅ Deploy lên production server

## 💡 Tips

- Dùng `make help` để xem tất cả commands
- Dùng `make status` để kiểm tra services
- Dùng `make logs` khi có lỗi
- Development mode có hot reload
- Production mode tối ưu performance

## 🆘 Support

Nếu gặp vấn đề:
1. Đọc `DOCKER-README.md`
2. Kiểm tra `make logs`
3. Xem section Troubleshooting
4. Liên hệ team qua Gitlab

---

**Setup by**: GitHub Copilot  
**Date**: 2024  
**Version**: 1.0.0
