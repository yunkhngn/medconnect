-- ============================================
-- MedConnect Mock Data Generation Script
-- Total: ~100 records
-- Users: Admin(2) + Doctor(10) + Patient(10) = 22
-- ============================================

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
(1, 'Admin System', 'admin.system@medconnect.vn', '0901000001', 'https://i.pravatar.cc/150?img=1', 'QOw1Uf8Vr0a8JGMMBNzjr7CSXFa2', 'ADMIN'),
(2, 'Admin Manager', 'admin.manager@medconnect.vn', '0901000002', 'https://i.pravatar.cc/150?img=2', 'firebase_uid_admin_2', 'ADMIN');

-- Insert 10 Doctors
INSERT INTO Users (user_id, name, email, phone, avatar_url, firebase_uid, role) VALUES
(3, 'BS. Nguyễn Văn An', 'doctor.an@medconnect.vn', '0902000001', 'https://i.pravatar.cc/150?img=11', '1e094cFqC1XLnblL7Lrd1W4QxLu1', 'DOCTOR'),
(4, 'BS. Trần Thị Bình', 'doctor.binh@medconnect.vn', '0902000002', 'https://i.pravatar.cc/150?img=12', 'firebase_uid_doctor_2', 'DOCTOR'),
(5, 'BS. Lê Hoàng Cường', 'doctor.cuong@medconnect.vn', '0902000003', 'https://i.pravatar.cc/150?img=13', 'firebase_uid_doctor_3', 'DOCTOR'),
(6, 'BS. Phạm Thị Dung', 'doctor.dung@medconnect.vn', '0902000004', 'https://i.pravatar.cc/150?img=14', 'firebase_uid_doctor_4', 'DOCTOR'),
(7, 'BS. Hoàng Văn Em', 'doctor.em@medconnect.vn', '0902000005', 'https://i.pravatar.cc/150?img=15', 'firebase_uid_doctor_5', 'DOCTOR'),
(8, 'BS. Vũ Thị Phương', 'doctor.phuong@medconnect.vn', '0902000006', 'https://i.pravatar.cc/150?img=16', 'firebase_uid_doctor_6', 'DOCTOR'),
(9, 'BS. Đặng Minh Giang', 'doctor.giang@medconnect.vn', '0902000007', 'https://i.pravatar.cc/150?img=17', 'firebase_uid_doctor_7', 'DOCTOR'),
(10, 'BS. Bùi Thị Hà', 'doctor.ha@medconnect.vn', '0902000008', 'https://i.pravatar.cc/150?img=18', 'firebase_uid_doctor_8', 'DOCTOR'),
(11, 'BS. Ngô Văn Hùng', 'doctor.hung@medconnect.vn', '0902000009', 'https://i.pravatar.cc/150?img=19', 'firebase_uid_doctor_9', 'DOCTOR'),
(12, 'BS. Mai Thị Lan', 'doctor.lan@medconnect.vn', '0902000010', 'https://i.pravatar.cc/150?img=20', 'firebase_uid_doctor_10', 'DOCTOR');

-- Insert 10 Patients
INSERT INTO Users (user_id, name, email, phone, avatar_url, firebase_uid, role) VALUES
(13, 'Nguyễn Thị Mai', 'patient.mai@gmail.com', '0903000001', 'https://i.pravatar.cc/150?img=21', 'cOOC9hjI9pYoyZd2pCPKsjxgZmd2', 'PATIENT'),
(14, 'Trần Văn Nam', 'patient.nam@gmail.com', '0903000002', 'https://i.pravatar.cc/150?img=22', 'firebase_uid_patient_2', 'PATIENT'),
(15, 'Lê Thị Oanh', 'patient.oanh@gmail.com', '0903000003', 'https://i.pravatar.cc/150?img=23', 'firebase_uid_patient_3', 'PATIENT'),
(16, 'Phạm Văn Phúc', 'patient.phuc@gmail.com', '0903000004', 'https://i.pravatar.cc/150?img=24', 'firebase_uid_patient_4', 'PATIENT'),
(17, 'Hoàng Thị Quỳnh', 'patient.quynh@gmail.com', '0903000005', 'https://i.pravatar.cc/150?img=25', 'firebase_uid_patient_5', 'PATIENT'),
(18, 'Vũ Văn Sơn', 'patient.son@gmail.com', '0903000006', 'https://i.pravatar.cc/150?img=26', 'firebase_uid_patient_6', 'PATIENT'),
(19, 'Đặng Thị Thảo', 'patient.thao@gmail.com', '0903000007', 'https://i.pravatar.cc/150?img=27', 'firebase_uid_patient_7', 'PATIENT'),
(20, 'Bùi Văn Tùng', 'patient.tung@gmail.com', '0903000008', 'https://i.pravatar.cc/150?img=28', 'firebase_uid_patient_8', 'PATIENT'),
(21, 'Ngô Thị Uyên', 'patient.uyen@gmail.com', '0903000009', 'https://i.pravatar.cc/150?img=29', 'firebase_uid_patient_9', 'PATIENT'),
(22, 'Mai Văn Vũ', 'patient.vu@gmail.com', '0903000010', 'https://i.pravatar.cc/150?img=30', 'firebase_uid_patient_10', 'PATIENT');

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
-- STEP 4: Insert Doctor specific data
-- ============================================

