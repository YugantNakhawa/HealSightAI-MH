package com.myproject.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.myproject.model.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByDoctorName(String doctorName);
}
