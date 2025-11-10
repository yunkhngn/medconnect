# 🔧 Docker Build Issues & Fixes

## ✅ Các vấn đề đã sửa

### 1. Frontend build errors

#### Issue 1: Yarn package manager ❌ → ✅
**Lỗi**: Project dùng Yarn nhưng Dockerfile dùng npm
**Fix**: Đã chuyển sang `yarn install --frozen-lockfile`

#### Issue 2: Firebase API Key error ❌ → ✅  
**Lỗi**: Firebase credentials không được pass vào build stage
**Fix**: Đã thêm build args trong docker-compose.yml và Dockerfile

#### Issue 3: Empty page files ❌ → ✅
**Lỗi**: Các file `tro-li-ca-nhan.jsx` trống không có default export
```
pages/admin/tro-li-ca-nhan.jsx
pages/bac-si/tro-li-ca-nhan.jsx  
pages/nguoi-dung/tro-li-ca-nhan.jsx
```
**Fix**: Đã thêm placeholder components

#### Issue 4: Lucide React icon warning ⚠️
**Cảnh báo**: `Tooth` icon không tồn tại trong lucide-react
**File**: `pages/bang-gia.jsx`
**Giải pháp**: Có thể ignore hoặc sửa bằng icon khác (không blocking build)

---

## 🚀 Build lại

### Quick build:
```bash
# Build frontend only
docker compose build fe

# Build all
docker compose build

# Build without cache
docker compose build --no-cache
```

### Check logs nếu fail:
```bash
# Xem build logs
docker compose build fe 2>&1 | tee build.log

# Xem lỗi cuối cùng
docker compose build fe 2>&1 | tail -50
```

---

## 📝 Checklist trước khi build

- [x] File `.env` tồn tại ở root
- [x] File `.env` có đủ biến NEXT_PUBLIC_*
- [x] Các file page có default export
- [x] yarn.lock exists
- [x] package.json đúng

---

## 🐛 Nếu build vẫn fail

### 1. Kiểm tra environment variables:
```bash
cat .env | grep NEXT_PUBLIC_FIREBASE_API_KEY
```

### 2. Xóa cache và build lại:
```bash
docker compose build --no-cache fe
```

### 3. Build local để test:
```bash
cd medconnect-fe
yarn install
yarn build
```

### 4. Kiểm tra pages:
```bash
find pages -name "*.jsx" -exec grep -L "export default" {} \;
```

---

## ✅ Status

**Last Update**: 2024-11-11  
**Build Status**: Ready to build ✅

**Files Fixed**:
- ✅ `medconnect-fe/Dockerfile` - Added build args & retry
- ✅ `docker-compose.yml` - Added build args for frontend
- ✅ `pages/admin/tro-li-ca-nhan.jsx` - Added placeholder
- ✅ `pages/bac-si/tro-li-ca-nhan.jsx` - Added placeholder
- ✅ `pages/nguoi-dung/tro-li-ca-nhan.jsx` - Added placeholder

**Thử build ngay**:
```bash
docker compose build fe
```
