-- ================================================
-- CLEANUP DOCTOR TABLE
-- Xóa các cột không còn sử dụng sau khi migrate sang Speciality và License
-- ================================================

-- Kiểm tra các cột hiện tại
PRINT '=== TRƯỚC KHI XÓA ===';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Doctor'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '=== BẮT ĐẦU CLEANUP ===';

-- 1. Xóa cột specialization (enum cũ → speciality_id FK)
IF COL_LENGTH('Doctor', 'specialization') IS NOT NULL
BEGIN
    ALTER TABLE Doctor DROP COLUMN specialization;
    PRINT '✓ Đã xóa: specialization';
END
ELSE
BEGIN
    PRINT '○ Không tồn tại: specialization';
END

-- 2. Xóa cột license_issued_date (→ License table)
IF COL_LENGTH('Doctor', 'license_issued_date') IS NOT NULL
BEGIN
    ALTER TABLE Doctor DROP COLUMN license_issued_date;
    PRINT '✓ Đã xóa: license_issued_date';
END
ELSE
BEGIN
    PRINT '○ Không tồn tại: license_issued_date';
END

-- 3. Xóa cột license_expiry_date (→ License table)
IF COL_LENGTH('Doctor', 'license_expiry_date') IS NOT NULL
BEGIN
    ALTER TABLE Doctor DROP COLUMN license_expiry_date;
    PRINT '✓ Đã xóa: license_expiry_date';
END
ELSE
BEGIN
    PRINT '○ Không tồn tại: license_expiry_date';
END

-- 4. Xóa cột license_number (→ License table)
IF COL_LENGTH('Doctor', 'license_number') IS NOT NULL
BEGIN
    ALTER TABLE Doctor DROP COLUMN license_number;
    PRINT '✓ Đã xóa: license_number';
END
ELSE
BEGIN
    PRINT '○ Không tồn tại: license_number';
END

-- 5. Xóa cột license_id (→ License table)
IF COL_LENGTH('Doctor', 'license_id') IS NOT NULL
BEGIN
    ALTER TABLE Doctor DROP COLUMN license_id;
    PRINT '✓ Đã xóa: license_id';
END
ELSE
BEGIN
    PRINT '○ Không tồn tại: license_id';
END

PRINT '';
PRINT '=== SAU KHI XÓA ===';

-- Kiểm tra kết quả
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Doctor'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '=== CLEANUP HOÀN TẤT ===';
PRINT 'Các cột còn lại nên là: user_id, speciality_id, status, experience_years';
