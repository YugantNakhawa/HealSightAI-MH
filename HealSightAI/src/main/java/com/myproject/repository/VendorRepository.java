package com.myproject.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.myproject.model.Vendor;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
}
