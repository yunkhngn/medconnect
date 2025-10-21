package se1961.g1.medconnect.enums;

import java.time.LocalTime;

public enum Slot {
    SLOT_1(LocalTime.of(7, 30), LocalTime.of(9, 50)),
    SLOT_2(LocalTime.of(10, 0), LocalTime.of(12, 20)),
    SLOT_3(LocalTime.of(12, 50), LocalTime.of(15, 10)),
    SLOT_4(LocalTime.of(15, 20), LocalTime.of(17, 40));

    private final LocalTime start;
    private final LocalTime end;

    Slot(LocalTime start, LocalTime end) {
        this.start = start;
        this.end = end;
    }

    public LocalTime getStart() { return start; }
    public LocalTime getEnd() { return end; }
}