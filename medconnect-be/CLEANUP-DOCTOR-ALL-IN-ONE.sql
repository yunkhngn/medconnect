-- ================================================
-- CLEANUP DOCTOR TABLE - ALL IN ONE
-- Bước 1: Xóa constraints
-- Bước 2: Xóa các cột cũ
-- ================================================

PRINT '╔════════════════════════════════════════╗';
PRINT '║  CLEANUP DOCTOR TABLE - ALL IN ONE     ║';
PRINT '╚════════════════════════════════════════╝';
PRINT '';

-- ============================================
-- BƯỚC 0: XÓA DATA TRONG BẢNG LICENSE (OPTIONAL)
-- ============================================
PRINT '━━━ BƯỚC 0: XÓA DATA TRONG BẢNG LICENSE (OPTIONAL) ━━━';
PRINT '';

-- Nếu bảng License tồn tại, xóa tất cả data
IF OBJECT_ID('License', 'U') IS NOT NULL
BEGIN
    DELETE FROM License;
    PRINT '✓ Đã xóa tất cả data trong bảng License';
    PRINT '  (Bảng License vẫn còn, chỉ xóa data)';
END
ELSE
BEGIN
    PRINT '○ Bảng License chưa tồn tại';
END

PRINT '';

-- ============================================
-- BƯỚC 1: XÓA CONSTRAINTS
-- ============================================
PRINT '━━━ BƯỚC 1: XÓA CONSTRAINTS ━━━';
PRINT '';

-- 1.1. Xóa Unique Constraint trên license_id
DECLARE @UniqueConstraintName NVARCHAR(255);
SELECT @UniqueConstraintName = name
FROM sys.key_constraints
WHERE parent_object_id = OBJECT_ID('Doctor')
  AND type = 'UQ';

IF @UniqueConstraintName IS NOT NULL
BEGIN
    DECLARE @SqlUnique NVARCHAR(500);
    SET @SqlUnique = 'ALTER TABLE Doctor DROP CONSTRAINT ' + @UniqueConstraintName;
    EXEC sp_executesql @SqlUnique;
    PRINT '✓ Đã xóa Unique Constraint: ' + @UniqueConstraintName;
END
ELSE
BEGIN
    PRINT '○ Không có Unique Constraint cần xóa';
END

-- 1.2. Xóa Check Constraint trên specialization
DECLARE @CheckConstraintName NVARCHAR(255);
SELECT @CheckConstraintName = name
FROM sys.check_constraints
WHERE parent_object_id = OBJECT_ID('Doctor')
  AND OBJECT_DEFINITION(object_id) LIKE '%specialization%';

IF @CheckConstraintName IS NOT NULL
BEGIN
    DECLARE @SqlCheck NVARCHAR(500);
    SET @SqlCheck = 'ALTER TABLE Doctor DROP CONSTRAINT ' + @CheckConstraintName;
    EXEC sp_executesql @SqlCheck;
    PRINT '✓ Đã xóa Check Constraint: ' + @CheckConstraintName;
END
ELSE
BEGIN
    PRINT '○ Không có Check Constraint cần xóa';
END

PRINT '';

-- ============================================
-- BƯỚC 2: XÓA CÁC CỘT CŨ
-- ============================================
PRINT '━━━ BƯỚC 2: XÓA CÁC CỘT CŨ ━━━';
PRINT '';

-- 2.1. Xóa cột specialization (enum cũ)
IF COL_LENGTH('Doctor', 'specialization') IS NOT NULL
BEGIN
    ALTER TABLE Doctor DROP COLUMN specialization;
    PRINT '✓ Đã xóa cột: specialization';
END
ELSE
BEGIN
    PRINT '○ Cột specialization không tồn tại';
END

-- 2.2. Xóa cột license_id
IF COL_LENGTH('Doctor', 'license_id') IS NOT NULL
BEGIN
    ALTER TABLE Doctor DROP COLUMN license_id;
    PRINT '✓ Đã xóa cột: license_id';
END
ELSE
BEGIN
    PRINT '○ Cột license_id không tồn tại';
END

-- 2.3. Xóa cột license_number
IF COL_LENGTH('Doctor', 'license_number') IS NOT NULL
BEGIN
    ALTER TABLE Doctor DROP COLUMN license_number;
    PRINT '✓ Đã xóa cột: license_number';
END
ELSE
BEGIN
    PRINT '○ Cột license_number không tồn tại';
END

-- 2.4. Xóa cột license_issued_date
IF COL_LENGTH('Doctor', 'license_issued_date') IS NOT NULL
BEGIN
    ALTER TABLE Doctor DROP COLUMN license_issued_date;
    PRINT '✓ Đã xóa cột: license_issued_date';
END
ELSE
BEGIN
    PRINT '○ Cột license_issued_date không tồn tại';
END

-- 2.5. Xóa cột license_expiry_date
IF COL_LENGTH('Doctor', 'license_expiry_date') IS NOT NULL
BEGIN
    ALTER TABLE Doctor DROP COLUMN license_expiry_date;
    PRINT '✓ Đã xóa cột: license_expiry_date';
END
ELSE
BEGIN
    PRINT '○ Cột license_expiry_date không tồn tại';
END

PRINT '';

-- ============================================
-- BƯỚC 3: KIỂM TRA KẾT QUẢ
-- ============================================
PRINT '━━━ BƯỚC 3: KẾT QUẢ ━━━';
PRINT '';

-- Hiển thị các cột còn lại
PRINT 'Các cột còn lại trong bảng Doctor:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Doctor'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '╔════════════════════════════════════════╗';
PRINT '║          CLEANUP HOÀN TẤT!             ║';
PRINT '╠════════════════════════════════════════╣';
PRINT '║ Các cột còn lại nên là:               ║';
PRINT '║  • user_id                             ║';
PRINT '║  • speciality_id                       ║';
PRINT '║  • status                              ║';
PRINT '║  • experience_years                    ║';
PRINT '╚════════════════════════════════════════╝';

