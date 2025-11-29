package com.myproject.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;


@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientId;     // Example: P-1089
    private String name;
    private int age;
    private String gender;
    private String disease;
    private String doctorName;    // Linked doctor
    private String status;        // ADMITTED, DISCHARGED, FOLLOWUP

    private LocalDateTime admittedAt = LocalDateTime.now();
    private LocalDateTime dischargedAt;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getPatientId() {
		return patientId;
	}
	public void setPatientId(String patientId) {
		this.patientId = patientId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getAge() {
		return age;
	}
	public void setAge(int age) {
		this.age = age;
	}
	public String getGender() {
		return gender;
	}
	public void setGender(String gender) {
		this.gender = gender;
	}
	public String getDisease() {
		return disease;
	}
	public void setDisease(String disease) {
		this.disease = disease;
	}
	public String getDoctorName() {
		return doctorName;
	}
	public void setDoctorName(String doctorName) {
		this.doctorName = doctorName;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public LocalDateTime getAdmittedAt() {
		return admittedAt;
	}
	public void setAdmittedAt(LocalDateTime admittedAt) {
		this.admittedAt = admittedAt;
	}
	public LocalDateTime getDischargedAt() {
		return dischargedAt;
	}
	public void setDischargedAt(LocalDateTime dischargedAt) {
		this.dischargedAt = dischargedAt;
	}


}
