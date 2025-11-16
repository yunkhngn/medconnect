package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.pojo.Speciality;
import se1961.g1.medconnect.repository.SpecialityRepository;
import se1961.g1.medconnect.repository.DoctorRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SpecialityService {
    
    @Autowired
    private SpecialityRepository specialityRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Get speciality by ID
     */
    public Optional<Speciality> getSpecialityById(Integer id) {
        return specialityRepository.findById(id);
    }

    /**
     * Get all specialities
     */
    public List<Speciality> getAllSpecialities() {
        return specialityRepository.findAll();
    }

    /**
     * Save speciality (create or update)
     */
    public Speciality saveSpeciality(Speciality speciality) {
        return specialityRepository.save(speciality);
    }

    /**
     * Delete speciality by ID
     */
    public void deleteSpeciality(Integer id) {
        specialityRepository.deleteById(id);
    }

    /**
     * Check if speciality has associated doctors
     */
    public boolean hasAssociatedDoctors(Integer specialityId) {
        return doctorRepository.countBySpecialitySpecialityId(specialityId) > 0;
    }

    /**
     * Check if speciality name already exists (for validation)
     */
    public boolean existsByName(String name) {
        return specialityRepository.existsByName(name);
    }

    /**
     * Check if speciality name exists excluding current ID (for update validation)
     */
    public boolean existsByNameAndIdNot(String name, Integer id) {
        return specialityRepository.existsByNameAndSpecialityIdNot(name, id);
    }

    /**
     * Get all specialities with doctor count for public display
     */
    public List<Speciality> getAllSpecialitiesWithDoctorCount() {
        return specialityRepository.findAll();
    }

    /**
     * Get doctor count for a speciality
     */
    public long getDoctorCountBySpecialityId(Integer specialityId) {
        return doctorRepository.countBySpecialitySpecialityId(specialityId);
    }
}
