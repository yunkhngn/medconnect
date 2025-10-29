# Debug Appointment Booking Issue

## Problem Description
- User books appointment successfully (appointment created in database)
- But appointment doesn't show up in doctor's schedule
- Doctor can't see the booked appointment
- Patient can't see their appointment in their schedule

## Root Cause Analysis

### 1. Appointment Creation Flow
```
Frontend: selectedDoctor.id (user_id) → Backend: createAppointment()
Backend: doctorRepository.findById(doctorId) → Doctor entity
Backend: appointment.setDoctor(doctor) → Appointment entity
```

### 2. Schedule Display Flow
```
Frontend: doctor schedule page → Backend: getWeeklySchedule()
Backend: appointmentService.findByDoctorUserIdAndDateBetween(userId, start, end)
Backend: appointmentRepository.findByDoctorUserIdAndDateBetween(userId, start, end)
```

### 3. Potential Issues

#### Issue 1: Doctor ID Mapping
- Frontend sends `selectedDoctor.id` (user_id)
- Backend finds doctor by `doctorRepository.findById(doctorId)`
- If `doctorId` is user_id, this should work since Doctor extends User

#### Issue 2: Appointment Repository Query
- `findByDoctorUserIdAndDateBetween(userId, start, end)` 
- This queries: `appointment.doctor.userId = userId`
- But `appointment.doctor` is mapped to `doctor_id` (foreign key)
- So it should work if doctor_id = user_id

#### Issue 3: Date Format Mismatch
- Frontend sends date as string
- Backend parses to LocalDate
- Possible timezone issues

## Debug Steps

### 1. Check Database
```sql
-- Check if appointment was created
SELECT appointment_id, doctor_id, patient_id, date, slot, status 
FROM Appointment 
ORDER BY appointment_id DESC;

-- Check doctor mapping
SELECT d.user_id, d.name, a.appointment_id, a.date, a.slot
FROM Doctor d
LEFT JOIN Appointment a ON d.user_id = a.doctor_id
WHERE d.user_id = [doctor_user_id];
```

### 2. Check Backend Logs
- Look for `[createAppointment]` logs
- Look for `[getWeeklySchedule]` logs
- Look for `[findByDoctorUserIdAndDateBetween]` logs

### 3. Check Frontend Console
- Check if appointment creation response is correct
- Check if schedule fetch is working
- Check if data mapping is correct

## Quick Fixes to Try

### Fix 1: Add More Debug Logs
Add debug logs in `AppointmentService.createAppointment()`:
```java
System.out.println("[createAppointment] Doctor found: " + doctor.getName());
System.out.println("[createAppointment] Doctor user_id: " + doctor.getUserId());
System.out.println("[createAppointment] Setting doctor in appointment...");
appointment.setDoctor(doctor);
System.out.println("[createAppointment] Doctor set in appointment: " + appointment.getDoctor().getName());
```

### Fix 2: Check Date Format
Ensure date format is consistent between frontend and backend.

### Fix 3: Verify Repository Query
Test the repository query directly:
```java
List<Appointment> test = appointmentRepository.findByDoctorUserIdAndDateBetween(doctorId, startDate, endDate);
System.out.println("Direct query result: " + test.size() + " appointments");
```

## Expected Behavior
1. User books appointment → Appointment created in DB
2. Doctor's schedule shows appointment as BUSY
3. Patient's schedule shows their appointment
4. Both can see appointment details

## Current Status
- Appointment creation: ✅ Working (data in DB)
- Schedule display: ❌ Not working (appointment not showing)
- Root cause: Likely in repository query or data mapping
