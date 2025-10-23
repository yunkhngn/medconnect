package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.pojo.Speciality;
import se1961.g1.medconnect.repository.SpecialityRepository;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/specialities")
@CrossOrigin(origins = "http://localhost:3000")
public class SpecialityController {

    @Autowired
    private SpecialityRepository specialityRepository;

    /**
     * Get all specialities (public - for dropdown)
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllSpecialities() {
        List<Speciality> specialities = specialityRepository.findAll();
        
        List<Map<String, Object>> result = specialities.stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getSpecialityId());
                    map.put("name", s.getName());
                    map.put("description", s.getDescription());
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    /**
     * Get speciality by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSpecialityById(@PathVariable Integer id) {
        Optional<Speciality> speciality = specialityRepository.findById(id);
        
        if (speciality.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Speciality s = speciality.get();
        Map<String, Object> result = new HashMap<>();
        result.put("id", s.getSpecialityId());
        result.put("name", s.getName());
        result.put("description", s.getDescription());
        result.put("created_at", s.getCreatedAt());
        result.put("updated_at", s.getUpdatedAt());
        
        return ResponseEntity.ok(result);
    }
}

