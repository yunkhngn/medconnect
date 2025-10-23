# 📋 HƯỚNG DẪN QUẢN LÝ GIẤY PHÉP HÀNH NGHỀ

## 🎯 Tổng quan

Hệ thống quản lý **Giấy phép hành nghề khám bệnh, chữa bệnh** theo đúng mẫu Bộ Y Tế.

### ✨ Tính năng chính:
- ✅ Một bác sĩ có thể có **nhiều giấy phép** (cấp mới, cấp lại, gia hạn)
- ✅ Đầy đủ thông tin theo **mẫu Bộ Y Tế**
- ✅ Tự động kiểm tra **giấy phép hết hạn**
- ✅ Hiển thị **giấy phép đang hiệu lực**
- ✅ Lịch sử giấy phép đầy đủ

---

## 📊 Database Schema

### Bảng `License` (Giấy phép hành nghề)

| Column | Type | Description |
|--------|------|-------------|
| `license_id` | INT (PK) | ID giấy phép |
| `doctor_id` | INT (FK) | ID bác sĩ |
| `license_number` | NVARCHAR(50) | Số giấy phép (VD: `000001/BYT-GPHN`) |
| `issued_date` | DATE | Ngày cấp |
| `expiry_date` | DATE (nullable) | Ngày hết hạn (NULL = vô thời hạn) |
| `issued_by` | NVARCHAR(255) | Nơi cấp (VD: "Cục Quản lý Khám chữa bệnh - Bộ Y tế") |
| `issuer_title` | NVARCHAR(100) | Chức danh người cấp (VD: "Cục trưởng", "Trưởng phòng") |
| `scope_of_practice` | NVARCHAR(MAX) | Phạm vi hành nghề (Theo Điều 26 Luật Khám bệnh, chữa bệnh) |
| `is_active` | BIT | Còn hiệu lực không (1 = đang dùng, 0 = hết hạn/thu hồi) |
| `notes` | NVARCHAR(MAX) | Ghi chú (VD: "Cấp lại lần 2", "Gia hạn") |
| `created_at` | DATETIME2 | Ngày tạo record |
| `updated_at` | DATETIME2 | Ngày cập nhật |

### Relationships:
- **License** `ManyToOne` **Doctor** (doctor_id → user_id)
- **Doctor** `OneToMany` **License** (một bác sĩ nhiều giấy phép)

---

## 🔧 Backend APIs

### Base URL: `/api/licenses`

#### 1. **GET /api/licenses/my**
Lấy tất cả giấy phép của bác sĩ hiện tại (sắp xếp theo ngày cấp mới nhất)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "license_id": 1,
    "license_number": "000001/BYT-GPHN",
    "issued_date": "2020-01-15",
    "expiry_date": "2030-01-15",
    "issued_by": "Cục Quản lý Khám chữa bệnh - Bộ Y tế",
    "issuer_title": "Cục trưởng",
    "scope_of_practice": "Khám bệnh, chữa bệnh theo chuyên khoa Tim mạch",
    "is_active": true,
    "notes": null,
    "is_expired": false,
    "is_valid": true,
    "days_until_expiry": 1825,
    "created_at": "2025-10-23T21:00:00",
    "updated_at": "2025-10-23T21:00:00"
  }
]
```

---

#### 2. **GET /api/licenses/my/active**
Lấy giấy phép đang hiệu lực của bác sĩ hiện tại

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "license_id": 1,
  "license_number": "000001/BYT-GPHN",
  "issued_date": "2020-01-15",
  "expiry_date": "2030-01-15",
  ...
}
```

---

#### 3. **POST /api/licenses/my**
Tạo giấy phép mới

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "license_number": "000123/BYT-GPHN",
  "issued_date": "2025-01-15",
  "expiry_date": "2030-01-15",  // Optional, null = vô thời hạn
  "issued_by": "Cục Quản lý Khám chữa bệnh - Bộ Y tế",
  "issuer_title": "Cục trưởng",
  "scope_of_practice": "Khám bệnh, chữa bệnh theo chuyên khoa Tim mạch",
  "notes": "Cấp mới"  // Optional
}
```

---

#### 4. **PATCH /api/licenses/my/{licenseId}**
Cập nhật giấy phép

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:** (Chỉ gửi fields cần update)
```json
{
  "expiry_date": "2035-01-15",
  "notes": "Gia hạn lần 1",
  "is_active": true
}
```

---

#### 5. **DELETE /api/licenses/my/{licenseId}**
Xóa giấy phép

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "License deleted successfully"
}
```

