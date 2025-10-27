-- ============================================
-- Insert Sample Appointments with correct SLOT format
-- Only 4 slots: SLOT_1, SLOT_2, SLOT_3, SLOT_4
-- ============================================

USE MedConnect;
GO

SET QUOTED_IDENTIFIER ON;
GO

PRINT '============================================';
PRINT 'INSERTING SAMPLE APPOINTMENTS';
PRINT '============================================';
PRINT '';

-- Delete old appointments first
DELETE FROM Appointment;
DBCC CHECKIDENT ('Appointment', RESEED, 0);
GO

SET IDENTITY_INSERT Appointment ON;

-- Appointments: Mix of statuses and types
INSERT INTO Appointment (appointment_id, status, created_at, date, slot, type, doctor_id, patient_id, reason) VALUES
-- Doctor 3 (BS. Nguyễn Văn An) - user_id=3
(1, 'FINISHED', '2025-10-15', '2025-10-20', 'SLOT_1', 'ONLINE', 3, 13, N'Đau ngực, khó thở'),
(2, 'FINISHED', '2025-10-16', '2025-10-21', 'SLOT_2', 'OFFLINE', 3, 14, N'Ho, sốt'),
(3, 'CONFIRMED', '2025-10-20', '2025-10-27', 'SLOT_1', 'ONLINE', 3, 15, N'Tái khám tăng huyết áp'),

-- Doctor 4 (BS. Trần Thị Bình) - user_id=4
(4, 'FINISHED', '2025-10-14', '2025-10-19', 'SLOT_1', 'ONLINE', 4, 16, N'Đau đầu, chóng mặt'),
(5, 'CONFIRMED', '2025-10-22', '2025-10-28', 'SLOT_2', 'ONLINE', 4, 17, N'Khám tim mạch'),
(6, 'CONFIRMED', '2025-10-21', '2025-10-29', 'SLOT_3', 'OFFLINE', 4, 18, N'Khám định kỳ'),

-- Doctor 5 (BS. Lê Hoàng Cường) - user_id=5
(7, 'FINISHED', '2025-10-13', '2025-10-18', 'SLOT_2', 'OFFLINE', 5, 19, N'Đau bụng, tiêu chảy'),
(8, 'FINISHED', '2025-10-17', '2025-10-22', 'SLOT_3', 'ONLINE', 5, 20, N'Mệt mỏi, tăng cân'),
(9, 'PENDING', '2025-10-22', '2025-10-30', 'SLOT_1', 'ONLINE', 5, 21, N'Tư vấn sức khỏe'),

-- Doctor 6 (BS. Phạm Thị Dung) - user_id=6
(10, 'FINISHED', '2025-10-12', '2025-10-17', 'SLOT_2', 'ONLINE', 6, 22, N'Khó thở, ho khè khè'),
(11, 'CONFIRMED', '2025-10-20', '2025-10-28', 'SLOT_2', 'ONLINE', 6, 13, N'Tái khám hen phế quản'),
(12, 'CANCELLED', '2025-10-19', '2025-10-23', 'SLOT_4', 'OFFLINE', 6, 14, N'Đau bụng'),

-- Doctor 7 (BS. Hoàng Văn Em) - user_id=7
(13, 'FINISHED', '2025-10-11', '2025-10-16', 'SLOT_1', 'ONLINE', 7, 15, N'Đau khớp gối'),
(14, 'CONFIRMED', '2025-10-21', '2025-10-29', 'SLOT_2', 'ONLINE', 7, 16, N'Tái khám khớp'),
(15, 'PENDING', '2025-10-22', '2025-10-31', 'SLOT_3', 'OFFLINE', 7, 17, N'Khám nhi khoa'),

-- Doctor 8 (BS. Vũ Thị Phương) - user_id=8
(16, 'DENIED', '2025-10-20', '2025-10-24', 'SLOT_1', 'ONLINE', 8, 18, N'Khám da liễu'),
(17, 'PENDING', '2025-10-22', '2025-10-30', 'SLOT_3', 'ONLINE', 8, 19, N'Mụn trứng cá'),

