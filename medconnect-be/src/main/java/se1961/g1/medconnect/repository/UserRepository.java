package se1961.g1.medconnect.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se1961.g1.medconnect.pojo.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByFirebaseUid(String firebaseUid);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
}
