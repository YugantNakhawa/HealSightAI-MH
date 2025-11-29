package com.myproject.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.myproject.model.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {}
