# 🎨 Avatar Service - Complete Guide

## ✅ Setup đã hoàn tất!

Bạn đã setup Cloudinary credentials trong `.env` file. Bây giờ làm theo các bước sau:

---

## 📋 **Bước 1: Install Maven Dependencies**

```bash
cd medconnect-be
mvn clean install
```

Lệnh này sẽ download Cloudinary library vào project.

---

## 📋 **Bước 2: Restart Backend**

```bash
# Stop backend hiện tại (Ctrl+C)
# Then restart:
mvn spring-boot:run
```

Check console xem có errors không. Backend sẽ load Cloudinary credentials từ `.env`.

---

## 📋 **Bước 3: Test Avatar System**

### **3.1. Priority Avatars - Cách hoạt động:**

```
1️⃣ Custom Avatar (Cloudinary) - Ưu tiên cao nhất
   └─ Nếu user đã upload ảnh → Dùng ảnh Cloudinary

2️⃣ Gmail Profile Photo
   └─ Nếu login bằng Gmail → Dùng ảnh từ Gmail (user.photoURL)

3️⃣ Placeholder/Default
   └─ Nếu không có gì → Hiển thị icon User
```

### **3.2. Test Scenarios:**

#### **Scenario A: Login bằng Gmail**
1. Login với tài khoản Gmail
2. Vào `/nguoi-dung/cai-dat`
3. **Kết quả:** Hiển thị ảnh Gmail
4. Upload ảnh mới
5. **Kết quả:** Ảnh Gmail bị thay thế bằng ảnh Cloudinary

#### **Scenario B: Login bằng Email/Password**
1. Đăng ký tài khoản mới (không qua Gmail)
2. Vào `/nguoi-dung/cai-dat`
3. **Kết quả:** Hiển thị icon placeholder
4. Upload ảnh
5. **Kết quả:** Hiển thị ảnh từ Cloudinary

#### **Scenario C: Upload ảnh mới**
1. Đã có avatar (Gmail hoặc Cloudinary)
2. Upload ảnh mới
3. **Kết quả:** Ảnh cũ bị xóa, ảnh mới hiển thị

---

## 🎯 **API Endpoints**

### **1. Upload Avatar**
```http
POST http://localhost:8080/api/avatar/upload
Authorization: Bearer YOUR_FIREBASE_TOKEN
Content-Type: multipart/form-data

Body:
- file: [image file]
```

**Success Response:**
```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234/medconnect/avatars/userId/abc.jpg"
}
```

**Error Response:**
```json
{
  "error": "File must be an image"
}
// hoặc
{
  "error": "File size must be less than 5MB"
}
```

---

### **2. Get Avatar**
```http
GET http://localhost:8080/api/avatar
Authorization: Bearer YOUR_FIREBASE_TOKEN
```

**Response:**
```json
{
  "avatarUrl": "https://res.cloudinary.com/..."
}
// hoặc
{
  "avatarUrl": null
}
```

---

### **3. Delete Avatar**
```http
DELETE http://localhost:8080/api/avatar
Authorization: Bearer YOUR_FIREBASE_TOKEN
```

**Response:**
```json
{
  "message": "Avatar deleted successfully"
}
```

---

## 🎨 **Frontend Features**

### **Avatar Display Logic:**

```javascript
// hooks/useAvatar.js
const getAvatarUrl = (user, dbAvatarUrl) => {
  // 1. Custom uploaded avatar (priority)
  if (dbAvatarUrl) return dbAvatarUrl;
  
  // 2. Gmail profile photo
  if (user?.photoURL) return user.photoURL;
  
  // 3. No avatar
  return null;
};
```

### **Upload Function:**

```javascript
const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0];
  const url = await uploadAvatar(file);
  setAvatarUrl(url);
  toast.success("Tải ảnh đại diện thành công!");
};
```

---

## 🛡️ **Security & Validation**

### **Backend Validation:**
- ✅ File must be an image (`image/*`)
- ✅ Max size: 5MB
- ✅ Authenticated users only
- ✅ Auto-delete old avatar when uploading new one

### **Image Transformations:**
Cloudinary tự động:
- ✅ Resize: 400x400px
- ✅ Crop: Face-focused
- ✅ Quality: Auto-optimized
- ✅ Format: Auto (WebP for modern browsers)

---

## 📁 **Cloudinary Folder Structure**

```
medconnect/
  └── avatars/
      ├── firebaseUid1/
      │   └── uuid-1.jpg
      ├── firebaseUid2/
      │   └── uuid-2.jpg
      └── firebaseUid3/
          └── uuid-3.jpg
```

---

## 🔧 **Troubleshooting**

### **Error: "Cloudinary credentials not found"**
**Solution:**
1. Check `.env` file exists
2. Verify:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
3. Restart backend: `mvn spring-boot:run`

---

### **Error: "Upload failed"**
**Solutions:**
- Check internet connection
- Verify Cloudinary credentials are correct
- Check file size < 5MB
- Check file is an image

---

### **Image not displaying**
**Solutions:**
1. Open browser console (F12)
2. Check for CORS errors
3. Verify image URL is accessible
4. Check if avatarUrl state is updated

---

## 💡 **Best Practices**

### **1. Always use `getAvatarUrl()` helper:**
```javascript
const avatarUrl = getAvatarUrl(user, dbAvatarUrl);
```

### **2. Show loading state:**
```javascript
{uploading ? "Đang tải..." : "Chọn ảnh"}
```

### **3. Toast notifications:**
```javascript
toast.success("Upload thành công!");
toast.error("Upload thất bại!");
```

---

## 🎯 **Next Steps**

1. **Test uploading** với các loại file khác nhau
2. **Test với Gmail account** và Email/Password account
3. **Verify avatar** hiển thị ở các nơi khác (header, dashboard, etc.)
4. **Test delete avatar** và check Gmail photo fallback

---

## 📊 **Cloudinary Dashboard**

Login vào https://cloudinary.com/console để:
- ✅ Xem ảnh đã upload
- ✅ Check bandwidth usage
- ✅ Monitor transformations
- ✅ View analytics

---

**🎉 Avatar Service đã sẵn sàng!**

Reload frontend và test upload ảnh ngay! 🚀