---

## 🖥️ Frontend Integration

### 1. **Fetch danh sách giấy phép:**

```javascript
const fetchLicenses = async () => {
  const token = await user.getIdToken();
  const response = await fetch("http://localhost:8080/api/licenses/my", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const licenses = await response.json();
  return licenses;
};
```

### 2. **Fetch giấy phép hiện hành:**

```javascript
const fetchActiveLicense = async () => {
  const token = await user.getIdToken();
  const response = await fetch("http://localhost:8080/api/licenses/my/active", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const license = await response.json();
  return license;
};
```

### 3. **Tạo giấy phép mới:**

```javascript
const createLicense = async (licenseData) => {
  const token = await user.getIdToken();
  const response = await fetch("http://localhost:8080/api/licenses/my", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(licenseData)
  });
  return await response.json();
};
```

---

## 📝 Doctor Profile API Changes

### GET /doctor/dashboard/profile

**Thêm field mới:**

```json
{
  "name": "BS. Nguyễn Văn An",
  "email": "doctor.an@medconnect.vn",
  "phone": "0902000001",
  "specialization": "Tim mạch",
  "speciality_id": 1,
  "experience_years": 15,
  "active_license": {  // ← MỚI
    "license_id": 1,
    "license_number": "000001/BYT-GPHN",
    "issued_date": "2020-01-15",
    "expiry_date": "2030-01-15",
    "is_expired": false,
    "days_until_expiry": 1825
  }
}
```

Nếu **không có giấy phép hiệu lực**:
```json
{
  ...
  "active_license": null
}
```

---

## 🚀 Migration Steps

### 1. **Chạy SQL Script**
```bash
# Trong Azure Data Studio hoặc SSMS:
```

Mở file `CREATE-LICENSE-TABLE.sql` và execute.

### 2. **Restart Backend**
```bash
cd medconnect-be
./mvnw spring-boot:run
```

Backend sẽ:
- ✅ Load License entity
- ✅ Tạo relationship với Doctor
- ✅ Expose APIs `/api/licenses/**`

### 3. **Test APIs**
```bash
# Get all licenses
curl http://localhost:8080/api/licenses/my \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get active license
curl http://localhost:8080/api/licenses/my/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. **Update Frontend Form**

Trang `/bac-si/ho-so.jsx` cần:
- ✅ Fetch danh sách specialities từ `/api/specialities`
- ✅ Fetch license info từ `/api/licenses/my/active`
- ✅ Form quản lý giấy phép (add/edit)
- ✅ Hiển thị warning nếu giấy phép sắp hết hạn

---

## ⚠️ Lưu ý quan trọng

1. **Số năm kinh nghiệm**: Nhập thủ công, **KHÔNG** tự tính từ ngày cấp giấy phép
2. **Giấy phép có thể hết hạn**: Check `is_expired` và `days_until_expiry`
3. **Một bác sĩ nhiều giấy phép**: Chỉ có 1 giấy phép `is_active = true` tại một thời điểm
4. **Format số giấy phép**: `000001/BYT-GPHN` (6 chữ số / BYT-GPHN)

---

## 🔐 Security

- ✅ Tất cả endpoints yêu cầu authentication
- ✅ Chỉ bác sĩ mới quản lý giấy phép của mình
- ✅ Admin có thể view tất cả (nếu cần, thêm endpoint `/api/admin/licenses`)

---

## 📚 References

- [Luật Khám bệnh, chữa bệnh số 40/2009/QH12](https://thuvienphapluat.vn/van-ban/The-thao-Y-te/Luat-kham-benh-chua-benh-40-2009-QH12-88932.aspx)
- Mẫu giấy phép hành nghề - Bộ Y Tế

---

**🎉 Hệ thống quản lý giấy phép đã sẵn sàng!**

