package com.myproject.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.myproject.model.ShiftPlan;

public interface ShiftPlanRepository extends JpaRepository<ShiftPlan, Long> {
    List<ShiftPlan> findByDate(LocalDate date);
}
