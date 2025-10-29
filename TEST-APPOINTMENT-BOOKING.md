# Test Appointment Booking

## Steps to Test

### 1. Start Backend
```bash
cd medconnect-be
mvn spring-boot:run
```

### 2. Start Frontend
```bash
cd medconnect-fe
npm run dev
```

### 3. Test Booking Flow

#### Step 1: Login as Patient
- Go to http://localhost:3000/dang-nhap
- Login with patient account

#### Step 2: Book Appointment
- Go to http://localhost:3000/dat-lich-kham
- Select a doctor
- Select a date
- Select a time slot
- Fill in reason
- Click "Xác nhận đặt lịch"

#### Step 3: Check Backend Logs
Look for these logs:
```
[createAppointment] ========== START ==========
[createAppointment] Patient Firebase UID: [uid]
[createAppointment] Doctor ID: [doctor_id]
[createAppointment] Doctor: [doctor_name] (UserID: [user_id])
[createAppointment] Doctor set in appointment: [doctor_name]
[createAppointment] Doctor user_id in appointment: [user_id]
[createAppointment] ✅ Appointment created!
```

#### Step 4: Check Doctor Schedule
- Login as doctor
- Go to http://localhost:3000/bac-si/lich-lam-viec
- Check if appointment appears

#### Step 5: Check Backend Logs for Schedule
Look for these logs:
```
[getWeeklySchedule] ========== START ==========
[getWeeklySchedule] Doctor UserID: [user_id]
[findByDoctorUserIdAndDateBetween] Called with userId: [user_id]
[findByDoctorUserIdAndDateBetween] Found [count] appointments
```

## Expected Results

### ✅ Success Case
- Appointment created in database
- Doctor schedule shows appointment as BUSY
- Patient schedule shows their appointment
- Backend logs show correct data flow

### ❌ Failure Case
- Appointment created but not showing in schedule
- Backend logs show 0 appointments found
- Possible issues:
  - Doctor ID mapping incorrect
  - Date format mismatch
  - Repository query not working

## Debug Commands

### Check Database
```sql
-- Check appointments
SELECT appointment_id, doctor_id, patient_id, date, slot, status 
FROM Appointment 
ORDER BY appointment_id DESC;

-- Check doctor mapping
SELECT d.user_id, d.name, a.appointment_id, a.date, a.slot
FROM Doctor d
LEFT JOIN Appointment a ON d.user_id = a.doctor_id
WHERE d.user_id = [doctor_user_id];
```

### Check Backend Logs
```bash
# Look for appointment creation logs
grep "createAppointment" logs/application.log

# Look for schedule fetch logs
grep "getWeeklySchedule" logs/application.log

# Look for repository query logs
grep "findByDoctorUserIdAndDateBetween" logs/application.log
```

## Common Issues

### Issue 1: Doctor ID Mismatch
- Frontend sends `user_id` as `doctorId`
- Backend finds doctor by `user_id` (correct)
- But appointment is saved with `doctor_id` (foreign key)
- Repository query looks for `doctor.userId = user_id`

### Issue 2: Date Format
- Frontend sends date as string
- Backend parses to LocalDate
- Possible timezone issues

### Issue 3: Repository Query
- `findByDoctorUserIdAndDateBetween` might not work
- Check if `appointment.doctor.userId` mapping is correct

## Quick Fixes

### Fix 1: Use Doctor Object Instead of User ID
```java
// Instead of findByDoctorUserIdAndDateBetween
List<Appointment> appointments = appointmentRepository.findByDoctorAndDateBetween(doctor, start, end);
```

### Fix 2: Check Date Format
Ensure date format is consistent between frontend and backend.

### Fix 3: Add More Debug Logs
Add debug logs to see exactly what's happening in the repository query.
