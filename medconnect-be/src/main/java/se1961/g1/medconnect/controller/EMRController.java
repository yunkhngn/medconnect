package se1961.g1.medconnect.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.MedicalRecord;
import se1961.g1.medconnect.service.MedicalRecordService;

import java.util.Map;

@RestController
@RequestMapping("/api/emr")
public class EMRController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Get EMR by patient's Firebase UID
     * This endpoint allows doctors and admins to access patient EMR
     */
    @GetMapping("/firebase/{firebaseUid}")
    public ResponseEntity<?> getEmrByFirebaseUid(@PathVariable String firebaseUid) {
        try {
            MedicalRecord record = medicalRecordService.getByPatientFirebaseUid(firebaseUid);
            
            if (record == null) {
                return ResponseEntity.notFound().build();
            }

            // Parse JSON data and return
            @SuppressWarnings("unchecked")
            Map<String, Object> emrData = objectMapper.readValue(record.getDetail(), Map.class);
            
            return ResponseEntity.ok(emrData);
        } catch (Exception e) {
            System.err.println("Error fetching EMR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch EMR: " + e.getMessage()));
        }
    }

    /**
     * Get authenticated user's own EMR
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyEmr(@RequestAttribute("firebaseUid") String firebaseUid) {
        return getEmrByFirebaseUid(firebaseUid);
    }
}

