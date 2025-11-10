package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se1961.g1.medconnect.enums.Slot;
import se1961.g1.medconnect.pojo.Schedule;
import se1961.g1.medconnect.pojo.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByUserUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

    Optional<Schedule> findByUserUserIdAndDateAndSlot(Long userId, LocalDate date, Slot slot);
    
    List<Schedule> findByUserAndDate(User user, LocalDate date);
}
