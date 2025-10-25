# 📍 Vietnam Address Selector Feature

## 🎯 Overview
Integrated structured address selection (Tỉnh/Thành → Quận/Huyện → Phường/Xã) for both **Doctors** and **Patients** using Vietnam Provinces API.

**Purpose:** Store structured location data for:
- 🗺️ Distance calculation (future feature)
- 🔍 Search doctors by location
- 📊 Geographic analytics

---

## ✅ What Was Implemented

### 1. **Frontend Components**

#### `medconnect-fe/hooks/useAddressData.jsx`
- Custom React hook to fetch Vietnam administrative divisions
- API: `https://provinces.open-api.vn/api`
- Features:
  - Fetch all provinces
  - Fetch districts by province code
  - Fetch wards by district code
  - Helper methods: `getProvinceName`, `getDistrictName`, `getWardName`
  - Generate full address string

#### `medconnect-fe/components/ui/AddressSelector.jsx`
- Reusable cascading dropdown component
- 3 dropdowns: Province → District → Ward
- Built with `@heroui/react` Select components
- Auto-loads districts when province changes
- Auto-loads wards when district changes
- Props:
  - `provinceCode`, `districtCode`, `wardCode` (current values)
  - `onProvinceChange`, `onDistrictChange`, `onWardChange` (callbacks)
  - `disabled`, `required`, `size`, `variant`

#### Integration Points:
1. **Doctor Profile** (`medconnect-fe/pages/bac-si/ho-so.jsx`)
   - Address selector + clinic address detail input
   - Stores: `province_code`, `district_code`, `ward_code`, `clinic_address`

2. **Patient Settings** (`medconnect-fe/pages/nguoi-dung/cai-dat.jsx`)
   - Address selector + optional detail input
   - Stores: `province_code`, `district_code`, `ward_code`, `address`

---

### 2. **Backend Entities**

#### `Patient.java`
```java
@Column(name = "province_code")
private Integer provinceCode;

@Column(name = "province_name", columnDefinition = "NVARCHAR(100)")
private String provinceName;

@Column(name = "district_code")
private Integer districtCode;

@Column(name = "district_name", columnDefinition = "NVARCHAR(100)")
private String districtName;

@Column(name = "ward_code")
private Integer wardCode;

@Column(name = "ward_name", columnDefinition = "NVARCHAR(100)")
private String wardName;
```

#### `Doctor.java`
```java
// Same fields as Patient
// Plus: clinic_address for detailed address
```

---

### 3. **Backend Controllers**

#### `PatientController.java`
- `GET /api/patient/profile`: Returns address fields
- `PATCH /api/patient/profile`: Updates address fields

#### `DoctorController.java`
- `GET /doctor/dashboard/profile`: Returns address fields
- `PATCH /doctor/dashboard/profile`: Updates address fields

---

### 4. **Database Migration**

#### `ADD-ADDRESS-FIELDS.sql`
SQL script to add 6 columns to both `Patient` and `Doctor` tables:
- `province_code` (INT)
- `province_name` (NVARCHAR(100))
- `district_code` (INT)
- `district_name` (NVARCHAR(100))
- `ward_code` (INT)
- `ward_name` (NVARCHAR(100))

Includes:
- Index creation for faster queries
- Safe NULL-able columns (no data loss)
- MSSQL compatibility

---

## 🚀 How to Deploy

### **Step 1: Run SQL Migration**
```bash
# On your MSSQL server
sqlcmd -S localhost -U sa -P YOUR_PASSWORD -i ADD-ADDRESS-FIELDS.sql
```

**OR** let Hibernate auto-create columns:
1. Restart backend with `spring.jpa.hibernate.ddl-auto=update`
2. Hibernate will detect new fields and add columns automatically

### **Step 2: Restart Backend**
```bash
# Local
cd medconnect-be
mvn spring-boot:run

# Docker
docker compose restart be
```

### **Step 3: Test**
1. **Doctor:** Go to `/bac-si/ho-so` → Update address → Save
2. **Patient:** Go to `/nguoi-dung/cai-dat` → Update address → Save
3. Check API response includes address fields

---

## 📊 Data Structure

### API Response (Province)
```json
{
  "code": 1,
  "name": "Thành phố Hà Nội",
  "name_en": "Ha Noi City",
  "full_name": "Thành phố Hà Nội",
  "full_name_en": "Ha Noi City",
  "code_name": "ha_noi",
  "administrative_unit": {...},
  "administrative_region": {...}
}
```

### Database Storage
| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `province_code` | INT | `1` | For API calls to get districts |
| `province_name` | NVARCHAR | `Thành phố Hà Nội` | For display |
| `district_code` | INT | `1` | For API calls to get wards |
| `district_name` | NVARCHAR | `Quận Ba Đình` | For display |
| `ward_code` | INT | `1` | Unique ward identifier |
| `ward_name` | NVARCHAR | `Phường Phúc Xá` | For display |

