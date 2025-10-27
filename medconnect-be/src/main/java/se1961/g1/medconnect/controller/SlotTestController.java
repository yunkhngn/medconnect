package se1961.g1.medconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.enums.Slot;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * TEMPORARY CONTROLLER FOR DEBUGGING SLOT ENUM
 * This will be deleted after fixing the issue
 */
@RestController
@RequestMapping("/api/test/slots")
public class SlotTestController {

    /**
     * List all available slot enum values
     */
    @GetMapping("/list")
    public ResponseEntity<?> listAllSlots() {
        List<Map<String, Object>> slots = Arrays.stream(Slot.values())
                .map(slot -> {
                    Map<String, Object> info = new HashMap<>();
                    info.put("name", slot.name());
                    info.put("ordinal", slot.ordinal());
                    info.put("timeRange", slot.getTimeRange());
                    info.put("start", slot.getStart().toString());
                    info.put("end", slot.getEnd().toString());
                    return info;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(Map.of(
            "totalSlots", slots.size(),
            "slots", slots,
            "message", "If totalSlots is 4, backend is running OLD code. If 12, backend is OK."
        ));
    }

    /**
     * Test parsing a specific slot from string
     */
    @GetMapping("/parse/{slotName}")
    public ResponseEntity<?> parseSlot(@PathVariable String slotName) {
        try {
            Slot slot = Slot.valueOf(slotName);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "slot", slot.name(),
                "timeRange", slot.getTimeRange()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Invalid slot name: " + slotName,
                "message", "Available slots: " + Arrays.toString(Slot.values())
            ));
        }
    }

    /**
     * Test creating a ScheduleDTO with SLOT_5
     */
    @GetMapping("/test-slot5")
    public ResponseEntity<?> testSlot5() {
        try {
            Slot slot5 = Slot.valueOf("SLOT_5");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "✅ SLOT_5 exists in enum!",
                "slot", slot5.name(),
                "timeRange", slot5.getTimeRange()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "❌ SLOT_5 does NOT exist in current running code!",
                "message", "Backend is running OLD JAR with only 4 slots"
            ));
        }
    }
}

