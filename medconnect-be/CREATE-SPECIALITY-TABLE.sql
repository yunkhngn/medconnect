-- ============================================
-- CREATE SPECIALITY TABLE
-- ============================================
-- This script creates a new Speciality table and migrates
-- Doctor.specialization from ENUM to foreign key relationship
-- ============================================

USE g1medconnect;

-- ============================================
-- STEP 1: Create Speciality table
-- ============================================

CREATE TABLE IF NOT EXISTS speciality (
    speciality_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- ============================================
-- STEP 2: Insert Speciality data
-- ============================================

INSERT INTO speciality (speciality_id, name, description) VALUES
(1, 'Tim mạch', 'Chuyên khoa tim mạch, điều trị các bệnh về tim và mạch máu'),
(2, 'Nội khoa', 'Chuyên khoa nội tổng quát, điều trị các bệnh nội khoa'),
(3, 'Nhi khoa', 'Chuyên khoa nhi, chăm sóc sức khỏe trẻ em'),
(4, 'Da liễu', 'Chuyên khoa da liễu, điều trị các bệnh về da'),
(5, 'Tai mũi họng', 'Chuyên khoa tai mũi họng, điều trị các bệnh về tai, mũi, họng'),
(6, 'Mắt', 'Chuyên khoa mắt, điều trị các bệnh về mắt'),
(7, 'Răng hàm mặt', 'Chuyên khoa răng hàm mặt, điều trị các bệnh về răng'),
(8, 'Thần kinh', 'Chuyên khoa thần kinh, điều trị các bệnh về thần kinh'),
(9, 'Sản phụ khoa', 'Chuyên khoa sản phụ khoa, chăm sóc sức khỏe phụ nữ'),
(10, 'Chỉnh hình', 'Chuyên khoa chỉnh hình, điều trị các bệnh về xương khớp');

-- ============================================
-- STEP 3: Backup current Doctor.specialization data
-- ============================================

-- Create temporary mapping table
CREATE TEMPORARY TABLE IF NOT EXISTS doctor_speciality_mapping (
    user_id INT,
    old_specialization VARCHAR(50),
    new_speciality_id INT
);

-- Map old enum values to new speciality IDs
INSERT INTO doctor_speciality_mapping (user_id, old_specialization, new_speciality_id)
SELECT 
    user_id,
    specialization,
    CASE 
        WHEN specialization = 'TIM_MACH' THEN 1
        WHEN specialization = 'NOI_KHOA' THEN 2
        WHEN specialization = 'NHI_KHOA' THEN 3
        WHEN specialization = 'DA_LIEU' THEN 4
        WHEN specialization = 'TAI_MUI_HONG' THEN 5
        ELSE 2  -- Default to NOI_KHOA
    END as new_speciality_id
FROM doctor
WHERE specialization IS NOT NULL;

-- ============================================
-- STEP 4: Add new column to Doctor table
-- ============================================

-- Add new foreign key column
ALTER TABLE doctor 
ADD COLUMN speciality_id INT AFTER firebase_uid,
ADD CONSTRAINT fk_doctor_speciality 
    FOREIGN KEY (speciality_id) 
    REFERENCES speciality(speciality_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Create index for better performance
CREATE INDEX idx_doctor_speciality ON doctor(speciality_id);

-- ============================================
-- STEP 5: Migrate data from old to new column
-- ============================================

UPDATE doctor d
INNER JOIN doctor_speciality_mapping m ON d.user_id = m.user_id
SET d.speciality_id = m.new_speciality_id;

-- ============================================
-- STEP 6: Drop old specialization column
-- ============================================

-- ⚠️ UNCOMMENT BELOW AFTER VERIFYING DATA MIGRATION
-- ALTER TABLE doctor DROP COLUMN specialization;

-- ============================================
-- STEP 7: Verify migration
-- ============================================

SELECT 
    d.user_id,
    u.name as doctor_name,
    s.name as speciality_name,
    d.experience_years
FROM doctor d
LEFT JOIN users u ON d.user_id = u.user_id
LEFT JOIN speciality s ON d.speciality_id = s.speciality_id
ORDER BY d.user_id;

-- ============================================
-- DONE!
-- ============================================

SELECT 'Migration completed! Please verify data before dropping old column.' as status;

