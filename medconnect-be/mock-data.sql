-- ============================================
-- MedConnect Mock Data Generation Script
-- Total: ~100 records
-- Users: Admin(2) + Doctor(10) + Patient(10) = 22
-- ============================================
CREATE DATABASE MedConnect;

USE MedConnect;
GO

-- ============================================
-- STEP 1: Clear all existing data (in correct order due to foreign keys)
-- ============================================

PRINT 'Clearing existing data...';

-- Delete child tables first
DELETE FROM Feedback;
DELETE FROM Notification;
DELETE FROM Video_Call_Session;
DELETE FROM Medical_Record;
DELETE FROM Payment;
DELETE FROM Appointment;
DELETE FROM License;
DELETE FROM Schedule;

-- Delete parent tables
DELETE FROM Doctor;
DELETE FROM Patient;
DELETE FROM Admin;
DELETE FROM Users;

PRINT 'All data cleared successfully';
GO

-- ============================================
-- STEP 2: Insert Users (Base table)
-- ============================================

PRINT 'Inserting Users...';

-- Reset identity seeds
DBCC CHECKIDENT ('Users', RESEED, 0);
GO

-- Insert 2 Admins
SET IDENTITY_INSERT Users ON;

INSERT INTO Users (user_id, name, email, phone, avatar_url, firebase_uid, role) VALUES
(1, N'Admin System', 'admin.system@medconnect.vn', '0901000001', NULL, 'QOw1Uf8Vr0a8JGMMBNzjr7CSXFa2', 'ADMIN'),
(2, N'Admin Manager', 'admin.manager@medconnect.vn', '0901000002', NULL, 'firebase_uid_admin_2', 'ADMIN');

-- Insert 10 Doctors
INSERT INTO Users (user_id, name, email, phone, avatar_url, firebase_uid, role) VALUES
(3, N'BS. Nguyễn Văn An', 'doctor.an@medconnect.vn', '0902000001', NULL, '1e094cFqC1XLnblL7Lrd1W4QxLu1', 'DOCTOR'),
(4, N'BS. Trần Thị Bình', 'doctor.binh@medconnect.vn', '0902000002', NULL, 'firebase_uid_doctor_2', 'DOCTOR'),
(5, N'BS. Lê Hoàng Cường', 'doctor.cuong@medconnect.vn', '0902000003', NULL, 'firebase_uid_doctor_3', 'DOCTOR'),
(6, N'BS. Phạm Thị Dung', 'doctor.dung@medconnect.vn', '0902000004', NULL, 'firebase_uid_doctor_4', 'DOCTOR'),
(7, N'BS. Hoàng Văn Em', 'doctor.em@medconnect.vn', '0902000005', NULL, 'firebase_uid_doctor_5', 'DOCTOR'),
(8, N'BS. Vũ Thị Phương', 'doctor.phuong@medconnect.vn', '0902000006', NULL, 'firebase_uid_doctor_6', 'DOCTOR'),
(9, N'BS. Đặng Minh Giang', 'doctor.giang@medconnect.vn', '0902000007', NULL, 'firebase_uid_doctor_7', 'DOCTOR'),
(10, N'BS. Bùi Thị Hà', 'doctor.ha@medconnect.vn', '0902000008', NULL, 'firebase_uid_doctor_8', 'DOCTOR'),
(11, N'BS. Ngô Văn Hùng', 'doctor.hung@medconnect.vn', '0902000009', NULL, 'firebase_uid_doctor_9', 'DOCTOR'),
(12, N'BS. Mai Thị Lan', 'doctor.lan@medconnect.vn', '0902000010', NULL, 'firebase_uid_doctor_10', 'DOCTOR');

