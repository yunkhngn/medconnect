package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import se1961.g1.medconnect.pojo.Speciality;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecialityRepository extends JpaRepository<Speciality, Integer> {
    
    /**
     * Find speciality by exact name
     */
    Optional<Speciality> findByName(String name);
    
    /**
     * Find speciality by name ignoring case
     */
    Optional<Speciality> findByNameIgnoreCase(String name);
    
    /**
     * Find specialities containing keyword (for search)
     */
    List<Speciality> findByNameContainingIgnoreCase(String keyword);
    
    /**
     * Get all specialities ordered by name
     */
    List<Speciality> findAllByOrderByNameAsc();
    
    /**
     * Check if speciality exists by name
     */
    boolean existsByName(String name);
    
    /**
     * Check if speciality exists by name excluding current ID (for update validation)
     */
    boolean existsByNameAndSpecialityIdNot(String name, Integer specialityId);
}

