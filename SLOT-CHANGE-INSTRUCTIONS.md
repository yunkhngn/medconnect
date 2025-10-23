# 📋 Hướng dẫn thay đổi Slot System

## 🎯 Thay đổi gì?

### ❌ CŨ: 4 slots/ngày (2.5 giờ/slot)
- SLOT_1: 07:30 - 09:50
- SLOT_2: 10:00 - 12:20
- SLOT_3: 12:50 - 15:10
- SLOT_4: 15:20 - 17:40

### ✅ MỚI: 12 slots/ngày (30 phút/slot + 15 phút nghỉ)

**Buổi sáng (6 slots):**
- SLOT_1: 07:30 - 08:00 (Nghỉ 15p)
- SLOT_2: 08:15 - 08:45 (Nghỉ 15p)
- SLOT_3: 09:00 - 09:30 (Nghỉ 15p)
- SLOT_4: 09:45 - 10:15 (Nghỉ 15p)
- SLOT_5: 10:30 - 11:00 (Nghỉ 15p)
- SLOT_6: 11:15 - 11:45 (Nghỉ 15p)

**Nghỉ trưa: 12:00 - 13:00 (1 tiếng)**

**Buổi chiều (6 slots):**
- SLOT_7: 13:00 - 13:30 (Nghỉ 15p)
- SLOT_8: 13:45 - 14:15 (Nghỉ 15p)
- SLOT_9: 14:30 - 15:00 (Nghỉ 15p)
- SLOT_10: 15:15 - 15:45 (Nghỉ 15p)
- SLOT_11: 16:00 - 16:30 (Nghỉ 15p)
- SLOT_12: 16:45 - 17:15

---

## 🔧 Các file đã update:

### Backend:
- ✅ `medconnect-be/src/main/java/se1961/g1/medconnect/enums/Slot.java`
  - Thêm 8 slots mới (SLOT_5 → SLOT_12)
  - Thêm method `getTimeRange()` để format thời gian

### Frontend:
- ✅ `medconnect-fe/pages/bac-si/lich-lam-viec.jsx`
  - Update SLOTS array với 12 slots
  - Update totalWeekSlots: 7 * 12 = 84 slots
  
- ✅ `medconnect-fe/pages/bac-si/lich-hen.jsx`
  - Update SLOT_TIMES với 12 slots
  
- ✅ `medconnect-fe/pages/nguoi-dung/dat-lich-kham.jsx`
  - Update SLOT_TIMES với 12 slots

---

## ⚠️ QUAN TRỌNG: Phải xóa data cũ!

Vì thay đổi từ 4 slots → 12 slots, **PHẢI XÓA** tất cả appointments và schedules cũ.

### 🗑️ Cách 1: Chạy SQL script (Recommended)

```bash
# Kết nối MySQL
mysql -u root -p

# Chọn database
USE g1medconnect;

# Chạy script
source medconnect-be/CLEAR-APPOINTMENTS-FOR-SLOT-CHANGE.sql;
```

Hoặc copy-paste SQL này vào MySQL Workbench:
```sql
DELETE FROM appointment;
DELETE FROM schedule;
SELECT COUNT(*) as appointment_count FROM appointment;
SELECT COUNT(*) as schedule_count FROM schedule;
```

### 🗑️ Cách 2: Dùng MySQL Workbench
1. Mở MySQL Workbench
2. Connect vào database `g1medconnect`
3. Chạy queries:
   ```sql
   DELETE FROM appointment;
   DELETE FROM schedule;
   ```
4. Verify: `SELECT COUNT(*) FROM appointment;` → Phải = 0

---

## 🚀 Các bước thực hiện:

### 1. Xóa data cũ (QUAN TRỌNG!)
```bash
cd /Volumes/Data/Code/swp391/g1-se1961-nj-swp391-fal25
mysql -u root -p < medconnect-be/CLEAR-APPOINTMENTS-FOR-SLOT-CHANGE.sql
```

### 2. Restart Backend
```bash
cd medconnect-be
./mvnw spring-boot:run
```

Hoặc nếu đang chạy trong IDE, restart application.

### 3. Restart Frontend (không bắt buộc nhưng recommended)
```bash
cd medconnect-fe
npm run dev
```

### 4. Test hệ thống mới

#### Test Doctor Schedule:
1. Login as Doctor
2. Vào `/bac-si/lich-lam-viec`
3. Click vào ô trống → Thêm ca làm việc
4. Verify: Có 12 slots/ngày thay vì 4

#### Test Patient Booking:
1. Login as Patient
2. Vào `/nguoi-dung/dat-lich-kham`
3. Chọn bác sĩ → Chọn ngày
4. Verify: Hiển thị đúng slots đã mở (30 phút)

#### Test Appointment Management:
1. Login as Doctor
2. Vào `/bac-si/lich-hen`
3. Verify: Appointments hiển thị đúng thời gian mới

---

## ✅ Checklist:

- [ ] Đã backup database (nếu cần)
- [ ] Đã xóa data cũ (appointments + schedules)
- [ ] Đã restart backend
- [ ] Đã restart frontend
- [ ] Doctor có thể tạo schedule mới với 12 slots
- [ ] Patient có thể book appointment với slots mới
- [ ] Hiển thị đúng thời gian trên tất cả trang

---

## 📊 So sánh:

| Metric | CŨ (4 slots) | MỚI (12 slots) | Thay đổi |
|--------|--------------|----------------|----------|
| Slots/ngày | 4 | 12 | +200% |
| Thời gian/slot | 2.5 giờ | 30 phút | -80% |
| Nghỉ giữa slots | Không | 15 phút | ✅ |
| Total slots/tuần | 28 | 84 | +200% |
| Linh hoạt | Thấp | Cao | ⬆️⬆️⬆️ |

---

## 🎉 Lợi ích:

1. ✅ **Linh hoạt hơn**: Bệnh nhân có nhiều lựa chọn giờ hơn
2. ✅ **Hiệu quả hơn**: Bác sĩ có 15 phút nghỉ giữa các ca
3. ✅ **Mở rộng được**: Có thể extend thời gian bằng cách book 2 slots liên tiếp
4. ✅ **Chuyên nghiệp hơn**: Giống hệ thống booking quốc tế

---

## ⚠️ Lưu ý:

- ❌ **KHÔNG THỂ** giữ lại appointments cũ (data structure khác nhau)
- ✅ Phù hợp cho giai đoạn development/testing
- ✅ Nếu có data production quan trọng, cần có migration strategy phức tạp hơn

---

**Created:** 2025-10-23  
**Author:** AI Assistant  
**Status:** Ready to deploy

