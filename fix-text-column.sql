-- Fix TEXT column type issue in appointment table
-- TEXT is deprecated in SQL Server and causes "conversion from text to NCHAR" errors
-- Change to NVARCHAR(MAX)

ALTER TABLE appointment
ALTER COLUMN reason NVARCHAR(MAX);

-- Verify the change
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'appointment' AND COLUMN_NAME = 'reason';
