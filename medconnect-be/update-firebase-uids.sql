-- ============================================
-- Update Firebase UIDs for existing users
-- ============================================

USE MedConnect;
GO

PRINT 'Updating Firebase UIDs...';

-- Update Admin
UPDATE Users 
SET firebase_uid = 'QOw1Uf8Vr0a8JGMMBNzjr7CSXFa2' 
WHERE email = 'admin.system@medconnect.vn';

-- Update Doctor
UPDATE Users 
SET firebase_uid = '1e094cFqC1XLnblL7Lrd1W4QxLu1' 
WHERE email = 'doctor.an@medconnect.vn';

-- Update Patient
UPDATE Users 
SET firebase_uid = 'cOOC9hjI9pYoyZd2pCPKsjxgZmd2' 
WHERE email = 'patient.mai@gmail.com';

PRINT 'Firebase UIDs updated successfully!';
GO

-- Verify updates
SELECT 
    user_id,
    name,
    email,
    firebase_uid,
    role
FROM Users
WHERE email IN (
    'admin.system@medconnect.vn',
    'doctor.an@medconnect.vn', 
    'patient.mai@gmail.com'
);
GO

