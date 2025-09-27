package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Admin")
@Getter
@Setter
public class Admin {
    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "userId")
    private User user;
}