-- Insert 10 Patients
INSERT INTO Users (user_id, name, email, phone, avatar_url, firebase_uid, role) VALUES
(13, N'Nguyễn Thị Mai', 'patient.mai@gmail.com', '0903000001', NULL, 'cOOC9hjI9pYoyZd2pCPKsjxgZmd2', 'PATIENT'),
(14, N'Trần Văn Nam', 'patient.nam@gmail.com', '0903000002', NULL, 'firebase_uid_patient_2', 'PATIENT'),
(15, N'Lê Thị Oanh', 'patient.oanh@gmail.com', '0903000003', NULL, 'firebase_uid_patient_3', 'PATIENT'),
(16, N'Phạm Văn Phúc', 'patient.phuc@gmail.com', '0903000004', NULL, 'firebase_uid_patient_4', 'PATIENT'),
(17, N'Hoàng Thị Quỳnh', 'patient.quynh@gmail.com', '0903000005', NULL, 'firebase_uid_patient_5', 'PATIENT'),
(18, N'Vũ Văn Sơn', 'patient.son@gmail.com', '0903000006', NULL, 'firebase_uid_patient_6', 'PATIENT'),
(19, N'Đặng Thị Thảo', 'patient.thao@gmail.com', '0903000007', NULL, 'firebase_uid_patient_7', 'PATIENT'),
(20, N'Bùi Văn Tùng', 'patient.tung@gmail.com', '0903000008', NULL, 'firebase_uid_patient_8', 'PATIENT'),
(21, N'Ngô Thị Uyên', 'patient.uyen@gmail.com', '0903000009', NULL, 'firebase_uid_patient_9', 'PATIENT'),
(22, N'Mai Văn Vũ', 'patient.vu@gmail.com', '0903000010', NULL, 'firebase_uid_patient_10', 'PATIENT');

SET IDENTITY_INSERT Users OFF;

PRINT '22 Users inserted successfully';
GO

-- ============================================
-- STEP 3: Insert Admin specific data
-- ============================================

PRINT 'Inserting Admin data...';

INSERT INTO Admin (user_id, service_config, policy) VALUES
(1, '{"maintenance_mode": false, "max_appointments_per_day": 50}', '{"refund_policy": "24h", "cancellation_fee": 0}'),
(2, '{"email_notifications": true, "sms_notifications": false}', '{"doctor_commission": 0.15, "platform_fee": 0.15}');

PRINT '2 Admins configured';
GO

-- ============================================
-- STEP 3.5: Insert Speciality data (NEW)
-- ============================================

PRINT 'Inserting Specialities...';

-- Bật IDENTITY_INSERT để insert ID explicit (MSSQL requirement)
SET IDENTITY_INSERT speciality ON;

INSERT INTO speciality (speciality_id, name, description, created_at, updated_at) VALUES
(1, N'Tim mạch', N'Chuyên khoa tim mạch, điều trị các bệnh về tim và mạch máu', GETDATE(), GETDATE()),
(2, N'Nội khoa', N'Chuyên khoa nội tổng quát, điều trị các bệnh nội khoa', GETDATE(), GETDATE()),
(3, N'Nhi khoa', N'Chuyên khoa nhi, chăm sóc sức khỏe trẻ em', GETDATE(), GETDATE()),
(4, N'Da liễu', N'Chuyên khoa da liễu, điều trị các bệnh về da', GETDATE(), GETDATE()),
(5, N'Tai mũi họng', N'Chuyên khoa tai mũi họng, điều trị các bệnh về tai, mũi, họng', GETDATE(), GETDATE()),
(6, N'Mắt', N'Chuyên khoa mắt, điều trị các bệnh về mắt', GETDATE(), GETDATE()),
(7, N'Răng hàm mặt', N'Chuyên khoa răng hàm mặt, điều trị các bệnh về răng', GETDATE(), GETDATE()),
(8, N'Thần kinh', N'Chuyên khoa thần kinh, điều trị các bệnh về thần kinh', GETDATE(), GETDATE()),
(9, N'Sản phụ khoa', N'Chuyên khoa sản phụ khoa, chăm sóc sức khỏe phụ nữ', GETDATE(), GETDATE()),
(10, N'Chỉnh hình', N'Chuyên khoa chỉnh hình, điều trị các bệnh về xương khớp', GETDATE(), GETDATE());

-- Tắt IDENTITY_INSERT sau khi xong
SET IDENTITY_INSERT speciality OFF;

