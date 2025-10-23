-- Check user role và doctor profile
USE MedConnect;
GO

-- Lấy Firebase UID của user hiện tại từ frontend console
-- Thay thế <YOUR_FIREBASE_UID> bằng UID thực tế

DECLARE @uid NVARCHAR(255) = '<YOUR_FIREBASE_UID>'; -- Copy từ console log

SELECT 
    u.user_id,
    u.firebase_uid,
    u.name,
    u.email,
    u.phone,
    u.role AS user_role,
    d.user_id AS doctor_id,
    s.name AS speciality
FROM [User] u
LEFT JOIN Doctor d ON u.user_id = d.user_id
LEFT JOIN speciality s ON d.speciality_id = s.speciality_id
WHERE u.firebase_uid = @uid;
GO

-- Nếu role không phải DOCTOR, fix bằng:
-- UPDATE [User] SET role = 'DOCTOR' WHERE firebase_uid = '<YOUR_FIREBASE_UID>';

