-- =====================================================
-- CHECK APPOINTMENT & SCHEDULE DATA
-- =====================================================
-- Quick diagnostic script to check appointment and schedule data
-- =====================================================

USE MedConnect;
GO

PRINT '========================================';
PRINT 'DIAGNOSTIC: Appointment & Schedule Data';
PRINT '========================================';
PRINT '';

-- =====================================================
-- 1. Count records
-- =====================================================
PRINT '1. Record Counts:';
SELECT 
    'Appointments' AS TableName, 
    COUNT(*) AS Total,
    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS Pending,
    SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) AS Confirmed,
    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS Cancelled
FROM Appointment
UNION ALL
SELECT 
    'Schedules',
    COUNT(*),
    SUM(CASE WHEN status = 'RESERVED' THEN 1 ELSE 0 END) AS Reserved,
    SUM(CASE WHEN status = 'BUSY' THEN 1 ELSE 0 END) AS Busy,
    NULL
FROM Schedule;
GO

-- =====================================================
-- 2. Recent Appointments (last 10)
-- =====================================================
PRINT '';
PRINT '2. Recent Appointments:';
SELECT TOP 10
    a.appointment_id,
    a.date,
    a.slot,
    a.status,
    a.type,
    a.reason,
    p.name AS patient_name,
    d.name AS doctor_name,
    d.user_id AS doctor_user_id
FROM Appointment a
JOIN Patient p ON a.patient_id = p.user_id
JOIN Doctor d ON a.doctor_id = d.user_id
ORDER BY a.appointment_id DESC;
GO

-- =====================================================
-- 3. All Schedules
-- =====================================================
PRINT '';
PRINT '3. All Schedules:';
SELECT 
    s.schedule_id,
    s.date,
    s.slot,
    s.status,
    s.user_id,
    u.email AS doctor_email,
    d.name AS doctor_name
FROM Schedule s
JOIN Users u ON s.user_id = u.user_id
JOIN Doctor d ON s.user_id = d.user_id
ORDER BY s.date, s.slot;
GO

-- =====================================================
-- 4. Check for ORPHANED appointments (no schedule)
-- =====================================================
PRINT '';
PRINT '4. Appointments WITHOUT matching schedule (potential issue):';
SELECT 
    a.appointment_id,
    a.date,
    a.slot,
    a.status,
    d.name AS doctor_name,
    d.user_id AS doctor_user_id,
    'No matching schedule!' AS Issue
FROM Appointment a
JOIN Doctor d ON a.doctor_id = d.user_id
WHERE NOT EXISTS (
    SELECT 1 
    FROM Schedule s 
    WHERE s.user_id = d.user_id 
    AND s.date = a.date 
    AND s.slot = a.slot
)
AND a.status NOT IN ('CANCELLED', 'DENIED');

IF @@ROWCOUNT = 0
    PRINT '   ✅ All appointments have matching schedules';
GO

-- =====================================================
-- 5. Check for matching Appointment-Schedule pairs
-- =====================================================
PRINT '';
PRINT '5. Appointment-Schedule matches:';
SELECT 
    a.appointment_id,
    a.date,
    a.slot AS appt_slot,
    a.status AS appt_status,
    s.schedule_id,
    s.slot AS schedule_slot,
    s.status AS schedule_status,
    p.name AS patient_name,
    d.name AS doctor_name
FROM Appointment a
JOIN Doctor d ON a.doctor_id = d.user_id
JOIN Schedule s ON s.user_id = d.user_id AND s.date = a.date AND s.slot = a.slot
JOIN Patient p ON a.patient_id = p.user_id
WHERE a.status NOT IN ('CANCELLED', 'DENIED')
ORDER BY a.date, a.slot;

IF @@ROWCOUNT = 0
    PRINT '   ⚠️  No matching appointment-schedule pairs found!';
GO

-- =====================================================
-- 6. User IDs check (Doctor vs User)
-- =====================================================
PRINT '';
PRINT '6. Doctor User IDs (for debugging):';
SELECT 
    d.user_id,
    u.email,
    d.name,
    u.role
FROM Doctor d
JOIN Users u ON d.user_id = u.user_id;
GO

PRINT '';
PRINT '========================================';
PRINT 'Diagnostic Complete';
PRINT '========================================';
PRINT '';
PRINT 'Key things to check:';
PRINT '- If appointments exist but schedules are 0 → Doctor forgot to set schedule';
PRINT '- If "Appointments WITHOUT matching schedule" > 0 → Schedule was deleted!';
PRINT '- If schedule.status = RESERVED but appointment exists → Backend not updating status';
PRINT '';
GO