PRINT '10 Specialities inserted';
GO

-- ============================================
-- STEP 4: Insert Doctor specific data
-- ============================================

PRINT 'Inserting Doctor data...';

-- Note: Using speciality_id (entity) and enriched doctor profile fields
-- Columns: user_id, speciality_id, status, experience_years, education_level, bio, clinic_address,
--          province_code, province_name, district_code, district_name, ward_code, ward_name
INSERT INTO Doctor (
  user_id, speciality_id, status, experience_years, education_level, bio, clinic_address,
  province_code, province_name, district_code, district_name, ward_code, ward_name
) VALUES
(3, 1, 'ACTIVE', 15, N'Tiến sĩ Y khoa', N'Bác sĩ tim mạch 15 năm kinh nghiệm', N'123 Đường ABC, Quận 1', 79, N'TP. Hồ Chí Minh', 760, N'Quận 1', 26734, N'Phường Bến Nghé'),
(4, 1, 'ACTIVE', 10, N'Thạc sĩ Y khoa', N'Bác sĩ tim mạch 10 năm kinh nghiệm', N'456 Đường DEF, Quận 2', 79, N'TP. Hồ Chí Minh', 769, N'TP. Thủ Đức', 26806, N'Phường Thủ Thiêm'),
(5, 2, 'ACTIVE', 12, N'Tiến sĩ Y khoa', N'Bác sĩ nội khoa 12 năm kinh nghiệm', N'789 Đường GHI, Quận 3', 79, N'TP. Hồ Chí Minh', 772, N'Quận 3', 27199, N'Phường Võ Thị Sáu'),
(6, 2, 'ACTIVE', 8,  N'Bác sĩ CKI',    N'Bác sĩ nội tổng quát 8 năm kinh nghiệm', N'12 Đường JKL, Quận 4', 79, N'TP. Hồ Chí Minh', 773, N'Quận 4', 27211, N'Phường Bến Nghé'),
(7, 3, 'ACTIVE', 14, N'Thạc sĩ Nhi',   N'Bác sĩ nhi khoa 14 năm kinh nghiệm', N'34 Đường MNO, Quận 5', 79, N'TP. Hồ Chí Minh', 774, N'Quận 5', 27235, N'Phường 7'),
(8, 4, 'PENDING', 6, N'Bác sĩ CKI',    N'Bác sĩ da liễu 6 năm kinh nghiệm', N'56 Đường PQR, Quận 6', 79, N'TP. Hồ Chí Minh', 775, N'Quận 6', 27247, N'Phường 11'),
(9, 5, 'ACTIVE', 11, N'Bác sĩ CKII',   N'Bác sĩ tai mũi họng 11 năm', N'78 Đường STU, Quận 7', 79, N'TP. Hồ Chí Minh', 769, N'TP. Thủ Đức', 26809, N'Phường An Khánh'),
(10,1, 'ACTIVE', 9,  N'Thạc sĩ Y khoa',N'Bác sĩ tim mạch 9 năm kinh nghiệm', N'90 Đường VWX, Quận 8', 79, N'TP. Hồ Chí Minh', 776, N'Quận 8', 27271, N'Phường 5'),
(11,2, 'INACTIVE',20,N'Tiến sĩ Nội',   N'Bác sĩ nội khoa 20 năm kinh nghiệm', N'12 Đường YZA, Quận 10',79, N'TP. Hồ Chí Minh', 777, N'Quận 10', 27307, N'Phường 4'),
(12,3, 'ACTIVE', 7,  N'Bác sĩ CKI',    N'Bác sĩ nhi khoa 7 năm kinh nghiệm', N'34 Đường BCD, Quận 11',79, N'TP. Hồ Chí Minh', 778, N'Quận 11', 27331, N'Phường 13');

PRINT '10 Doctors inserted';
GO

-- ============================================
-- STEP 4.1: Insert Licenses for Doctors (optional but recommended)
-- ============================================

PRINT 'Skip Licenses seeding (upload via app)';
GO