-- Doctor 9 (BS. Đặng Minh Giang) - user_id=9
(18, 'FINISHED', '2025-10-10', '2025-10-15', 'SLOT_3', 'OFFLINE', 9, 20, N'Khám định kỳ'),
(19, 'CONFIRMED', '2025-10-20', '2025-10-27', 'SLOT_4', 'ONLINE', 9, 21, N'Đau tai, nghe kém'),
(20, 'CONFIRMED', '2025-10-21', '2025-10-28', 'SLOT_2', 'ONLINE', 9, 22, N'Viêm họng'),

-- Doctor 10 (BS. Bùi Thị Hà) - user_id=10
(21, 'FINISHED', '2025-10-09', '2025-10-14', 'SLOT_1', 'ONLINE', 10, 13, N'Sốt, đau đầu'),
(22, 'FINISHED', '2025-10-15', '2025-10-20', 'SLOT_2', 'OFFLINE', 10, 14, N'Mụn trứng cá'),
(23, 'CONFIRMED', '2025-10-21', '2025-10-29', 'SLOT_3', 'ONLINE', 10, 15, N'Tái khám da'),

-- Doctor 11 (BS. Ngô Văn Hùng) - user_id=11, INACTIVE
(24, 'FINISHED', '2025-09-01', '2025-09-10', 'SLOT_2', 'OFFLINE', 11, 16, N'Khám cũ'),
(25, 'CANCELLED', '2025-09-15', '2025-09-20', 'SLOT_3', 'ONLINE', 11, 17, N'Đã hủy'),

-- Doctor 12 (BS. Mai Thị Lan) - user_id=12
(26, 'FINISHED', '2025-10-08', '2025-10-13', 'SLOT_1', 'ONLINE', 12, 18, N'Buồn chán, mất ngủ'),
(27, 'FINISHED', '2025-10-14', '2025-10-19', 'SLOT_2', 'ONLINE', 12, 19, N'Đau ngực khi gắng sức'),
(28, 'CONFIRMED', '2025-10-20', '2025-10-27', 'SLOT_3', 'OFFLINE', 12, 20, N'Khám nhi khoa'),
(29, 'CONFIRMED', '2025-10-21', '2025-10-28', 'SLOT_1', 'ONLINE', 12, 21, N'Tiêm phòng'),
(30, 'PENDING', '2025-10-22', '2025-10-30', 'SLOT_4', 'ONLINE', 12, 22, N'Tư vấn dinh dưỡng');

SET IDENTITY_INSERT Appointment OFF;

PRINT '';
PRINT '✅ 30 Appointments inserted successfully!';
PRINT '';

-- Verify
PRINT 'Verification:';
SELECT 
    'Total Appointments' AS Info,
    COUNT(*) AS Count
FROM Appointment;

SELECT 
    'By Status' AS Info,
    status,
    COUNT(*) AS Count
FROM Appointment
GROUP BY status
ORDER BY status;

SELECT 
    'By Type' AS Info,
    type,
    COUNT(*) AS Count
FROM Appointment
GROUP BY type;

SELECT 
    'By Slot' AS Info,
    slot,
    COUNT(*) AS Count
FROM Appointment
GROUP BY slot
ORDER BY slot;

PRINT '';
PRINT '============================================';
PRINT 'APPOINTMENT DATA READY!';
PRINT '';
PRINT 'Test now:';
PRINT '1. Login as patient.mai@gmail.com';
PRINT '2. Go to /nguoi-dung/lich-hen';
PRINT '3. Should see 3 appointments';
PRINT '';
PRINT 'Or login as doctor.an@medconnect.vn';
PRINT 'Go to /bac-si/trang-chu';
PRINT 'Should see appointments dashboard';
PRINT '============================================';
GO
