# 🐛 DEBUG SUMMARY - Appointment & Schedule Issue

## Vấn đề báo cáo
- ✅ Patient đặt lịch → Appointment được tạo trong database
- ❌ Doctor xem schedule → **Slot bị mất luôn** (không hiện appointment)
- ❌ Patient xem lịch hẹn → Không hiện appointment vừa đặt

---

## 🔍 Đã thêm Debug Logs

### 1. `createAppointment()` - Khi patient đặt lịch
```
[createAppointment] ========== START ==========
[createAppointment] Patient UID: xxx
[createAppointment] Doctor ID: yyy
[createAppointment] Date: 2025-10-28
[createAppointment] Slot: SLOT_2
[createAppointment] ✅ Appointment created successfully!
```

### 2. `getAvailableSlots()` - Khi patient chọn doctor và ngày
```
[getAvailableSlots] ========== START ==========
[getAvailableSlots] Doctor ID: 3
[getAvailableSlots] Date: 2025-10-28
[getAvailableSlots] Found X schedules for this date  👈 PHẢI > 0!
  - Schedule ID: 1, Slot: SLOT_2, Status: RESERVED
[getAvailableSlots] Available slots from schedule: [SLOT_2]
[getAvailableSlots] Booked slots: []
[getAvailableSlots] Final available slots: [SLOT_2]
```

### 3. `getWeeklySchedule()` - Khi doctor xem lịch làm việc
```
[getWeeklySchedule] ========== START ==========
[getWeeklySchedule] Found X schedules  👈 PHẢI > 0!
[getWeeklySchedule] Found Y appointments  👈 PHẢI > 0 sau khi patient đặt!
[getWeeklySchedule] Appointment details:
  - ID: 1, Date: 2025-10-28, Slot: SLOT_2, Status: PENDING, Patient: Mai
```

---

## 🚀 TEST NGAY

### Step 1: Chạy Backend
```bash
cd medconnect-be
mvn spring-boot:run
```

### Step 2: Check Database State
```bash
# Chạy diagnostic script
sqlcmd -S localhost -U sa -P YOUR_PASSWORD -i medconnect-be/CHECK-APPOINTMENT-SCHEDULE-DATA.sql
```

**Kết quả mong đợi (nếu có data cũ):**
- Xem số lượng appointments và schedules
- Xem appointments WITHOUT matching schedule (phải = 0)
- Xem appointment-schedule pairs

### Step 3: Test Flow
1. **Doctor login** → Tạo 1 schedule (Thứ 3, Ca 2, status RESERVED)
2. **Patient login** → Đặt lịch cùng ngày, cùng ca
3. **Check backend logs** → Gửi toàn bộ cho tôi
4. **Doctor reload** → Check xem slot có hiện không

---

## 📊 Các Trường Hợp Debug

### Case 1: "Found 0 schedules" khi patient chọn ngày
**Nguyên nhân**: Doctor chưa set schedule cho ngày đó
**Fix**: Doctor phải vào `/bac-si/lich-lam-viec` và thêm ca trước

### Case 2: "Found X schedules" nhưng "Final available slots: []"
**Nguyên nhân**: Tất cả slots đã có appointment
**Expected**: Nếu đã đặt rồi thì không thể đặt tiếp

### Case 3: Appointment created nhưng "Found 0 appointments" trong getWeeklySchedule
**Nguyên nhân**: 
- Query `findByDoctorUserIdAndDateBetween` không hoạt động
- doctor.userId không khớp với appointment.doctor_id
- Date range không cover appointment date

**Debug**: Chạy SQL:
```sql
SELECT 
    a.appointment_id,
    a.doctor_id,
    d.user_id AS doctor_user_id,
    a.date,
    a.slot,
    a.status
FROM Appointment a
JOIN Doctor d ON a.doctor_id = d.user_id
ORDER BY a.appointment_id DESC;
```

### Case 4: Schedule bị mất sau khi patient đặt
**Nguyên nhân**: Schedule bị DELETE ở đâu đó (KHÔNG NÊN!)
**Debug**: Check logs xem có call `scheduleRepository.delete()` không

**Expected**: Schedule KHÔNG BAO GIỜ bị xóa khi có appointment!

### Case 5: Appointment hiện trong database nhưng UI không render
**Nguyên nhân**: Frontend issue
**Debug**: 
- F12 Console → check errors
- Network tab → check response từ `/api/schedule/weekly`
- Check frontend `lich-lam-viec.jsx` rendering logic

---

## 📤 GỬI CHO TÔI SAU KHI TEST:

1. **Backend logs** (toàn bộ từ lúc start):
   - createAppointment logs
   - getAvailableSlots logs
   - getWeeklySchedule logs

2. **SQL diagnostic result**:
   ```bash
   sqlcmd -S localhost -U sa -P YOUR_PASSWORD -i medconnect-be/CHECK-APPOINTMENT-SCHEDULE-DATA.sql > diagnosis.txt
   ```

3. **Screenshots**:
   - Doctor schedule TRƯỚC khi patient đặt
   - Patient đặt lịch (form + success message)
   - Doctor schedule SAU khi patient đặt (reload page)

4. **Manual SQL query result**:
   ```sql
   -- Check appointment
   SELECT * FROM Appointment ORDER BY appointment_id DESC;
   
   -- Check schedule
   SELECT * FROM Schedule ORDER BY schedule_id DESC;
   
   -- Check matching
   SELECT 
       a.appointment_id,
       a.date,
       a.slot,
       s.schedule_id,
       s.slot,
       s.status AS schedule_status
   FROM Appointment a
   JOIN Doctor d ON a.doctor_id = d.user_id
   LEFT JOIN Schedule s ON s.user_id = d.user_id AND s.date = a.date AND s.slot = a.slot;
   ```

---

## 🎯 Expected Final Result

**Sau khi patient đặt lịch thành công:**

1. ✅ Database có 1 row trong `Appointment` (status: PENDING)
2. ✅ Database có 1 row trong `Schedule` (status: RESERVED hoặc BUSY)
3. ✅ Backend logs: "Found 1 schedules", "Found 1 appointments"
4. ✅ Doctor UI: Slot hiển thị xanh lá "Đã đặt" với thông tin patient
5. ✅ Patient UI: Lịch hẹn hiển thị trong danh sách

---

**Chạy test và gửi logs + SQL results cho tôi!** 🔍