-- ============================================
-- STEP 5: Insert Patient specific data
-- ============================================

PRINT 'Inserting Patient data...';

INSERT INTO Patient (user_id, citizenship, social_insurance) VALUES
(13, '001195000123', 'SI-001195000123'),
(14, '001296000234', 'SI-001296000234'),
(15, '001397000345', 'SI-001397000345'),
(16, '001498000456', 'SI-001498000456'),
(17, '001599000567', 'SI-001599000567'),
(18, '001600000678', 'SI-001600000678'),
(19, '001701000789', 'SI-001701000789'),
(20, '001802000890', 'SI-001802000890'),
(21, '001903000901', 'SI-001903000901'),
(22, '002004001012', 'SI-002004001012');

PRINT '10 Patients inserted';
GO

-- ============================================
-- STEP 6: Insert Appointments (30 records)
-- ============================================
-- ⚠️ COMMENTED OUT - Slot enum đã thay đổi từ 4 slots → 12 slots
-- ⚠️ Cần tạo lại appointments với slot mới sau khi update
-- ============================================

/*
PRINT 'Inserting Appointments...';

DBCC CHECKIDENT ('Appointment', RESEED, 0);
GO

SET IDENTITY_INSERT Appointment ON;

-- Appointments: Mix of ONLINE and OFFLINE, various statuses
INSERT INTO Appointment (appointment_id, status, created_at, date, type, doctor_id, patient_id) VALUES
-- Doctor 1 (userId=3)
(1, 'FINISHED', '2025-10-15', '2025-10-20 09:00:00', 'ONLINE', 3, 13),
(2, 'FINISHED', '2025-10-16', '2025-10-21 10:00:00', 'OFFLINE', 3, 14),
(3, 'CONFIRMED', '2025-10-20', '2025-10-25 14:00:00', 'ONLINE', 3, 15),

-- Doctor 2 (userId=4)
(4, 'FINISHED', '2025-10-14', '2025-10-19 08:30:00', 'ONLINE', 4, 16),
(5, 'ONGOING', '2025-10-22', '2025-10-22 09:00:00', 'ONLINE', 4, 17),
(6, 'CONFIRMED', '2025-10-21', '2025-10-26 15:00:00', 'OFFLINE', 4, 18),

-- Doctor 3 (userId=5)
(7, 'FINISHED', '2025-10-13', '2025-10-18 11:00:00', 'OFFLINE', 5, 19),
(8, 'FINISHED', '2025-10-17', '2025-10-22 13:00:00', 'ONLINE', 5, 20),
(9, 'PENDING', '2025-10-22', '2025-10-27 09:30:00', 'ONLINE', 5, 21),

-- Doctor 4 (userId=6)
(10, 'FINISHED', '2025-10-12', '2025-10-17 10:00:00', 'ONLINE', 6, 22),
(11, 'CONFIRMED', '2025-10-20', '2025-10-24 14:30:00', 'ONLINE', 6, 13),
(12, 'CANCELLED', '2025-10-19', '2025-10-23 16:00:00', 'OFFLINE', 6, 14),

-- Doctor 5 (userId=7)
(13, 'FINISHED', '2025-10-11', '2025-10-16 09:00:00', 'ONLINE', 7, 15),
(14, 'CONFIRMED', '2025-10-21', '2025-10-25 10:30:00', 'ONLINE', 7, 16),
(15, 'PENDING', '2025-10-22', '2025-10-28 11:00:00', 'OFFLINE', 7, 17),

-- Doctor 6 (userId=8)
(16, 'DENIED', '2025-10-20', '2025-10-24 08:00:00', 'ONLINE', 8, 18),
(17, 'PENDING', '2025-10-22', '2025-10-26 13:30:00', 'ONLINE', 8, 19),

-- Doctor 7 (userId=9)
(18, 'FINISHED', '2025-10-10', '2025-10-15 14:00:00', 'OFFLINE', 9, 20),
(19, 'CONFIRMED', '2025-10-20', '2025-10-25 15:30:00', 'ONLINE', 9, 21),
(20, 'CONFIRMED', '2025-10-21', '2025-10-27 10:00:00', 'ONLINE', 9, 22),

-- Doctor 8 (userId=10)
(21, 'FINISHED', '2025-10-09', '2025-10-14 09:30:00', 'ONLINE', 10, 13),
(22, 'FINISHED', '2025-10-15', '2025-10-20 11:00:00', 'OFFLINE', 10, 14),
(23, 'CONFIRMED', '2025-10-21', '2025-10-26 14:00:00', 'ONLINE', 10, 15),

-- Doctor 9 (userId=11) - INACTIVE, old appointments
(24, 'FINISHED', '2025-09-01', '2025-09-10 10:00:00', 'OFFLINE', 11, 16),
(25, 'CANCELLED', '2025-09-15', '2025-09-20 14:00:00', 'ONLINE', 11, 17),

-- Doctor 10 (userId=12)
(26, 'FINISHED', '2025-10-08', '2025-10-13 08:30:00', 'ONLINE', 12, 18),
(27, 'FINISHED', '2025-10-14', '2025-10-19 10:30:00', 'ONLINE', 12, 19),
(28, 'CONFIRMED', '2025-10-20', '2025-10-25 13:00:00', 'OFFLINE', 12, 20),
(29, 'CONFIRMED', '2025-10-21', '2025-10-26 09:00:00', 'ONLINE', 12, 21),
(30, 'PENDING', '2025-10-22', '2025-10-28 15:00:00', 'ONLINE', 12, 22);

SET IDENTITY_INSERT Appointment OFF;

PRINT '30 Appointments inserted';
GO
*/

