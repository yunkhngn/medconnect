# 📋 Electronic Medical Record (EMR) System

## 📌 Tổng quan

Hệ thống quản lý hồ sơ bệnh án điện tử (EMR) cho MedConnect, cho phép:
- **Bệnh nhân** tạo và quản lý hồ sơ bệnh án cá nhân
- **Bác sĩ** xem hồ sơ, thêm lịch sử khám bệnh và kê đơn thuốc
- **Admin** quản lý tất cả hồ sơ bệnh án

---

## 📊 Cấu trúc dữ liệu

### **Database Schema**
```sql
CREATE TABLE Medical_Records (
    record_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT,
    detail TEXT,  -- JSON string chứa toàn bộ EMR data
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (patient_id) REFERENCES Users(user_id),
    FOREIGN KEY (doctor_id) REFERENCES Users(user_id)
);
```

### **EMR JSON Structure**

#### **1. Patient Profile** (Do bệnh nhân điền)
```json
{
  "patient_profile": {
    "patient_id": "firebase_uid",
    "full_name": "Nguyễn Văn A",
    "dob": "1985-06-12",
    "gender": "male",
    "contact": {
      "phone": "0901234567",
      "email": "a@example.com"
    },
    "address": "Hà Đông, Hà Nội, Việt Nam",
    "identity": {
      "national_id": "0790xxxxxxx",
      "verified": false
    },
    "insurance": {
      "type": "BHYT",
      "number": "HS 4 01 0120878811",
      "valid_to": "2026-12-31"
    },
    "allergies": ["Penicillin"],
    "chronic_conditions": ["Tăng huyết áp"],
    "medications": ["Amlodipine 5mg"],
    "emergency_contact": {
      "name": "Trần Thị B",
      "phone": "0902345678",
      "relation": "spouse"
    },
    "consents": {
      "privacy": true,
      "telemedicine": true,
      "consent_at": "2025-10-23T08:56:00+07:00"
    },
    "meta": {
      "created_at": "2025-10-20T09:00:00+07:00",
      "updated_at": "2025-10-23T08:56:00+07:00"
    }
  },
  "medical_records": []
}
```

#### **2. Medical Records** (Do bác sĩ thêm sau mỗi lần khám)
```json
{
  "medical_records": [
    {
      "record_id": "MR-2025-000123",
      "encounter": {
        "type": "telemedicine",
        "status": "completed",
        "appointment_id": "A-3001",
        "started_at": "2025-10-23T09:00:00+07:00",
        "ended_at": "2025-10-23T09:35:00+07:00"
      },
      "provider": {
        "doctor_id": "D-2001",
        "full_name": "BS. Trần B",
        "specialization": "Cardiology",
        "license_id": "LIC-123456"
      },
      "reason_for_visit": "Đau thắt ngực 2 giờ",
      "history": {
        "hpi": "Đau 4/10, không lan tỏa",
        "pmh": ["Tăng huyết áp"],
        "meds": ["Amlodipine 5mg"],
        "allergies": ["Penicillin"]
      },
      "assessment_plan": {
        "assessment": ["Unstable angina vs GERD"],
        "final_diagnosis": [
          { "text": "Unstable angina", "icd10": "I20.0" }
        ],
        "plan": [
          "Uống Aspirin 81mg mỗi ngày",
          "Đến phòng cấp cứu nếu đau ngực nặng"
        ]
      },
      "e_prescription": {
        "rx_id": "RX-2025-00999",
        "items": [
          { "drug": "Aspirin", "dose": "81mg", "route": "PO", "freq": "OD", "days": 30 }
        ],
        "issued_at": "2025-10-23T09:34:00+07:00"
      }
    }
  ]
}
```

---

## 🔌 Backend API

### **Base URL**: `http://localhost:8080/api/medical-records`

### **Endpoints**

#### **1. Get My EMR Profile** (Patient)
```http
GET /my-profile
Authorization: Bearer {firebase_token}
```

**Response 200:**
```json
{
  "recordId": 1,
  "detail": "{...emr_json...}",
  "createdAt": "2025-10-23T10:00:00",
  "updatedAt": "2025-10-23T10:00:00"
}
```

**Response 404:** No medical record found

---

#### **2. Create EMR** (Patient - First time only)
```http
POST /
Authorization: Bearer {firebase_token}
Content-Type: application/json

{
  "detail": "{...emr_json_string...}"
}
```

**Response 201:**
```json
{
  "message": "Medical record created successfully",
  "record": {...}
}
```

**Response 409:** Medical record already exists

---

#### **3. Update My EMR Profile** (Patient)
```http
PATCH /my-profile
Authorization: Bearer {firebase_token}
Content-Type: application/json

{
  "detail": "{...updated_emr_json...}"
}
```

**Response 200:**
```json
{
  "message": "Medical record updated successfully",
  "record": {...}
}
```

---

#### **4. Get Patient's EMR** (Doctor/Admin)
```http
GET /patient/{patientUserId}
Authorization: Bearer {firebase_token}
Role: DOCTOR or ADMIN
```

---

#### **5. Add Medical Entry** (Doctor)
```http
POST /patient/{patientUserId}/add-entry
Authorization: Bearer {firebase_token}
Role: DOCTOR
Content-Type: application/json

{
  "entry": {
    "record_id": "MR-2025-000123",
    "encounter": {...},
    "provider": {...},
    "assessment_plan": {...},
    "e_prescription": {...}
  }
}
```

---

#### **6. Get All EMRs** (Admin)
```http
GET /all
Authorization: Bearer {firebase_token}
Role: ADMIN
```

---