**Why store both code AND name?**
- **Code:** For fetching child divisions from API
- **Name:** For display without extra API calls
- **Code:** For distance calculation (future)

---

## 🔮 Future Features

### 1. **Distance Calculation**
Use province/district/ward codes to calculate approximate distance between patient and doctor.

**Algorithm:**
```javascript
function calculateDistance(patient, doctor) {
  if (patient.province_code === doctor.province_code) {
    if (patient.district_code === doctor.district_code) {
      if (patient.ward_code === doctor.ward_code) {
        return { distance: "< 1 km", level: "same_ward" };
      }
      return { distance: "< 5 km", level: "same_district" };
    }
    return { distance: "< 20 km", level: "same_province" };
  }
  return { distance: "> 50 km", level: "different_province" };
}
```

### 2. **Search Doctors by Location**
Filter doctors by:
- Same province
- Same district
- Same ward
- Within X km (using coordinates API)

**Example:**
```sql
-- Find doctors in same district as patient
SELECT * FROM Doctor d
WHERE d.province_code = ? AND d.district_code = ?;
```

### 3. **Geographic Analytics**
- Heatmap of patient distribution
- Doctor coverage by region
- Most underserved areas

---

## 🐛 Troubleshooting

### **Issue 1: Dropdowns not loading**
**Symptom:** Province dropdown is empty

**Fix:**
1. Check browser console for CORS errors
2. Verify API is accessible: `curl https://provinces.open-api.vn/api/p/`
3. Check `useAddressData` hook is called at component top level

### **Issue 2: District/Ward not resetting**
**Symptom:** Old district/ward remains when changing province

**Fix:**
- Ensure `onProvinceChange` sets `district_code: null` and `ward_code: null`
- Check `AddressSelector` component resets child dropdowns

### **Issue 3: Backend not saving address**
**Symptom:** Address fields are null in database

**Fix:**
1. Check payload in browser DevTools Network tab
2. Verify controller receives address fields: Add `System.out.println(request)`
3. Check database columns exist: `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Patient'`

### **Issue 4: Hibernate not creating columns**
**Symptom:** `Invalid column name 'province_code'`

**Fix:**
1. Check `application.properties`: `spring.jpa.hibernate.ddl-auto=update`
2. Manually run `ADD-ADDRESS-FIELDS.sql`
3. Restart backend

---

## 📝 API Reference

### **Vietnam Provinces API**

Base URL: `https://provinces.open-api.vn/api`

| Endpoint | Description | Example |
|----------|-------------|---------|
| `GET /p/` | Get all provinces | [Link](https://provinces.open-api.vn/api/p/) |
| `GET /p/{code}?depth=2` | Get province + districts | [Link](https://provinces.open-api.vn/api/p/1?depth=2) |
| `GET /d/{code}?depth=2` | Get district + wards | [Link](https://provinces.open-api.vn/api/d/1?depth=2) |

**Depth parameter:**
- `depth=1`: Basic info only
- `depth=2`: Include child divisions
- `depth=3`: Include all descendants

**Documentation:** https://provinces.open-api.vn/api/v2/redoc

---

## ✨ Benefits

1. **User Experience:**
   - ✅ No typos in address
   - ✅ Standardized format
   - ✅ Fast selection (no typing)

2. **Data Quality:**
   - ✅ Structured data (easy to query)
   - ✅ Consistent format
   - ✅ Valid administrative codes

3. **Future-proof:**
   - ✅ Ready for distance calculation
   - ✅ Ready for location-based search
   - ✅ Ready for analytics

4. **Developer Experience:**
   - ✅ Reusable component
   - ✅ Type-safe (code + name)
   - ✅ Easy to extend

---

## 📦 Files Changed

### Frontend
- ✅ `medconnect-fe/hooks/useAddressData.jsx` (NEW)
- ✅ `medconnect-fe/components/ui/AddressSelector.jsx` (NEW)
- ✅ `medconnect-fe/pages/bac-si/ho-so.jsx` (MODIFIED)
- ✅ `medconnect-fe/pages/nguoi-dung/cai-dat.jsx` (MODIFIED)

### Backend
- ✅ `medconnect-be/src/main/java/se1961/g1/medconnect/pojo/Patient.java` (MODIFIED)
- ✅ `medconnect-be/src/main/java/se1961/g1/medconnect/pojo/Doctor.java` (MODIFIED)
- ✅ `medconnect-be/src/main/java/se1961/g1/medconnect/controller/PatientController.java` (MODIFIED)
- ✅ `medconnect-be/src/main/java/se1961/g1/medconnect/controller/DoctorController.java` (MODIFIED)
- ✅ `medconnect-be/ADD-ADDRESS-FIELDS.sql` (NEW)

---

## 🎉 Done!

**Address feature is complete and ready to use!** 🚀

Patients and Doctors can now select their location using structured dropdowns, and the data is stored in a format ready for distance calculation and location-based features.

**Next steps:**
1. Run SQL migration
2. Test address selection in browser
3. (Future) Implement distance calculation
4. (Future) Add "Find doctors near me" feature

