package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * License Entity - Giấy phép hành nghề khám bệnh, chữa bệnh
 * Theo mẫu Bộ Y Tế
 */
@Entity
@Table(name = "License")
@Getter
@Setter
public class License {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "license_id")
    private Integer licenseId;
    
    // Bác sĩ sở hữu giấy phép này
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", referencedColumnName = "user_id", nullable = false)
    private Doctor doctor;
    
    // Số giấy phép hành nghề (Format: 000001/BYT-GPHN)
    @Column(name = "license_number", unique = true, nullable = false, length = 50)
    private String licenseNumber;
    
    // Ngày cấp giấy phép
    @Column(name = "issued_date", nullable = false)
    private LocalDate issuedDate;
    
    // Ngày hết hạn giấy phép (null = vô thời hạn)
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    // Nơi cấp (VD: "Cục Quản lý Khám chữa bệnh - Bộ Y tế")
    @Column(name = "issued_by", columnDefinition = "NVARCHAR(255)")
    private String issuedBy;
    
    // Chức danh người cấp (VD: "Cục trưởng", "Trưởng phòng")
    @Column(name = "issuer_title", columnDefinition = "NVARCHAR(100)")
    private String issuerTitle;
    
    // Phạm vi hành nghề (Theo Điều 26 Luật Khám bệnh, chữa bệnh)
    @Column(name = "scope_of_practice", columnDefinition = "NVARCHAR(MAX)")
    private String scopeOfPractice;
    
    // Còn hiệu lực không (true = đang dùng, false = đã hết hạn/thu hồi)
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    // Ghi chú (VD: "Cấp lại lần 2", "Gia hạn")
    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public License() {}
    
    /**
     * Check if license is expired
     */
    public boolean isExpired() {
        if (expiryDate == null) {
            return false; // Vô thời hạn
        }
        return LocalDate.now().isAfter(expiryDate);
    }
    
    /**
     * Check if license is valid (active and not expired)
     */
    public boolean isValid() {
        return isActive && !isExpired();
    }
    
    /**
     * Get days until license expires (null if no expiry)
     */
    public Long getDaysUntilExpiry() {
        if (expiryDate == null) {
            return null;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }
}

