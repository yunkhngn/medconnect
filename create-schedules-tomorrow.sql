SET QUOTED_IDENTIFIER ON;
GO

-- Create schedules for doctor user_id=3 for tomorrow
DECLARE @tomorrow DATE = DATEADD(day, 1, CAST(GETDATE() AS DATE));

INSERT INTO schedule (user_id, date, slot, status) 
VALUES 
    (3, @tomorrow, 'SLOT_1', 'EMPTY'),
    (3, @tomorrow, 'SLOT_2', 'EMPTY'),
    (3, @tomorrow, 'SLOT_3', 'EMPTY'),
    (3, @tomorrow, 'SLOT_4', 'EMPTY');

-- Verify inserted schedules
SELECT * FROM schedule WHERE date = @tomorrow;
