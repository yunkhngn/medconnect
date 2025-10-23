# 📋 Migration Guide - Database Changes

## 🎯 Tổng quan thay đổi

### 1. **Slot System**: 4 slots → 12 slots
### 2. **Speciality**: Enum → Table

---

## 🔄 **THAY ĐỔI 1: SLOT SYSTEM**

### Trước:
- 4 slots/ngày (2.5 giờ/slot)
- SLOT_1, SLOT_2, SLOT_3, SLOT_4

### Sau:
- 12 slots/ngày (30 phút/slot + 15 phút nghỉ)
- SLOT_1 → SLOT_12

### Impact:
- ❌ **PHẢI XÓA** tất cả appointments, schedules, payments, video_call_sessions cũ

---

## 🔄 **THAY ĐỔI 2: SPECIALITY SYSTEM**

### Trước:
```java
public enum Speciality {
    TIM_MACH, NOI_KHOA, NHI_KHOA, DA_LIEU, TAI_MUI_HONG
}
```

```sql
CREATE TABLE doctor (
    user_id INT PRIMARY KEY,
    specialization VARCHAR(50),  -- ENUM value
    ...
);
```

### Sau:
```sql
-- New table
CREATE TABLE speciality (
    speciality_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    ...
);

-- Updated Doctor table
CREATE TABLE doctor (
    user_id INT PRIMARY KEY,
    speciality_id INT,  -- Foreign key to speciality table
    FOREIGN KEY (speciality_id) REFERENCES speciality(speciality_id),
    ...
);
```

### Benefits:
- ✅ Linh hoạt: Admin có thể thêm/sửa/xóa speciality qua UI
- ✅ Mở rộng: Thêm mô tả, icon, pricing cho mỗi speciality
- ✅ Chuẩn hóa: Theo best practice database design

---

## 🚀 **CÁCH MIGRATION**

### **Option A: Fresh Start (Recommended cho Development)**

Xóa toàn bộ database và tạo lại:

```bash
# 1. Drop database cũ
mysql -u root -p
DROP DATABASE IF EXISTS g1medconnect;

# 2. Chạy init-db.sql (nếu có) hoặc tạo database mới
CREATE DATABASE g1medconnect;

# 3. Để Spring Boot tạo schema tự động
# hoặc chạy schema.sql nếu có
```

### **Option B: Incremental Migration (Cho Production)**

#### Bước 1: Clear data phụ thuộc Slot
```bash
mysql -u root -p g1medconnect < medconnect-be/CLEAR-APPOINTMENTS-FOR-SLOT-CHANGE.sql
```

#### Bước 2: Tạo bảng Speciality và migrate Doctor
```bash
mysql -u root -p g1medconnect < medconnect-be/CREATE-SPECIALITY-TABLE.sql
```

#### Bước 3: Load mock data mới
```bash
mysql -u root -p g1medconnect < medconnect-be/mock-data.sql
```

#### Bước 4: Restart Spring Boot
```bash
cd medconnect-be
./mvnw spring-boot:run
```

---

## 📂 **FILES CREATED/MODIFIED**

### Backend:
- ✅ `Slot.java` - Updated với 12 slots
- ✅ `CREATE-SPECIALITY-TABLE.sql` - Migration script
- ✅ `CLEAR-APPOINTMENTS-FOR-SLOT-CHANGE.sql` - Clear old appointments
- ✅ `mock-data.sql` - Updated với Speciality table
- ⏳ `Doctor.java` - Cần update (enum → FK)

### Frontend:
- ✅ `lich-lam-viec.jsx` - 12 slots
- ✅ `lich-hen.jsx` - 12 slots  
- ✅ `dat-lich-kham.jsx` - 12 slots

### Documentation:
- ✅ `SLOT-CHANGE-INSTRUCTIONS.md`
- ✅ `MIGRATION-GUIDE.md` (this file)

---

## ⚠️ **BACKEND CODE CHANGES NEEDED**

### 1. Update Doctor Entity

**Before:**
```java
@Entity
public class Doctor {
    @Enumerated(EnumType.STRING)
    private Speciality specialization;
}
```

**After:**
```java
@Entity
public class Doctor {
    @ManyToOne
    @JoinColumn(name = "speciality_id")
    private Speciality speciality;
}
```

### 2. Create Speciality Entity

```java
@Entity
@Table(name = "speciality")
public class Speciality {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer specialityId;
    
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // One-to-Many với Doctor
    @OneToMany(mappedBy = "speciality")
    private List<Doctor> doctors;
    
    // Getters & Setters
}
```

### 3. Create SpecialityRepository

```java
@Repository
public interface SpecialityRepository extends JpaRepository<Speciality, Integer> {
    Optional<Speciality> findByName(String name);
    List<Speciality> findAllByOrderByNameAsc();
}
```

### 4. Create SpecialityService & Controller (Optional)

Để admin có thể quản lý specialities qua API.

---

## 📊 **DATABASE SCHEMA COMPARISON**

### Old Schema:
```
Users (1) ----< Doctor (specialization: ENUM)
                    |
                    |--< Appointment (slot: SLOT_1-4)
```

### New Schema:
```
Users (1) ----< Doctor >---- (M:1) Speciality
                    |
                    |--< Appointment (slot: SLOT_1-12)
```

---

## ✅ **CHECKLIST**

### Pre-Migration:
- [ ] Backup database (nếu production)
- [ ] Review all changes
- [ ] Test trên local environment trước

### Migration Steps:
- [ ] Clear old appointments/payments/video_calls
- [ ] Create Speciality table
- [ ] Update Doctor table structure
- [ ] Update Doctor entity code
- [ ] Create Speciality entity
- [ ] Load mock data mới
- [ ] Restart backend

### Post-Migration:
- [ ] Verify Speciality table có data
- [ ] Verify Doctor.speciality_id populated
- [ ] Test doctor list API
- [ ] Test appointment booking với slots mới
- [ ] Test schedule management với 12 slots

---

## 🧪 **TESTING QUERIES**

```sql
-- Check Speciality data
SELECT * FROM speciality;

-- Check Doctor-Speciality relationship
SELECT 
    d.user_id,
    u.name as doctor_name,
    s.name as speciality_name,
    d.license_id,
    d.status
FROM doctor d
LEFT JOIN users u ON d.user_id = u.user_id
LEFT JOIN speciality s ON d.speciality_id = s.speciality_id;

-- Check appointments count
SELECT COUNT(*) FROM appointment;  -- Should be 0 after clear

-- Check schedules count  
SELECT COUNT(*) FROM schedule;     -- Should be 0 after clear
```

---

## 🆘 **ROLLBACK (if needed)**

Nếu có vấn đề, restore từ backup:

```bash
mysql -u root -p g1medconnect < backup_before_migration.sql
```

---

## 📞 **SUPPORT**

- Xem chi tiết Slot changes: `SLOT-CHANGE-INSTRUCTIONS.md`
- SQL scripts: `CREATE-SPECIALITY-TABLE.sql`, `CLEAR-APPOINTMENTS-FOR-SLOT-CHANGE.sql`
- Mock data: `mock-data.sql`

---

**Created:** 2025-10-23  
**Status:** Ready for migration  
**Priority:** High

