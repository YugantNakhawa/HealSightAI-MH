package com.myproject.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "advisories")
public class Advisory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String doctorName;
    private String patientName;
    private String patientId;

    @Column(length = 1000)
    private String aiInsight;  // Example: "Slight risk of dehydration due to high temperature"

    @Column(length = 2000)
    private String doctorAdvice;

    private String nextSteps;
    private LocalDateTime createdAt = LocalDateTime.now();
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getDoctorName() {
		return doctorName;
	}
	public void setDoctorName(String doctorName) {
		this.doctorName = doctorName;
	}
	public String getPatientName() {
		return patientName;
	}
	public void setPatientName(String patientName) {
		this.patientName = patientName;
	}
	public String getPatientId() {
		return patientId;
	}
	public void setPatientId(String patientId) {
		this.patientId = patientId;
	}
	public String getAiInsight() {
		return aiInsight;
	}
	public void setAiInsight(String aiInsight) {
		this.aiInsight = aiInsight;
	}
	public String getDoctorAdvice() {
		return doctorAdvice;
	}
	public void setDoctorAdvice(String doctorAdvice) {
		this.doctorAdvice = doctorAdvice;
	}
	public String getNextSteps() {
		return nextSteps;
	}
	public void setNextSteps(String nextSteps) {
		this.nextSteps = nextSteps;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
