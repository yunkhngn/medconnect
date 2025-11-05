-- ============================================
-- MedConnect Mock Data Generation Script
-- Total: ~100 records
-- Users: Admin(2) + Doctor(10) + Patient(10) = 22
-- ============================================
USE MedConnect;
GO

-- ============================================
-- STEP 1: Clear all existing data 
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

INSERT INTO speciality (speciality_id, name, description, online_price, offline_price, created_at, updated_at) VALUES
(1, N'Tim mạch', N'Chuyên khoa tim mạch, điều trị các bệnh về tim và mạch máu', 300000, 500000, GETDATE(), GETDATE()),
(2, N'Nội khoa', N'Chuyên khoa nội tổng quát, điều trị các bệnh nội khoa', 250000, 400000, GETDATE(), GETDATE()),
(3, N'Nhi khoa', N'Chuyên khoa nhi, chăm sóc sức khỏe trẻ em', 200000, 350000, GETDATE(), GETDATE()),
(4, N'Da liễu', N'Chuyên khoa da liễu, điều trị các bệnh về da', 180000, 300000, GETDATE(), GETDATE()),
(5, N'Tai mũi họng', N'Chuyên khoa tai mũi họng, điều trị các bệnh về tai, mũi, họng', 220000, 380000, GETDATE(), GETDATE()),
(6, N'Mắt', N'Chuyên khoa mắt, điều trị các bệnh về mắt', 250000, 420000, GETDATE(), GETDATE()),
(7, N'Răng hàm mặt', N'Chuyên khoa răng hàm mặt, điều trị các bệnh về răng', 200000, 400000, GETDATE(), GETDATE()),
(8, N'Thần kinh', N'Chuyên khoa thần kinh, điều trị các bệnh về thần kinh', 350000, 600000, GETDATE(), GETDATE()),
(9, N'Sản phụ khoa', N'Chuyên khoa sản phụ khoa, chăm sóc sức khỏe phụ nữ', 280000, 480000, GETDATE(), GETDATE()),
(10, N'Chỉnh hình', N'Chuyên khoa chỉnh hình, điều trị các bệnh về xương khớp', 320000, 550000, GETDATE(), GETDATE());

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
--          province_code, province_name, district_code, ward_code, ward_name
INSERT INTO Doctor (
  user_id, speciality_id, status, experience_years, education_level, bio, clinic_address,
  province_code, province_name, district_code, ward_code, ward_name
) VALUES
(3, 1, 'ACTIVE', 15, N'Tiến sĩ Y khoa', N'Bác sĩ tim mạch 15 năm kinh nghiệm', N'123 Đường ABC, Quận 1', 79, N'TP. Hồ Chí Minh', 760, 26734, N'Phường Bến Nghé'),
(4, 1, 'ACTIVE', 10, N'Thạc sĩ Y khoa', N'Bác sĩ tim mạch 10 năm kinh nghiệm', N'456 Đường DEF, Quận 2', 79, N'TP. Hồ Chí Minh', 769, 26806, N'Phường Thủ Thiêm'),
(5, 2, 'ACTIVE', 12, N'Tiến sĩ Y khoa', N'Bác sĩ nội khoa 12 năm kinh nghiệm', N'789 Đường GHI, Quận 3', 79, N'TP. Hồ Chí Minh', 772, 27199, N'Phường Võ Thị Sáu'),
(6, 2, 'ACTIVE', 8,  N'Bác sĩ CKI',    N'Bác sĩ nội tổng quát 8 năm kinh nghiệm', N'12 Đường JKL, Quận 4', 79, N'TP. Hồ Chí Minh', 773, 27211, N'Phường Bến Nghé'),
(7, 3, 'ACTIVE', 14, N'Thạc sĩ Nhi',   N'Bác sĩ nhi khoa 14 năm kinh nghiệm', N'34 Đường MNO, Quận 5', 79, N'TP. Hồ Chí Minh', 774, 27235, N'Phường 7'),
(8, 4, 'PENDING', 6, N'Bác sĩ CKI',    N'Bác sĩ da liễu 6 năm kinh nghiệm', N'56 Đường PQR, Quận 6', 79, N'TP. Hồ Chí Minh', 775, 27247, N'Phường 11'),
(9, 5, 'ACTIVE', 11, N'Bác sĩ CKII',   N'Bác sĩ tai mũi họng 11 năm', N'78 Đường STU, Quận 7', 79, N'TP. Hồ Chí Minh', 769, 26809, N'Phường An Khánh'),
(10,1, 'ACTIVE', 9,  N'Thạc sĩ Y khoa',N'Bác sĩ tim mạch 9 năm kinh nghiệm', N'90 Đường VWX, Quận 8', 79, N'TP. Hồ Chí Minh', 776, 27271, N'Phường 5'),
(11,2, 'INACTIVE',20,N'Tiến sĩ Nội',   N'Bác sĩ nội khoa 20 năm kinh nghiệm', N'12 Đường YZA, Quận 10',79, N'TP. Hồ Chí Minh', 777, 27307, N'Phường 4'),
(12,3, 'ACTIVE', 7,  N'Bác sĩ CKI',    N'Bác sĩ nhi khoa 7 năm kinh nghiệm', N'34 Đường BCD, Quận 11',79, N'TP. Hồ Chí Minh', 778, 27331, N'Phường 13');

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
SELECT 'Speciality', COUNT(*) FROM Speciality
UNION ALL
SELECT '=== TOTAL ===' AS TableName, 
    (SELECT COUNT(*) FROM Users) +
    (SELECT COUNT(*) FROM Admin) +
    (SELECT COUNT(*) FROM Doctor) +
    (SELECT COUNT(*) FROM Patient) +
    (SELECT COUNT(*) FROM Speciality) AS RecordCount;

PRINT '';
PRINT 'Note: Firebase UIDs are placeholders (firebase_uid_xxx)';
PRINT 'Please update them after Firebase authentication setup';
PRINT '';
GO

