package se1961.g1.medconnect.pojo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "Patient")
@Getter
@Setter
public class Patient {
    @Id
    private Long patientId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "userId")
    private User user;

    @Column(nullable = false)
    @Size(min = 2, max = 50)
    private String firstName;

    @Column(nullable = false)
    @Size(min = 2, max = 50)
    private String lastName;

    @Column(nullable = false)
    private String phone;

    @Column(columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String EMR;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments =  new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Feedback> feedbacks = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<ChatBot> chats = new ArrayList<>();

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL)
    private StreetMap map;
}
