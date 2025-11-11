# 📧 Email Flow Implementation - Đặt Lịch & Xác Nhận

## ✅ Đã Hoàn Thành

### 1. **Email CAM (ORANGE) - Chờ Xác Nhận**
**Khi nào gửi:** Sau khi patient thanh toán thành công

**File:** `PaymentService.java` - method `processVnPayResponse()`

```java
// Line ~210 trong PaymentService.java
if ("00".equals(responseCode)) { // Payment success
    // ... update payment status ...
    
    // 📧 Send "Pending Confirmation" email
    emailService.sendAppointmentPendingConfirmation(
        patientEmail,
        patientName,
        doctorName,
        appointmentDate,
        appointmentTime,
        appointmentType
    );
}
```

**Template:** `appointment-pending.html` (màu cam/orange)

**Nội dung:**
- ⏳ Status: "CHỜ BÁC SĨ XÁC NHẬN"
- 📋 Thông tin lịch hẹn đầy đủ
- ⚠️ Lưu ý: Bác sĩ sẽ xác nhận trong 24h
- 🔄 Hoàn tiền nếu bác sĩ từ chối

---

### 2. **Email XANH (GREEN) - Đã Xác Nhận**
**Khi nào gửi:** Sau khi bác sĩ xác nhận lịch hẹn (doctor confirm)

**File:** `AppointmentService.java` - method `confirmAppointment()`

```java
// Line ~310 trong AppointmentService.java
public Appointment confirmAppointment(Long id) throws Exception {
    // ... validate & update status ...
    
    appointment.setStatus(AppointmentStatus.CONFIRMED);
    Appointment savedAppointment = appointmentRepository.save(appointment);
    
    // 📧 Send "CONFIRMED" email  
    emailService.sendAppointmentConfirmation(
        patientEmail,
        patientName,
        doctorName,
        appointmentDate,
        appointmentTime,
        specialization
    );
    
    return savedAppointment;
}
```

**Template:** `appointment-confirmation.html` (màu xanh/cyan)

**Nội dung:**
- ✅ Status: "ĐÃ XÁC NHẬN"
- 📋 Thông tin lịch hẹn chi tiết
- 📅 Reminder ngày giờ khám
- 📝 Lưu ý chuẩn bị trước khám
- 🔗 Link tham gia cuộc gọi (nếu online)

---

## 📊 Flow Diagram

```
1. Patient đặt lịch
   ↓
2. Patient thanh toán VNPay
   ↓
3. ✅ Thanh toán thành công
   ↓
4. 📧 GỬI EMAIL CAM (PENDING)
   - Status: PENDING
   - Chờ bác sĩ xác nhận
   ↓
5. Bác sĩ xem lịch hẹn
   ↓
6. Bác sĩ nhấn "Xác nhận"
   ↓
7. 📧 GỬI EMAIL XANH (CONFIRMED)
   - Status: CONFIRMED
   - Reminder ngày giờ
   ↓
8. Patient nhận email xác nhận
```

---

## 🔧 Technical Details

### Files Modified:
1. **PaymentService.java**
   - Added: `@Autowired EmailService emailService`
   - Modified: `processVnPayResponse()` - Added email sending after payment success

2. **AppointmentService.java**
   - Added: `@Autowired EmailService emailService`
   - Modified: `confirmAppointment()` - Added email sending after doctor confirms

3. **EmailService.java**
   - Added: `sendAppointmentPendingConfirmation()` method
   - Updated: `sendAppointmentConfirmation()` method (green email)

4. **Email Templates:**
   - Created: `appointment-pending.html` (Orange theme)
   - Existing: `appointment-confirmation.html` (Cyan/Green theme)

---

## 🎨 Email Template Colors

### Email CAM (Pending):
- Header: `#f97316` to `#fb923c` (Orange gradient)
- Background: `#fffbeb` (Light yellow)
- Border: `#fde68a` (Yellow)
- Status Badge: `#fbbf24` (Amber)

### Email XANH (Confirmed):
- Header: `#0891b2` to `#06b6d4` (Cyan gradient)
- Background: `#f9fafb` (Light gray)
- Border: `#e5e7eb` (Gray)
- Accent: `#0891b2` (Cyan)

---

## 🧪 Testing

### Test Flow:
1. **Patient đặt lịch** → Create appointment (status: PENDING)
2. **Thanh toán VNPay** → Return URL triggers `processVnPayResponse()`
3. **Check email CAM** → Patient receives "Chờ xác nhận" email
4. **Doctor confirm** → Call `PATCH /api/appointment/{id}/confirm`
5. **Check email XANH** → Patient receives "Đã xác nhận" email

### Test Commands:
```bash
# 1. Create appointment (as patient)
curl -X POST http://localhost:8080/api/appointment \
  -H "Authorization: Bearer {patient-token}" \
  -d '{ "doctorId": 1, "date": "2025-11-15", "slot": "SLOT_1", "type": "ONLINE" }'

# 2. Process payment (VNPay callback - automatic)

# 3. Confirm appointment (as doctor)
curl -X PATCH http://localhost:8080/api/appointment/1/confirm \
  -H "Authorization: Bearer {doctor-token}"
```

---

## 📝 Notes

- ✅ Email failures don't block payment/confirmation (try-catch with error logging)
- ✅ Both emails sent asynchronously
- ✅ Error logs printed to console if email fails
- ✅ Email templates support Vietnamese text
- ⚠️ Requires Resend API key in `application.properties`

---

## 🚀 Next Steps (Optional)

- [ ] Add email to doctor khi có appointment mới
- [ ] Add reminder email 24h trước khám
- [ ] Add cancellation email
- [ ] Add SMS notifications
- [ ] Add push notifications

---

**Last Updated:** November 11, 2025
**Status:** ✅ READY FOR TESTING