PRINT 'Inserting Doctor data...';

INSERT INTO Doctor (user_id, specialization, license_id, status) VALUES
(3, 'CARDIOLOGY', 'LIC-CARD-001', 'ACTIVE'),
(4, 'CARDIOLOGY', 'LIC-CARD-002', 'ACTIVE'),
(5, 'CARDIOLOGY', 'LIC-CARD-003', 'ACTIVE'),
(6, 'CARDIOLOGY', 'LIC-CARD-004', 'ACTIVE'),
(7, 'CARDIOLOGY', 'LIC-CARD-005', 'ACTIVE'),
(8, 'CARDIOLOGY', 'LIC-CARD-006', 'PENDING'),
(9, 'CARDIOLOGY', 'LIC-CARD-007', 'ACTIVE'),
(10, 'CARDIOLOGY', 'LIC-CARD-008', 'ACTIVE'),
(11, 'CARDIOLOGY', 'LIC-CARD-009', 'INACTIVE'),
(12, 'CARDIOLOGY', 'LIC-CARD-010', 'ACTIVE');

PRINT '10 Doctors inserted';
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

-- ============================================
-- STEP 7: Insert Payments (25 records - for completed/confirmed appointments)
-- ============================================

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

-- ============================================
-- STEP 8: Insert VideoCallSessions (15 records - for ONLINE appointments)
-- ============================================

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

-- ============================================
-- STEP 9: Insert MedicalRecords (12 records - for finished appointments)
-- ============================================

PRINT 'Inserting MedicalRecords...';

DBCC CHECKIDENT ('Medical_Record', RESEED, 0);
GO

SET IDENTITY_INSERT Medical_Record ON;

