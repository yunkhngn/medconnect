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
(1, N'Admin System', 'admin.system@medconnect.vn', '0901000001', NULL, 'QOw1Uf8Vr0a8JGMMBNzjr7CSXFa2', 'ADMIN');

-- Insert 10 Doctors
INSERT INTO Users (user_id, name, email, phone, avatar_url, firebase_uid, role) VALUES
(3, N'BS. Nguyễn Văn An', 'doctor.an@medconnect.vn', '0902000001', NULL, '1e094cFqC1XLnblL7Lrd1W4QxLu1', 'DOCTOR'),
(4, N'BS. Trần Thị Bình', 'doctor.binh@medconnect.vn', '0902000002', NULL, 'stw8uXWPwHXr7diCNyEdFMWDg1I2', 'DOCTOR'),
(5, N'BS. Lê Hoàng Cường', 'doctor.cuong@medconnect.vn', '0902000003', NULL, '0aGcNFS8bcRCCTZwTVVEzbjNEoj2', 'DOCTOR'),
(6, N'BS. Phạm Thị Dung', 'doctor.dung@medconnect.vn', '0902000004', NULL, 'WY1U1zrri5fU66mMiyrzGlOQsW02', 'DOCTOR');

-- Insert 10 Patients
INSERT INTO Users (user_id, name, email, phone, avatar_url, firebase_uid, role) VALUES
(7, N'Nguyễn Thị Mai', 'patient.mai@gmail.com', '0903000001', NULL, 'cOOC9hjI9pYoyZd2pCPKsjxgZmd2', 'PATIENT');

SET IDENTITY_INSERT Users OFF;

PRINT '22 Users inserted successfully';
GO

-- ============================================
-- STEP 3: Insert Admin specific data
-- ============================================

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
(6, 2, 'ACTIVE', 8,  N'Bác sĩ CKI',    N'Bác sĩ nội tổng quát 8 năm kinh nghiệm', N'12 Đường JKL, Quận 4', 79, N'TP. Hồ Chí Minh', 773, 27211, N'Phường Bến Nghé');


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
(7, '001195000123', 'SI-001195000123');

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

