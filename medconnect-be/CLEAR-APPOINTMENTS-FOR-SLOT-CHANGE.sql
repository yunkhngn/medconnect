-- ============================================
-- CLEAR APPOINTMENTS & SCHEDULES FOR SLOT CHANGE
-- ============================================
-- Run this script to clear all appointments and schedules
-- before changing Slot enum from 4 slots to 12 slots
-- ============================================

-- 1. Clear all appointments (will cascade to payments, video_call_sessions)
DELETE FROM appointment;

-- 2. Clear all schedules
DELETE FROM schedule;

-- 3. Verify tables are empty
SELECT COUNT(*) as appointment_count FROM appointment;
SELECT COUNT(*) as schedule_count FROM schedule;
SELECT COUNT(*) as payment_count FROM payment;

-- ============================================
-- DONE! Now you can safely change Slot enum
-- ============================================

