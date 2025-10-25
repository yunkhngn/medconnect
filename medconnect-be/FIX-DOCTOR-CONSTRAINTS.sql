-- ================================================
-- FIX DOCTOR TABLE CONSTRAINTS
-- Xóa các constraints cũ trước khi xóa cột
-- ================================================

PRINT '=== KIỂM TRA VÀ XÓA CONSTRAINTS ===';
PRINT '';

-- 1. Tìm và xóa Unique Constraint trên license_id
DECLARE @UniqueConstraintName NVARCHAR(255);
SELECT @UniqueConstraintName = name
FROM sys.key_constraints
WHERE parent_object_id = OBJECT_ID('Doctor')
  AND type = 'UQ'
  AND name LIKE '%license_id%' OR name = 'UKtc8hbqdl1ukbvnjbi53cc0pfn';

IF @UniqueConstraintName IS NOT NULL
BEGIN
    DECLARE @SqlUnique NVARCHAR(500);
    SET @SqlUnique = 'ALTER TABLE Doctor DROP CONSTRAINT ' + @UniqueConstraintName;
    EXEC sp_executesql @SqlUnique;
    PRINT '✓ Đã xóa Unique Constraint: ' + @UniqueConstraintName;
END
ELSE
BEGIN
    PRINT '○ Không tìm thấy Unique Constraint trên license_id';
END

PRINT '';

-- 2. Tìm và xóa Check Constraint trên specialization
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
    PRINT '○ Không tìm thấy Check Constraint trên specialization';
END

PRINT '';

-- 3. Liệt kê tất cả constraints còn lại trên Doctor table
PRINT '=== CONSTRAINTS CÒN LẠI ===';
SELECT 
    c.name AS ConstraintName,
    c.type_desc AS ConstraintType,
    OBJECT_NAME(c.parent_object_id) AS TableName
FROM sys.objects c
WHERE c.parent_object_id = OBJECT_ID('Doctor')
  AND c.type IN ('C', 'UQ', 'F', 'PK', 'D')
ORDER BY c.type_desc, c.name;

PRINT '';
PRINT '=== HOÀN TẤT ===';
PRINT 'Giờ có thể chạy CLEANUP-DOCTOR-TABLE.sql để xóa các cột';

