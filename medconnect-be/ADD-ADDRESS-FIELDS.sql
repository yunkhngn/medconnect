-- =====================================================
-- ADD ADDRESS FIELDS TO PATIENT & DOCTOR TABLES
-- =====================================================
-- Run this script to add structured address fields
-- for calculating distance and filtering by location
-- =====================================================

USE MedConnect;
GO

-- =====================================================
-- 1. ADD ADDRESS FIELDS TO PATIENT TABLE
-- =====================================================
-- Patient chỉ cần lưu province, district, ward (không cần detail)
-- Dùng để tính khoảng cách sau này

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Patient]') AND name = 'province_code')
BEGIN
    ALTER TABLE [dbo].[Patient]
    ADD 
        province_code INT NULL,
        province_name NVARCHAR(100) NULL,
        district_code INT NULL,
        district_name NVARCHAR(100) NULL,
        ward_code INT NULL,
        ward_name NVARCHAR(100) NULL;
    
    PRINT '✅ Added address fields to Patient table';
END
ELSE
BEGIN
    PRINT '⚠️ Patient address fields already exist, skipping...';
END
GO

-- =====================================================
-- 2. ADD ADDRESS FIELDS TO DOCTOR TABLE
-- =====================================================
-- Doctor cần lưu address chi tiết hơn (có detail)
-- Giúp patient biết địa chỉ phòng khám

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Doctor]') AND name = 'province_code')
BEGIN
    ALTER TABLE [dbo].[Doctor]
    ADD 
        province_code INT NULL,
        province_name NVARCHAR(100) NULL,
        district_code INT NULL,
        district_name NVARCHAR(100) NULL,
        ward_code INT NULL,
        ward_name NVARCHAR(100) NULL;
    
    PRINT '✅ Added address fields to Doctor table';
END
ELSE
BEGIN
    PRINT '⚠️ Doctor address fields already exist, skipping...';
END
GO

-- =====================================================
-- 3. ADD INDEX FOR BETTER QUERY PERFORMANCE
-- =====================================================
-- Index for searching doctors by location

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Doctor_Location' AND object_id = OBJECT_ID('Doctor'))
BEGIN
    CREATE INDEX IX_Doctor_Location ON Doctor(province_code, district_code, ward_code);
    PRINT '✅ Created index IX_Doctor_Location';
END
GO

-- Index for searching patients by location (for future analytics)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Patient_Location' AND object_id = OBJECT_ID('Patient'))
BEGIN
    CREATE INDEX IX_Patient_Location ON Patient(province_code, district_code, ward_code);
    PRINT '✅ Created index IX_Patient_Location';
END
GO

PRINT '';
PRINT '========================================';
PRINT '✅ MIGRATION COMPLETED SUCCESSFULLY!';
PRINT '========================================';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Restart backend application';
PRINT '2. Test address selector in frontend';
PRINT '3. Update mock data (optional)';
GO

