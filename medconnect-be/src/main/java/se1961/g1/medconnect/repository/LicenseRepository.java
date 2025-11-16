package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.License;

import java.util.List;
import java.util.Optional;

@Repository
public interface LicenseRepository extends JpaRepository<License, Integer> {
    
    // Tìm giấy phép theo số giấy phép
    Optional<License> findByLicenseNumber(String licenseNumber);
    
    // Tìm tất cả giấy phép của một bác sĩ
    List<License> findByDoctorOrderByIssuedDateDesc(Doctor doctor);
    
    // Tìm giấy phép còn hiệu lực của một bác sĩ
    @Query("SELECT l FROM License l WHERE l.doctor = ?1 AND l.isActive = true ORDER BY l.issuedDate DESC")
    List<License> findActiveLicensesByDoctor(Doctor doctor);
    
    // Tìm giấy phép còn hiệu lực nhất của một bác sĩ
    @Query("SELECT l FROM License l WHERE l.doctor = ?1 AND l.isActive = true ORDER BY l.issuedDate DESC")
    Optional<License> findActiveLicenseByDoctor(Doctor doctor);
}