## 🎨 Frontend Pages

### **1. `/nguoi-dung/ho-so-benh-an` - View EMR**

**Features:**
- ✅ Hiển thị thông tin patient profile
- ✅ Hiển thị lịch sử khám bệnh (accordion)
- ✅ Empty state nếu chưa có hồ sơ
- ✅ Button "Tạo hồ sơ" / "Chỉnh sửa"

**Components used:**
- `Card`, `CardHeader`, `CardBody` (HeroUI)
- `Accordion`, `AccordionItem` (HeroUI)
- `Chip` for status badges

---

### **2. `/nguoi-dung/ho-so-benh-an/tao-moi` - Create EMR**

**Features:**
- ✅ Form để tạo patient profile
- ✅ Sections:
  - Thông tin cơ bản
  - Bảo hiểm Y tế (BHYT input)
  - Tiền sử bệnh (allergies, chronic conditions, medications)
  - Liên hệ khẩn cấp
  - Đồng ý điều khoản

**Components used:**
- `Input`, `Select`, `Textarea` (HeroUI)
- `BHYTInput` (custom)
- `Chip` for tags
- `Checkbox` for consents

**Validation:**
- Required: full_name, dob
- Required: both consent checkboxes
- Optional: insurance, allergies, medications

---

## 🔐 Security

### **Permissions:**

| Endpoint | Role | Permission |
|----------|------|------------|
| `GET /my-profile` | PATIENT | Own EMR only |
| `POST /` | PATIENT | Create own EMR |
| `PATCH /my-profile` | PATIENT | Update own EMR |
| `GET /patient/{id}` | DOCTOR | Any patient during consultation |
| `POST /patient/{id}/add-entry` | DOCTOR | Add medical entry |
| `GET /all` | ADMIN | All EMRs |

### **Access Control:**
- Firebase UID verified via `FirebaseFilter`
- Role-based access via Spring Security
- Patient can only access/modify their own EMR
- Doctor needs active appointment to access patient EMR (TODO)

---

## 🔄 Data Flow

### **Patient creates EMR:**
```
1. Patient fills form at /tao-moi
2. Frontend sends POST /api/medical-records with JSON detail
3. Backend:
   - Gets Patient from firebaseUid
   - Checks if EMR already exists
   - Creates new MedicalRecord with patient_profile
   - Returns created record
4. Frontend redirects to /ho-so-benh-an
```

### **Doctor adds medical entry:**
```
1. Doctor completes consultation
2. Frontend sends POST /patient/{id}/add-entry
3. Backend:
   - Gets existing EMR
   - Parses detail JSON
   - Appends new entry to medical_records array
   - Saves updated JSON
4. Patient can view new entry immediately
```

---

## 📦 Components

### **Backend:**
- ✅ `MedicalRecordController.java`
- ✅ `MedicalRecordService.java`
- ✅ `MedicalRecordRepository.java`
- ✅ `MedicalRecord.java` (Entity)

### **Frontend:**
- ✅ `/pages/nguoi-dung/ho-so-benh-an.jsx`
- ✅ `/pages/nguoi-dung/ho-so-benh-an/tao-moi.jsx`
- ✅ `/components/ui/BHYTInput.jsx`
- ✅ `/utils/bhytHelper.js`

---

## 🚀 Next Steps (TODO)

### **Phase 1: Basic EMR ✅ DONE**
- [x] Create patient profile form
- [x] Save EMR to database
- [x] Display EMR on frontend
- [x] BHYT input component

### **Phase 2: Doctor Integration**
- [ ] Doctor view patient EMR during consultation
- [ ] Doctor add medical entry after consultation
- [ ] Link EMR to Appointment
- [ ] Verify doctor permission to access patient EMR

### **Phase 3: Advanced Features**
- [ ] Export EMR to PDF
- [ ] Upload medical images/documents
- [ ] AI summarization of medical history
- [ ] E-prescription generation
- [ ] Link to video call transcripts
- [ ] Audit trail (who accessed when)

### **Phase 4: Integration**
- [ ] Integrate with Agora video call
- [ ] Auto-fill medical entry from AI summary
- [ ] Link to payment records
- [ ] Link to feedback/ratings

---

## 🧪 Testing

### **Test Scenarios:**

1. **Create EMR:**
   - ✅ Patient can create new EMR
   - ✅ Patient cannot create duplicate EMR
   - ✅ Required fields validated
   - ✅ BHYT format validated

2. **View EMR:**
   - ✅ Patient can view own EMR
   - ✅ Empty state when no EMR exists
   - ✅ Medical records displayed correctly

3. **Update EMR:**
   - [ ] Patient can update profile
   - [ ] Allergies/medications can be added/removed

4. **Doctor Access:**
   - [ ] Doctor can view patient EMR
   - [ ] Doctor can add medical entry
   - [ ] Unauthorized access prevented

---

## 📝 Notes

- **JSON in TEXT column**: Flexible schema, easy to extend
- **patient_profile** is maintained by patient
- **medical_records** array is append-only by doctors
- Future: Consider migrating to separate tables for better querying
- Current: One EMR per patient (1:1 relationship)

---

## 🎯 Success Criteria

✅ **Patient:**
- Can create EMR in < 3 minutes
- Can view complete medical history
- Can update profile anytime

✅ **Doctor:**
- Can access patient EMR during consultation
- Can add medical entry with diagnosis & prescription
- Entry saved immediately

✅ **System:**
- Data integrity maintained
- Proper access control
- Audit trail available

---

**Last Updated:** October 23, 2025  
**Version:** 1.0  
**Author:** MedConnect Development Team

