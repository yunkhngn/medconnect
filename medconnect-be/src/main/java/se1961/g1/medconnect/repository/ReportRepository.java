package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se1961.g1.medconnect.pojo.Doctor;
import se1961.g1.medconnect.pojo.Report;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByCreatedAtDesc();
    List<Report> findByStatus(Report.ReportStatus status);
    List<Report> findByDoctor(Doctor doctor);
}

