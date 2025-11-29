package com.myproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientName;
    private String doctorName;
    private String status; // e.g., "Pending", "Completed"

    // Constructors
    public Appointment() {}

    public Appointment(String patientName, String doctorName, String status) {
        this.patientName = patientName;
        this.doctorName = doctorName;
        this.status = status;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