INSERT INTO Medical_Record (record_id, detail, doctor_id, patient_id, created_at, updated_at) VALUES
(1, 'Triệu chứng: Đau ngực, khó thở. Chẩn đoán: Tăng huyết áp. Đơn thuốc: Amlodipine 5mg x 1 viên/ngày. Tái khám sau 2 tuần.', 3, 13, '2025-10-20 09:35:00', '2025-10-20 09:35:00'),
(2, 'Triệu chứng: Ho, sốt. Chẩn đoán: Viêm phổi nhẹ. Đơn thuốc: Amoxicillin 500mg x 3 lần/ngày x 7 ngày. Nghỉ ngơi, uống nhiều nước.', 3, 14, '2025-10-21 10:30:00', '2025-10-21 10:30:00'),
(3, 'Triệu chứng: Đau đầu, chóng mặt. Chẩn đoán: Migraine. Đơn thuốc: Paracetamol 500mg khi đau. Tránh stress.', 4, 16, '2025-10-19 09:20:00', '2025-10-19 09:20:00'),
(4, 'Triệu chứng: Đau bụng, tiêu chảy. Chẩn đoán: Viêm dạ dày. Đơn thuốc: Omeprazole 20mg x 2 lần/ngày trước ăn. Ăn nhẹ, tránh cay nóng.', 5, 19, '2025-10-18 11:45:00', '2025-10-18 11:45:00'),
(5, 'Triệu chứng: Mệt mỏi, tăng cân. Chẩn đoán: Suy giáp. Xét nghiệm TSH: 8.5. Đơn thuốc: Levothyroxine 50mcg x 1 viên/ngày lúc đói. Tái khám sau 1 tháng.', 5, 20, '2025-10-22 13:50:00', '2025-10-22 13:50:00'),
(6, 'Triệu chứng: Khó thở, ho khè khè. Chẩn đoán: Hen phế quản. Đơn thuốc: Salbutamol inhaler 2 nhát khi cần. Tránh yếu tố kích thích.', 6, 22, '2025-10-17 10:30:00', '2025-10-17 10:30:00'),
(7, 'Triệu chứng: Đau khớp gối. Chẩn đoán: Thoái hóa khớp độ 2. Đơn thuốc: Glucosamine 1500mg/ngày. Vật lý trị liệu. Giảm cân nếu thừa cân.', 7, 15, '2025-10-16 09:45:00', '2025-10-16 09:45:00'),
(8, 'Khám định kỳ. Sức khỏe tốt. Không có vấn đề đặc biệt. Tiếp tục duy trì lối sống lành mạnh.', 9, 20, '2025-10-15 14:40:00', '2025-10-15 14:40:00'),
(9, 'Triệu chứng: Sốt, đau đầu. Chẩn đoán: Cúm mùa. Đơn thuốc: Paracetamol 500mg x 3 lần/ngày. Nghỉ ngơi, uống nhiều nước. Tái khám nếu sốt trên 39°C hoặc không đỡ sau 3 ngày.', 10, 13, '2025-10-14 10:05:00', '2025-10-14 10:05:00'),
(10, 'Triệu chứng: Mụn trứng cá. Chẩn đoán: Acne vulgaris. Đơn thuốc: Benzoyl peroxide gel bôi tối. Rửa mặt 2 lần/ngày. Tái khám sau 1 tháng.', 10, 14, '2025-10-20 11:30:00', '2025-10-20 11:30:00'),
(11, 'Triệu chứng: Buồn chán, mất ngủ. Chẩn đoán: Trầm cảm nhẹ. Tư vấn tâm lý. Đơn thuốc: Sertraline 50mg x 1 viên/ngày buổi sáng. Tái khám sau 2 tuần.', 12, 18, '2025-10-13 09:00:00', '2025-10-13 09:00:00'),
(12, 'Triệu chứng: Đau ngực trái khi gắng sức. Chẩn đoán: Nghi ngờ bệnh mạch vành. Chỉ định: ECG, Siêu âm tim. Tái khám sau khi có kết quả xét nghiệm.', 12, 19, '2025-10-19 11:00:00', '2025-10-19 11:00:00');

SET IDENTITY_INSERT Medical_Record OFF;

PRINT '12 MedicalRecords inserted';
GO

-- ============================================
-- STEP 10: Insert Feedback (10 records)
-- ============================================

PRINT 'Inserting Feedback...';

DBCC CHECKIDENT ('Feedback', RESEED, 0);
GO

SET IDENTITY_INSERT Feedback ON;

INSERT INTO Feedback (feedback_id, comment, rating, created_at, patient, doctor) VALUES
(1, 'Bác sĩ tư vấn rất tận tình và chu đáo. Rất hài lòng!', 5, '2025-10-20 10:00:00', 13, 3),
(2, 'Khám nhanh, chính xác. Đơn thuốc hiệu quả.', 5, '2025-10-21 11:00:00', 14, 3),
(3, 'Bác sĩ nhiệt tình, giải thích rõ ràng dễ hiểu.', 5, '2025-10-19 09:30:00', 16, 4),
(4, 'Khám kỹ càng, tư vấn dinh dưỡng chi tiết.', 4, '2025-10-18 12:00:00', 19, 5),
(5, 'Video call chất lượng tốt, bác sĩ dễ giao tiếp.', 5, '2025-10-22 14:00:00', 20, 5),
(6, 'Phòng khám sạch sẽ, nhân viên thân thiện.', 4, '2025-10-17 11:00:00', 22, 6),
(7, 'Bác sĩ lắng nghe và chia sẻ rất tốt.', 5, '2025-10-16 10:00:00', 15, 7),
(8, 'Khám định kỳ nhanh gọn, chuyên nghiệp.', 4, '2025-10-15 15:00:00', 20, 9),
(9, 'Giải thích bệnh rõ ràng, đơn thuốc hiệu quả.', 5, '2025-10-14 10:30:00', 13, 10),
(10, 'Bác sĩ rất kiên nhẫn và chuyên nghiệp.', 5, '2025-10-20 12:00:00', 14, 10);