PRINT 'Skip Appointments seeding (created via app)';
GO

-- ============================================
-- STEP 7: Insert Payments (25 records - for completed/confirmed appointments)
-- ============================================
-- ⚠️ COMMENTED OUT - Phụ thuộc vào appointments
-- ============================================

/*
PRINT 'Inserting Payments...';

DBCC CHECKIDENT ('Payment', RESEED, 0);
GO

SET IDENTITY_INSERT Payment ON;

INSERT INTO Payment (payment_id, created_at, status, amount, patient_id, appointment_id) VALUES
(1, '2025-10-15 08:00:00', 'COMPLETED', 500000, 13, 1),
(2, '2025-10-16 09:00:00', 'COMPLETED', 300000, 14, 2),
(3, '2025-10-20 13:00:00', 'COMPLETED', 500000, 15, 3),
(4, '2025-10-14 07:00:00', 'COMPLETED', 500000, 16, 4),
(5, '2025-10-22 08:00:00', 'COMPLETED', 500000, 17, 5),
(6, '2025-10-21 14:00:00', 'COMPLETED', 300000, 18, 6),
(7, '2025-10-13 10:00:00', 'COMPLETED', 300000, 19, 7),
(8, '2025-10-17 12:00:00', 'COMPLETED', 500000, 20, 8),
(9, '2025-10-22 08:00:00', 'PENDING', 500000, 21, 9),
(10, '2025-10-12 09:00:00', 'COMPLETED', 500000, 22, 10),
(11, '2025-10-20 13:00:00', 'COMPLETED', 500000, 13, 11),
(12, '2025-10-19 15:00:00', 'REFUNDED', 300000, 14, 12),
(13, '2025-10-11 08:00:00', 'COMPLETED', 500000, 15, 13),
(14, '2025-10-21 09:00:00', 'COMPLETED', 500000, 16, 14),
(15, '2025-10-22 10:00:00', 'PENDING', 300000, 17, 15),
(16, '2025-10-20 07:00:00', 'FAILED', 500000, 18, 16),
(17, '2025-10-22 12:00:00', 'PENDING', 500000, 19, 17),
(18, '2025-10-10 13:00:00', 'COMPLETED', 300000, 20, 18),
(19, '2025-10-20 14:00:00', 'COMPLETED', 500000, 21, 19),
(20, '2025-10-21 09:00:00', 'COMPLETED', 500000, 22, 20),
(21, '2025-10-09 08:00:00', 'COMPLETED', 500000, 13, 21),
(22, '2025-10-15 10:00:00', 'COMPLETED', 300000, 14, 22),
(23, '2025-10-21 13:00:00', 'COMPLETED', 500000, 15, 23),
(24, '2025-10-20 12:00:00', 'COMPLETED', 300000, 20, 28),
(25, '2025-10-21 08:00:00', 'COMPLETED', 500000, 21, 29);

SET IDENTITY_INSERT Payment OFF;

PRINT '25 Payments inserted';
GO
*/

