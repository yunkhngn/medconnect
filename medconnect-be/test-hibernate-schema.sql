-- ========================================
-- Test Hibernate Schema Generation
-- Run this AFTER rebuilding and restarting Spring Boot
-- ========================================

USE MEDCONNECT_DB;
GO

PRINT '📋 Checking Medical_Record table schema...';
PRINT '';

-- Check if table exists
IF OBJECT_ID('dbo.Medical_Record', 'U') IS NOT NULL
BEGIN
    -- Show all columns
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CASE 
            WHEN CHARACTER_MAXIMUM_LENGTH = -1 THEN 'MAX'
            ELSE CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR)
        END AS LENGTH,
        IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Medical_Record'
    ORDER BY ORDINAL_POSITION;
    
    PRINT '';
    PRINT '🔍 Checking detail column specifically:';
    
    DECLARE @dataType NVARCHAR(50);
    SELECT @dataType = DATA_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Medical_Record' AND COLUMN_NAME = 'detail';
    
    IF @dataType = 'nvarchar'
    BEGIN
        PRINT '✅ SUCCESS! detail column is NVARCHAR(MAX)';
        PRINT '🎉 Hibernate is now correctly configured!';
    END
    ELSE IF @dataType = 'text'
    BEGIN
        PRINT '❌ FAIL! detail column is still TEXT';
        PRINT '⚠️ Maven classes were not rebuilt properly.';
        PRINT '';
        PRINT '💡 Solutions:';
        PRINT '   1. Stop Spring Boot';
        PRINT '   2. Run: mvn clean compile';
        PRINT '   3. Drop database';
        PRINT '   4. Restart Spring Boot';
    END
    ELSE
    BEGIN
        PRINT '⚠️ Unexpected type: ' + @dataType;
    END
END
ELSE
BEGIN
    PRINT '⚠️ Medical_Record table does not exist';
    PRINT '💡 Start Spring Boot to create it';
END
GO

