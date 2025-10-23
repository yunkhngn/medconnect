-- ========================================
-- MANUAL FIX: Alter Medical_Record table
-- Run this AFTER Hibernate creates the table
-- ========================================

USE MEDCONNECT_DB;
GO

PRINT '🔍 Checking current schema...';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Medical_Record' 
AND COLUMN_NAME = 'detail';
GO

PRINT '🔧 Altering detail column...';
ALTER TABLE Medical_Record
ALTER COLUMN detail NVARCHAR(MAX);
GO

PRINT '✅ Column altered!';
PRINT '📊 New schema:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Medical_Record' 
AND COLUMN_NAME = 'detail';
GO

PRINT '';
PRINT '🎉 Done! You do NOT need to restart Spring Boot.';
PRINT '📋 Now test creating EMR in frontend.';
GO

