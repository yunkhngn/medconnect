package se1961.g1.medconnect.enums;

import java.time.LocalTime;

public enum Slot {
    // Morning slots (7:30 - 12:00)
    SLOT_1(LocalTime.of(7, 30), LocalTime.of(8, 0)),      // 07:30 - 08:00
    SLOT_2(LocalTime.of(8, 15), LocalTime.of(8, 45)),     // 08:15 - 08:45
    SLOT_3(LocalTime.of(9, 0), LocalTime.of(9, 30)),      // 09:00 - 09:30
    SLOT_4(LocalTime.of(9, 45), LocalTime.of(10, 15)),    // 09:45 - 10:15
    SLOT_5(LocalTime.of(10, 30), LocalTime.of(11, 0)),    // 10:30 - 11:00
    SLOT_6(LocalTime.of(11, 15), LocalTime.of(11, 45)),   // 11:15 - 11:45
    
    // Lunch break: 12:00 - 13:00
    
    // Afternoon slots (13:00 - 17:15)
    SLOT_7(LocalTime.of(13, 0), LocalTime.of(13, 30)),    // 13:00 - 13:30
    SLOT_8(LocalTime.of(13, 45), LocalTime.of(14, 15)),   // 13:45 - 14:15
    SLOT_9(LocalTime.of(14, 30), LocalTime.of(15, 0)),    // 14:30 - 15:00
    SLOT_10(LocalTime.of(15, 15), LocalTime.of(15, 45)),  // 15:15 - 15:45
    SLOT_11(LocalTime.of(16, 0), LocalTime.of(16, 30)),   // 16:00 - 16:30
    SLOT_12(LocalTime.of(16, 45), LocalTime.of(17, 15));  // 16:45 - 17:15

    private final LocalTime start;
    private final LocalTime end;

    Slot(LocalTime start, LocalTime end) {
        this.start = start;
        this.end = end;
    }

    public LocalTime getStart() { return start; }
    public LocalTime getEnd() { return end; }
    
    public String getTimeRange() {
        return String.format("%02d:%02d - %02d:%02d", 
            start.getHour(), start.getMinute(),
            end.getHour(), end.getMinute());
    }
}