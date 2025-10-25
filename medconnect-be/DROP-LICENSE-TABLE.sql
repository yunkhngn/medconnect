-- ================================================
-- DROP LICENSE TABLE (OPTIONAL)
-- Xóa hoàn toàn bảng License nếu muốn reset từ đầu
-- ================================================

PRINT '╔════════════════════════════════════════╗';
PRINT '║       DROP LICENSE TABLE               ║';
PRINT '╚════════════════════════════════════════╝';
PRINT '';

-- ⚠️ CẢNH BÁO: Script này sẽ XÓA HOÀN TOÀN bảng License
-- Tất cả data giấy phép hành nghề sẽ MẤT VĨNH VIỄN
-- Chỉ chạy nếu bạn chắc chắn muốn reset

-- Kiểm tra xem bảng License có tồn tại không
IF OBJECT_ID('License', 'U') IS NOT NULL
BEGIN
    PRINT '🔍 Tìm thấy bảng License';
    
    -- Đếm số record
    DECLARE @RecordCount INT;
    SELECT @RecordCount = COUNT(*) FROM License;
    PRINT '📊 Số record hiện tại: ' + CAST(@RecordCount AS VARCHAR);
    
    PRINT '';
    PRINT '⚠️  CẢNH BÁO: Bạn có chắc muốn xóa bảng License?';
    PRINT '   Tất cả ' + CAST(@RecordCount AS VARCHAR) + ' giấy phép sẽ bị XÓA VĨNH VIỄN!';
    PRINT '';
    
    -- Drop bảng License
    DROP TABLE License;
    PRINT '✓ Đã XÓA bảng License';
    PRINT '';
    PRINT '📝 Sau khi restart backend, Hibernate sẽ tự tạo lại bảng License mới (rỗng)';
END
ELSE
BEGIN
    PRINT '○ Bảng License không tồn tại';
    PRINT '📝 Sau khi restart backend, Hibernate sẽ tự tạo bảng License';
END

PRINT '';
PRINT '╔════════════════════════════════════════╗';
PRINT '║            HOÀN TẤT!                   ║';
PRINT '╚════════════════════════════════════════╝';

