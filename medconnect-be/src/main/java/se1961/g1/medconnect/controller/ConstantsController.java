package se1961.g1.medconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.enums.BloodType;
import se1961.g1.medconnect.enums.Gender;
import se1961.g1.medconnect.enums.PatientStatus;

import java.util.*;

@RestController
@RequestMapping("/api/constants")
@CrossOrigin(origins = "*")
public class ConstantsController {

    @GetMapping("/genders")
    public ResponseEntity<List<Map<String, String>>> getGenders() {
        List<Map<String, String>> genders = new ArrayList<>();
        for (Gender gender : Gender.values()) {
            Map<String, String> item = new HashMap<>();
            item.put("value", gender.getValue());
            item.put("label", gender.getDisplayName());
            genders.add(item);
        }
        return ResponseEntity.ok(genders);
    }

    @GetMapping("/blood-types")
    public ResponseEntity<List<Map<String, String>>> getBloodTypes() {
        List<Map<String, String>> bloodTypes = new ArrayList<>();
        for (BloodType bloodType : BloodType.values()) {
            Map<String, String> item = new HashMap<>();
            item.put("value", bloodType.getValue());
            item.put("label", bloodType.getDisplayName());
            bloodTypes.add(item);
        }
        return ResponseEntity.ok(bloodTypes);
    }

    @GetMapping("/patient-statuses")
    public ResponseEntity<List<Map<String, String>>> getPatientStatuses() {
        List<Map<String, String>> statuses = new ArrayList<>();
        for (PatientStatus status : PatientStatus.values()) {
            Map<String, String> item = new HashMap<>();
            item.put("value", status.getValue());
            item.put("label", status.getDisplayName());
            statuses.add(item);
        }
        return ResponseEntity.ok(statuses);
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, List<Map<String, String>>>> getAllConstants() {
        Map<String, List<Map<String, String>>> allConstants = new HashMap<>();
        
        // Genders
        List<Map<String, String>> genders = new ArrayList<>();
        for (Gender gender : Gender.values()) {
            Map<String, String> item = new HashMap<>();
            item.put("value", gender.getValue());
            item.put("label", gender.getDisplayName());
            genders.add(item);
        }
        allConstants.put("genders", genders);
        
        // Blood Types
        List<Map<String, String>> bloodTypes = new ArrayList<>();
        for (BloodType bloodType : BloodType.values()) {
            Map<String, String> item = new HashMap<>();
            item.put("value", bloodType.getValue());
            item.put("label", bloodType.getDisplayName());
            bloodTypes.add(item);
        }
        allConstants.put("bloodTypes", bloodTypes);
        
        // Patient Statuses
        List<Map<String, String>> statuses = new ArrayList<>();
        for (PatientStatus status : PatientStatus.values()) {
            Map<String, String> item = new HashMap<>();
            item.put("value", status.getValue());
            item.put("label", status.getDisplayName());
            statuses.add(item);
        }
        allConstants.put("patientStatuses", statuses);
        
        return ResponseEntity.ok(allConstants);
    }
}
