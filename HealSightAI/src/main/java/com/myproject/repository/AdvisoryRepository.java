package com.myproject.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.myproject.model.Advisory;

public interface AdvisoryRepository extends JpaRepository<Advisory, Long> {
    List<Advisory> findByDoctorName(String doctorName);
}
