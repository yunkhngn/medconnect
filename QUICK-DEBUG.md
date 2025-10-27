# 🔥 QUICK DEBUG - Appointment không hiện

## Vấn đề:
- ✅ Patient đặt lịch → Appointment vào DB
- ❌ Doctor xem schedule → KHÔNG THẤY appointment
- ❌ Slot BỊ MẤT LUÔN

---

## ⚡ BƯỚC 1: Chạy Backend MỚI

```bash
# Option A: Dùng script
./RUN-BACKEND.sh

# Option B: Manual
cd medconnect-be
mvn spring-boot:run
```

**Đợi thấy:**
```
Started MedConnectApplication in X.XXX seconds
```

---

## ⚡ BƯỚC 2: Check Database

```bash
sqlcmd -S localhost -U sa -P YOUR_PASSWORD -i CHECK-DATA.sql
```

**Xem kết quả:**
- Có bao nhiêu Schedules?
- Có bao nhiêu Appointments?
- Appointment có match với Schedule không?

---

## ⚡ BƯỚC 3: Test Flow & Check Logs

### A. Doctor mở schedule
1. Login doctor
2. Vào `/bac-si/lich-lam-viec`
3. Click "Thêm ca" trên 1 slot (VD: 28/10, Ca 2)

**PHẢI THẤY LOG:**
```
[addSchedule] ========== START ==========
[addSchedule] Doctor UserID: 3
[addSchedule] Date: 2025-10-28
[addSchedule] Slot: SLOT_2
[addSchedule] ✅ Schedule created with ID: 1
```

❌ **KHÔNG THẤY LOG NÀY = Backend chưa chạy code mới!**

### B. Patient đặt lịch
1. Login patient
2. Vào `/nguoi-dung/dat-lich-kham`
3. Chọn doctor, ngày, slot
4. Đặt lịch

**PHẢI THẤY LOG:**
```
[getAvailableSlots] ========== START ==========
[getAvailableSlots] Doctor ID: 3
[getAvailableSlots] Open slots: [SLOT_2]
[getAvailableSlots] Final available slots: [SLOT_2]

[createAppointment] ========== START ==========
[createAppointment] ✅ Appointment created!
[createAppointment] Appointment ID: 1
```

❌ **KHÔNG THẤY LOG NÀY = Backend chưa chạy code mới!**

### C. Doctor reload schedule
1. F5 trang `/bac-si/lich-lam-viec`

**PHẢI THẤY LOG:**
```
[getWeeklySchedule] ========== START ==========
[getWeeklySchedule] Found 1 schedules (opened slots)
[getWeeklySchedule] Found 1 appointments  👈 KEY!
[getWeeklySchedule] Appointment details:
  - ID: 1, Date: 2025-10-28, Slot: SLOT_2, Status: PENDING, Patient: Mai
[getWeeklySchedule] Generating grid for 7 days x 12 slots
  [BUSY] 2025-10-28 SLOT_2 -> Appointment #1  👈 KEY!
```

❌ **KHÔNG THẤY LOG NÀY = Backend chưa chạy code mới!**

---

## 🔍 DIAGNOSE:

### Case 1: Không thấy logs `========== START ==========`
**Nguyên nhân:** Backend đang chạy **CODE CŨ**!

**Fix:**
```bash
# Kill tất cả
pkill -9 java

# Xóa compiled code
cd medconnect-be
rm -rf target/

# Rebuild
mvn clean compile

# Run
mvn spring-boot:run
```

### Case 2: Thấy logs nhưng "Found 0 appointments"
**Nguyên nhân:** Database query issue hoặc doctor.userId không match

**Fix:**
```sql
-- Check trong database
SELECT 
    a.appointment_id,
    a.doctor_id,
    d.user_id AS doctor_user_id,
    a.date,
    a.slot
FROM Appointment a
JOIN Doctor d ON a.doctor_id = d.user_id
ORDER BY a.appointment_id DESC;
```

Nếu `a.doctor_id != d.user_id` → BUG!

### Case 3: Thấy logs "Found 1 appointments" nhưng UI không hiện
**Nguyên nhân:** Frontend rendering issue

**Fix:**
- F12 Console → check errors
- Network tab → check response từ `/api/schedule/weekly`
- Hard reload: Ctrl+Shift+R

---

## 🚨 QUAN TRỌNG NHẤT:

**PHẢI THẤY CÁC LOGS `========== START ==========`!**

Nếu KHÔNG THẤY = Backend 100% chạy code cũ!

---

## 📤 GỬI CHO TÔI:

1. **Backend console logs** (toàn bộ từ lúc start)
2. **SQL result** từ `CHECK-DATA.sql`
3. **Screenshot** network tab trong F12 (response của `/api/schedule/weekly`)

Không cần screenshot UI! Cần logs để debug!

