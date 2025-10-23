-- ========================================
-- Clear all Medical Record data
-- This removes potentially invalid JSON data
-- ========================================

USE MEDCONNECT_DB;
GO

PRINT '🗑️ Clearing Medical_Record table...';

-- Delete all records
DELETE FROM Medical_Record;
GO

PRINT '✅ All Medical_Record data cleared!';
PRINT '';
PRINT '📋 Next steps:';
PRINT '   1. Refresh frontend page';
PRINT '   2. Create new EMR with fixed code';
PRINT '   3. Should work now!';
GO

-- Verify
SELECT COUNT(*) AS remaining_records FROM Medical_Record;
GO

