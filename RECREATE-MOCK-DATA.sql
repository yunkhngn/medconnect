-- Mock Data Script for MedConnect
-- Run this after clearing the database

-- Enable IDENTITY_INSERT for tables that need it
SET IDENTITY_INSERT speciality ON;

-- Insert Specialities
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

SET IDENTITY_INSERT speciality OFF;

-- Insert Users (Admin, Doctors, Patients)
INSERT INTO users (firebase_uid, email, name, phone, role, avatar_url) VALUES
-- Admin
('admin123', 'admin@medconnect.vn', N'Quản trị viên', '0123456789', 'ADMIN', NULL),

-- Doctors
('doctor.an@medconnect.vn', 'doctor.an@medconnect.vn', N'BS. Nguyễn Văn An', '0986651076', 'DOCTOR', NULL),
('doctor.binh@medconnect.vn', 'doctor.binh@medconnect.vn', N'BS. Trần Thị Bình', '0987654321', 'DOCTOR', NULL),
('doctor.cuong@medconnect.vn', 'doctor.cuong@medconnect.vn', N'BS. Lê Văn Cường', '0987654322', 'DOCTOR', NULL),

-- Patients
('patient.mai@gmail.com', 'patient.mai@gmail.com', N'Nguyễn Thị Mai', '0376971168', 'PATIENT', NULL),
('patient.khoa@gmail.com', 'patient.khoa@gmail.com', N'Khoa Nguyễn', '0376971169', 'PATIENT', NULL),
('patient.linh@gmail.com', 'patient.linh@gmail.com', N'Phạm Thị Linh', '0376971170', 'PATIENT', NULL);

-- Insert Admin
INSERT INTO admin (user_id, policy, service_config) VALUES
(1, N'{"allow_all": true}', N'{"max_users": 1000}');

-- Insert Doctors
INSERT INTO doctor (user_id, speciality_id, experience_years, bio, clinic_address, education_level, province_code, province_name, district_code, district_name, ward_code, ward_name, status) VALUES
(2, 9, 12, N'Bác sĩ chuyên khoa Sản phụ khoa với 12 năm kinh nghiệm', N'123 Đường ABC, Quận 1', N'Tiến sĩ Y khoa', '79', N'TP. Hồ Chí Minh', '760', N'Quận 1', '26734', N'Phường Bến Nghé', 'ACTIVE'),
(3, 1, 8, N'Bác sĩ chuyên khoa Tim mạch với 8 năm kinh nghiệm', N'456 Đường DEF, Quận 2', N'Thạc sĩ Y khoa', '79', N'TP. Hồ Chí Minh', '769', N'Quận 2', '26806', N'Phường Thủ Thiêm', 'ACTIVE'),
(4, 2, 15, N'Bác sĩ chuyên khoa Nội khoa với 15 năm kinh nghiệm', N'789 Đường GHI, Quận 3', N'Tiến sĩ Y khoa', '79', N'TP. Hồ Chí Minh', '772', N'Quận 3', '27199', N'Phường Võ Thị Sáu', 'ACTIVE');

-- Insert Patients
INSERT INTO patient (user_id, date_of_birth, gender, blood_type, address, citizenship, social_insurance, insurance_valid_to, allergies, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, province_code, province_name, district_code, district_name, ward_code, ward_name) VALUES
(5, '1995-03-15', N'Nữ', N'A', N'Hà Đông, Hà Nội', '036205002024', 'HS4012323232332', '2030-03-20', N'Tôm, Sứa', N'Phạm Dung', '0376971169', N'Mẹ', '01', N'Hà Nội', '001', N'Quận Hà Đông', '00001', N'Phường Phúc La'),
(6, '2005-04-12', N'Nam', N'B', N'Hà Đông, Hà Nội', '036205002025', 'HS4012323232333', '2030-04-20', N'Không có', N'Nguyễn Minh', '0376971170', N'Bố', '01', N'Hà Nội', '001', N'Quận Hà Đông', '00001', N'Phường Phúc La'),
(7, '1998-07-20', N'Nữ', N'O', N'Quận 1, TP.HCM', '036205002026', 'HS4012323232334', '2030-07-20', N'Penicillin', N'Phạm Văn Nam', '0376971171', N'Chồng', '79', N'TP. Hồ Chí Minh', '760', N'Quận 1', '26734', N'Phường Bến Nghé');

-- Insert Licenses for Doctors
INSERT INTO license (doctor_id, license_number, issued_date, expiry_date, issuer_title, scope_of_practice, notes, proof_document_url, created_at, updated_at) VALUES
(2, '000001/BYT-GPHN', '2015-01-15', '2030-01-15', N'Bộ Y tế', N'Chuyên khoa Sản phụ khoa', N'Giấy phép hành nghề chuyên khoa', NULL, GETDATE(), GETDATE()),
(3, '000002/BYT-GPHN', '2016-03-20', '2031-03-20', N'Bộ Y tế', N'Chuyên khoa Tim mạch', N'Giấy phép hành nghề chuyên khoa', NULL, GETDATE(), GETDATE()),
(4, '000003/BYT-GPHN', '2014-06-10', '2029-06-10', N'Bộ Y tế', N'Chuyên khoa Nội khoa', N'Giấy phép hành nghề chuyên khoa', NULL, GETDATE(), GETDATE());

-- Insert some sample schedules (optional - for testing)
INSERT INTO schedule (user_id, date, slot, status, created_at, updated_at) VALUES
(2, '2025-10-29', 'SLOT_1', 'RESERVED', GETDATE(), GETDATE()),
(2, '2025-10-29', 'SLOT_2', 'RESERVED', GETDATE(), GETDATE()),
(2, '2025-10-30', 'SLOT_1', 'RESERVED', GETDATE(), GETDATE()),
(3, '2025-10-29', 'SLOT_3', 'RESERVED', GETDATE(), GETDATE()),
(3, '2025-10-30', 'SLOT_2', 'RESERVED', GETDATE(), GETDATE()),
(4, '2025-10-29', 'SLOT_4', 'RESERVED', GETDATE(), GETDATE());

-- Insert some sample appointments (optional - for testing)
INSERT INTO appointment (patient_id, doctor_id, date, slot, type, reason, status, created_at, updated_at) VALUES
(5, 2, '2025-10-29', 'SLOT_1', 'ONLINE', N'Khám thai định kỳ', 'PENDING', GETDATE(), GETDATE()),
(6, 3, '2025-10-29', 'SLOT_3', 'ONLINE', N'Khám tim mạch', 'CONFIRMED', GETDATE(), GETDATE()),
(7, 4, '2025-10-29', 'SLOT_4', 'ONLINE', N'Khám nội tổng quát', 'PENDING', GETDATE(), GETDATE());

PRINT 'Mock data inserted successfully!';
