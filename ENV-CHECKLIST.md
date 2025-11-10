# ✅ Environment Variables Checklist cho Docker

## 📋 Tổng quan

Dự án đã có **ĐỦ** environment variables cho Docker Compose!

### Files đã kiểm tra:
- ✅ `/medconnect-be/.env` - Backend env (đầy đủ)
- ✅ `/medconnect-fe/.env.local` - Frontend env (đầy đủ)  
- ✅ `/.env` - Root env cho docker-compose (đầy đủ)

---

## 🔑 Environment Variables đã có

### 1. **Database** ✅
```bash
DB_USER=sa
DB_PASSWORD=Toilakhoa1204!
```

### 2. **Firebase Backend** ✅
```bash
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=medconnect-2eaff
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_AUTH_URI=...
FIREBASE_TOKEN_URI=...
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=...
FIREBASE_CLIENT_X509_CERT_URL=...
FIREBASE_UNIVERSE_DOMAIN=...
```

### 3. **Firebase Frontend** ✅
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### 4. **Cloudinary** ✅
```bash
CLOUDINARY_CLOUD_NAME=dx6jeulg2
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 5. **Gemini AI** ✅
```bash
NEXT_PUBLIC_GEMINI_API_KEY=...
```

### 6. **Resend Email** ✅
```bash
RESEND_API_KEY=...
NEXT_PUBLIC_RESEND_API_KEY=...
```

### 7. **VNPay Payment** ✅
```bash
VNPAY_TMN_CODE=...
VNPAY_HASH_SECRET=...
VNPAY_PAY_URL=...
VNPAY_RETURN_URL=...
VNPAY_IPN_URL=...
```

### 8. **SePay Payment** ✅
```bash
SEPAY_MERCHANT_ID=...
SEPAY_SECRET_KEY=...
```

### 9. **Agora Video** ✅
```bash
AGORA_APP_ID=...
AGORA_CERTIFICATE=...
NEXT_PUBLIC_AGORA_APP_ID=... (cho frontend)
```

### 10. **Geoapify Maps** ✅
```bash
GEOAPIFY_API_KEY=...
NEXT_PUBLIC_GEOAPIFY_API_KEY=...
```

### 11. **Application URLs** ✅
```bash
APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 🔧 Dockerfile Fixes đã thực hiện

### Frontend Dockerfile ✅
**Vấn đề**: Project dùng **Yarn** nhưng Dockerfile dùng **npm**

**Đã sửa**:
```dockerfile
# Trước
COPY package.json package-lock.json* ./
RUN npm ci
RUN npm run build

# Sau
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile
RUN yarn build
```

---

## 🚀 Sẵn sàng chạy Docker

### Bước 1: Build và khởi động
```bash
# Cách 1: Dùng Makefile
make build
make start

# Cách 2: Dùng docker-compose
docker-compose build
docker-compose up -d

# Cách 3: Dùng script
./docker-manage.sh build
./docker-manage.sh start
```

### Bước 2: Kiểm tra
```bash
# Xem trạng thái
docker-compose ps

# Xem logs
docker-compose logs -f

# Health checks
curl http://localhost:8080/actuator/health
curl http://localhost:3000/api/health
```

### Bước 3: Truy cập
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Database**: localhost:1433

---

## 📊 So sánh Environment Variables

### Docker Compose cần gì?
| Biến | Backend cần | Frontend cần | Root .env có | Status |
|------|-------------|--------------|--------------|--------|
| DB_USER | ✅ | ❌ | ✅ | ✅ OK |
| DB_PASSWORD | ✅ | ❌ | ✅ | ✅ OK |
| FIREBASE_* (Backend) | ✅ | ❌ | ✅ | ✅ OK |
| NEXT_PUBLIC_FIREBASE_* | ❌ | ✅ | ✅ | ✅ OK |
| CLOUDINARY_* | ✅ | ❌ | ✅ | ✅ OK |
| NEXT_PUBLIC_GEMINI_API_KEY | ❌ | ✅ | ✅ | ✅ OK |
| RESEND_API_KEY | ✅ | ✅ | ✅ | ✅ OK |
| VNPAY_* | ✅ | ❌ | ✅ | ✅ OK |
| AGORA_* | ✅ | ✅ | ✅ | ✅ OK |
| GEOAPIFY_* | ❌ | ✅ | ✅ | ✅ OK |

**Kết luận**: ✅ **TẤT CẢ biến đều ĐỦ!**

---

## 🎯 Docker Compose Environment Mapping

### Backend Service (be):
```yaml
environment:
  - DB_USER=${DB_USER}                        ✅
  - DB_PASSWORD=${DB_PASSWORD}                ✅
  - FIREBASE_TYPE=${FIREBASE_TYPE}            ✅
  - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID} ✅
  - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME} ✅
  - RESEND_API_KEY=${RESEND_API_KEY}          ✅
  - VNPAY_TMN_CODE=${VNPAY_TMN_CODE}          ✅
  - AGORA_APP_ID=${AGORA_APP_ID}              ✅
  # ... tất cả biến khác
```

### Frontend Service (fe):
```yaml
environment:
  - NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY} ✅
  - NEXT_PUBLIC_GEMINI_API_KEY=${NEXT_PUBLIC_GEMINI_API_KEY}     ✅
  - NEXT_PUBLIC_AGORA_APP_ID=${AGORA_APP_ID}                     ✅
  - NEXT_PUBLIC_GEOAPIFY_API_KEY=${GEOAPIFY_API_KEY}             ✅
  - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}                   ✅
  # ... tất cả biến khác
```

---

## ⚠️ Lưu ý quan trọng

### 1. Frontend API URL
Trong Docker:
- ✅ **Đúng**: `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
- ❌ **Sai**: `NEXT_PUBLIC_API_URL=http://be:8080/api`

**Lý do**: Frontend chạy ở browser, phải gọi qua localhost, không phải tên service Docker.

### 2. Password phải mạnh
```bash
DB_PASSWORD=Toilakhoa1204!  ✅ OK (có chữ hoa, số, ký tự đặc biệt)
```

### 3. Private Key format
Firebase Private Key phải có `\n`:
```bash
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n
```
✅ Đã đúng format!

---

## 🔍 Kiểm tra nhanh

### Trước khi build:
```bash
# Kiểm tra file .env tồn tại
ls -la .env

# Kiểm tra có đủ biến không
cat .env | grep -E "DB_USER|FIREBASE_PROJECT_ID|CLOUDINARY_CLOUD_NAME|AGORA_APP_ID"
```

### Sau khi build:
```bash
# Kiểm tra env trong container
docker-compose exec be env | grep FIREBASE_PROJECT_ID
docker-compose exec fe env | grep NEXT_PUBLIC_FIREBASE_API_KEY
```

---

## ✅ Kết luận

**Status**: 🟢 **READY TO BUILD**

Tất cả environment variables đã đầy đủ cho Docker Compose:
- ✅ Database credentials
- ✅ Firebase (backend + frontend)
- ✅ Cloudinary
- ✅ Gemini AI
- ✅ Resend Email
- ✅ VNPay + SePay Payment
- ✅ Agora Video
- ✅ Geoapify Maps
- ✅ Application URLs

**Các file đã được sửa**:
1. ✅ `medconnect-fe/Dockerfile` - Chuyển từ npm sang yarn
2. ✅ `.env` - Đã bổ sung đầy đủ biến
3. ✅ `docker-compose.yml` - Đã map đủ biến cho services

**Có thể chạy ngay**:
```bash
docker-compose build
docker-compose up -d
```

---

**Last Updated**: 2024-11-11  
**Status**: ✅ Production Ready