PRINT 'Skip Payments seeding (created via app)';
GO

-- ============================================
-- STEP 8: Insert VideoCallSessions (15 records - for ONLINE appointments)
-- ============================================
-- ⚠️ COMMENTED OUT - Phụ thuộc vào appointments
-- ============================================

/*
PRINT 'Inserting VideoCallSessions...';

INSERT INTO Video_Call_Session (appointment_id, connection_status, start_time, end_time) VALUES
(1, 'ENDED', '2025-10-20 09:00:00', '2025-10-20 09:30:00'),
(3, 'PENDING', NULL, NULL),
(4, 'ENDED', '2025-10-19 08:30:00', '2025-10-19 09:15:00'),
(5, 'CONNECTED', '2025-10-22 09:00:00', NULL),
(8, 'ENDED', '2025-10-22 13:00:00', '2025-10-22 13:45:00'),
(9, 'PENDING', NULL, NULL),
(10, 'ENDED', '2025-10-17 10:00:00', '2025-10-17 10:25:00'),
(11, 'PENDING', NULL, NULL),
(13, 'ENDED', '2025-10-16 09:00:00', '2025-10-16 09:40:00'),
(14, 'PENDING', NULL, NULL),
(16, 'PENDING', NULL, NULL),
(17, 'PENDING', NULL, NULL),
(19, 'PENDING', NULL, NULL),
(21, 'ENDED', '2025-10-14 09:30:00', '2025-10-14 10:00:00'),
(23, 'PENDING', NULL, NULL);

PRINT '15 VideoCallSessions inserted';
GO
*/

PRINT 'Skip VideoCallSessions seeding (created via app)';
GO

-- ============================================
-- STEP 9: Insert MedicalRecords (12 records - for finished appointments)
-- ============================================

PRINT 'Skip MedicalRecords seeding (created via app)';
GO

-- ============================================
-- STEP 10: Insert Feedback (10 records)
-- ============================================

PRINT 'Skip Feedback seeding';
GO

-- ============================================
-- STEP 11: Insert Notifications (8 records)
-- ============================================

PRINT 'Skip Notifications seeding';
GO

-- ============================================
-- STEP 12: Insert Schedules (10 records - for doctors)
-- ============================================

PRINT 'Skip Schedules seeding (managed by app)';
GO

-- ============================================
-- FINAL: Summary
-- ============================================

PRINT '';
PRINT '============================================';
PRINT 'Mock Data Generation Complete!';
PRINT '============================================';
PRINT '';

SELECT 'Users' AS TableName, COUNT(*) AS RecordCount FROM Users
UNION ALL
SELECT 'Admin', COUNT(*) FROM Admin
UNION ALL
SELECT 'Doctor', COUNT(*) FROM Doctor
UNION ALL
SELECT 'Patient', COUNT(*) FROM Patient
UNION ALL
SELECT 'Speciality', COUNT(*) FROM speciality
UNION ALL
SELECT '=== TOTAL ===' AS TableName, 
    (SELECT COUNT(*) FROM Users) +
    (SELECT COUNT(*) FROM Admin) +
    (SELECT COUNT(*) FROM Doctor) +
    (SELECT COUNT(*) FROM Patient) +
    (SELECT COUNT(*) FROM speciality) AS RecordCount;

PRINT '';
PRINT 'Note: Firebase UIDs are placeholders (firebase_uid_xxx)';
PRINT 'Please update them after Firebase authentication setup';
PRINT '';
GO

