-- Create MedConnect database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MedConnect')
BEGIN
    CREATE DATABASE MedConnect;
    PRINT 'Database MedConnect created successfully';
END
ELSE
BEGIN
    PRINT 'Database MedConnect already exists';
END
GO

USE MedConnect;
GO

-- Your table schemas will go here
-- Add your tables as needed
