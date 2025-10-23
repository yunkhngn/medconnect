package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "speciality")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Speciality {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "speciality_id")
    private Integer specialityId;
    
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationship: One Speciality has Many Doctors
    @OneToMany(mappedBy = "speciality", fetch = FetchType.LAZY)
    private List<Doctor> doctors;
    
    // Constructor without relationships (for DTOs)
    public Speciality(Integer specialityId, String name, String description) {
        this.specialityId = specialityId;
        this.name = name;
        this.description = description;
    }
    
    // Override toString to avoid circular reference
    @Override
    public String toString() {
        return "Speciality{" +
                "specialityId=" + specialityId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}

