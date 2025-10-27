-- =====================================================
-- QUICK CHECK: Appointment & Schedule Data
-- =====================================================
USE MedConnect;
GO

PRINT '========================================';
PRINT '📊 CURRENT DATA STATUS';
PRINT '========================================';
PRINT '';

-- 1. Count
PRINT '1. Record counts:';
SELECT 
    'Schedules' AS TableName, 
    COUNT(*) AS Total
FROM Schedule
UNION ALL
SELECT 
    'Appointments',
    COUNT(*)
FROM Appointment;
GO

PRINT '';
PRINT '2. Recent appointments (last 5):';
SELECT TOP 5
    a.appointment_id AS ID,
    a.date AS Date,
    a.slot AS Slot,
    a.status AS Status,
    p.name AS Patient,
    d.name AS Doctor,
    d.user_id AS DoctorUserID
FROM Appointment a
JOIN Patient p ON a.patient_id = p.user_id
JOIN Doctor d ON a.doctor_id = d.user_id
ORDER BY a.appointment_id DESC;
GO

PRINT '';
PRINT '3. Recent schedules (last 5):';
SELECT TOP 5
    s.schedule_id AS ID,
    s.date AS Date,
    s.slot AS Slot,
    s.status AS Status,
    u.email AS DoctorEmail,
    s.user_id AS DoctorUserID
FROM Schedule s
JOIN Users u ON s.user_id = u.user_id
ORDER BY s.schedule_id DESC;
GO

PRINT '';
PRINT '4. Matching check (Appointment vs Schedule):';
SELECT 
    a.appointment_id AS AppointmentID,
    a.date AS Date,
    a.slot AS Slot,
    a.status AS ApptStatus,
    CASE 
        WHEN s.schedule_id IS NOT NULL THEN 'HAS SCHEDULE'
        ELSE '❌ NO SCHEDULE!'
    END AS ScheduleExists,
    s.schedule_id AS ScheduleID,
    s.status AS ScheduleStatus
FROM Appointment a
JOIN Doctor d ON a.doctor_id = d.user_id
LEFT JOIN Schedule s ON s.user_id = d.user_id 
    AND s.date = a.date 
    AND s.slot = a.slot
WHERE a.status NOT IN ('CANCELLED', 'DENIED')
ORDER BY a.appointment_id DESC;
GO

PRINT '';
PRINT '========================================';
PRINT '✅ Data check complete!';
PRINT '========================================';
PRINT '';
PRINT 'If you see:';
PRINT '- Appointments > 0 but Schedules = 0 → Doctor forgot to open schedule';
PRINT '- Appointment exists but "NO SCHEDULE" → Schedule was deleted (BAD!)';
PRINT '- Both exist but UI not showing → Backend issue (check logs)';
PRINT '';
GO

