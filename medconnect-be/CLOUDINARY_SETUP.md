# 🌐 Cloudinary Setup Guide

## 📝 Overview
MedConnect sử dụng Cloudinary để lưu trữ và quản lý avatar của user.

## 🔑 Get Cloudinary Credentials

### Bước 1: Tạo tài khoản Cloudinary (FREE)
1. Truy cập: https://cloudinary.com/
2. Click **Sign Up** (hoặc dùng tài khoản đã có)
3. Chọn plan **Free** (25GB storage, 25GB bandwidth/tháng)

### Bước 2: Lấy API Credentials
1. Đăng nhập vào Cloudinary Dashboard
2. Vào **Dashboard** → Bạn sẽ thấy:
   ```
   Cloud name: your-cloud-name
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz
   ```
3. Copy 3 giá trị này

## ⚙️ Configure Backend

### Option 1: Environment Variables (Recommended cho Production)

#### Windows (PowerShell):
```powershell
$env:CLOUDINARY_CLOUD_NAME="your-cloud-name"
$env:CLOUDINARY_API_KEY="your-api-key"
$env:CLOUDINARY_API_SECRET="your-api-secret"
```

#### macOS/Linux:
```bash
export CLOUDINARY_CLOUD_NAME="your-cloud-name"
export CLOUDINARY_API_KEY="your-api-key"
export CLOUDINARY_API_SECRET="your-api-secret"
```

#### Permanent Setup (add to shell profile):

**Windows:** Thêm vào System Environment Variables
- Search "Environment Variables" → Edit System Environment Variables
- Add 3 biến trên

**macOS/Linux:** Thêm vào `~/.bashrc` hoặc `~/.zshrc`:
```bash
echo 'export CLOUDINARY_CLOUD_NAME="your-cloud-name"' >> ~/.zshrc
echo 'export CLOUDINARY_API_KEY="your-api-key"' >> ~/.zshrc
echo 'export CLOUDINARY_API_SECRET="your-api-secret"' >> ~/.zshrc
source ~/.zshrc
```

### Option 2: IntelliJ IDEA Run Configuration (Recommended cho Development)

1. Mở IntelliJ IDEA
2. **Run** → **Edit Configurations...**
3. Chọn Spring Boot application config
4. Trong **Environment variables**, thêm:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name;CLOUDINARY_API_KEY=your-api-key;CLOUDINARY_API_SECRET=your-api-secret
   ```
5. Click **Apply** → **OK**

### Option 3: application.properties (NOT Recommended - chỉ local dev)

**⚠️ WARNING:** Không commit file này lên Git!

Tạo file `application-local.properties`:
```properties
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret
```

Run với profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

## ✅ Verify Setup

### Test 1: Check Application Start
```bash
cd medconnect-be
mvn spring-boot:run
```

Nếu thành công, bạn sẽ thấy:
```
Started MedConnectApplication in X.XXX seconds
```

Nếu **FAIL**, sẽ thấy error:
```
Could not resolve placeholder 'CLOUDINARY_CLOUD_NAME'
```
→ Environment variables chưa được set!

### Test 2: Upload Avatar
1. Login vào app
2. Vào **Profile Settings**
3. Click **Change Avatar**
4. Upload một ảnh
5. ✅ Success: Ảnh hiển thị với URL `https://res.cloudinary.com/...`
6. ❌ Fail: Error "Failed to upload avatar"

## 🔒 Security Notes

### DO:
✅ Dùng environment variables
✅ Add `.env` files vào `.gitignore`
✅ Share credentials qua secure channel (1Password, Bitwarden, encrypted chat)

### DON'T:
❌ Commit credentials vào Git
❌ Share credentials qua email/Slack
❌ Hardcode credentials trong code

## 🆘 Troubleshooting

### Error: "Could not resolve placeholder"
→ Environment variables chưa được set
→ Solution: Follow Option 1 hoặc 2 ở trên

### Error: "Invalid credentials"
→ API Key hoặc Secret sai
→ Solution: Double-check credentials trên Cloudinary Dashboard

### Error: "Upload failed"
→ Network issue hoặc Cloudinary service down
→ Solution: Check internet connection, check Cloudinary status

### Avatar không hiển thị sau khi upload
→ URL không được lưu vào database
→ Solution: Check backend logs, verify database connection

## 📚 More Info

- Cloudinary Docs: https://cloudinary.com/documentation
- Java SDK: https://cloudinary.com/documentation/java_integration
- Dashboard: https://console.cloudinary.com/

---

**Need help?** Contact team lead hoặc check Slack channel.