SET IDENTITY_INSERT Feedback OFF;

PRINT '10 Feedback inserted';
GO

-- ============================================
-- STEP 11: Insert Notifications (8 records)
-- ============================================

PRINT 'Inserting Notifications...';

DBCC CHECKIDENT ('Notification', RESEED, 0);
GO

SET IDENTITY_INSERT Notification ON;

INSERT INTO Notification (notification_id, created_at, send_at, status, user_id) VALUES
(1, '2025-10-20 08:00:00', 'patient.mai@gmail.com', 'SENT', 13),
(2, '2025-10-21 09:00:00', 'patient.nam@gmail.com', 'SENT', 14),
(3, '2025-10-22 08:00:00', 'patient.quynh@gmail.com', 'SENT', 17),
(4, '2025-10-25 13:00:00', 'patient.oanh@gmail.com', 'PENDING', 15),
(5, '2025-10-26 14:00:00', 'patient.phuc@gmail.com', 'PENDING', 16),
(6, '2025-10-22 08:30:00', 'doctor.an@medconnect.vn', 'SENT', 3),
(7, '2025-10-22 08:35:00', 'doctor.binh@medconnect.vn', 'SENT', 4),
(8, '2025-10-25 12:00:00', 'doctor.cuong@medconnect.vn', 'PENDING', 5);

SET IDENTITY_INSERT Notification OFF;

PRINT '8 Notifications inserted';
GO

-- ============================================
-- STEP 12: Insert Schedules (10 records - for doctors)
-- ============================================

PRINT 'Inserting Schedules...';

DBCC CHECKIDENT ('Schedule', RESEED, 0);
GO

SET IDENTITY_INSERT Schedule ON;

INSERT INTO Schedule (schedule_id, status, date, slot, user_id) VALUES
-- Doctor 1 schedules (next week)
(1, 'AVAILABLE', '2025-10-28', '09:00:00', 3),
(2, 'AVAILABLE', '2025-10-28', '14:00:00', 3),
(3, 'AVAILABLE', '2025-10-29', '10:00:00', 3),

-- Doctor 2 schedules
(4, 'AVAILABLE', '2025-10-28', '08:30:00', 4),
(5, 'BOOKED', '2025-10-29', '09:00:00', 4),

-- Doctor 3 schedules
(6, 'AVAILABLE', '2025-10-28', '11:00:00', 5),
(7, 'AVAILABLE', '2025-10-29', '13:00:00', 5),

-- Doctor 4 schedules
(8, 'AVAILABLE', '2025-10-30', '10:00:00', 6),

-- Doctor 5 schedules
(9, 'AVAILABLE', '2025-10-28', '15:00:00', 7),
(10, 'AVAILABLE', '2025-10-31', '09:00:00', 12);

SET IDENTITY_INSERT Schedule OFF;

PRINT '10 Schedules inserted';
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
SELECT 'Appointment', COUNT(*) FROM Appointment
UNION ALL
SELECT 'Payment', COUNT(*) FROM Payment
UNION ALL
SELECT 'Video_Call_Session', COUNT(*) FROM Video_Call_Session
UNION ALL
SELECT 'Medical_Record', COUNT(*) FROM Medical_Record
UNION ALL
SELECT 'Feedback', COUNT(*) FROM Feedback
UNION ALL
SELECT 'Notification', COUNT(*) FROM Notification
UNION ALL
SELECT 'Schedule', COUNT(*) FROM Schedule
UNION ALL
SELECT '=== TOTAL ===' AS TableName, 
    (SELECT COUNT(*) FROM Users) +
    (SELECT COUNT(*) FROM Appointment) +
    (SELECT COUNT(*) FROM Payment) +
    (SELECT COUNT(*) FROM Video_Call_Session) +
    (SELECT COUNT(*) FROM Medical_Record) +
    (SELECT COUNT(*) FROM Feedback) +
    (SELECT COUNT(*) FROM Notification) +
    (SELECT COUNT(*) FROM Schedule) AS RecordCount;

PRINT '';
PRINT 'Note: Firebase UIDs are placeholders (firebase_uid_xxx)';
PRINT 'Please update them after Firebase authentication setup';
PRINT '';
GO

