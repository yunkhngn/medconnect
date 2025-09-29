package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import se1961.g1.medconnect.enums.NotificationStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "Notification")
@Getter
@Setter
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Email
    private String sendAt;

    @Enumerated(EnumType.STRING)
    private NotificationStatus status;
}
